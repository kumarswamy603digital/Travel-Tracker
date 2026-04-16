-- Optional: run against your PostgreSQL "world" (or app) database if tables are missing.
-- The Udemy / Angela Yu course usually ships these via `psql` against the `world` dump.

CREATE TABLE IF NOT EXISTS visited_countries (
  country_code VARCHAR(3) PRIMARY KEY,
  CONSTRAINT fk_country FOREIGN KEY (country_code) REFERENCES countries (country_code)
);
