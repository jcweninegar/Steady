#!/usr/bin/env node
/**
 * Steady — Events table + tasks.start_time column migration
 * Creates an analytics events table and adds start_time to tasks.
 * Usage: node scripts/migrate-events-starttime.js
 */

const PAT = process.env.SUPABASE_PAT;
const PROJECT_URL = process.env.VITE_SUPABASE_URL || "https://ebgowtfbelmhkejjyssl.supabase.co";
const PROJECT_REF = PROJECT_URL.replace("https://", "").replace(".supabase.co", "");

if (!PAT) { console.error("Missing SUPABASE_PAT"); process.exit(1); }

async function runSQL(sql, label) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${PAT}` },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  if (res.status >= 200 && res.status < 300) { console.log(`✓ ${label}`); return data; }
  console.error(`✗ ${label}:`, JSON.stringify(data));
  throw new Error(`Migration failed: ${label}`);
}

async function main() {
  console.log(`Running on project: ${PROJECT_REF}\n`);

  // 1. Add start_time column to tasks
  await runSQL(`
    ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS start_time text;
  `, "tasks: add start_time column");

  // 2. Create events table
  await runSQL(`
    CREATE TABLE IF NOT EXISTS events (
      id          bigserial PRIMARY KEY,
      user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      event       text        NOT NULL,
      ts          timestamptz NOT NULL DEFAULT now()
    );
  `, "events: create table");

  // 3. Enable RLS on events
  await runSQL(`ALTER TABLE events ENABLE ROW LEVEL SECURITY;`, "events: enable RLS");

  // 4. RLS — users can only insert their own events
  await runSQL(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename='events' AND policyname='Users can insert own events'
      ) THEN
        CREATE POLICY "Users can insert own events" ON events
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      END IF;
    END $$;
  `, "events: insert policy");

  // 5. RLS — users can read their own events (for future analytics)
  await runSQL(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename='events' AND policyname='Users can select own events'
      ) THEN
        CREATE POLICY "Users can select own events" ON events
          FOR SELECT USING (auth.uid() = user_id);
      END IF;
    END $$;
  `, "events: select policy");

  // 6. Index for fast per-user queries
  await runSQL(`
    CREATE INDEX IF NOT EXISTS events_user_ts_idx ON events (user_id, ts DESC);
  `, "events: user+ts index");

  console.log("\nMigration complete: events table + tasks.start_time added.");
}

main().catch(e => { console.error(e.message); process.exit(1); });
