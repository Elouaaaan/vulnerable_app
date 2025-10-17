-- Consolidated seed data for local testing (doctors only)
-- Creates specialties, doctor users, doctor profiles, and future time slots.

-- Enable pgcrypto for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Specialties
INSERT INTO specialties (name) VALUES
  ('General Practice'),
  ('Cardiology'),
  ('Dermatology'),
  ('Pediatrics'),
  ('Neurology')
ON CONFLICT (name) DO NOTHING;

-- Doctor users only (password for all: Test1234!)
INSERT INTO users (email, password_hash, name, surname, role, phone)
VALUES
  ('doctor@example.com',         crypt('Test1234!', gen_salt('bf', 10)), 'John',  'Doe',   'doctor', '+33100000000'),
  ('doc.cardiology@example.com', crypt('Test1234!', gen_salt('bf', 10)), 'Alice', 'Heart', 'doctor', '+33100000001'),
  ('doc.derm@example.com',       crypt('Test1234!', gen_salt('bf', 10)), 'Bob',   'Skin',  'doctor', '+33100000002'),
  ('doc.peds@example.com',       crypt('Test1234!', gen_salt('bf', 10)), 'Carol', 'Kid',   'doctor', '+33100000003'),
  ('doc.neuro@example.com',      crypt('Test1234!', gen_salt('bf', 10)), 'Dave',  'Brain', 'doctor', '+33100000004')
ON CONFLICT (email) DO NOTHING;

-- Doctor profiles
WITH spec AS (
  SELECT id, name FROM specialties
), u AS (
  SELECT id, email FROM users WHERE role = 'doctor'
)
INSERT INTO doctors (user_id, specialty_id, bio, licence_number, rating)
SELECT
  u1.id AS user_id,
  s1.id AS specialty_id,
  CASE WHEN u1.email = 'doctor@example.com' THEN 'Temporary GP for testing' ELSE 'Experienced specialist for testing purposes' END AS bio,
  CASE WHEN u1.email = 'doctor@example.com' THEN 'TMP-123-TEST' ELSE 'LIC-' || substr(md5(u1.email), 1, 8) END AS licence_number,
  4.5 AS rating
FROM u u1
JOIN (
  VALUES
    ('doctor@example.com','General Practice'),
    ('doc.cardiology@example.com','Cardiology'),
    ('doc.derm@example.com','Dermatology'),
    ('doc.peds@example.com','Pediatrics'),
    ('doc.neuro@example.com','Neurology')
) map(email, spec_name) ON map.email = u1.email
JOIN spec s1 ON s1.name = map.spec_name
ON CONFLICT DO NOTHING;

-- Time slots: next 3 days for all doctors, 30-min intervals
WITH d AS (
  SELECT d.id AS doctor_id
  FROM doctors d
), day1 AS (
  SELECT 
    (date_trunc('day', now()) + interval '1 day' + time '09:00') AS s1,
    (date_trunc('day', now()) + interval '1 day' + time '09:30') AS s2,
    (date_trunc('day', now()) + interval '1 day' + time '10:00') AS s3,
    (date_trunc('day', now()) + interval '1 day' + time '10:30') AS s4,
    (date_trunc('day', now()) + interval '1 day' + time '11:00') AS s5,
    (date_trunc('day', now()) + interval '1 day' + time '11:30') AS s6
), day2 AS (
  SELECT 
    (date_trunc('day', now()) + interval '2 days' + time '09:00') AS s1,
    (date_trunc('day', now()) + interval '2 days' + time '09:30') AS s2,
    (date_trunc('day', now()) + interval '2 days' + time '10:00') AS s3,
    (date_trunc('day', now()) + interval '2 days' + time '10:30') AS s4,
    (date_trunc('day', now()) + interval '2 days' + time '11:00') AS s5,
    (date_trunc('day', now()) + interval '2 days' + time '11:30') AS s6
), day3 AS (
  SELECT 
    (date_trunc('day', now()) + interval '3 days' + time '14:00') AS s1,
    (date_trunc('day', now()) + interval '3 days' + time '14:30') AS s2,
    (date_trunc('day', now()) + interval '3 days' + time '15:00') AS s3,
    (date_trunc('day', now()) + interval '3 days' + time '15:30') AS s4,
    (date_trunc('day', now()) + interval '3 days' + time '16:00') AS s5,
    (date_trunc('day', now()) + interval '3 days' + time '16:30') AS s6
)
INSERT INTO time_slots (doctor_id, start_ts, end_ts, is_booked)
SELECT d.doctor_id, t.start_ts, t.start_ts + interval '30 minutes', false
FROM d
JOIN (
  SELECT s1 AS start_ts FROM day1
  UNION ALL SELECT s2 FROM day1
  UNION ALL SELECT s3 FROM day1
  UNION ALL SELECT s4 FROM day1
  UNION ALL SELECT s5 FROM day1
  UNION ALL SELECT s6 FROM day1
  UNION ALL SELECT s1 FROM day2
  UNION ALL SELECT s2 FROM day2
  UNION ALL SELECT s3 FROM day2
  UNION ALL SELECT s4 FROM day2
  UNION ALL SELECT s5 FROM day2
  UNION ALL SELECT s6 FROM day2
  UNION ALL SELECT s1 FROM day3
  UNION ALL SELECT s2 FROM day3
  UNION ALL SELECT s3 FROM day3
  UNION ALL SELECT s4 FROM day3
  UNION ALL SELECT s5 FROM day3
  UNION ALL SELECT s6 FROM day3
) t ON true
ON CONFLICT DO NOTHING;

INSERT INTO flags (code, description)
VALUES ('FLAG{sqli-second-order}', 'Faille SQLi de second ordre')
ON CONFLICT (code) DO NOTHING;


