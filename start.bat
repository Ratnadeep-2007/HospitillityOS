@echo off
echo 🚀 Launching HospitalityOS Local Staging Services...

:: 1. Free ports 3000 (Next.js) and 8288 (Inngest) if they are in use
echo 🧹 Checking and clearing ports 3000 (Next.js) and 8288 (Inngest)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":3000 "') do (
    echo Killing process %%a on port 3000...
    taskkill /f /pid %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":8288 "') do (
    echo Killing process %%a on port 8288...
    taskkill /f /pid %%a 2>nul
)

:: 2. Choose Database Connection
set "CHOOSE_DB=y"
set /p CHOOSE_DB="🔋 Are you using Supabase Cloud database? (Y/N, default: Y): "
if /i "%CHOOSE_DB%"=="n" (
    echo 🔋 Starting PostgreSQL database container...
    docker compose up -d postgres
    echo ⏱️ Waiting for database to accept connections...
    timeout /t 3 /nobreak > NUL
) else (
    echo ☁️ Bypassing local Postgres Docker container. Connecting to cloud database...
)

:: 3. Setup Prisma and Seed Mock Data
echo 💾 Initializing database schema and seeding demo logs...
call npm run db:setup

:: 4. Start Inngest Dev Server in a new window
echo ⚡ Launching Inngest Dev Server...
start "Inngest Dev Server" npx inngest-cli@latest dev

:: 5. Start Next.js development server in current window
echo 💻 Launching Next.js Application...
call npm run dev
