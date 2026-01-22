
import "dotenv/config";

const apiKey = process.env.YOUTUBE_API_KEY;

async function searchChannel() {
  const q = "Hackride Studios";
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(q)}&key=${apiKey}`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  console.log(JSON.stringify(data, null, 2));
}

searchChannel();
