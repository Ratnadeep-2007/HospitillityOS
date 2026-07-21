# HospitalityOS: Daily Operations Hub V1 (Serverless Stack)

Welcome to **HospitalityOS**, an AI-powered operational intelligence platform for hotel operations.

This repository is configured as a single-root, serverless-ready **Next.js** application designed for zero-infrastructure deployment costs (hosted on Vercel and Supabase).

---

## 🛠️ Tech Stack & Design Choices

*   **Framework:** [Next.js 15](https://nextjs.org/) (React, Tailwind CSS v4, containing both Frontend UI and serverless API Routes)
*   **Database & ORM:** [Supabase PostgreSQL](https://supabase.com/) with [Prisma ORM](https://www.prisma.io/)
*   **Authentication:** [Supabase Auth](https://supabase.com/docs/guides/auth)
*   **Storage:** [Supabase Storage](https://supabase.com/docs/guides/storage)
*   **Queue & Event Logs:** [Inngest](https://www.inngest.com/) (Serverless event queue, triggering Next.js HTTP API endpoints for background jobs and SLA check delays with **zero** persistent server costs)
*   **AI Engine:** [Vercel AI SDK](https://sdk.ai.bytpl.dev/) abstraction supporting **Google Gemini** (default: 2.5 Flash) and **OpenAI**. Includes a resilient local mock fallback mode if API keys are absent.

---

## 📂 Repository Structure

```
├── prisma/
│   ├── schema.prisma   # Database schema for Supabase Postgres
│   └── seed.ts         # Database seeder (departments, users, rooms, tasks)
├── public/
│   ├── sw.js           # PWA Service Worker (offline network fallback)
│   ├── manifest.json   # PWA manifest configurations
│   └── icons/          # App icons
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── inngest/             # Inngest Serverless Event Router
│   │   │   ├── dashboard/stats/     # Dashboard statistics API
│   │   │   ├── integrations/mock/   # Webhook simulators
│   │   │   └── tasks/[id]/status/   # Task updates API
│   │   ├── layout.tsx               # Root layout (PWA configurations)
│   │   └── page.tsx                 # Operations Control Room Dashboard
│   ├── inngest/
│   │   └── functions.ts             # Inngest Background Tasks (AI, Booking, SLA Checks)
│   └── lib/
│       ├── ai.ts                    # Vercel AI SDK service engine
│       ├── db.ts                    # Prisma DB client singleton
│       └── inngest.ts               # Inngest client
├── docker-compose.yml   # Optional local Postgres (if not using Supabase cloud)
├── .env                 # Environment variables
└── package.json         # Build and dependency scripts
```

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies
Ensure you have [Node.js (v18+)](https://nodejs.org/) installed:
```bash
npm install
```

### Step 2: Set Up Environment Variables
Create or edit your `.env` file at the root. Set your `DATABASE_URL` pointing to your local PostgreSQL docker container or your cloud Supabase database.

### Step 3: Run Local Services (Optional)
If you want to test PostgreSQL locally instead of on Supabase cloud:
```bash
docker compose up -d postgres
```

### Step 4: Setup the Database (Generate Schema & Seed)
Push the database schema and seed the mock dataset (7 departments, 10 employees, 20 rooms, sample guests, bookings, and active tasks):
```bash
npm run db:setup
```

### Step 5: Start the Local Development Environment
Run the Next.js development server:
```bash
npm run dev
```

### Step 6: Start Inngest Local Dev Server
Inngest provides a local development UI to inspect queued jobs, trace steps, and trigger events locally. Run this in a separate terminal:
```bash
npx inngest-cli@latest dev
```
Open [http://localhost:8288](http://localhost:8288) to view the Inngest Dev Server UI, and [http://localhost:3000](http://localhost:3000) to view the HospitalityOS Dashboard.

---

## 🔌 Using the Integration Simulator

The dashboard includes a **Mock Integration Simulator** panel on the left.

You can simulate:
1.  **Incoming Guest WhatsApp Messages:** Triggers Inngest event `guest.request.created`. The AI parses the intent, resolves the booking, creates the tasks, and registers the **SLA delayed checks**.
2.  **PMS Reservation Syncs:** Triggers `booking.created` to prepopulate arrival checklists.
3.  **Low Inventory Alerts:** Triggers `inventory.low` to create procurement tasks.
4.  **Asset Failures:** Triggers `maintenance.due` to generate repair tasks.

*If no AI API keys are defined in `.env`, the system will automatically run in **mock AI parser mode** (using local keyword matching) so you can test all workflows for free!*
