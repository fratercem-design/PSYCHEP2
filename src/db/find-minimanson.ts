
import "dotenv/config";

const apiKey = process.env.YOUTUBE_API_KEY;

async function searchChannel() {
  const q = "Mini Manson";
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(q)}&key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.items && data.items.length > 0) {
        console.log("Found Channels:");
        data.items.forEach((item: any, index: number) => {
            console.log(`[${index}] Title: ${item.snippet.title}`);
            console.log(`    Channel ID: ${item.id.channelId}`);
            console.log(`    Description: ${item.snippet.description}`);
            console.log("---");
        });
    } else {
        console.log("No channels found.");
    }
  } catch (e) {
      console.error(e);
  }
}

searchChannel();
