/*
  # News Verification Database Schema

  1. New Tables
    - `verification_requests`
      - `id` (uuid, primary key)
      - `content_type` (text: 'text', 'image', 'video')
      - `content_text` (text, nullable)
      - `content_url` (text, nullable)
      - `verification_result` (text: 'true', 'fake', 'pending')
      - `classification` (text: 'man_made', 'ai_generated', 'authentic', nullable)
      - `confidence_score` (numeric)
      - `details` (jsonb)
      - `created_at` (timestamptz)
      - `ip_address` (text)
    
    - `trusted_sources`
      - `id` (uuid, primary key)
      - `name_en` (text)
      - `name_ta` (text)
      - `url` (text)
      - `category` (text)
      - `reliability_score` (numeric)
      - `created_at` (timestamptz)
    
    - `verified_articles`
      - `id` (uuid, primary key)
      - `title_en` (text)
      - `title_ta` (text)
      - `content_hash` (text, unique)
      - `source_id` (uuid, foreign key to trusted_sources)
      - `published_date` (timestamptz)
      - `original_url` (text)
      - `category` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to trusted sources
    - Add policies for anonymous verification request creation
    - Add policies for reading verification results
*/

CREATE TABLE IF NOT EXISTS trusted_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_ta text NOT NULL,
  url text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  reliability_score numeric DEFAULT 0.95 CHECK (reliability_score >= 0 AND reliability_score <= 1),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verified_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_ta text NOT NULL,
  content_hash text UNIQUE NOT NULL,
  source_id uuid REFERENCES trusted_sources(id) ON DELETE CASCADE,
  published_date timestamptz NOT NULL,
  original_url text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('text', 'image', 'video')),
  content_text text,
  content_url text,
  verification_result text NOT NULL DEFAULT 'pending' CHECK (verification_result IN ('true', 'fake', 'pending', 'uncertain')),
  classification text CHECK (classification IN ('man_made', 'ai_generated', 'authentic', 'uncertain')),
  confidence_score numeric DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  ip_address text
);

ALTER TABLE trusted_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trusted sources"
  ON trusted_sources FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read verified articles"
  ON verified_articles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create verification requests"
  ON verification_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read verification requests"
  ON verification_requests FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_verified_articles_content_hash ON verified_articles(content_hash);
CREATE INDEX IF NOT EXISTS idx_verified_articles_source_id ON verified_articles(source_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_created_at ON verification_requests(created_at DESC);

INSERT INTO trusted_sources (name_en, name_ta, url, category, reliability_score) VALUES
  ('BBC News', 'பிபிசி செய்திகள்', 'https://www.bbc.com/news', 'international', 0.98),
  ('Reuters', 'ராய்ட்டர்ஸ்', 'https://www.reuters.com', 'international', 0.97),
  ('The Hindu', 'தி இந்து', 'https://www.thehindu.com', 'national', 0.95),
  ('Times of India', 'டைம்ஸ் ஆஃப் இந்தியா', 'https://timesofindia.indiatimes.com', 'national', 0.90),
  ('Dinamalar', 'தினமலர்', 'https://www.dinamalar.com', 'regional', 0.92),
  ('Dinamani', 'தினமணி', 'https://www.dinamani.com', 'regional', 0.93),
  ('Associated Press', 'அசோசியேட்டட் பிரஸ்', 'https://apnews.com', 'international', 0.98)
ON CONFLICT DO NOTHING;
