import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function testConnection() {
  try {
    console.log("Testing connection to:", process.env.DATABASE_URL?.substring(0, 50) + "...");
    const result = await sql`SELECT version()`;
    console.log("✅ Database connected successfully!");
    console.log("PostgreSQL version:", result[0].version);
  } catch (error) {
    console.error("❌ Connection failed:", error);
    console.log("Full URL:", process.env.DATABASE_URL);
  }
}

testConnection();