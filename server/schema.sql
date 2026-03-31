-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'salesman', 'customer')) DEFAULT 'customer',
  profile_pic TEXT DEFAULT '',
  join_date DATE DEFAULT CURRENT_DATE,
  salary TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cars table
CREATE TABLE cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL,
  price TEXT NOT NULL,
  image TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test Drives table
CREATE TABLE test_drives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT DEFAULT '',
  car_model TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  assigned_salesman UUID REFERENCES users(id) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  reply TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed users
INSERT INTO users (name, email, password, role) VALUES
  ('Admin',       'admin@gmail.com', 'admin123', 'admin'),
  ('Rahul Sales', 'sales@gmail.com', 'sales123', 'salesman'),
  ('Naveen',      'user@gmail.com',  'user123',  'customer');

-- Seed cars
INSERT INTO cars (model_name, price, image) VALUES
  ('BMW M3 Competition', '1.15 Cr', 'm3.jpg'),
  ('BMW M5',             '2.05 Cr', 'm5.jpg'),
  ('BMW X5',             '95 L',    'x5.jpg'),
  ('BMW i7',             '1.95 Cr', 'i7.jpg');

-- Disable RLS for simplicity (college project)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE cars DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_drives DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
