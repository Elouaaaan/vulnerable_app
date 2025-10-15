CREATE TYPE appointment_status AS ENUM ('requested','confirmed','cancelled','completed','no_show');

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'patient', -- 'patient', 'doctor', 'admin'
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
);

CREATE TABLE specialties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE doctors (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialty_id INT NOT NULL REFERENCES specialties(id),
  bio TEXT,
  licence_number TEXT UNIQUE,
  rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE doctor_availabilities (
  id BIGSERIAL PRIMARY KEY,
  doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT NOT NULL DEFAULT 15,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE time_slots (
  id BIGSERIAL PRIMARY KEY,
  doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  start_ts TIMESTAMP WITH TIME ZONE NOT NULL,
  end_ts TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, start_ts)
);

CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  time_slot_id BIGINT REFERENCES time_slots(id) ON DELETE SET NULL,
  start_ts TIMESTAMP WITH TIME ZONE NOT NULL,
  end_ts TIMESTAMP WITH TIME ZONE NOT NULL,
  status appointment_status NOT NULL DEFAULT 'requested',
  reason TEXT,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancelled_by BIGINT REFERENCES users(id),
  cancelled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id, start_ts);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id, start_ts);
CREATE INDEX idx_time_slots_doctor_start ON time_slots(doctor_id, start_ts);
