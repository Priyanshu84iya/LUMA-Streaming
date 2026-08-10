/*
# Streaming Platform Schema (single-tenant, no auth)

1. Purpose
   Persistent storage for a streaming platform frontend. Stores user watch history,
   continue-watching progress, favorites, watch-later list, user preferences/settings,
   and extension sync state. No sign-in screen, so all tables are anon-accessible.

2. New Tables
   - `watch_history`: records of watched content with last position and timestamps.
     - id (uuid pk), content_id (text), title (text), poster (text), backdrop (text),
       media_type (text: movie|tv|anime), season (int), episode (int), episode_id (text),
       duration (int seconds), position (int seconds, default 0), completed (bool),
       updated_at (timestamptz).
   - `continue_watching`: lightweight pointer rows for resume bar (one per content/episode).
     - id (uuid pk), content_id (text), episode_id (text), title (text), poster (text),
       backdrop (text), media_type (text), season (int), episode (int), position (int),
       duration (int), updated_at (timestamptz).
   - `favorites`: user-favorited content.
     - id (uuid pk), content_id (text), title (text), poster (text), backdrop (text),
       media_type (text), added_at (timestamptz).
   - `watch_later`: saved-for-later content.
     - id (uuid pk), content_id (text), title (text), poster (text), backdrop (text),
       media_type (text), added_at (timestamptz).
   - `user_settings`: single-row JSON blob of persistent preferences (autoplay, subtitles, quality, theme, volume).
     - id (int pk default 1), settings (jsonb), updated_at (timestamptz).
   - `extension_state`: single-row record of extension connection/sync status.
     - id (int pk default 1), name (text), connected (bool), last_sync (timestamptz),
       library_count (int), status (text), updated_at (timestamptz), raw_manifest (jsonb).

3. Security
   - Enable RLS on all tables.
   - All tables use TO anon, authenticated with USING (true) / WITH CHECK (true) because
     this is an intentionally single-tenant no-auth app (data is shared/public).

4. Notes
   - UNIQUE constraints on (content_id, episode_id) for continue_watching and watch_history
     to allow upserts via onConflict.
   - UNIQUE on content_id for favorites and watch_later.
*/

CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  title text NOT NULL,
  poster text,
  backdrop text,
  media_type text DEFAULT 'movie',
  season int,
  episode int,
  episode_id text,
  duration int DEFAULT 0,
  position int DEFAULT 0,
  completed boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS watch_history_content_episode_uidx
  ON watch_history (content_id, episode_id);

ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_watch_history" ON watch_history;
CREATE POLICY "anon_select_watch_history" ON watch_history FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_watch_history" ON watch_history;
CREATE POLICY "anon_insert_watch_history" ON watch_history FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_watch_history" ON watch_history;
CREATE POLICY "anon_update_watch_history" ON watch_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_watch_history" ON watch_history;
CREATE POLICY "anon_delete_watch_history" ON watch_history FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS continue_watching (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  episode_id text,
  title text NOT NULL,
  poster text,
  backdrop text,
  media_type text DEFAULT 'movie',
  season int,
  episode int,
  position int DEFAULT 0,
  duration int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS continue_watching_content_episode_uidx
  ON continue_watching (content_id, episode_id);

ALTER TABLE continue_watching ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_continue_watching" ON continue_watching;
CREATE POLICY "anon_select_continue_watching" ON continue_watching FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_continue_watching" ON continue_watching;
CREATE POLICY "anon_insert_continue_watching" ON continue_watching FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_continue_watching" ON continue_watching;
CREATE POLICY "anon_update_continue_watching" ON continue_watching FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_continue_watching" ON continue_watching;
CREATE POLICY "anon_delete_continue_watching" ON continue_watching FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL UNIQUE,
  title text NOT NULL,
  poster text,
  backdrop text,
  media_type text DEFAULT 'movie',
  added_at timestamptz DEFAULT now()
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_favorites" ON favorites;
CREATE POLICY "anon_select_favorites" ON favorites FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
CREATE POLICY "anon_insert_favorites" ON favorites FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;
CREATE POLICY "anon_delete_favorites" ON favorites FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS watch_later (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL UNIQUE,
  title text NOT NULL,
  poster text,
  backdrop text,
  media_type text DEFAULT 'movie',
  added_at timestamptz DEFAULT now()
);

ALTER TABLE watch_later ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_watch_later" ON watch_later;
CREATE POLICY "anon_select_watch_later" ON watch_later FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_watch_later" ON watch_later;
CREATE POLICY "anon_insert_watch_later" ON watch_later FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_watch_later" ON watch_later;
CREATE POLICY "anon_delete_watch_later" ON watch_later FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS user_settings (
  id int PRIMARY KEY DEFAULT 1,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_user_settings" ON user_settings;
CREATE POLICY "anon_select_user_settings" ON user_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_user_settings" ON user_settings;
CREATE POLICY "anon_insert_user_settings" ON user_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_user_settings" ON user_settings;
CREATE POLICY "anon_update_user_settings" ON user_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS extension_state (
  id int PRIMARY KEY DEFAULT 1,
  name text,
  connected boolean DEFAULT false,
  last_sync timestamptz,
  library_count int DEFAULT 0,
  status text DEFAULT 'disconnected',
  updated_at timestamptz DEFAULT now(),
  raw_manifest jsonb
);

ALTER TABLE extension_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_extension_state" ON extension_state;
CREATE POLICY "anon_select_extension_state" ON extension_state FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_extension_state" ON extension_state;
CREATE POLICY "anon_insert_extension_state" ON extension_state FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_extension_state" ON extension_state;
CREATE POLICY "anon_update_extension_state" ON extension_state FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
