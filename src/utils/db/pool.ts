import { Pool } from 'pg';

let pool: Pool;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
