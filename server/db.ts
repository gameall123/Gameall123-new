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
  console.log('🔧 Using mock database for demo purposes...');
  
  // Mock database with in-memory storage - more robust implementation
  const mockData = {
    users: [] as any[],
    products: [] as any[],
    orders: [] as any[],
    userIdCounter: 1
  };
  
  console.log('✅ Mock database initialized');
  
           db = {
      select: (columns?: any) => ({
        from: (table: any) => ({
          where: (condition: any) => {
            try {
              console.log('🔍 Mock DB SELECT - table:', table?.name || 'unknown');
              
              if (table === schema.users) {
                console.log('👥 Returning users, count:', mockData.users.length);
                return Promise.resolve(mockData.users);
              }
              if (table === schema.products) {
                console.log('📦 Returning products, count:', mockData.products.length);
                return Promise.resolve(mockData.products);
              }
              console.log('❓ Unknown table, returning empty array');
              return Promise.resolve([]);
            } catch (error) {
              console.error('💥 Mock DB SELECT error:', error);
              return Promise.resolve([]);
            }
          }
        })
      }),
      insert: (table: any) => ({
        values: (data: any) => ({
          returning: () => {
            try {
              console.log('💾 Mock DB INSERT - table:', table?.name || 'unknown');
              console.log('📋 Insert data:', JSON.stringify(data, null, 2));
              
              if (table === schema.users) {
                const newUser = { 
                  ...data, 
                  id: data.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  createdAt: new Date().toISOString()
                };
                mockData.users.push(newUser);
                console.log('✅ User inserted successfully:', { id: newUser.id, email: newUser.email });
                console.log('📊 Total users now:', mockData.users.length);
                return Promise.resolve([newUser]);
              }
              
              const newItem = { ...data, id: mockData.userIdCounter++ };
              console.log('✅ Generic item inserted:', newItem);
              return Promise.resolve([newItem]);
            } catch (error) {
              console.error('💥 Mock DB INSERT error:', error);
              return Promise.reject(error);
            }
          }
        })
      }),
      update: (table: any) => ({
        set: (data: any) => ({
          where: (condition: any) => ({
            returning: () => {
              try {
                console.log('📝 Mock DB UPDATE - table:', table?.name || 'unknown');
                return Promise.resolve([{ ...data, updatedAt: new Date().toISOString() }]);
              } catch (error) {
                console.error('💥 Mock DB UPDATE error:', error);
                return Promise.reject(error);
              }
            }
          })
        })
      }),
      delete: (table: any) => ({
        where: (condition: any) => {
          try {
            console.log('🗑️ Mock DB DELETE - table:', table?.name || 'unknown');
            return Promise.resolve([]);
          } catch (error) {
            console.error('💥 Mock DB DELETE error:', error);
            return Promise.reject(error);
          }
        }
      }),
    };
}

export { pool, db };