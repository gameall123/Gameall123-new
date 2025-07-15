import { db } from './db';
import { products, categories, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const sampleCategories = [
  {
    name: 'Azione',
    description: 'Giochi d\'azione adrenalinici e sparatutto',
    imageUrl: null,
    isActive: true,
  },
  {
    name: 'Avventura',
    description: 'Epiche avventure e giochi di esplorazione',
    imageUrl: null,
    isActive: true,
  },
  {
    name: 'RPG',
    description: 'Giochi di ruolo e fantasy',
    imageUrl: null,
    isActive: true,
  },
  {
    name: 'Sport',
    description: 'Simulazioni sportive e giochi di competizione',
    imageUrl: null,
    isActive: true,
  },
  {
    name: 'Strategia',
    description: 'Giochi di strategia e tattica',
    imageUrl: null,
    isActive: true,
  },
  {
    name: 'Arcade',
    description: 'Giochi arcade e casual',
    imageUrl: null,
    isActive: true,
  },
];

const sampleProducts = [
  {
    name: 'Cyberpunk 2077',
    description: 'Un RPG d\'azione ambientato in una megalopoli futuristica ossessionata dal potere, dal glamour e dalla modifica del corpo.',
    price: 39.99,
    category: 'RPG',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
  {
    name: 'FIFA 24',
    description: 'L\'esperienza calcistica definitiva con meccaniche di gioco migliorate e modalità di gioco innovative.',
    price: 69.99,
    category: 'Sport',
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
  {
    name: 'The Witcher 3: Wild Hunt',
    description: 'Un RPG epico ambientato in un mondo fantasy ricco di scelte significative e conseguenze.',
    price: 29.99,
    category: 'RPG',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
  {
    name: 'Call of Duty: Modern Warfare III',
    description: 'L\'ultima iterazione della famosa serie di sparatutto in prima persona.',
    price: 79.99,
    category: 'Azione',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
  {
    name: 'Horizon Zero Dawn',
    description: 'Un\'avventura post-apocalittica in cui devi combattere contro macchine robotiche in un mondo selvaggio.',
    price: 49.99,
    category: 'Avventura',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
  {
    name: 'Civilization VI',
    description: 'Costruisci un impero che resisterà alla prova del tempo in questo gioco di strategia a turni.',
    price: 34.99,
    category: 'Strategia',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
  {
    name: 'Pac-Man Championship Edition',
    description: 'Il classico gioco arcade reinventato con nuove meccaniche e sfide moderne.',
    price: 19.99,
    category: 'Arcade',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
  {
    name: 'Red Dead Redemption 2',
    description: 'Un\'epica avventura nel selvaggio West con una narrazione profonda e un mondo aperto mozzafiato.',
    price: 59.99,
    category: 'Avventura',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1538481199464-7160b8298f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
  {
    name: 'Assassin\'s Creed Valhalla',
    description: 'Vivi l\'era vichinga in questo action RPG ricco di avventure e combattimenti brutali.',
    price: 44.99,
    category: 'Azione',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
  {
    name: 'NBA 2K24',
    description: 'La simulazione di basket più autentica con modalità di gioco innovative e grafica mozzafiato.',
    price: 69.99,
    category: 'Sport',
    stock: 55,
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
  {
    name: 'Elden Ring',
    description: 'Un action RPG fantasy creato da FromSoftware e George R.R. Martin con un mondo aperto mozzafiato.',
    price: 59.99,
    category: 'RPG',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
  {
    name: 'Spider-Man: Miles Morales',
    description: 'Salta nell\'universo di Spider-Man con Miles Morales in questa avventura piena di azione.',
    price: 49.99,
    category: 'Azione',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    isActive: true,
  },
];

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Insert categories
    console.log('Adding categories...');
    for (const category of sampleCategories) {
      await db.insert(categories).values(category).onConflictDoNothing();
    }
    
    // Insert products
    console.log('Adding products...');
    for (const product of sampleProducts) {
      await db.insert(products).values({
        ...product,
        price: product.price.toString()
      }).onConflictDoNothing();
    }
    
    // Set admin privileges for specific user IDs
    console.log('Setting admin privileges...');
    const adminUserIds = ['45037735', '45032407'];
    
    for (const userId of adminUserIds) {
      try {
        await db.update(users)
          .set({ isAdmin: true })
          .where(eq(users.id, userId));
        console.log(`✅ Admin privileges set for user ${userId}`);
      } catch (error) {
        console.log(`ℹ️  User ${userId} not found in database yet - will be set as admin when they first log in`);
      }
    }
    
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}