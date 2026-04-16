import dotenv from "dotenv";
import pg from "pg";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  try {
    let raw = readFileSync(filePath, "utf8");
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
    const parsed = dotenv.parse(raw);
    for (const [key, value] of Object.entries(parsed)) {
      process.env[key] = value;
    }
  } catch (e) {
    console.warn("[Travel Tracker] .env read error:", filePath, e.message);
  }
}

const envProject = join(__dirname, ".env");
const envCwd = join(process.cwd(), ".env");

loadEnvFile(envProject);
if (
  envCwd !== envProject &&
  (!process.env.PGPASSWORD || String(process.env.PGPASSWORD).trim() === "") &&
  !process.env.DATABASE_URL
) {
  loadEnvFile(envCwd);
}

const { Pool } = pg;

export function pgPassword() {
  const raw =
    process.env.PGPASSWORD ??
    process.env.POSTGRES_PASSWORD ??
    process.env.PG_PASS;
  if (raw == null) return "";
  return String(raw).trim();
}

function databaseUrlHasPassword(databaseUrl) {
  try {
    const normalized = databaseUrl.trim().replace(/^postgresql:/i, "http:");
    const u = new URL(normalized);
    return u.password !== "";
  } catch {
    return true;
  }
}

function poolFromParts() {
  const ssl =
    process.env.PGSSLMODE === "require"
      ? { rejectUnauthorized: false }
      : false;
  const pass = pgPassword();
  const user = process.env.PGUSER ?? "postgres";
  const host = process.env.PGHOST ?? "localhost";
  const port = Number(process.env.PGPORT) || 5432;
  const database = process.env.PGDATABASE ?? "world";

  if (pass !== "") {
    const u = encodeURIComponent(user);
    const p = encodeURIComponent(pass);
    const d = encodeURIComponent(database);
    return new Pool({
      connectionString: `postgresql://${u}:${p}@${host}:${port}/${d}`,
      ssl,
    });
  }

  return new Pool({
    user,
    host,
    database,
    port,
    ssl,
  });
}

function createPool() {
  const ssl =
    process.env.PGSSLMODE === "require"
      ? { rejectUnauthorized: false }
      : false;

  if (process.env.DATABASE_URL) {
    const cfg = {
      connectionString: process.env.DATABASE_URL,
      ssl,
    };
    const pass = pgPassword();
    if (!databaseUrlHasPassword(process.env.DATABASE_URL) && pass !== "") {
      cfg.password = pass;
    } else if (pass !== "") {
      cfg.password = pass;
    }
    return new Pool(cfg);
  }
  return poolFromParts();
}

export const pool = createPool();

if (!process.env.DATABASE_URL && pgPassword() === "") {
  console.warn(
    "\n[Travel Tracker] No database password in env. In .env next to index.js add:\n  PGPASSWORD=your_postgres_password\n(or POSTGRES_PASSWORD=… or DATABASE_URL with password). Save the file and restart.\n"
  );
}
