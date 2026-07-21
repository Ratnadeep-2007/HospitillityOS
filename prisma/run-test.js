/* eslint-disable */
const fs = require('fs');
const path = require('path');

// Set NODE_ENV to development to enable query logging in Prisma Client
process.env.NODE_ENV = 'development';

// 1. Manually load the DATABASE_URL from .env into process.env before Prisma loads
try {
  const envPath = path.resolve(__dirname, '../.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    // Match lines like DATABASE_URL="..." or DATABASE_URL=...
    const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?(.*?)["']?\s*$/);
    if (match) {
      process.env.DATABASE_URL = match[1];
    }
  });
} catch (e) {
  console.error('Failed to load .env file manually:', e);
}

// 2. Register ts-node for TypeScript compilation in CommonJS mode
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node'
  }
});

// 3. Configure the database URL to use the restricted hospitality_app role (preserving Supabase project ref suffix)
const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl.replace(
    'postgres.mwjgapluewfoeztxuwbz:Deep%402007supabase',
    'hospitality_app.mwjgapluewfoeztxuwbz:AppSecurePassword123!'
  );
  console.log('🔒 Connecting as restricted role: hospitality_app');
} else {
  console.error('❌ DATABASE_URL could not be resolved from .env!');
}

// 4. Execute the RLS test suite
require('./test-rls.ts');
