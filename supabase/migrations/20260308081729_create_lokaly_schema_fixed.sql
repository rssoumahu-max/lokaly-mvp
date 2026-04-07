/*
  # Lokaly Database Schema

  ## Overview
  Complete database schema for the Lokaly application including locations, categories,
  vibes, user profiles, favorites, reviews, and analytics tracking.

  ## Tables Created
  
  ### Core Content
  - `vibes` - Activity vibes/moods (cultural, romantic, active, etc.)
  - `categories` - Location categories (museums, VR gaming, bars, etc.)
  - `locations` - All venue/activity locations in Amsterdam
  - `location_vibes` - Many-to-many relationship between locations and vibes
  - `location_categories` - Many-to-many relationship between locations and categories

  ### User System
  - `profiles` - Extended user profile data (linked to auth.users)
  - `favorites` - User's saved/bookmarked locations
  - `reviews` - User reviews and ratings for locations

  ### Analytics
  - `analytics_events` - Track user interactions and behavior

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict access based on authentication and ownership
  - Public read access for core content tables
  - Protected write access for user-generated content
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text DEFAULT '',
  avatar_url text DEFAULT '',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND is_admin = (SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid()));

CREATE TABLE IF NOT EXISTS vibes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_nl text NOT NULL,
  name_en text NOT NULL,
  slug text UNIQUE NOT NULL,
  color text DEFAULT '#06b6d4',
  text_color text DEFAULT '#FFFFFF',
  icon text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vibes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vibes are viewable by everyone"
  ON vibes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert vibes"
  ON vibes FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can update vibes"
  ON vibes FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_nl text NOT NULL,
  name_en text NOT NULL,
  slug text UNIQUE NOT NULL,
  color text DEFAULT '#06b6d4',
  text_color text DEFAULT '#FFFFFF',
  icon text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  district text DEFAULT '',
  address text DEFAULT '',
  postal_code text DEFAULT '',
  city text DEFAULT 'Amsterdam',
  country_code text DEFAULT 'NL',
  lat numeric,
  lng numeric,
  place_id text,
  website text DEFAULT '',
  phone text DEFAULT '',
  main_image text DEFAULT '',
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active locations are viewable by everyone"
  ON locations FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE POLICY "Only admins can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE TABLE IF NOT EXISTS location_vibes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  vibe_id uuid REFERENCES vibes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(location_id, vibe_id)
);

ALTER TABLE location_vibes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Location vibes are viewable by everyone"
  ON location_vibes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage location vibes"
  ON location_vibes FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE TABLE IF NOT EXISTS location_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(location_id, category_id)
);

ALTER TABLE location_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Location categories are viewable by everyone"
  ON location_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage location categories"
  ON location_categories FOR ALL
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, location_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating numeric NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(location_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Users can view own reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_location_id ON analytics_events(location_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert analytics"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anonymous users can insert analytics"
  ON analytics_events FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Only admins can view analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = true);

CREATE INDEX IF NOT EXISTS idx_locations_lat_lng ON locations(lat, lng);
CREATE INDEX IF NOT EXISTS idx_locations_district ON locations(district);
CREATE INDEX IF NOT EXISTS idx_locations_is_featured ON locations(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_location_id ON reviews(location_id) WHERE is_approved = true;
