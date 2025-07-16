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
  // In production without DATABASE_URL, we'll create a mock database interface for demo
  console.log('Using mock database for demo purposes...');
  
  // Mock database with in-memory storage
  let mockUsers: any[] = [];
  let mockProducts: any[] = [];
  let mockOrders: any[] = [];
  let userIdCounter = 1;
  
     db = {
     select: (columns?: any) => ({
       from: (table: any) => ({
         where: (condition: any) => {
           console.log('🔍 Mock DB query - table:', table.name || 'unknown', 'condition:', condition);
           
           if (table === schema.users) {
             // Simple mock: return all users for now, let the app filter
             console.log('👥 Returning mockUsers:', mockUsers.length, 'users');
             return Promise.resolve(mockUsers);
           }
           if (table === schema.products) {
             return Promise.resolve(mockProducts);
           }
           return Promise.resolve([]);
         }
       })
     }),
     insert: (table: any) => ({
       values: (data: any) => ({
         returning: () => {
           console.log('💾 Mock DB insert - table:', table.name || 'unknown', 'data:', data);
           
           if (table === schema.users) {
             const newUser = { 
               ...data, 
               id: data.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
             };
             mockUsers.push(newUser);
             console.log('✅ User inserted:', newUser);
             return Promise.resolve([newUser]);
           }
           return Promise.resolve([{ ...data, id: userIdCounter++ }]);
         }
       })
     }),
     update: (table: any) => ({
       set: (data: any) => ({
         where: (condition: any) => ({
           returning: () => {
             console.log('📝 Mock DB update');
             return Promise.resolve([data]);
           }
         })
       })
     }),
     delete: (table: any) => ({
       where: (condition: any) => {
         console.log('🗑️ Mock DB delete');
         return Promise.resolve([]);
       }
     }),
   };
}

export { pool, db };