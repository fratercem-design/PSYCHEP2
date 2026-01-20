import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    console.log("Database connected:", result.rows[0].version);
    client.release();
    await pool.end();
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

testConnection();
