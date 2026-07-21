#!/bin/bash
echo "🚀 Launching HospitalityOS Local Staging Services..."

# 1. Spin up PostgreSQL container
echo "🔋 Starting PostgreSQL database container..."
docker compose up -d postgres

# 2. Wait for database connection
echo "⏱️ Waiting for database to accept connections..."
sleep 3

# 3. Setup Prisma and Seed Mock Data
echo "💾 Initializing database schema and seeding demo logs..."
npm run db:setup

# 4. Start Inngest Dev Server in background
echo "⚡ Launching Inngest Dev Server..."
npx inngest-cli@latest dev &

# 5. Start Next.js development server in foreground
echo "💻 Launching Next.js Application..."
npm run dev
