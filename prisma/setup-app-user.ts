/* eslint-disable */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating database role "hospitality_app"...');
  
  // Create role if it doesn't exist
  try {
    await prisma.$executeRawUnsafe(`
      CREATE ROLE hospitality_app WITH LOGIN PASSWORD 'AppSecurePassword123!';
    `);
    console.log('Role "hospitality_app" created.');
  } catch (e: any) {
    if (e.message.includes('already exists') || e.message.includes('duplicate key value')) {
      console.log('Role "hospitality_app" already exists.');
    } else {
      throw e;
    }
  }

  // Grant privileges
  console.log('Granting schema and table privileges...');
  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO hospitality_app;`);
  await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hospitality_app;`);
  await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hospitality_app;`);
  await prisma.$executeRawUnsafe(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hospitality_app;`);
  await prisma.$executeRawUnsafe(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hospitality_app;`);
  
  console.log('🎉 Role "hospitality_app" successfully configured with standard privileges (NO BYPASSRLS)!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
