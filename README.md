<div align="center">

# SLSH
### *Smooth · Live · Sweet · Home*

A modern web application for smart residential building management — unifying parcel tracking, utility billing, asset maintenance, and resident-to-admin communication in a single, role-aware platform.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-v5-purple)](https://authjs.dev/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Overview

**SLSH** is a full-stack management console built for residential and mixed-use buildings. It gives building administrators a single dashboard to track incoming parcels, manage utility bills, monitor facility assets, and communicate with residents — while residents get a focused, self-service portal for their own parcels, bills, and profile.

The application is built around **role-based access control**, separating the experience into two dedicated areas:

- **Admin console** — dashboard, parcel intake/handover, resident directory, utility billing, messaging, and asset/maintenance tracking.
- **Resident portal** — personal parcel history, bill overview, and profile management.

---

## Key Features

- **Secure Authentication & RBAC**
  Credential-based sign-in via **NextAuth.js (v5)**, with hashed passwords (`bcryptjs`) and route-level middleware that enforces `ADMIN` / `RESIDENT` role separation across the entire app.

- **Parcel Tracking & Management**
  Admins log incoming parcels per unit/carrier, track `PENDING → DELIVERED` status, and hand off to the correct recipient. Residents see live status of their own deliveries.

- **Smart Billing & Invoicing**
  Utility bills are generated per unit and period, tracked through `UNPAID → PAID` status, with linked payment records for a clean audit trail.

- **Resident ↔ Admin Messaging**
  A per-unit conversation thread with read/unread tracking, backed by a notification system (`PARCEL_ARRIVED`, `BILL_CREATED`, `BILL_PAID`, `MESSAGE`) and a live unread-count badge in the UI.

- **Asset & Maintenance Tracking**
  Building assets (equipment, facilities) are catalogued with condition and value, alongside a full maintenance history log.

- **Responsive, Component-Driven UI**
  Built with **Tailwind CSS v4** and **Radix UI** primitives (dialogs, dropdowns), with data fetching handled through **TanStack Query** for a fast, real-time feel without full-page reloads.

- **Containerized Deployment**
  Ships as a multi-stage **Docker** build producing a minimal, production-ready Next.js standalone image.

---

## Tech Stack

| Layer                     | Technology                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| **Frontend**              | Next.js 16 (App Router), React 19, Tailwind CSS 4, JavaScript              |
| **UI Components**         | Radix UI, Lucide Icons, Sonner (toasts)                                   |
| **Data Fetching / State** | TanStack React Query                                                       |
| **Database**              | PostgreSQL                                                                 |
| **ORM**                   | Prisma ORM                                                                 |
| **Authentication**        | NextAuth.js (Auth.js v5) — credentials provider, JWT sessions, RBAC        |
| **Validation**            | Zod                                                                        |
| **Containerization**      | Docker (multi-stage build, standalone Next.js output)                     |
| **Tooling**                | ESLint, npm                                                                |

---

## Database Schema Overview

The data model is designed around a **Unit-centric** structure — every resident, parcel, bill, and message is scoped to a physical unit, which keeps building-level reporting and access control straightforward.

| Model            | Purpose                                                                 |
|-------------------|--------------------------------------------------------------------------|
| `User`            | Authenticated accounts (`ADMIN` / `RESIDENT`), linked to a `Unit`        |
| `Unit`            | A physical apartment/unit — the anchor for residents, bills, and parcels |
| `Parcel`          | Incoming deliveries, tracked from check-in to hand-off (`PENDING`/`DELIVERED`) |
| `Bill` / `Payment`| Utility invoices per unit/period, with linked payment records            |
| `Vehicle`         | Registered vehicles per unit                                             |
| `Thread` / `Message` | Per-unit conversation between resident and admin                     |
| `Notification`    | In-app alerts (parcel arrivals, bill events, new messages)               |
| `Asset` / `MaintenanceLog` | Facility/equipment inventory and service history                 |

Full schema definition: [`src/prisma/schema.prisma`](src/prisma/schema.prisma)

---

## Quick Start (Docker)

The fastest way to run SLSH locally is with the pre-built Docker image — no local Node.js or PostgreSQL installation required (a reachable PostgreSQL instance is still needed).

```bash
docker run -d \
  --name slsh-tracker \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=public" \
  -e NEXTAUTH_SECRET="<your-random-32-byte-secret>" \
  -e AUTH_TRUST_HOST=true \
  -e NEXTAUTH_URL="http://localhost:3000" \
  slsh-tracker:latest
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

| Variable            | Description                                                              |
|----------------------|---------------------------------------------------------------------------|
| `DATABASE_URL`       | PostgreSQL connection string                                              |
| `NEXTAUTH_SECRET`    | Random secret used to sign session tokens (`openssl rand -base64 32`)    |
| `AUTH_TRUST_HOST`    | Required in production so Auth.js trusts the incoming `Host` header      |
| `NEXTAUTH_URL`       | Canonical URL of the deployed app                                        |

### Building the image yourself

```bash
docker build -t slsh-tracker:latest .
```

### Local development (without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Apply the database schema
npm run db:migrate

# 4. Start the dev server
npm run dev
```

---

## Project Structure

```
src/
├── app/
│   ├── (admin)/       # Admin-only routes: dashboard, parcels, residents, utilities, messages, assets
│   ├── (auth)/         # Login / authentication layout
│   ├── (resident)/     # Resident-only routes: my-parcels, bills, profile
│   └── api/            # NextAuth.js API route
├── actions/            # Server actions (data mutations/queries)
├── components/         # Shared UI, layout, and feature components
├── lib/                # Auth config, Prisma client, utilities
├── prisma/             # Prisma schema, migrations, seed script
└── proxy.js            # Auth middleware — enforces RBAC on protected routes
```

---

## License

This project was built for portfolio and educational purposes.
