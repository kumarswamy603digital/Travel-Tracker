/**
 * Alternate server: fuzzy country search (SQL LIKE) instead of exact name match.
 * Run: npm run solution4   → http://localhost:3001
 * Main app: npm start      → http://localhost:3000 (index.js)
 */
import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pool } from "./db.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = Number(process.env.SOLUTION4_PORT) || 3001;

app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "public")));

function renderHome(res, { countries, formError, inputError, dbOffline } = {}) {
  res.status(200).render("index", {
    countries,
    total: countries.length,
    formError: formError ?? null,
    inputError: !!inputError,
    dbOffline: !!dbOffline,
  });
}

async function getVisitedCountryCodes() {
  const result = await pool.query(
    "SELECT country_code FROM visited_countries ORDER BY country_code"
  );
  return result.rows.map((row) => row.country_code);
}

app.get("/", async (_req, res) => {
  try {
    const countries = await getVisitedCountryCodes();
    renderHome(res, { countries });
  } catch (err) {
    console.error(err);
    renderHome(res, {
      countries: [],
      formError: err.message || "Could not load from database.",
    });
  }
});

app.post("/add", async (req, res) => {
  const raw = req.body.country;
  const input = typeof raw === "string" ? raw.trim() : "";

  try {
    if (!input) {
      const countries = await getVisitedCountryCodes();
      return renderHome(res, {
        countries,
        formError: "Enter a country name.",
        inputError: true,
      });
    }

    const lookup = await pool.query(
      `SELECT country_code, country_name FROM countries
       WHERE LOWER(country_name) LIKE '%' || LOWER($1) || '%'
       ORDER BY LENGTH(country_name) ASC
       LIMIT 1`,
      [input]
    );

    if (lookup.rows.length === 0) {
      const countries = await getVisitedCountryCodes();
      return renderHome(res, {
        countries,
        formError: "No country matched that text. Try another spelling.",
        inputError: true,
      });
    }

    const countryCode = lookup.rows[0].country_code;

    const already = await pool.query(
      "SELECT 1 FROM visited_countries WHERE country_code = $1",
      [countryCode]
    );
    if (already.rows.length > 0) {
      const countries = await getVisitedCountryCodes();
      return renderHome(res, {
        countries,
        formError: "That country is already on your map.",
        inputError: true,
      });
    }

    await pool.query(
      "INSERT INTO visited_countries (country_code) VALUES ($1)",
      [countryCode]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    const countries = await getVisitedCountryCodes().catch(() => []);
    if (err.code === "23505") {
      return renderHome(res, {
        countries,
        formError: "That country is already on your map.",
        inputError: true,
      });
    }
    return renderHome(res, {
      countries,
      formError: err.message || "Could not add country.",
      inputError: true,
    });
  }
});

const server = app.listen(port, () => {
  console.log(`Travel Tracker (solution4 — fuzzy search) → http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, closing…`);
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
