# Travel Tracker

A small web app that shows an interactive world map and highlights countries you have logged as visited. Data is stored in PostgreSQL (same pattern as the common “world” database tutorial).

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- PostgreSQL with tables `countries` and `visited_countries` — see `database/setup-travel-tracker.sql` (instructions) and run either `database/full-setup-sample-countries.sql` (new DB) or `database/visited-countries-only.sql` (if you already imported the course `countries` data).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment template and edit:

   ```bash
   copy .env.example .env
   ```

   Keep `.env` in the **project root** (next to `index.js`). Set `PGPASSWORD` (and other fields) for your database, or use `DATABASE_URL` for a hosted Postgres URL. For SSL-required hosts, set `PGSSLMODE=require`.

3. Start the server:

   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. Optional — fuzzy country search (SQL `LIKE`) on port **3001**:

   ```bash
   npm run solution4
   ```

   Uses the same `.env` and `db.mjs` as the main app.

## Operations

- **Health check:** `GET /health` returns JSON for load balancers and monitoring.
- **Graceful shutdown:** `SIGINT` / `SIGTERM` closes the HTTP server and the DB pool.

## Project layout

| Path | Role |
|------|------|
| `index.js` | Main Express app (exact country name match) |
| `db.mjs` | Loads `.env` and creates the shared PostgreSQL pool |
| `solution4.js` | Alternate server: fuzzy `LIKE` search (`npm run solution4`, port 3001) |
| `views/` | EJS templates (map + error page) |
| `public/` | Static assets (CSS) |
| `database/*.sql` | PostgreSQL setup (see `setup-travel-tracker.sql` for which file to run) |
