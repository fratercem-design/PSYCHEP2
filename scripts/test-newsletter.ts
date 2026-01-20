async function main() {
  const response = await fetch("http://localhost:3000/api/newsletter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "test@example.com",
    }),
  });

  const data = await response.json();
  console.log(data);
}

main();
