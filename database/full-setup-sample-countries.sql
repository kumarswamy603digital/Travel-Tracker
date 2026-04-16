-- Run this for a NEW empty `world` database (no `countries` table yet).
-- Create DB first:  CREATE DATABASE world;  then connect to `world` and run this file.

CREATE TABLE IF NOT EXISTS countries (
  country_code VARCHAR(3) NOT NULL PRIMARY KEY,
  country_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS visited_countries (
  country_code VARCHAR(3) PRIMARY KEY,
  CONSTRAINT fk_visited_country
    FOREIGN KEY (country_code)
    REFERENCES countries (country_code)
);

INSERT INTO countries (country_code, country_name) VALUES
  ('US', 'United States of America'),
  ('GB', 'United Kingdom'),
  ('FR', 'France'),
  ('DE', 'Germany'),
  ('JP', 'Japan'),
  ('IN', 'India'),
  ('AU', 'Australia'),
  ('CA', 'Canada'),
  ('BR', 'Brazil'),
  ('IT', 'Italy'),
  ('ES', 'Spain'),
  ('CN', 'China'),
  ('MX', 'Mexico'),
  ('ZA', 'South Africa'),
  ('EG', 'Egypt')
ON CONFLICT (country_code) DO NOTHING;
