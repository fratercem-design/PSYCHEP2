async function main() {
  const response = await fetch("http://localhost:3000/api/submissions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      displayName: "Test Streamer",
      twitchHandle: "teststreamer",
      youtubeHandle: "teststreamer",
    }),
  });

  const data = await response.json();
  console.log(data);
}

main();
