import { Pool } from 'pg';

let pool: Pool;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Log connection string (safely, just the first 15 chars)
if (process.env.DATABASE_URL.startsWith('*****')) {
  console.error('[CRITICAL_ERROR] DATABASE_URL appears to be a redacted placeholder (starts with *****). Check Vercel environment variables.');
} else if (!process.env.DATABASE_URL.startsWith('postgres')) {
  console.error('[CRITICAL_ERROR] DATABASE_URL does not start with a valid postgres protocol. Starts with:', process.env.DATABASE_URL.slice(0, 15));
} else {
  console.log('[DEBUG_LOG] pool.ts: Initializing with DATABASE_URL starting with:', process.env.DATABASE_URL.slice(0, 15));
}

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Use a global variable to prevent multiple pools in development
  if (!(global as any).pool) {
    (global as any).pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  pool = (global as any).pool;
}

export default pool;
