# DispatchPro — Project Handoff

**Repository:** https://github.com/abdur4430/dispatch-pro  
**Local path:** `/Users/muhammadabdurrehman/dev/dispatch-pro`  
**Status:** Fully functional, running locally  
**Last updated:** April 2026

---

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [How to Run It](#2-how-to-run-it)
3. [Architecture Overview](#3-architecture-overview)
4. [Tech Stack & Why](#4-tech-stack--why)
5. [Critical Gotchas](#5-critical-gotchas)
6. [File Structure](#6-file-structure)
7. [Database & Data Model](#7-database--data-model)
8. [GraphQL API](#8-graphql-api)
9. [Authentication](#9-authentication)
10. [External APIs (Free, No Keys)](#10-external-apis-free-no-keys)
11. [Pages & Features](#11-pages--features)
12. [Environment Variables](#12-environment-variables)
13. [What Needs API Keys to Unlock](#13-what-needs-api-keys-to-unlock)
14. [Known Issues & Limitations](#14-known-issues--limitations)
15. [Deployment Guide](#15-deployment-guide)
16. [Suggested Next Features](#16-suggested-next-features)
17. [Test Credentials](#17-test-credentials)

---

## 1. What This Is

DispatchPro is a **full-stack truck dispatching management platform** built for independent dispatchers and small-to-mid fleets. It covers the full dispatch workflow:

- **Company setup** — DOT number, MC number, address, contact info
- **Fleet management** — trucks by size, usage type, segment, load capacity, distance range, per-truck license/permit tracking with expiry
- **Driver management** — CDL tracking, status, truck assignment
- **Client management** — billing profiles, contact info, active/inactive status
- **Dispatch orders** — 6-status workflow (Pending → Confirmed → In Transit → At Pickup → Loaded → Delivered → Completed), rate types, full route details
- **Dialer** — softphone UI integrated with your driver/client contacts, call history, power dialer
- **Market board** — load board, driver jobs, FMCSA carrier lookup, industry news
- **Route map** — interactive map with real routing, weather along route, per-mile calculator
- **Industry guides** — truck types, client playbook, outreach scripts (all hardcoded reference content)
- **Dark/Light mode** — CSS variable theming with localStorage persistence

---

## 2. How to Run It

### Prerequisites
- Node.js 20+
- Git
- GitHub CLI (`gh`) — already authenticated as `abdur4430`

### First time setup
```bash
cd /Users/muhammadabdurrehman/dev/dispatch-pro
npm install
```

### Start dev server
```bash
DATABASE_URL="file:/Users/muhammadabdurrehman/dev/dispatch-pro/dev.db" npm run dev
```

**Why the explicit env var?** Next.js reads `.env.local` for most runtime code, but the Prisma singleton initializes at module load time — before Next.js guarantees env loading. Passing the var explicitly in the shell ensures it's in `process.env` from the start. See §5 for the full explanation.

The server starts at **http://localhost:3000**

### Verify it's working
```bash
curl -s -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ me { id email } }"}' | python3 -m json.tool
```

Should return `{ "data": { "me": null } }` (null = not signed in, which is correct).

---

## 3. Architecture Overview

```
Browser
  │
  ├── React (Next.js 16, App Router)
  │     ├── Apollo Client v4 → /api/graphql
  │     ├── NextAuth client hooks → /api/auth/*
  │     ├── Leaflet (map) — dynamic import (no SSR)
  │     └── React Three Fiber (3D scenes) — dynamic import
  │
Next.js Server
  │
  ├── /api/graphql          Apollo Server 4 → GraphQL resolvers → Prisma → SQLite
  ├── /api/auth/[...nextauth]  NextAuth v4 credentials provider
  ├── /api/geocode          Proxy to Nominatim (OpenStreetMap geocoder)
  ├── /api/route-plan       Proxy to OSRM (free truck routing)
  ├── /api/weather          Proxy to Open-Meteo (free weather API)
  ├── /api/fmcsa            FMCSA carrier lookup (mock data or real with key)
  └── /api/crawl            Load board + jobs + news (mock data + RSS)
  │
Prisma 7 (driver adapter mode)
  └── libsql → dev.db (SQLite file at project root)
```

**Request flow for a typical page:**
1. Page component mounts, calls `useQuery(SOME_GQL_QUERY)`
2. Apollo Client sends POST to `/api/graphql`
3. Apollo Server resolves using `prisma.*` calls
4. Prisma queries SQLite via the libsql adapter
5. Data returns through the chain to the component

---

## 4. Tech Stack & Why

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16.2.4 (App Router) | Full-stack in one repo, API routes co-located with pages |
| Language | TypeScript | Throughout — types generated from Prisma schema |
| Styling | Tailwind CSS v4 | `@theme inline` for custom design tokens; CSS variables for theming |
| UI Components | Hand-written | No shadcn CLI — raw Tailwind + Radix UI primitives for full control |
| State | Apollo Client cache | All server state lives in Apollo's normalized cache |
| GraphQL Server | Apollo Server 4 | Single `/api/graphql` endpoint covers all data operations |
| ORM | Prisma 7 | Type-safe DB access; driver adapter mode for edge-compatible SQLite |
| Database | SQLite (libsql) | Zero-config local dev; swap the URL for Turso/PlanetScale for production |
| Auth | NextAuth v4 | Credentials provider + JWT; sessions stored in HTTP-only cookies |
| 3D / Landing | React Three Fiber + drei | Truck convoy animation on landing page; globe on dashboard |
| Maps | Leaflet + react-leaflet | Free, no API key, dark map tiles via CartoDB |
| Routing | OSRM (public API) | Free truck routing, no account needed |
| Weather | Open-Meteo | Free weather API, no key required, 10,000 calls/day |
| Geocoding | Nominatim (OSM) | Free address → coordinates, rate-limited to 1 req/sec |
| Animations | Framer Motion | Page transitions and landing page animations |
| Icons | Lucide React | Consistent icon set throughout |

---

## 5. Critical Gotchas

These are non-obvious issues that caused significant debugging time. Read all of these before touching the database or Prisma config.

### 5.1 — PrismaLibSql takes a CONFIG object, not a client instance

**The bug that cost hours:**

```typescript
// ❌ WRONG — this is what broke everything
const libsql = createClient({ url });
const adapter = new PrismaLibSql(libsql); // passing a client, NOT config

// ✅ CORRECT — PrismaLibSql creates its own client internally
const adapter = new PrismaLibSql({ url });
```

`PrismaLibSql` accepts `{ url, authToken? }` as its first argument. It calls `createClient()` internally. If you pass a pre-created client, it treats the client object as the config, `url` resolves to `undefined`, and you get:

```
URL_INVALID: The URL 'undefined' is not in a valid format
```

This error is thrown by libsql deep inside the Prisma runtime on the first query — not at client construction time — making it extremely confusing to trace.

### 5.2 — libsql URL format

libsql does NOT support `file:///path` (three slashes). Use:
- `file:/absolute/path/to/dev.db` — single slash for absolute
- `file:./relative/path.db` — relative to CWD

The `.env.local` currently has:
```
DATABASE_URL="file:/Users/muhammadabdurrehman/dev/dispatch-pro/dev.db"
```

### 5.3 — Prisma 7 schema has NO `url` in datasource

Prisma 7 moved the datasource URL out of `schema.prisma` and into `prisma.config.ts`. The schema datasource block is:
```prisma
datasource db {
  provider = "sqlite"
  // NO url here — this is intentional for Prisma 7
}
```
The URL for migrations lives in `prisma.config.ts`. The runtime URL comes from `process.env.DATABASE_URL` via the adapter.

### 5.4 — Prisma singleton uses a Proxy for lazy initialization

```typescript
// src/lib/prisma.ts
let _prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (_prisma) return _prisma;
  const url = process.env.DATABASE_URL ?? "file:/Users/.../dev.db";
  const adapter = new PrismaLibSql({ url } as any);
  _prisma = new PrismaClient({ adapter } as any);
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    return (getPrismaClient() as any)[prop];
  },
});
```

**Why the Proxy?** The global singleton pattern (`export const prisma = globalForPrisma.prisma ?? createPrismaClient()`) initializes at module load time. Turbopack can evaluate modules before `process.env` is populated, causing `DATABASE_URL` to be `undefined`. The Proxy defers client creation until the first actual property access, which always happens during a request (when env vars are guaranteed to be available).

**Do not change this back to the simple singleton pattern** without understanding the above.

### 5.5 — Apollo Client v4 has split imports

Apollo Client v4 split the package into subpaths:

```typescript
// ❌ This won't work in v4
import { useQuery, ApolloClient, gql } from "@apollo/client";

// ✅ Correct v4 imports
import { useQuery, useMutation } from "@apollo/client/react";   // React hooks
import { ApolloClient, InMemoryCache, gql } from "@apollo/client/core";  // Core
import { ApolloProvider } from "@apollo/client/react";  // Provider
```

Every page file follows this pattern. If you add a new page, use these imports.

### 5.6 — Leaflet must be dynamically imported (no SSR)

```typescript
// ✅ In the page
const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

// ✅ Inside MapView.tsx — import leaflet dynamically too
import("leaflet").then((L) => { ... });
```

Leaflet reads `window` at import time. SSR will crash. Always `ssr: false` and dynamic import.

### 5.7 — React Three Fiber scenes must also be dynamic imports

```typescript
const LandingHero = dynamic(() => import("@/components/three/LandingHero"), { ssr: false });
const DashboardGlobe = dynamic(() => import("@/components/three/DashboardGlobe"), { ssr: false });
```

### 5.8 — Running migrations

```bash
cd /Users/muhammadabdurrehman/dev/dispatch-pro
npx prisma migrate dev --name your_migration_name
```

This uses `prisma.config.ts` for the datasource URL (separate from runtime). The config reads `DATABASE_URL` from `.env` (not `.env.local` — dotenv loads `.env`). If migration fails with URL errors, check `prisma.config.ts` and make sure `.env` (not `.env.local`) has `DATABASE_URL`.

---

## 6. File Structure

```
dispatch-pro/
├── prisma/
│   ├── schema.prisma          — Data models (no url in datasource — Prisma 7)
│   └── migrations/            — SQL migration history
├── prisma.config.ts           — Prisma 7 datasource config (used for migrations)
├── dev.db                     — SQLite database (gitignored)
├── .env.local                 — Runtime env vars (gitignored)
│
└── src/
    ├── app/
    │   ├── layout.tsx         — Root layout (ThemeProvider + SessionProvider + ApolloProvider)
    │   ├── globals.css        — Tailwind v4 + CSS variable theming system
    │   ├── page.tsx           — Landing page (3D truck scene)
    │   │
    │   ├── (auth)/            — Unauthenticated layout (centered card on dark bg)
    │   │   ├── sign-in/page.tsx
    │   │   └── sign-up/page.tsx
    │   │
    │   ├── (app)/             — Authenticated layout (sidebar + topbar)
    │   │   ├── layout.tsx     — AppSidebar + main content area
    │   │   ├── dashboard/page.tsx
    │   │   ├── trucks/page.tsx, trucks/[id]/page.tsx, trucks/new/page.tsx
    │   │   ├── drivers/page.tsx, drivers/[id]/page.tsx, drivers/new/page.tsx
    │   │   ├── clients/page.tsx, clients/[id]/page.tsx, clients/new/page.tsx
    │   │   ├── dispatch/page.tsx, dispatch/[id]/page.tsx, dispatch/new/page.tsx
    │   │   ├── dialer/page.tsx
    │   │   ├── market/page.tsx
    │   │   ├── map/page.tsx
    │   │   ├── company/page.tsx
    │   │   ├── settings/page.tsx
    │   │   └── guides/
    │   │       ├── page.tsx           — Guides hub
    │   │       ├── trucks/page.tsx    — Comprehensive truck guide (4 tabs)
    │   │       ├── clients/page.tsx   — Client playbook
    │   │       └── outreach/page.tsx  — Outreach scripts & templates
    │   │
    │   └── api/
    │       ├── graphql/route.ts       — Apollo Server endpoint
    │       ├── auth/[...nextauth]/    — NextAuth handler
    │       ├── geocode/route.ts       — Nominatim proxy (address search)
    │       ├── route-plan/route.ts    — OSRM proxy (truck routing)
    │       ├── weather/route.ts       — Open-Meteo proxy (weather)
    │       ├── fmcsa/route.ts         — FMCSA carrier lookup (mock or live)
    │       └── crawl/route.ts         — Load board, jobs, news data
    │
    ├── graphql/
    │   ├── schema/index.ts    — Complete GraphQL SDL type definitions
    │   └── resolvers/index.ts — All Query + Mutation resolvers
    │
    ├── lib/
    │   ├── prisma.ts          — Prisma singleton (Proxy pattern — do not simplify)
    │   ├── auth.ts            — NextAuth authOptions (CredentialsProvider + JWT)
    │   ├── apollo-client.ts   — Apollo Client singleton (client-side)
    │   └── utils.ts           — cn(), formatCurrency(), formatDateTime(), constants
    │
    ├── providers/
    │   ├── ThemeProvider.tsx  — Dark/light mode context + localStorage
    │   ├── SessionProvider.tsx — NextAuth session wrapper
    │   └── ApolloProvider.tsx  — Apollo Client wrapper
    │
    └── components/
        ├── layout/
        │   ├── AppSidebar.tsx  — Fixed left sidebar, collapsible Guides section
        │   └── AppTopbar.tsx   — Sticky header, theme toggle, notifications
        ├── map/
        │   └── MapView.tsx     — Leaflet map component (dynamic import only)
        ├── three/
        │   ├── LandingHero.tsx   — 3D truck convoy on landing page
        │   ├── DashboardGlobe.tsx — Spinning globe with route arcs
        │   └── FloatingParticles.tsx
        └── ui/
            ├── button.tsx, card.tsx, input.tsx
            ├── badge.tsx, select.tsx, textarea.tsx
            └── dialog.tsx
```

---

## 7. Database & Data Model

**Engine:** SQLite via libsql  
**File:** `dev.db` at project root (gitignored)  
**ORM:** Prisma 7 with driver adapter

### Models

```
User
├── id (cuid)
├── email (unique)
├── passwordHash
├── name
├── role (OWNER | ADMIN | DISPATCHER | VIEWER)
└── companyId → Company

Company
├── id, name, dotNumber (unique), mcNumber (unique)
├── address, city, state, zip, country
├── phone, email, website, logoUrl
└── → [users, trucks, drivers, clients, dispatchOrders]

Truck
├── id, companyId → Company
├── unitNumber, make, model, year, vin (unique)
├── licensePlate, licensePlateState, color
├── size (enum: CARGO_VAN → OTHER — 12 values)
├── usageType (DEDICATED | SPOT_MARKET | OWNER_OPERATOR | LEASE | RENTAL)
├── segment (LTL | FTL | PARTIAL_LOAD | EXPEDITED | SPECIALIZED | HAZMAT)
├── status (AVAILABLE | ON_ROUTE | MAINTENANCE | OUT_OF_SERVICE | RESERVED)
├── loadCapacityLbs, maxWeightLbs, lengthFt, widthFt, heightFt
├── distanceRange (LOCAL | REGIONAL | LONG_HAUL | ANY)
└── → [licenses: TruckLicense[], drivers: Driver[], dispatchOrders]

TruckLicense
├── id, truckId → Truck
├── licenseType, licenseNumber, issuedBy
├── issuedAt, expiresAt (DateTime — use for expiry alerts)
└── documentUrl, notes

Driver
├── id, companyId → Company
├── firstName, lastName, email, phone
├── address, city, state, zip
├── licenseNumber, licenseState, licenseClass, licenseExpiry
├── status (AVAILABLE | ON_DUTY | OFF_DUTY | ON_LEAVE | TERMINATED)
├── hireDate, terminationDate
└── assignedTruckId → Truck (nullable)

Client
├── id, companyId → Company
├── name, contactName, email, phone
├── address, city, state, zip, country
├── billing fields (billingName, billingAddress, etc.)
├── paymentTerms, creditLimit
└── isActive (Boolean)

DispatchOrder
├── id, orderNumber (unique: DP-YYYY-NNNNN)
├── companyId → Company
├── truckId → Truck (nullable), driverId → Driver (nullable), clientId → Client (nullable)
├── origin: originAddress, originCity, originState, originZip, originLat, originLng
├── dest: destAddress, destCity, destState, destZip, destLat, destLng
├── distanceMiles, pickupAt, deliveryAt, actualPickupAt, actualDeliveryAt
├── loadDescription, weightLbs, pieces, pallets
├── hazmat (Boolean), hazmatClass
├── rate, rateType (FLAT | PER_MILE | PER_HUNDREDWEIGHT | PER_PALLET)
├── fuelSurcharge, totalCharge, driverPay
├── status (PENDING → CONFIRMED → IN_TRANSIT → AT_PICKUP → LOADED → AT_DELIVERY → DELIVERED → COMPLETED | CANCELLED | ON_HOLD)
└── → [statusHistory: DispatchStatusEvent[]]

DispatchStatusEvent
├── id, dispatchOrderId → DispatchOrder
├── status (DispatchStatus)
├── note
└── occurredAt, createdAt
```

### Running migrations after schema changes

```bash
# After editing prisma/schema.prisma:
npx prisma migrate dev --name describe_your_change

# To regenerate the Prisma client after schema changes:
npx prisma generate

# To open the DB in Prisma Studio (browser GUI):
npx prisma studio
```

---

## 8. GraphQL API

**Endpoint:** `POST /api/graphql`  
**Playground:** Open `http://localhost:3000/api/graphql` in browser for Apollo Sandbox

All queries and mutations are protected by `requireAuth(ctx)` in the resolvers except `signUp`. Context includes `{ session, userId, companyId }` derived from the NextAuth session.

### Queries

| Query | Description |
|---|---|
| `me` | Current user |
| `company` | Company for current user |
| `dashboardStats` | Aggregated stats for dashboard widgets |
| `trucks(filters, page, pageSize)` | Paginated truck list |
| `truck(id)` | Single truck with licenses and drivers |
| `truckLicenses(truckId)` | Licenses for a specific truck |
| `drivers(status, search, page, pageSize)` | Paginated driver list |
| `driver(id)` | Single driver |
| `clients(search, isActive, page, pageSize)` | Paginated client list |
| `client(id)` | Single client |
| `dispatchOrders(filters, page, pageSize)` | Paginated dispatch orders |
| `dispatchOrder(id)` | Single order with full status history |
| `recentDispatchOrders(limit)` | Latest N orders for dashboard |

### Mutations

| Mutation | Description |
|---|---|
| `signUp(input)` | Create user account (unauthenticated) |
| `upsertCompany(input)` | Create or update company profile |
| `createTruck / updateTruck / deleteTruck` | Fleet CRUD |
| `updateTruckStatus(id, status)` | Quick status update |
| `addTruckLicense / deleteTruckLicense` | Per-truck license management |
| `createDriver / updateDriver / deleteDriver` | Driver CRUD |
| `assignDriverToTruck(driverId, truckId)` | Assign or unassign a driver |
| `createClient / updateClient / deleteClient` | Client CRUD |
| `createDispatchOrder / updateDispatchOrder / deleteDispatchOrder` | Dispatch CRUD |
| `updateDispatchStatus(id, status, note)` | Advance order status + append to history |

### Adding a new resolver

1. Add the type/mutation to `src/graphql/schema/index.ts`
2. Add the resolver function to `src/graphql/resolvers/index.ts`
3. Add Prisma model/field in `prisma/schema.prisma` if needed
4. Run `npx prisma migrate dev --name name` + `npx prisma generate`

---

## 9. Authentication

**Library:** NextAuth v4 (`next-auth`)  
**Strategy:** JWT (no database sessions — stateless)  
**Provider:** CredentialsProvider (email + bcrypt password)

### How it works

1. User submits email + password to `/api/auth/callback/credentials`
2. NextAuth calls `authorize()` in `src/lib/auth.ts`
3. Finds user by email in DB, compares password with `bcrypt.compare()`
4. On success, returns user object → NextAuth creates JWT with `{ id, email, name, role, companyId }`
5. JWT is stored in an HTTP-only cookie (`next-auth.session-token`)
6. On subsequent requests, `getServerSession(authOptions)` reads the cookie → returns session

### Accessing session in API routes

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
const userId = (session?.user as any)?.id;
const companyId = (session?.user as any)?.companyId;
```

### Accessing session in client components

```typescript
import { useSession } from "next-auth/react";
const { data: session } = useSession();
```

### No route-level auth middleware

There is **no `middleware.ts`**. Protected routes (`/dashboard`, `/trucks`, etc.) are not server-enforced at the routing layer. If a user visits without a session, they see empty data (GraphQL returns null/empty for `requireAuth` resolvers). This is intentional for simplicity — add middleware if you need hard redirects.

To add hard redirect protection:
```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware";
export default withAuth({ pages: { signIn: "/sign-in" } });
export const config = { matcher: ["/dashboard/:path*", "/trucks/:path*", ...] };
```

---

## 10. External APIs (Free, No Keys)

All of these work immediately with no configuration.

### Nominatim (Address geocoding)
- **URL:** `https://nominatim.openstreetmap.org/search`
- **Rate limit:** 1 request/second — **do not hammer it**
- **Proxy:** `GET /api/geocode?q=Chicago,IL`
- **Returns:** `[{ display, lat, lon, type }]`

### OSRM (Truck routing)
- **URL:** `https://router.project-osrm.org/route/v1/driving/{lon,lat};{lon,lat}`
- **Rate limit:** Public demo server — acceptable for dev, unreliable for production
- **Proxy:** `GET /api/route-plan?olat=&olon=&dlat=&dlon=`
- **Returns:** `{ distanceMiles, durationHours, geometry (GeoJSON), waypoints }`
- **Production note:** Self-host OSRM or use OpenRouteService (free tier: 2000 requests/day)

### Open-Meteo (Weather)
- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Rate limit:** 10,000 calls/day — very generous
- **Proxy:** `GET /api/weather?lat=&lon=`
- **Returns:** `{ temp, feelsLike, windSpeed, precipitation, condition, alert }`
- **Note:** Caches for 30 minutes (`next: { revalidate: 1800 }`)

### FreightWaves RSS (Industry news)
- **URL:** Fetched via `https://api.rss2json.com/v1/api.json?rss_url=...`
- **Proxy:** `GET /api/crawl?type=news`
- **Fallback:** Hardcoded mock news if RSS fetch fails

---

## 11. Pages & Features

| Route | Description | Auth Required |
|---|---|---|
| `/` | Landing page — 3D truck convoy animation | No |
| `/sign-up` | Create account | No |
| `/sign-in` | Login | No |
| `/dashboard` | Stats, recent dispatches, globe visualization | Soft |
| `/trucks` | Fleet list with filters and status badges | Soft |
| `/trucks/new` | Add truck form | Soft |
| `/trucks/[id]` | Truck detail with license tracker | Soft |
| `/drivers` | Driver list with CDL status | Soft |
| `/drivers/new` | Add driver form | Soft |
| `/drivers/[id]` | Driver profile | Soft |
| `/clients` | Client list | Soft |
| `/clients/new` | Add client form | Soft |
| `/clients/[id]` | Client detail with billing info | Soft |
| `/dispatch` | Order list with status pipeline | Soft |
| `/dispatch/new` | Create dispatch order | Soft |
| `/dispatch/[id]` | Order detail with status timeline | Soft |
| `/dialer` | Softphone UI, contacts, call history | Soft |
| `/market` | Load board, jobs, FMCSA, news | Soft |
| `/map` | Interactive route planner + weather | Soft |
| `/company` | Company profile setup | Soft |
| `/settings` | Account settings | Soft |
| `/guides` | Guide hub | Soft |
| `/guides/trucks` | 12 truck types + regulations + cargo securement + maintenance | Soft |
| `/guides/clients` | Client onboarding & billing playbook | Soft |
| `/guides/outreach` | Cold call scripts, email templates, objection handling | Soft |

**"Soft" auth** = no server redirect, but GraphQL returns empty/null data without a valid session.

### Theming
- Toggle: sun/moon icon in the topbar
- Persisted to `localStorage` under key `dp-theme`
- HTML class: `html.light` for light mode, default (no class) = dark
- CSS variables defined in `globals.css` under `:root` (dark) and `html.light` (light)
- **Do not use hardcoded Tailwind color classes** (like `bg-steel-950`) for new structural elements — use `var(--dp-bg)` etc. so they respond to theme toggle

### CSS Variable Tokens

| Token | Dark | Light | Use for |
|---|---|---|---|
| `--dp-bg` | `#020617` | `#f1f5f9` | Page background |
| `--dp-bg-alt` | `#0f172a` | `#e2e8f0` | Alternate background |
| `--dp-surface` | `#1e293b` | `#ffffff` | Cards, sidebars |
| `--dp-border` | `#1e293b` | `#cbd5e1` | Borders |
| `--dp-text` | `#f1f5f9` | `#0f172a` | Primary text |
| `--dp-text-muted` | `#94a3b8` | `#475569` | Secondary text |
| `--dp-text-faint` | `#475569` | `#94a3b8` | Placeholder/label text |
| `--dp-input-bg` | `#0f172a` | `#f8fafc` | Input backgrounds |
| `--dp-hover` | `#1e293b` | `#f1f5f9` | Hover state backgrounds |

---

## 12. Environment Variables

### `.env.local` (runtime — gitignored)

```bash
DATABASE_URL="file:/Users/muhammadabdurrehman/dev/dispatch-pro/dev.db"
NEXTAUTH_SECRET="dispatch-pro-secret-key-change-in-production-xyz123"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional unlocks (add to `.env.local`)

```bash
# FMCSA live carrier lookup (free key at https://ai.fmcsa.dot.gov/SMS/Doc/WebServicesGuide.aspx)
FMCSA_WEB_KEY="your_key_here"

# Twilio (for live calling in Dialer)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+15005550006"

# If deploying with Turso (remote SQLite)
DATABASE_URL="libsql://your-db-name.turso.io"
TURSO_AUTH_TOKEN="your_turso_token"
```

### `prisma.config.ts` (for migrations only)

```typescript
import "dotenv/config";
export default {
  earlyAccess: true,
  schema: "./prisma/schema.prisma",
  migrate: { adapter: "libsql", url: process.env["DATABASE_URL"] },
};
```

This file uses `dotenv/config` which reads `.env` (not `.env.local`). For running migrations locally, either:
- Copy `DATABASE_URL` to a `.env` file temporarily, OR
- Set it inline: `DATABASE_URL="file:/path/dev.db" npx prisma migrate dev`

---

## 13. What Needs API Keys to Unlock

| Feature | Current state | How to unlock |
|---|---|---|
| FMCSA carrier lookup | Returns 6 mock carriers | Get free key at fmcsa.dot.gov, add `FMCSA_WEB_KEY` to `.env.local` |
| Live dialer calls | UI only, simulated call timer | Add Twilio credentials; implement `/api/twilio/token` route for WebRTC token |
| Load board (real) | Mock data (realistic, but not live) | Subscribe to DAT ($) or Truckstop.com ($) for real load feed API |
| Google Maps | Not used | Replace OSRM/Nominatim with Google Maps Platform if you need traffic/street view |
| Industry news | Attempts RSS, falls back to mock | Works without key; add real RSS parsing or FreightWaves subscription for better data |
| Production DB | SQLite file | Sign up for Turso (free tier), update `DATABASE_URL` to `libsql://...` + add `TURSO_AUTH_TOKEN` |

---

## 14. Known Issues & Limitations

### Current limitations

1. **No real-time updates** — Dispatch status changes require page refresh. Fix: add Apollo subscription support or polling with `pollInterval` on key queries.

2. **No file uploads** — Document URL fields (truck licenses, company logo) store URLs as text only. There's no upload endpoint. Fix: add an S3/Cloudflare R2 bucket + a `POST /api/upload` route.

3. **No email notifications** — Expiring licenses and delivery confirmations don't send emails. Fix: add Resend or SendGrid, trigger on `expiresAt` within 30 days via cron.

4. **No pagination UI** — GraphQL pagination is implemented in the API (page/pageSize params) but most list pages load all records. For large fleets (100+ trucks/drivers), add pagination UI.

5. **Dialer calls are simulated** — The call timer and UI work but no actual phone call is made. Requires Twilio integration.

6. **Load board data is mock** — Real load board data requires paid subscriptions to DAT ($150+/month) or Truckstop.com.

7. **No user roles enforced in UI** — The `role` field (OWNER/ADMIN/DISPATCHER/VIEWER) is stored and passed in JWT but not used to hide/show UI elements. The schema supports it; the UI doesn't use it yet.

8. **No mobile layout** — The sidebar is fixed 240px. On screens under 768px the layout breaks. The pages are usable on tablets in landscape but not on phones.

9. **OSRM public API** — The free OSRM routing server is a demo server with no SLA. For production, self-host OSRM or use OpenRouteService free tier (2000 req/day).

10. **Nominatim rate limit** — 1 request/second. The geocoder has a 350ms debounce. Don't remove the debounce or the API will rate-limit you.

### Not bugs, just design decisions

- No middleware auth guard — protected pages show empty state without login rather than redirecting
- `as any` casts in Prisma init — Prisma 7 types don't fully match the adapter API yet; the casts are safe
- Mock data in Market and Crawl APIs — intentional fallback while real API integrations aren't configured

---

## 15. Deployment Guide

### Option A: Vercel (Recommended)

1. Push to GitHub (already done)
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   ```
   DATABASE_URL=libsql://your-db.turso.io        # Turso remote SQLite
   TURSO_AUTH_TOKEN=your_token
   NEXTAUTH_SECRET=generate-a-strong-secret-here   # openssl rand -hex 32
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
4. Update `src/lib/prisma.ts` to pass `authToken` for Turso:
   ```typescript
   const adapter = new PrismaLibSql({
     url: process.env.DATABASE_URL!,
     authToken: process.env.TURSO_AUTH_TOKEN,
   } as any);
   ```
5. `vercel deploy`

### Option B: Railway / Render

Same env vars as Vercel. Both support Next.js natively. Railway lets you add a SQLite volume — keep using the file-based DB.

### Option C: Self-host (VPS / Docker)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["node", "server.js"]
```

Run with:
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="libsql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  dispatch-pro
```

### Pre-deploy checklist

- [ ] Replace `NEXTAUTH_SECRET` with a real random secret: `openssl rand -hex 32`
- [ ] Replace `DATABASE_URL` with a remote DB URL (Turso free tier)
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Run `npx prisma migrate deploy` against production DB
- [ ] Remove or protect the landing page if app is internal-only

---

## 16. Suggested Next Features

Listed in rough priority order based on dispatcher workflow value.

### High value, lower effort

- **License expiry alerts** — Query `TruckLicense.expiresAt < now + 30 days`, show banner in dashboard and truck detail. Data is already tracked.
- **Dispatch status notifications** — Email driver/client when status changes. Add Resend (free tier: 100 emails/day). Simple webhook from `updateDispatchStatus` resolver.
- **Driver HOS tracker** — Add a HOS log model linked to Driver. Simple daily log of driving hours. Triggers warning when approaching 11hr limit.
- **Invoice generation** — PDF invoice from a DispatchOrder using `@react-pdf/renderer`. All fields already exist on the model.
- **Quick-assign on dispatch board** — Drag-and-drop truck/driver assignment. Currently done via form; a Kanban-style board would be faster for dispatchers.

### Medium value, medium effort

- **Real-time dispatch board** — WebSocket or SSE for live status updates. Apollo subscriptions over `/api/graphql` websocket.
- **Route optimization** — Multi-stop dispatch orders. OSRM supports waypoints; the current route planner does A-to-B only.
- **Twilio dialer integration** — Full live calling. Requires Twilio account, `/api/twilio/token` route for client-side WebRTC token, and `twilio` npm package.
- **Mobile-responsive sidebar** — Hamburger menu below 768px. The sidebar component is isolated and easy to modify.
- **Driver mobile app** — A companion Next.js page at `/driver/[token]` accessible without login, showing the driver's current assignment and allowing status updates.

### Lower value, higher effort

- **EDI integration** — 204 load tender, 214 status update, 210 invoice. Needed for large shipper accounts. Very complex; requires EDI translator.
- **IFTA fuel tax reporting** — Tracks miles per state for quarterly fuel tax filing. Requires route-level state boundary detection.
- **DAT/Truckstop load board** — Real load data. $150–$200/month subscription + API access application required.
- **Multi-company support** — Currently one company per account. Enabling a dispatcher to manage multiple carrier accounts requires a new top-level tenant model.

---

## 17. Test Credentials

### Local accounts (in dev.db)

| Email | Password | Notes |
|---|---|---|
| `admin@test.com` | `password123` | First test account created |
| `owner@dispatchpro.com` | `password123` | Main test account, use this one |

### To create more accounts

Visit `http://localhost:3000/sign-up` and register. Or via GraphQL:

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { signUp(input: { email: \"you@test.com\", password: \"password123\", name: \"Your Name\" }) { user { id email } } }"}'
```

### To reset the database

```bash
cd /Users/muhammadabdurrehman/dev/dispatch-pro
rm dev.db
npx prisma migrate deploy
# or: npx prisma migrate dev
```

This wipes all data and recreates the schema from migrations. You'll need to sign up again.

---

## Quick Reference Card

```bash
# Start
DATABASE_URL="file:/Users/muhammadabdurrehman/dev/dispatch-pro/dev.db" npm run dev

# Test GraphQL
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'

# Migrate schema
DATABASE_URL="file:/path/to/dev.db" npx prisma migrate dev --name migration_name

# Open DB in browser
DATABASE_URL="file:/path/to/dev.db" npx prisma studio

# Push to GitHub
git add -A && git commit -m "message" && git push origin main

# Repo
https://github.com/abdur4430/dispatch-pro
```

---

*This handoff was written after the full build session. All information reflects the current state of the codebase as of the last commit (`728ab60`).*
