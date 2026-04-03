-- Luxury Auto Wash - Complete Database Schema
--
-- 1. New Tables
--    - users: Customer, employee, and admin profiles
--    - loyalty_plans: Configurable loyalty reward plans
--    - loyalty_cards: User loyalty card instances
--    - wash_logs: Activity tracking for washes and redemptions
--    - subscriptions: User subscription management
--
-- 2. Security
--    - Enable RLS on all tables
--    - Role-based access: admin (full), employee (limited), customer (own data only)
--
-- 3. Indexes
--    - Optimized for common query patterns

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'employee', 'admin')),
  subscription_status text NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'suspended')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create loyalty_plans table
CREATE TABLE IF NOT EXISTS loyalty_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  required_washes integer NOT NULL CHECK (required_washes > 0),
  reward text NOT NULL DEFAULT 'free_wash',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create loyalty_cards table
CREATE TABLE IF NOT EXISTS loyalty_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES loyalty_plans(id) ON DELETE CASCADE,
  current_washes integer DEFAULT 0 CHECK (current_washes >= 0),
  reward_available boolean DEFAULT false,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wash_logs table
CREATE TABLE IF NOT EXISTS wash_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('wash_added', 'reward_redeemed')),
  card_id uuid REFERENCES loyalty_cards(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled')),
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_user_id ON loyalty_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_plan_id ON loyalty_cards(plan_id);
CREATE INDEX IF NOT EXISTS idx_wash_logs_user_id ON wash_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_wash_logs_employee_id ON wash_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_wash_logs_created_at ON wash_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE wash_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Employees can view customer profiles"
  ON users FOR SELECT
  TO authenticated
  USING (
    role = 'customer' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('employee', 'admin')
    )
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for loyalty_plans table
CREATE POLICY "Anyone authenticated can view active plans"
  ON loyalty_plans FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins can view all plans"
  ON loyalty_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage plans"
  ON loyalty_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for loyalty_cards table
CREATE POLICY "Users can view own loyalty cards"
  ON loyalty_cards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Employees can view all loyalty cards"
  ON loyalty_cards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('employee', 'admin')
    )
  );

CREATE POLICY "Employees can update loyalty cards"
  ON loyalty_cards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('employee', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('employee', 'admin')
    )
  );

CREATE POLICY "Admins can insert loyalty cards"
  ON loyalty_cards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for wash_logs table
CREATE POLICY "Users can view own wash logs"
  ON wash_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Employees can view all wash logs"
  ON wash_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('employee', 'admin')
    )
  );

CREATE POLICY "Employees can insert wash logs"
  ON wash_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('employee', 'admin')
    )
  );

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Insert default loyalty plan
INSERT INTO loyalty_plans (name, required_washes, reward, active)
VALUES 
  ('Silver Member', 5, 'free_wash', true),
  ('Gold Member', 10, 'free_wash', true),
  ('Platinum Member', 15, 'free_wash', true)
ON CONFLICT DO NOTHING;