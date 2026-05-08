#!/usr/bin/env node
/**
 * Steady — Captures & Chat Persistence Migration
 * Adds sync columns to captures table so captures and chat history
 * persist to Supabase (not just localStorage).
 * Usage: node scripts/migrate-captures-chat.js
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

  // captures: add sync columns
  await runSQL(`
    ALTER TABLE captures
      ADD COLUMN IF NOT EXISTS client_id   text,
      ADD COLUMN IF NOT EXISTS text        text,
      ADD COLUMN IF NOT EXISTS type        text         DEFAULT 'idea',
      ADD COLUMN IF NOT EXISTS updated_at  timestamptz  DEFAULT now();
  `, "captures: add sync columns");

  await runSQL(`
    CREATE UNIQUE INDEX IF NOT EXISTS captures_user_client_idx
      ON captures (user_id, client_id)
      WHERE client_id IS NOT NULL;
  `, "captures: unique index (user_id, client_id)");

  // Enable RLS on captures if not already
  await runSQL(`ALTER TABLE captures ENABLE ROW LEVEL SECURITY;`, "captures: enable RLS");

  // RLS policies for captures
  await runSQL(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename='captures' AND policyname='Users can select own captures'
      ) THEN
        CREATE POLICY "Users can select own captures" ON captures FOR SELECT USING (auth.uid() = user_id);
      END IF;
    END $$;
  `, "captures: select policy");

  await runSQL(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename='captures' AND policyname='Users can insert own captures'
      ) THEN
        CREATE POLICY "Users can insert own captures" ON captures FOR INSERT WITH CHECK (auth.uid() = user_id);
      END IF;
    END $$;
  `, "captures: insert policy");

  await runSQL(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename='captures' AND policyname='Users can update own captures'
      ) THEN
        CREATE POLICY "Users can update own captures" ON captures FOR UPDATE USING (auth.uid() = user_id);
      END IF;
    END $$;
  `, "captures: update policy");

  console.log("\nCaptures & chat migration complete.");
}

main().catch(e => { console.error(e.message); process.exit(1); });
