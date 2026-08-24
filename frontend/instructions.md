Implementation Plan

 Phase 1: Extract Shared Code

 Goal: Move common types and utilities into shared/ so both backends
 can import them.

 Files to create:
 - shared/types/index.ts - Export all TypeScript interfaces
 (Business, User, Employee, Product, Category, Order, Sale, etc.)
 - shared/constants/index.ts - Export role names, status enums, etc.
 - shared/validators/index.ts - Zod schemas for request validation
 - shared/utils/index.ts - Pure functions (date formatting,
 calculations, etc.)

 Files to modify:
 - Update backend/tsconfig.json and cloud-backend/tsconfig.json to
 reference shared/
 - Update imports in backend/src/ modules to use @shared/* instead of
 local types
 - Update imports in frontend/src/ to use @shared/* for types

 Note: Use TypeScript path aliases in tsconfig.json:
 {
   "compilerOptions": {
     "paths": {
       "@shared/*": ["../shared/*"]
     }
   }
 }

 ---
 Phase 2: Make Frontend Environment-Aware

 Goal: Frontend should detect if it's running in "desktop mode"
 (talking to http://localhost:5055) or "cloud mode" (talking to a
 remote API like https://api.omnitrack.com).

 Files to modify:

 1. frontend/.env.development and frontend/.env.production
 # Desktop mode (default)
 VITE_API_BASE_URL=http://localhost:5055
 VITE_MODE=desktop

 # Cloud mode (set when building for cloud)
 # VITE_API_BASE_URL=https://api.omnitrack.com
 # VITE_MODE=cloud
 2. frontend/src/store/useAppStore.ts
   - Add isCloudMode computed from import.meta.env.VITE_MODE
   - Modify checkSetupStatus():
       - In desktop mode: check /api/license/status → show
 ActivationPage if not licensed
     - In cloud mode: skip license check, go straight to login/signup
 3. frontend/src/App.tsx
   - Current flow: isLicensed ? (currentUser ? Dashboard : Login) :
 ActivationPage
   - New flow:
 if (isCloudMode) {
   // Cloud: no license check, just auth
   return currentUser ? <Dashboard /> : <CloudAuth />
 } else {
   // Desktop: license → local login
   return isLicensed ? (currentUser ? <Dashboard /> : <Login />) :
 <ActivationPage />
 }
 4. frontend/src/modules/auth/CloudAuth.tsx (NEW)
   - Cloud-only login/signup page
   - Calls /api/account/login (cloud-backend)
   - Stores JWT token in localStorage
   - On successful login, redirects to dashboard
 5. frontend/vite.config.ts
   - Add build script for cloud:
 "scripts": {
   "build:desktop": "vite build",
   "build:cloud": "VITE_MODE=cloud
 VITE_API_BASE_URL=https://api.omnitrack.com vite build --outDir
 dist-cloud"
 }

 ---
 Phase 3: Expand Cloud Backend

 Goal: Turn cloud-backend/ into a full-featured backend that mirrors
 backend/ but uses PostgreSQL and account-based auth.

 Files to create:

 1. cloud-backend/prisma/schema.prisma
   - Copy the entire schema from backend/prisma/schema.prisma
   - Change provider = "sqlite" to provider = "postgresql"
   - Add new tables:
 model Account {
   id            String   @id @default(uuid())
   email         String   @unique
   password_hash String
   firstName     String?
   lastName      String?
   created_at    DateTime @default(now())
   updated_at    DateTime @updatedAt

   subscriptions Subscription[]
 }

 model Subscription {
   id           String   @id @default(uuid())
   account_id   String
   business_id  String   @unique
   plan         String   // 'free', 'pro', 'enterprise'
   status       String   // 'active', 'canceled', 'expired'
   starts_at    DateTime
   expires_at   DateTime?
   created_at   DateTime @default(now())

   account Account  @relation(fields: [account_id], references: [id])
   business Business @relation(fields: [business_id], references:
 [id])
 }

 // Add to Business model:
 model Business {
   // ... existing fields
   subscription Subscription?
 }
 2. cloud-backend/src/modules/account/
   - account.routes.ts - POST /api/account/register, POST
 /api/account/login
   - account.controller.ts - Handle registration, login, JWT
 generation
   - account.service.ts - Hash passwords (bcrypt), validate emails
 3. cloud-backend/src/modules/subscription/
   - subscription.routes.ts - GET /api/subscription/status
   - subscription.service.ts - Check if user has active subscription
 4. cloud-backend/src/middleware/auth.middleware.ts
   - Verify JWT token from Authorization: Bearer <token> header
   - Attach req.user (decoded token with account_id, business_id)
 5. cloud-backend/src/middleware/subscription.middleware.ts
   - Check if req.user.business_id has an active subscription
   - Block request if subscription is expired or canceled
 6. Copy all business logic modules from backend/src/modules/
   - business/, products/, inventory/, orders/, sales/, expenses/,
 employees/, etc.
   - Modify each controller to use req.user.business_id (from JWT)
 instead of expecting business_id in query/body
   - Remove license/ module (cloud doesn't use license keys)
 7. cloud-backend/src/app.ts
   - Import all routes
   - Apply authMiddleware globally (except /api/account/login,
 /api/account/register, /api/health)
   - Apply subscriptionMiddleware to protected routes
 8. cloud-backend/src/server.ts
   - Start Express on port 8000 (or configured PORT)
   - Remove sync engine (cloud doesn't sync to another cloud—it IS
 the cloud)

 Files to modify:
 - cloud-backend/package.json - Add dependencies: bcryptjs,
 jsonwebtoken, @types/bcryptjs, @types/jsonwebtoken
 - cloud-backend/.env - Add JWT_SECRET, DATABASE_URL (PostgreSQL
 connection string)

 ---
 Phase 4: Update Desktop Build Process

 Goal: Ensure desktop/ continues to bundle the built frontend and
 backend correctly.

 Files to modify:

 1. desktop/electron-builder.yml
   - Ensure resources/backend/dist/ is included (already done)
   - Ensure resources/frontend/ contains the built React app (already
 done)
 2. desktop/package.json scripts:
 {
   "scripts": {
     "build": "npm run typecheck && electron-vite build && npm run
 copy-resources",
     "copy-resources": "node scripts/copy-resources.js"
   }
 }
 3. desktop/scripts/copy-resources.js (NEW, or existing build script)
   - Copy ../backend/dist/ → desktop/resources/backend/dist/
   - Copy ../backend/prisma/empty.db →
 desktop/resources/backend/prisma/empty.db
   - Copy ../frontend/dist/ → desktop/resources/frontend/
 4. Build order (root package.json):
 {
   "scripts": {
     "build:backend": "cd backend && npm run build",
     "build:frontend:desktop": "cd frontend && npm run
 build:desktop",
     "build:desktop": "npm run build:backend && npm run
 build:frontend:desktop && cd desktop && npm run build",
     "build:cloud": "cd cloud-backend && npm run build && cd
 ../frontend && npm run build:cloud"
   }
 }

 No changes needed to desktop/src/main/index.ts - it already forks
 the backend and loads the frontend correctly.

 ---
 Phase 5: Deploy Cloud Product

 Goal: Deploy cloud-backend/ and frontend/dist-cloud/ to hosting.

 Hosting recommendations:
 - Cloud Backend: Railway, Render, Heroku, DigitalOcean App Platform,
 or Vercel (for API routes)
 - Cloud Frontend: Vercel, Netlify, Cloudflare Pages, or serve from
 the same backend as static files
 - Database: Neon, Supabase, Railway Postgres, or any managed
 PostgreSQL

 Deployment steps:
 1. Create PostgreSQL database (e.g., Neon)
 2. Set environment variables on hosting platform:
 DATABASE_URL=postgresql://...
 JWT_SECRET=<random-secret>
 PORT=8000
 NODE_ENV=production
 3. Deploy cloud-backend/:
   - Install dependencies
   - Run npx prisma migrate deploy (apply migrations)
   - Run npm start (or node dist/server.js)
 4. Deploy frontend/dist-cloud/:
   - Upload to CDN or static hosting
   - Set environment variable:
 VITE_API_BASE_URL=https://api.omnitrack.com

 ---
 Summary of Changes

 ┌─────────────┬───────────────────┬────────────────────────────┐
 │  Component  │  Desktop Product  │       Cloud Product        │
 ├─────────────┼───────────────────┼────────────────────────────┤
 │             │ Build with VITE_M │ Build with                 │
 │ Frontend    │ ODE=desktop,      │ VITE_MODE=cloud, talks to  │
 │             │ talks to          │ cloud API                  │
 │             │ localhost:5055    │                            │
 ├─────────────┼───────────────────┼────────────────────────────┤
 │             │ License           │                            │
 │ Auth Flow   │ activation →      │ Account signup/login (JWT) │
 │             │ local login       │                            │
 ├─────────────┼───────────────────┼────────────────────────────┤
 │             │ Express + SQLite  │ Express + PostgreSQL       │
 │ Backend     │ (bundled in       │ (deployed)                 │
 │             │ Electron)         │                            │
 ├─────────────┼───────────────────┼────────────────────────────┤
 │             │ Local SQLite file │                            │
 │ Database    │  in user data     │ Cloud PostgreSQL database  │
 │             │ directory         │                            │
 ├─────────────┼───────────────────┼────────────────────────────┤
 │ Access      │ ProdKey license   │ JWT token + subscription   │
 │ Control     │ certificate       │ status                     │
 ├─────────────┼───────────────────┼────────────────────────────┤
 │ Distributio │ Electron          │ Web URL (https://app.omnit │
 │ n           │ installer (.exe,  │ rack.com)                  │
 │             │ .dmg, .AppImage)  │                            │
 └─────────────┴───────────────────┴────────────────────────────┘

 Shared between both:
 - All React components (UI, layouts, modules)
 - All business logic (controllers, services)
 - All types and utilities (shared/)

 ---
 Verification

 Desktop Product

 1. Run npm run build:desktop (builds backend, frontend, packages
 Electron)
 2. Install the generated .exe/.dmg
 3. Launch app → shows activation page
 4. Enter license key → activates via ProdKey API
 5. See business setup wizard → create business → local login
 6. Use app offline → data stored in local SQLite

 Cloud Product

 1. Deploy cloud-backend to Railway/Render
 2. Deploy frontend/dist-cloud to Vercel/Netlify
 3. Open https://app.omnitrack.com
 4. See signup/login page (no activation)
 5. Register account → receives JWT token
 6. Create business → data stored in cloud PostgreSQL
 7. Use app online → API calls authenticated with JWT

 ---
 Critical Files Reference

 Existing files to modify:

 - frontend/src/App.tsx - Add cloud/desktop routing logic
 - frontend/src/store/useAppStore.ts - Add isCloudMode flag
 - frontend/vite.config.ts - Add cloud build target
 - cloud-backend/prisma/schema.prisma - Add Account, Subscription
 tables
 - cloud-backend/src/server.ts - Expand to full backend

 New files to create:

 - shared/types/index.ts - Shared TypeScript types
 - shared/constants/index.ts - Shared constants
 - frontend/src/modules/auth/CloudAuth.tsx - Cloud signup/login
 - cloud-backend/src/modules/account/ - Account registration/login
 - cloud-backend/src/modules/subscription/ - Subscription management
 - cloud-backend/src/middleware/auth.middleware.ts - JWT verification
 - cloud-backend/src/middleware/subscription.middleware.ts -
 Subscription check
 - Copy all modules from backend/src/modules/ to
 cloud-backend/src/modules/

 Files to keep as-is:

 - desktop/src/main/index.ts - Electron main process (no changes
 needed)
 - backend/src/ - Desktop backend (no changes needed)
 - frontend/src/modules/license/ActivationPage.tsx - Desktop-only (no
 changes)
 - All other frontend modules (products, inventory, orders, etc.) -
 unchanged

 ---
 Next Steps

 Once this plan is approved:
 1. Create shared/ directory structure
 2. Modify frontend to be environment-aware
 3. Expand cloud-backend with account/subscription modules
 4. Update build scripts
 5. Test desktop build (license activation → local app)
 6. Test cloud build (account signup → cloud app)
 7. Deploy cloud product to hosting platform