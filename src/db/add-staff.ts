import "dotenv/config";
import { db } from "./index";
import { staffUsers } from "./schema";

async function main() {
  const email = "psyche@cultofpsyche.com";
  console.log(`Adding staff user: ${email}...`);
  
  await db
    .insert(staffUsers)
    .values({
      email,
      role: "admin",
    })
    .onConflictDoUpdate({
      target: staffUsers.email,
      set: { role: "admin" },
    });

  console.log("Staff user added successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to add staff user:", err);
  process.exit(1);
});
