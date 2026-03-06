const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const HOST = process.env.CTRL_PROXY_HOST || '127.0.0.1';
const PORT = Number(process.env.CTRL_PROXY_PORT || 3001);
const ROOT = path.join(__dirname, 'public', 'ctrl');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const CONFIG = {
  tiktokUsername: process.env.CTRL_TIKTOK_USERNAME || 'cultofpsyche',
  instagramUsername: process.env.CTRL_INSTAGRAM_USERNAME || 'psycheawakens',
  youtubeHandle: process.env.CTRL_YOUTUBE_HANDLE || 'cultofpsyche',
  apifyToken: process.env.APIFY_TOKEN || '',
  youtubeKey: process.env.YOUTUBE_API_KEY || '',
  apifyTiktokActor: process.env.APIFY_TIKTOK_ACTOR || 'clockworks~tiktok-profile-scraper',
  apifyInstagramActor: process.env.APIFY_INSTAGRAM_ACTOR || 'apify~instagram-scraper',
};

function sendJson(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function readJsonBody(req, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > maxBytes) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function serveFile(req, res) {
  const cleanPath = req.url.split('?')[0];
  const reqPath = cleanPath === '/' ? '/ai-dashboard.html' : decodeURIComponent(cleanPath);
  const filePath = path.normalize(path.join(ROOT, reqPath));
  if (!filePath.startsWith(ROOT)) return sendJson(res, 403, { error: 'Forbidden' });
  fs.readFile(filePath, (err, content) => {
    if (err) return sendJson(res, 404, { error: 'Not found' });
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

function runClaude(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', ['-p']);
    let out = '';
    let err = '';
    const timer = setTimeout(() => child.kill('SIGTERM'), 120000);
    child.stdout.on('data', (d) => (out += d.toString()));
    child.stderr.on('data', (d) => (err += d.toString()));
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(err || `claude exited ${code}`));
      resolve(out.trim());
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

async function runApifyActor(actorId, input) {
  const runRes = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${CONFIG.apifyToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((r) => r.json());

  const run = runRes.data;
  if (!run?.id) throw new Error(`Failed to start actor: ${actorId}`);

  let status = run.status;
  while (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
    await new Promise((r) => setTimeout(r, 1800));
    const st = await fetch(`https://api.apify.com/v2/actor-runs/${run.id}?token=${CONFIG.apifyToken}`).then((r) => r.json());
    status = st.data?.status;
  }
  if (status !== 'SUCCEEDED') throw new Error(`${actorId} run ended with ${status}`);
  return run.defaultDatasetId;
}

async function getDatasetItems(datasetId) {
  return fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=true`).then((r) => r.json());
}

async function fetchYouTube() {
  if (!CONFIG.youtubeKey || !CONFIG.youtubeHandle) return { available: false, posts: [] };
  const ch = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${encodeURIComponent(CONFIG.youtubeHandle)}&key=${CONFIG.youtubeKey}`).then((r) => r.json());
  const cid = ch.items?.[0]?.id;
  if (!cid) return { available: true, posts: [{ title: 'No content yet', views: 0, engagement: '--' }] };

  const s = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${cid}&order=date&maxResults=10&type=video&key=${CONFIG.youtubeKey}`).then((r) => r.json());
  const ids = (s.items || []).map((i) => i.id.videoId).filter(Boolean);
  if (!ids.length) return { available: true, posts: [{ title: 'No content yet', views: 0, engagement: '--' }] };

  const v = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids.join(',')}&key=${CONFIG.youtubeKey}`).then((r) => r.json());
  const posts = (v.items || []).slice(0, 10).map((x, i) => {
    const views = Number(x.statistics?.viewCount || 0);
    const likes = Number(x.statistics?.likeCount || 0);
    return {
      title: `YouTube #${i + 1}`,
      views,
      engagement: `${((likes / Math.max(views, 1)) * 100).toFixed(1)}%`,
    };
  });
  return { available: true, posts };
}

async function fetchLivePayload() {
  let tiktokPosts = [];
  let instagramPosts = [];
  let tiktokFollowers = 0;
  let instagramFollowers = 0;

  const canApify = Boolean(CONFIG.apifyToken && CONFIG.tiktokUsername && CONFIG.instagramUsername);
  if (canApify) {
    const [ttDataset, igDataset] = await Promise.all([
      runApifyActor(CONFIG.apifyTiktokActor, {
        profiles: [CONFIG.tiktokUsername],
        resultsType: 'details',
        period: '30d',
        resultsLimit: 10,
      }),
      runApifyActor(CONFIG.apifyInstagramActor, {
        usernames: [CONFIG.instagramUsername],
      }),
    ]);

    const [ttItems, igItems] = await Promise.all([getDatasetItems(ttDataset), getDatasetItems(igDataset)]);
    const tt = ttItems?.[0] || {};
    const ig = igItems?.[0] || {};

    tiktokFollowers = Number(tt.followers || tt.followerCount || 0);
    instagramFollowers = Number(ig.followersCount || ig.followers || 0);

    tiktokPosts = (tt.latestPosts || tt.posts || []).slice(0, 10).map((p, i) => {
      const views = Number(p.playCount || p.videoPlayCount || 0);
      const likes = Number(p.diggCount || p.likes || 0);
      return { title: `TikTok #${i + 1}`, views, engagement: `${((likes / Math.max(views, 1)) * 100).toFixed(1)}%` };
    });

    instagramPosts = (ig.latestPosts || ig.posts || []).slice(0, 10).map((p, i) => {
      const views = Number(p.videoViewCount || p.videoPlayCount || p.likesCount || 0);
      const comments = Number(p.commentsCount || 0);
      return { title: `Instagram #${i + 1}`, views, engagement: `${((comments / Math.max(views, 1)) * 100).toFixed(1)}%` };
    });
  }

  const youtube = await fetchYouTube();

  return {
    updatedAt: new Date().toISOString(),
    config: {
      tiktokUsername: CONFIG.tiktokUsername,
      instagramUsername: CONFIG.instagramUsername,
      youtubeHandle: CONFIG.youtubeHandle,
      hasApifyToken: Boolean(CONFIG.apifyToken),
      hasYoutubeKey: Boolean(CONFIG.youtubeKey),
    },
    social: {
      tiktok: { followers: tiktokFollowers, posts: tiktokPosts },
      instagram: { followers: instagramFollowers, posts: instagramPosts },
      youtube: { subscribers: youtube.posts?.[0]?.title === 'No content yet' ? 0 : null, posts: youtube.posts || [] },
    },
  };
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') return sendJson(res, 200, { ok: true });

    if (req.method === 'GET' && req.url === '/config') {
      return sendJson(res, 200, {
        tiktokUsername: CONFIG.tiktokUsername,
        instagramUsername: CONFIG.instagramUsername,
        youtubeHandle: CONFIG.youtubeHandle,
        hasApifyToken: Boolean(CONFIG.apifyToken),
        hasYoutubeKey: Boolean(CONFIG.youtubeKey),
      });
    }

    if (req.method === 'POST' && req.url === '/generate') {
      const data = await readJsonBody(req);
      const mergedPrompt = `${data.system || ''}\n\n${data.prompt || ''}`.trim();
      if (!mergedPrompt) return sendJson(res, 400, { error: 'Missing prompt' });
      const script = await runClaude(mergedPrompt);
      return sendJson(res, 200, { script });
    }

    if (req.method === 'POST' && req.url === '/live/refresh') {
      const payload = await fetchLivePayload();
      return sendJson(res, 200, payload);
    }

    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });
    return serveFile(req, res);
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Internal server error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`CTRL proxy listening on http://${HOST}:${PORT}`);
  console.log('Use env vars APIFY_TOKEN, YOUTUBE_API_KEY, CTRL_TIKTOK_USERNAME, CTRL_INSTAGRAM_USERNAME, CTRL_YOUTUBE_HANDLE for deploy-safe config.');
});
