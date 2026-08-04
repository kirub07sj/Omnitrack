
## FRONTEND STRUCTURE (REACT)

frontend/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── common/
│   │   ├── forms/
│   │   ├── tables/
│   │   └── layouts/
│   │
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── SetupLayout.tsx
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── setup/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── tables/
│   │   ├── kitchen/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── purchases/
│   │   ├── suppliers/
│   │   ├── expenses/
│   │   ├── employees/
│   │   ├── users/
│   │   ├── reports/
│   │   ├── sync/
│   │   └── settings/
│   │
│   ├── routes/
│   │
│   ├── hooks/
│   │
│   ├── services/
│   │
│   ├── store/
│   │
│   ├── lib/
│   │
│   ├── utils/
│   │
│   ├── types/
│   │
│   ├── constants/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── tsconfig.json
└── vite.config.ts

## BACKEND STRUCTURE (EXPRESS)

backend/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   │
│   ├── config/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── business/
│   │   ├── users/
│   │   ├── employees/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── purchases/
│   │   ├── suppliers/
│   │   ├── expenses/
│   │   ├── payments/
│   │   ├── reports/
│   │   ├── sync/
│   │   ├── settings/
│   │   └── license/
│   │
│   ├── middleware/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   ├── database/
│   │
│   ├── utils/
│   │
│   ├── types/
│   │
│   ├── app.ts
│   └── server.ts
│
├── package.json
└── tsconfig.json



