-- Run this ONLY if database `world` already has a `countries` table (e.g. Udemy dump).
-- Connect to `world` first, then execute.

CREATE TABLE IF NOT EXISTS visited_countries (
  country_code VARCHAR(3) PRIMARY KEY,
  CONSTRAINT fk_visited_country
    FOREIGN KEY (country_code)
    REFERENCES countries (country_code)
);
