import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pool } from "./db.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

function isConnectionError(err) {
  const code = err && err.code;
  return (
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN"
  );
}

function isSaslOrPasswordConfigError(err) {
  const msg = err && err.message;
  if (typeof msg !== "string") return false;
  return (
    msg.includes("SCRAM-SERVER-FIRST-MESSAGE") ||
    msg.includes("client password must be")
  );
}

function isMissingRelationError(err) {
  return err && err.code === "42P01";
}

app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "public")));

async function getVisitedCountryCodes() {
  const result = await pool.query(
    "SELECT country_code FROM visited_countries ORDER BY country_code"
  );
  return result.rows.map((row) => row.country_code);
}

function renderHome(res, { countries, formError, inputError, dbOffline } = {}) {
  res.status(200).render("index", {
    countries,
    total: countries.length,
    formError: formError ?? null,
    inputError: !!inputError,
    dbOffline: !!dbOffline,
  });
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "travel-tracker" });
});

app.get("/", async (_req, res, next) => {
  try {
    const countries = await getVisitedCountryCodes();
    renderHome(res, { countries });
  } catch (err) {
    if (isConnectionError(err)) {
      console.error("Database unreachable:", err.message);
      return renderHome(res, { countries: [], dbOffline: true });
    }
    if (err.code === "28P01") {
      return renderHome(res, {
        countries: [],
        formError:
          "PostgreSQL login failed. Check PGPASSWORD or DATABASE_URL in .env next to index.js, then restart the server.",
      });
    }
    if (err.code === "3D000") {
      return renderHome(res, {
        countries: [],
        formError: `Database does not exist. Create it or set PGDATABASE in .env.`,
      });
    }
    if (isSaslOrPasswordConfigError(err)) {
      console.error(
        "PostgreSQL SASL/auth failed — usually empty or missing PGPASSWORD in .env."
      );
      return renderHome(res, {
        countries: [],
        formError:
          "PostgreSQL needs a password. In the .env file next to index.js add one line: PGPASSWORD=YourPassword (no spaces around =, no quotes). You can use POSTGRES_PASSWORD instead. Save the file, stop the server (Ctrl+C), then run npm start again.",
      });
    }
    if (isMissingRelationError(err)) {
      console.error("Missing table:", err.message);
      return renderHome(res, {
        countries: [],
        formError:
          "A required table is missing (often visited_countries). Open database/schema.sql in this project and run it in your PostgreSQL database, then reload.",
      });
    }
    console.error("GET /:", err);
    return renderHome(res, {
      countries: [],
      formError:
        process.env.NODE_ENV === "production"
          ? "Could not load map data. Confirm PostgreSQL is running and .env matches your setup."
          : `Database error: ${err.message || err.code || "unknown"}`,
    });
  }
});

app.post("/add", async (req, res, next) => {
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
      "SELECT country_code FROM countries WHERE LOWER(TRIM(country_name)) = LOWER(TRIM($1))",
      [input]
    );

    if (lookup.rows.length === 0) {
      const countries = await getVisitedCountryCodes();
      return renderHome(res, {
        countries,
        formError:
          "No match for that name. Use the exact spelling from your database (e.g. “United States of America”, “Japan”).",
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
    if (isConnectionError(err)) {
      console.error("Database unreachable:", err.message);
      return renderHome(res, { countries: [], dbOffline: true });
    }
    if (err.code === "28P01") {
      return renderHome(res, {
        countries: [],
        formError:
          "PostgreSQL login failed. Check PGPASSWORD or DATABASE_URL in .env, then restart.",
      });
    }
    if (err.code === "3D000") {
      return renderHome(res, {
        countries: [],
        formError: `Database does not exist. Create it or set PGDATABASE in .env.`,
      });
    }
    if (isSaslOrPasswordConfigError(err)) {
      return renderHome(res, {
        countries: [],
        formError:
          "PostgreSQL password missing or not read. Add PGPASSWORD=YourPassword to .env next to index.js (or POSTGRES_PASSWORD). Save, restart npm start.",
      });
    }
    if (isMissingRelationError(err)) {
      return renderHome(res, {
        countries: [],
        formError:
          "A required table is missing. Run database/schema.sql in PostgreSQL, then try again.",
      });
    }
    console.error("POST /add:", err);
    return renderHome(res, {
      countries: [],
      formError:
        process.env.NODE_ENV === "production"
          ? "Could not save. Check the database and .env file."
          : `Database error: ${err.message || err.code || "unknown"}`,
    });
  }
});

app.use((err, req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Try again later."
      : err.message;
  res.status(500).render("error", { message }, (renderErr) => {
    if (renderErr) {
      console.error("Error page render failed:", renderErr);
      res
        .status(500)
        .type("text/html; charset=utf-8")
        .send(
          `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Error</title></head><body><p>Server error.</p><p><a href="/">Home</a></p></body></html>`
        );
    }
  });
});

const server = app.listen(port, () => {
  console.log(`Travel Tracker → http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, closing…`);
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
