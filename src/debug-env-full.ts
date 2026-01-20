import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

// Load .env file manually
config();

console.log('=== ENVIRONMENT DEBUG ===');
console.log('DATABASE_URL from process.env:', process.env.DATABASE_URL);
console.log('AUTH_SECRET from process.env:', process.env.AUTH_SECRET ? 'Set' : 'Not set');

console.log('\n=== FILE SYSTEM CHECK ===');
try {
  const envContent = readFileSync('.env', 'utf8');
  console.log('.env file content:');
  console.log(envContent);
} catch (error) {
  console.error('Error reading .env file:', error);
}

console.log('\n=== SYSTEM ENVIRONMENT ===');
try {
  // Check Windows environment variables
  const envVars = execSync('set DATABASE_URL', { encoding: 'utf8' }).toString();
  console.log('System DATABASE_URL:', envVars.trim());
} catch {
  console.log('No system DATABASE_URL found or error accessing it');
}