async function main() {
  // Test getting ads
  const adsResponse = await fetch("http://localhost:3000/api/ads");
  const adsData = await adsResponse.json();
  console.log("Ads:", adsData);

  // Test getting submissions
  const submissionsResponse = await fetch("http://localhost:3000/api/submissions");
  const submissionsData = await submissionsResponse.json();
  console.log("Submissions:", submissionsData);
}

main();
