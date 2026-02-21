const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: 'static-cdn.jtvnw.net',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.kick.com',
      },
      {
        protocol: 'https',
        hostname: 'files.kick.com',
      },
      {
        protocol: 'https',
        hostname: 'kick.com',
      },
      {
        protocol: 'https',
        hostname: 'static-cdn.jtvnw.net',
      },
      {
        protocol: 'https',
        hostname: 'clips-media-assets2.twitch.tv',
      },
    ],
  },
  reactCompiler: true,
  turbopack: {
    // Explicitly set project root to avoid lockfile confusion
    root: path.join(__dirname),
  },
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;
