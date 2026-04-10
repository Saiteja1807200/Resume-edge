# ResumeEdge — Freelance Resume Writing Service

## Overview

A production-ready, full-stack booking platform for a freelance resume writing service. Single-vendor model (not a marketplace). Users select a package, submit details, pay via UPI, upload payment proof, and receive order confirmation.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (artifact: `resume-service`)
- **Backend**: Express 5 (artifact: `api-server`)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- **Routing (frontend)**: wouter
- **Forms**: react-hook-form + zodResolver

## Architecture

```
artifacts/
  api-server/        # Express 5 backend, port auto-assigned
    src/routes/
      health.ts      # /api/healthz
      services.ts    # /api/services — static service package definitions
      orders.ts      # /api/orders — CRUD + payment proof + status updates
  resume-service/    # React + Vite frontend, previewPath: "/"
    src/pages/
      landing.tsx    # Landing page with hero, packages, process, testimonials
      order.tsx      # 4-step order flow
      confirmation.tsx # Order confirmation page
      admin.tsx      # Admin panel for order management
lib/
  api-spec/openapi.yaml  # OpenAPI 3.1 spec — source of truth
  api-client-react/      # Generated React Query hooks
  api-zod/               # Generated Zod validation schemas
  db/
    src/schema/
      orders.ts          # orders table schema
```

## Service Packages

| Package | Price | Delivery |
|---------|-------|----------|
| Basic Resume | ₹999 | 5 days |
| Professional Resume (ATS optimized) | ₹1,999 | 3 days |
| Premium Resume (ATS + recruiter rewrite) | ₹3,499 | 2 days |

Add-ons: Express Delivery (+₹499), ATS Optimization Boost (+₹299)

## Order Flow

1. **Select Plan** — Choose package + optional add-ons, see total dynamically
2. **Fill Details** — Name, email, phone, target job role, work experience, notes
3. **Make Payment** — Display UPI ID `resumeedge@upi` with QR code placeholder
4. **Upload Proof** — Base64 screenshot upload + optional transaction ID → confirmation page

Order status lifecycle: `pending_payment` → `pending_verification` → `confirmed` → `in_progress` → `delivered`

## Key Routes

- `/` — Landing page
- `/order` — 4-step booking flow
- `/confirmation` — Order confirmation (reads orderId from localStorage)
- `/admin` — Admin panel (no auth, protected by obscurity)

## API Endpoints

- `GET  /api/services` — List service packages
- `POST /api/orders` — Create order
- `GET  /api/orders` — List all orders (admin)
- `GET  /api/orders/:orderId` — Get single order
- `PATCH /api/orders/:orderId/status` — Update status (admin)
- `POST /api/orders/:orderId/payment-proof` — Upload payment proof (base64)
- `GET  /api/orders/stats` — Order statistics

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/resume-service run dev` — run frontend locally

## Design System

- Color palette: Indigo primary (239 84% 67%), white background, gray text
- Typography: Inter (system-ui fallback)
- Components: shadcn/ui
- Mobile-first, minimal SaaS style

## Scalability Notes

- Services are defined as a static array in `artifacts/api-server/src/routes/services.ts` — easy to move to DB or CMS
- Order schema includes `addOns[]` array — new add-ons just need to be added to the ADD_ONS config array in `order.tsx`
- New service types (LinkedIn, cover letters) can be added as new packages without touching the core order flow
- File uploads use base64 data URLs stored in PostgreSQL — for production scale, replace `paymentScreenshotUrl` and `resumeFileUrl` with object storage (S3/R2) URLs
