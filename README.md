# HospitalityOS: Daily Operations Hub V1 (Serverless Stack)

> 📘 **Full System Documentation:** For complete architecture, Prisma database schemas, API specs, background workflows, and feature guides consolidated into a single LLM-friendly file, see **[HOSPITALITY_OS_MASTER_CONTEXT.md](file:///E:/webstack/ClimForge/Hotel%20management/docs/HOSPITALITY_OS_MASTER_CONTEXT.md)** inside the [`docs/`](file:///E:/webstack/ClimForge/Hotel%20management/docs) folder.

Welcome to **HospitalityOS**, an AI-powered operational intelligence platform for hotel operations.

This repository is configured as a single-root, serverless-ready **Next.js** application designed for zero-infrastructure deployment costs (hosted on Vercel and Supabase).

---

## 🛠️ Tech Stack & Design Choices

*   **Framework:** [Next.js 16](https://nextjs.org/) (React 19, Bootstrap 5 layout utilities, custom **Precision Operational Tooling** token system in `globals.css`)
*   **Iconography:** Standardized on **Material Symbols Outlined**
*   **Database & ORM:** [Supabase PostgreSQL](https://supabase.com/) with [Prisma ORM](https://www.prisma.io/)
*   **Authentication & RLS:** [Supabase Auth & Row Level Security](https://supabase.com/docs/guides/auth)
*   **Storage:** [Supabase Storage](https://supabase.com/docs/guides/storage)
*   **Queue & Event Logs:** [Inngest](https://www.inngest.com/) (Serverless event queue, triggering Next.js HTTP API endpoints for background jobs and SLA check delays with **zero** persistent server costs)
*   **AI Engine:** [Vercel AI SDK](https://sdk.ai.bytpl.dev/) abstraction supporting **Google Gemini** (default: 2.5 Flash) and **OpenAI**. Includes a resilient local mock fallback mode if API keys are absent.
*   **Data Export:** Native CSV export engine across all department views (`csvExport.ts`).

---

## 📂 Repository Structure

```
├── docs/                # Architecture, design briefs, and feature requirements specs
│   ├── design.md
│   └── FEATURE_REQUIREMENTS.md
├── prisma/
│   ├── schema.prisma   # Database schema for Supabase Postgres
│   └── seed.ts         # Database seeder (departments, users, rooms, tasks)
├── public/
│   ├── sw.js           # PWA Service Worker (offline network fallback)
│   ├── manifest.json   # PWA manifest configurations
│   └── icons/          # App icons
├── src/
│   ├── app/
│   │   ├── api/                     # Serverless Next.js API endpoints
│   │   ├── dev/simulator/           # Access-gated Integration Payload Simulator (/dev/simulator)
│   │   ├── globals.css              # Precision Operational Tooling design system tokens
│   │   ├── layout.tsx               # Root layout & Material Symbols fonts
│   │   └── page.tsx                 # Operations Control Room Dashboard
│   ├── components/
│   │   ├── dashboard/               # Header, StatsOverview KPI hierarchy
│   │   ├── departments/             # Reception, Housekeeping, Maintenance, Kitchen, Restaurant, Security, Management
│   │   ├── notifications/           # Real-Time Outbox Feed
│   │   ├── simulator/               # Integration Simulator form component
│   │   └── tasks/                   # Task cards, Creation & Manager Override modals
│   ├── inngest/
│   │   └── functions.ts             # Inngest Background Tasks (AI, Booking, SLA Checks)
│   └── lib/
│       ├── ai.ts                    # Vercel AI SDK service engine
│       ├── csvExport.ts             # Client-side CSV export generator
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

The **Integration Payload Simulator** is access-gated to dev/demo environments and hosted separately at **`/dev/simulator`**.

You can simulate:
1.  **Incoming Guest WhatsApp Messages:** Triggers Inngest event `guest.request.created`. The AI parses the intent, resolves the booking, creates the tasks, and registers the **SLA delayed checks**.
2.  **PMS Reservation Syncs:** Triggers `booking.created` to prepopulate arrival checklists and room turnover status.
3.  **Low Inventory Alerts:** Triggers `inventory.low` to create procurement tasks and vendor draft POs.
4.  **Asset Failures:** Triggers `maintenance.due` to generate predictive repair work orders.

*If no AI API keys are defined in `.env`, the system will automatically run in **mock AI parser mode** (using local keyword matching) so you can test all workflows for free!*
