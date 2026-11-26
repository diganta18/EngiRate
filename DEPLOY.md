# 🚀 EngiRate — Production Deployment & Migration Guide

> Complete reference for migrating EngiRate from local development (SQLite) to production-grade cloud infrastructure (PostgreSQL, Docker, Vercel, Render).

---

## 1. Environment Variables Matrix

Create a production `.env` file for the backend server with the following variables:

| Variable | Description | Example (Production) |
|---|---|---|
| `NODE_ENV` | Runtime environment mode | `production` |
| `PORT` | HTTP port to listen on | `3001` (or assigned by host) |
| `DATABASE_URL` | PostgreSQL connection string with SSL | `postgresql://user:pass@db.railway.app:5432/engirate?sslmode=require` |
| `JWT_SECRET` | 32+ character cryptographic secret for signing cookies | `openssl rand -base64 32` |
| `CLIENT_URL` | Fully-qualified URL of frontend SPA (enforces CORS & cookies) | `https://engirate.app` |

---

## 2. Migrating Prisma from SQLite to PostgreSQL

In local development, EngiRate uses SQLite (`server/dev.db`). For concurrent production traffic, migrate to PostgreSQL in 3 simple steps:

### Step 1: Update `server/prisma/schema.prisma`

Change the `datasource` block:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Push Schema to Production Database

```bash
cd server
npx prisma db push
npx prisma generate
```

### Step 3: Seed Iconic Subjects & Universe Lore

```bash
npm run db:seed
npx tsx prisma/seedPhase2.ts
npx tsx prisma/seedPhase3.ts
```

---

## 3. Docker Containerization

### `server/Dockerfile` (Multi-stage build)

```dockerfile
# Stage 1: Build & TypeScript compilation
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Minimal runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### `docker-compose.yml` (Local production simulation)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: engirate_postgres
    restart: always
    environment:
      POSTGRES_USER: engirate_admin
      POSTGRES_PASSWORD: production_strong_password_here
      POSTGRES_DB: engirate
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: ./server
    container_name: engirate_api
    restart: always
    depends_on:
      - postgres
    environment:
      PORT: 3001
      NODE_ENV: production
      DATABASE_URL: postgresql://engirate_admin:production_strong_password_here@postgres:5432/engirate?schema=public
      JWT_SECRET: super_secure_32_character_token_engirate_jwt_secret
      CLIENT_URL: http://localhost:5173
    ports:
      - "3001:3001"

volumes:
  pgdata:
```

---

## 4. Cloud Hosting Options

### Option A: Vercel (Frontend) + Render / Railway (Backend) — *Recommended*

#### 1. Backend on Render / Railway:
1. Connect your GitHub repository `https://github.com/diganta18/EngiRate`.
2. Root Directory: `server`.
3. Build Command: `npm install && npx prisma generate && npm run build`.
4. Start Command: `node dist/index.js`.
5. Attach a managed PostgreSQL database and set `DATABASE_URL`, `JWT_SECRET`, and `CLIENT_URL`.

#### 2. Frontend on Vercel:
1. Connect your GitHub repository.
2. Root Directory: `client`.
3. Framework Preset: `Vite`.
4. Environment Variables:
   - `VITE_API_URL`: Your Render/Railway backend URL (e.g. `https://api.engirate.app`).
5. In `client/vite.config.ts`, ensure production proxy or direct `VITE_API_URL` is configured for API calls.

---

## 5. Security & Hardening Checklist (Week 1 Verified)

- [x] **Prisma Singleton**: `server/src/lib/prisma.ts` eliminates connection pool exhaustion.
- [x] **JWT Security**: Enforced in `server/src/lib/env.ts` (fails fast on boot if secret is missing or default).
- [x] **HTTP Security Headers**: `helmet` enabled with cross-origin resource policy.
- [x] **Rate Limiting**:
  - Auth limiter: 30 req/min
  - Rating limiter: 10 req/min
  - Review limiter: 15 req/hour
  - Forecast limiter: 25 req/min
  - Subject proposal limiter: 10 req/hour
- [x] **Client Resilience**: `ErrorBoundary.tsx` prevents white-screen runtime crashes.
- [x] **Automated Tests**: Vitest suite verifies Bayesian weighting ($WR$) and forecast classifier algorithms.
