# Omnitrack Architecture

Omnitrack is designed as a monorepo containing two distinct product offerings derived from a shared codebase:
1. **Omnitrack Desktop (Offline Edition):** A local Electron app with SQLite, designed for restaurants with poor or no internet.
2. **Omnitrack Cloud (SaaS Edition):** A web-based application hosted on Vercel with a Neon PostgreSQL database, designed for multi-location access and real-time cloud operations.

## MONOREPO STRUCTURE

omnitrack/
├── backend/          # Express API for the Desktop app (connects to local SQLite)
├── cloud-backend/    # Express API for the SaaS app (connects to Neon Postgres)
├── desktop/          # Electron wrapper that bundles the `frontend` and `backend`
├── frontend/         # React frontend (Vite) - builds for both Desktop and Cloud
└── shared/           # Shared types, constants, and utilities

## 1. OMNITRACK DESKTOP (OFFLINE EDITION)

**Target Audience:** Businesses without reliable internet connections.
**Licensing:** Activation Keys via the external Product Key Manager Web App.
**Deployment:** Windows `.exe` / macOS `.dmg` via Electron.

**Data Flow:**
[ React Frontend ] <--(Local IPC/HTTP)--> [ Local Express Backend ] <--(Prisma)--> [ Local SQLite DB ]

* The `desktop` package acts as the orchestrator.
* On launch, `desktop/src/main/index.ts` forks the compiled `backend/dist/server.js`.
* The `frontend` detects the `file://` protocol and routes API calls to `localhost:5055`.
* Data remains entirely local.

## 2. OMNITRACK CLOUD (SAAS EDITION)

**Target Audience:** Businesses that want remote management, multiple locations, and zero local IT maintenance.
**Licensing:** Subscription-based (Accounts with JWT authentication).
**Deployment:** Frontend on Vercel (`omnitrack-portal.vercel.app`), Backend on Vercel (`omnitrack-cloud-backend.vercel.app`), Database on Neon (PostgreSQL).

**Data Flow:**
[ React Frontend (Vercel) ] <--(HTTPS/REST)--> [ Cloud Express Backend (Vercel) ] <--(Prisma)--> [ Neon PostgreSQL ]

* The frontend is built using `npm run build:cloud` which utilizes `.env.cloud` variables.
* The frontend proxies API calls via `vercel.json` rewrites to the cloud backend.
* The cloud backend uses `@vercel/node` to run serverless functions natively via `api/index.ts`.
* All routes are protected by a global JWT `authMiddleware` (except for public registration and status checks).

## FRONTEND STRUCTURE (REACT)

frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── modules/
│   │   ├── auth/          # Cloud login/registration
│   │   ├── setup/         # Business bootstrapping
│   │   ├── license/       # Desktop activation
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── tables/
│   │   ├── kitchen/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── suppliers/
│   │   ├── expenses/
│   │   ├── employees/
│   │   ├── reports/
│   │   ├── sync/          # (Deprecated/Disabled in new architecture)
│   │   └── settings/
│   ├── routes/
│   ├── store/             # Zustand state management
│   ├── lib/               # apiFetch wrapper for Desktop vs Cloud routing
│   ├── App.tsx
│   └── main.tsx
├── vercel.json            # Vercel deployment config (Cloud mode)
└── package.json           # Contains build:desktop and build:cloud scripts

## CLOUD BACKEND STRUCTURE (EXPRESS)

cloud-backend/
├── prisma/
│   └── schema.prisma      # PostgreSQL schema
├── src/
│   ├── config/
│   ├── modules/           # REST Controllers and Routes
│   ├── middleware/        # authMiddleware, subscriptionMiddleware
│   └── server.ts          # Express app entry point
├── api/
│   └── index.ts           # Vercel Serverless Entry Point
├── vercel.json            # Vercel routing configuration
└── package.json
