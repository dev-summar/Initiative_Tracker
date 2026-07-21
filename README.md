# Initiative Tracker

Web application for tracking institutional initiatives across strategic areas — tasks, KPIs, dashboards, and activity — with PI-360 JWT authentication.

Frontend and backend live in **separate folders** and run as **two processes**. Deploy them on your own server (Nginx + Node).

**Repository:** https://github.com/dev-summar/Initiative_Tracker

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Local development](#local-development)
- [Seed & demo data](#seed--demo-data)
- [NPM scripts](#npm-scripts)
- [API overview](#api-overview)
- [Authentication](#authentication)
- [Production deploy (own server)](#production-deploy-own-server)
- [Health checks](#health-checks)
- [Troubleshooting](#troubleshooting)

---

## Features

- Login via PI-360 credentials (JWT stored and validated by the API)
- Dashboard: overview stats, charts, areas, needs-attention, recent activity
- Area detail pages with task board and KPI cards
- Task CRUD, status updates, CSV import
- KPI CRUD and CSV import
- Role gate: manager/admin access for tracker APIs
- Optional demo seed for local/testing data

---

## Tech stack

| Layer | Stack |
|--------|--------|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router, Zustand, Recharts |
| Backend | Node.js, Express, TypeScript, Mongoose |
| Database | MongoDB (Atlas or self-hosted) |
| Auth | PI-360 JWT (`jsonwebtoken`) |

---

## Project structure

```
Initiative_Tracker/
├── src/                 # React frontend (Vite)
│   ├── api/             # HTTP client & types
│   ├── components/      # UI (layout, dashboard, area, common)
│   ├── context/         # Auth context
│   ├── pages/           # Login, Dashboard, Area details
│   ├── services/        # API service wrappers
│   └── store/           # Zustand store
├── backend/             # Express API
│   ├── src/
│   │   ├── config/      # Env + MongoDB connection
│   │   ├── middleware/  # Auth, CORS
│   │   ├── models/      # Area, Task, Kpi, Activity
│   │   ├── routes/      # auth, areas, tasks, kpis, dashboard
│   │   ├── services/    # Business logic
│   │   ├── seed*.ts     # Seed / demo / clear scripts
│   │   └── server.ts    # API entry (port 3001)
│   └── package.json
├── public/              # Static assets
├── .env.example         # Env template (copy to .env)
├── package.json         # Frontend + convenience scripts
└── vite.config.ts       # Dev server + /api → :3001 proxy
```

---

## Prerequisites

- **Node.js** 20+ (recommended) and npm
- **MongoDB** connection string (MongoDB Atlas or local)
- PI-360 JWT settings matching your environment (`JWT_SECRET`, issuer, audience)
- For production: a Linux server with **Nginx** and a process manager (**PM2** recommended)

---

## Environment variables

Copy the example file at the **repo root**:

```bash
cp .env.example .env
```

Edit `.env`. Never commit `.env`.

| Variable | Used by | Description |
|----------|---------|-------------|
| `VITE_SITE_ORIGIN` | Frontend | PI-360 site origin (e.g. `https://pi360.net`) |
| `VITE_INSTITUTE_ID` | Frontend | Institute id for login (e.g. `mietjammu`) |
| `VITE_API_BASE` | Frontend | API base path. Use `/api` when Nginx proxies same host |
| `VITE_BASE_PATH` | Frontend | Optional subpath if app is not at domain root (e.g. `/tracker`) |
| `MONGODB_URI` | Backend | MongoDB connection URI |
| `JWT_SECRET` | Backend | Secret used to verify PI-360 JWTs (quote if it contains `#`) |
| `JWT_ISSUER` | Backend | Expected JWT `iss` (default `https://pi360.net`) |
| `JWT_AUDIENCE` | Backend | Expected JWT `aud` (default `Pi360-User`) |
| `PORT` | Backend | API listen port (default `3001`) |
| `NODE_ENV` | Backend | Set `production` on the server |

**Notes**

- Vite only exposes variables prefixed with `VITE_` to the browser; they are baked in at **build** time.
- Backend loads env from the root `.env` (see `backend/src/config/env.ts`).
- If `JWT_SECRET` contains `#`, keep it quoted in `.env`, e.g. `JWT_SECRET="auth@pi360.net#54321!!"`.

---

## Local development

Frontend and backend must both be running.

### 1. Clone and install

```bash
git clone https://github.com/dev-summar/Initiative_Tracker.git
cd Initiative_Tracker

cp .env.example .env
# Edit .env — set at least MONGODB_URI

npm install
cd backend && npm install && cd ..
```

### 2. Seed areas (once per database)

```bash
npm run seed
```

### 3. Start API (terminal 1)

```bash
npm run dev:api
```

API: `http://localhost:3001`

### 4. Start frontend (terminal 2)

```bash
npm run dev
```

UI: `http://localhost:5174`

In development, Vite proxies `/api` → `http://localhost:3001`, so the browser can call `/api/...` on the same origin.

### 5. Optional demo data

```bash
npm run seed:demo      # add demo tasks / KPIs / activity
npm run clear:demo     # remove demo data
```

---

## Seed & demo data

| Command | What it does |
|---------|----------------|
| `npm run seed` | Seeds initiative **areas** (run once on a new DB) |
| `npm run seed:demo` | Loads sample tasks, KPIs, and activity |
| `npm run clear:demo` | Removes demo-tagged data |

Run these from the **repo root**. They execute scripts under `backend/`.

---

## NPM scripts

### Root (`package.json`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite frontend (port **5174**) |
| `npm run dev:api` | Start Express API in watch mode (port **3001**) |
| `npm run build` | Typecheck + build frontend → `dist/` |
| `npm run preview` | Preview production frontend build locally |
| `npm run seed` | Seed areas |
| `npm run seed:demo` | Seed demo data |
| `npm run clear:demo` | Clear demo data |

### Backend (`backend/package.json`)

| Script | Description |
|--------|-------------|
| `npm run dev` | `tsx watch` API server |
| `npm run build` | Compile TypeScript → `backend/dist/` |
| `npm start` | Run compiled API (`node dist/server.js`) |
| `npm run seed` / `seed:demo` / `clear:demo` | Same as root wrappers |

---

## API overview

Base path: `/api`  
Protected routes require a valid PI-360 JWT and manager/admin access (except health).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Public health check |
| `GET` | `/api/auth/me` | Current user from JWT |
| `GET` | `/api/areas` | List areas |
| `GET` | `/api/areas/detail` | Area detail (query params) |
| `GET` | `/api/tasks` | List tasks |
| `GET` | `/api/tasks/filtered` | Filtered tasks |
| `POST` | `/api/tasks` | Create task |
| `PUT` | `/api/tasks/update` | Update task |
| `PUT` | `/api/tasks/status` | Update task status |
| `DELETE` | `/api/tasks/delete` | Delete task |
| `POST` | `/api/tasks/import` | CSV import tasks |
| `GET` | `/api/kpis` | List KPIs |
| `POST` | `/api/kpis` | Create KPI |
| `PUT` | `/api/kpis/update` | Update KPI |
| `DELETE` | `/api/kpis/delete` | Delete KPI |
| `POST` | `/api/kpis/import` | CSV import KPIs |
| `GET` | `/api/dashboard/overview` | Dashboard payload |

More detail: `backend/README.md` and route files under `backend/src/routes/`.

---

## Authentication

1. User signs in on the frontend with PI-360 email/password.
2. Frontend obtains a JWT (via PI-360 / configured institute flow).
3. Subsequent API calls send the token; backend verifies `iss`, `aud`, signature, and expiry.
4. Tracker APIs also require a **manager/admin** account type (see `backend/src/middleware/auth.ts`).

Ensure production `JWT_SECRET`, `JWT_ISSUER`, and `JWT_AUDIENCE` match the PI-360 environment you use.

---

## Production deploy (own server)

Keep folders separate: build/serve the frontend statically; run the backend as a Node process. Put Nginx in front.

### A. Backend

```bash
cd /opt/initiative-tracker   # or your deploy path
git pull
cd backend
npm ci
npm run build

# Ensure env is available (root .env or process env):
# MONGODB_URI, JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE, PORT=3001, NODE_ENV=production

npm start
# Recommended with PM2:
# pm2 start dist/server.js --name initiative-api --cwd /opt/initiative-tracker/backend
# pm2 save
```

Seed once on a new production database:

```bash
cd /opt/initiative-tracker
# with production .env loaded
npm run seed
```

### B. Frontend

Set production `VITE_*` values in `.env` **before** building (they are compiled into the bundle):

```bash
cd /opt/initiative-tracker
npm ci
npm run build
# Output: dist/
```

Copy `dist/` to your web root, e.g. `/var/www/initiative-tracker/`.

### C. Nginx example

Same domain: static UI + proxy `/api` to the Node process.

```nginx
server {
    listen 80;
    server_name tracker.example.com;

    # Prefer HTTPS in real production (certbot / your TLS termination).

    root /var/www/initiative-tracker;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Use `VITE_API_BASE=/api` so the browser calls the same host.

If the app is served under a subpath (e.g. `https://example.com/tracker/`):

1. Set `VITE_BASE_PATH=/tracker` before `npm run build`
2. Adjust Nginx `root` / `alias` and SPA fallback accordingly

### D. Checklist

- [ ] `.env` / secrets only on the server (not in git)
- [ ] `NODE_ENV=production`
- [ ] MongoDB reachable from the server
- [ ] Areas seeded (`npm run seed`)
- [ ] API process supervised (PM2/systemd) and restarts on reboot
- [ ] Nginx proxies `/api` and serves SPA fallback
- [ ] HTTPS enabled
- [ ] Firewall: only 80/443 public; Node port bound to localhost

---

## Health checks

```bash
# Direct API
curl http://localhost:3001/api/health

# Via Nginx (production)
curl https://tracker.example.com/api/health
```

Expected shape:

```json
{
  "status": "success",
  "response_code": 200,
  "message": "Initiative Tracker API is running.",
  "data": { "version": "1.0.0" }
}
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Vite `http proxy error` / `ECONNREFUSED` on `/api/*` | API not running | Start `npm run dev:api` |
| Frontend loads but data fails | Wrong `VITE_API_BASE` or Nginx proxy | Use `/api` + proxy to `:3001` |
| Auth / 401 errors | JWT secret/issuer/audience mismatch | Align `.env` with PI-360 |
| 403 on API | User not manager/admin | Use an allowed account |
| Mongo connection errors | Bad `MONGODB_URI` / network | Check Atlas IP allowlist and URI |
| Blank page on refresh (prod) | SPA fallback missing | Nginx `try_files ... /index.html` |
| Env changes ignored in UI | Vite env is build-time | Rebuild frontend after changing `VITE_*` |

---

## License

Private / internal use unless otherwise specified by the repository owners.
