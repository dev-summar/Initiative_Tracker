# Initiative Tracker API

Express + MongoDB API for the Initiative Tracker.

For full setup, environment variables, and production deploy, see the **[root README](../README.md)**.

## Quick start

From the repo root:

```bash
cp .env.example .env   # set MONGODB_URI
npm install && cd backend && npm install && cd ..
npm run seed
npm run dev:api        # http://localhost:3001
```

## Health check

```
GET http://localhost:3001/api/health
```
