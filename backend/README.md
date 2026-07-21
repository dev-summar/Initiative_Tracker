# Initiative Tracker API (Node.js + MongoDB)

Express API with MongoDB Atlas. PI-360 JWT auth preserved.

## Local setup

1. Copy root `.env.example` to `.env` and set `MONGODB_URI`.
2. Install deps:
   ```bash
   npm install
   cd backend && npm install
   ```
3. Seed areas (once):
   ```bash
   npm run seed
   ```
4. Optional — demo tasks, KPIs, and activity:
   ```bash
   npm run seed:demo
   ```
   Remove demo data anytime:
   ```bash
   npm run clear:demo
   ```
5. Start API (port 3001):
   ```bash
   npm run dev:api
   ```
5. Start frontend (port 5174, proxies `/api` to backend):
   ```bash
   npm run dev
   ```

## Health check

```
GET http://localhost:3001/api/health
```

## Vercel

- `api/index.ts` wraps the Express app as a serverless function.
- Set env vars in Vercel: `MONGODB_URI`, `JWT_SECRET`, `VITE_*`.
- Frontend uses `VITE_API_BASE=/api`.
