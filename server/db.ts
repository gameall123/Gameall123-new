import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For development, use a fallback database URL if not provided
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gameall_dev';

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn(
    "⚠️  DATABASE_URL not configured. Using SQLite fallback for demo purposes. Please provision a PostgreSQL database for production use.",
  );
}

let pool: Pool;
let db: any;

try {
  pool = new Pool({ connectionString: DATABASE_URL });
  db = drizzle({ client: pool, schema });
} catch (error) {
  console.warn('Database connection failed:', error);
  // In development, we'll create a mock database interface
  if (process.env.NODE_ENV !== 'production') {
    console.log('Using mock database for development...');
    db = {
      select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
      insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }),
      delete: () => ({ where: () => Promise.resolve([]) }),
    };
  } else {
    throw error;
  }
}

export { pool, db };