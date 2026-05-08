#!/usr/bin/env node
const PAT = process.env.SUPABASE_PAT;
const PROJECT_URL = process.env.VITE_SUPABASE_URL || "";
const REF = PROJECT_URL.replace("https://", "").replace(".supabase.co", "");

if (!PAT) { console.error("Missing SUPABASE_PAT"); process.exit(1); }

async function sql(query, label) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${PAT}` },
    body: JSON.stringify({ query }),
  });
  const d = await r.json();
  if (r.ok) console.log("✓", label);
  else console.error("✗", label, JSON.stringify(d));
}

async function main() {
  await sql(`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT,
      email TEXT,
      onboarding_complete BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `, "create profiles table");

  await sql(`
    ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS name TEXT,
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
  `, "add missing columns");

  await sql(`ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`, "enable RLS");

  await sql(`
    DO $prof$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_select_own') THEN
        CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id);
      END IF;
    END $prof$;
  `, "select policy");

  await sql(`
    DO $prof$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_insert_own') THEN
        CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
      END IF;
    END $prof$;
  `, "insert policy");

  await sql(`
    DO $prof$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_update_own') THEN
        CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);
      END IF;
    END $prof$;
  `, "update policy");

  console.log("\nProfiles migration complete.");
}

main().catch(e => { console.error(e.message); process.exit(1); });
