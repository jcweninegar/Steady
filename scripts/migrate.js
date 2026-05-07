#!/usr/bin/env node
/**
 * Steady — Database Migration Runner
 * Usage: node scripts/migrate.js
 * Requires: SUPABASE_PAT and VITE_SUPABASE_URL env vars
 */

const PAT = process.env.SUPABASE_PAT;
const PROJECT_URL = process.env.VITE_SUPABASE_URL || "https://ebgowtfbelmhkejjyssl.supabase.co";
const PROJECT_REF = PROJECT_URL.replace("https://", "").replace(".supabase.co", "");

if (!PAT) {
  console.error("Missing SUPABASE_PAT environment variable");
  process.exit(1);
}

async function runSQL(sql, label = "migration") {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${PAT}` },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  if (res.status >= 200 && res.status < 300) {
    console.log(`✓ ${label}`);
    return data;
  } else {
    console.error(`✗ ${label}:`, JSON.stringify(data));
    throw new Error(`Migration failed: ${label}`);
  }
}

// Run migrations in order
async function main() {
  console.log(`Running migrations on project: ${PROJECT_REF}\n`);

  // journal_entries: structured daily records for AI personalization
  await runSQL(`
    ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS date          text,
      ADD COLUMN IF NOT EXISTS chat_messages jsonb        DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS captures      jsonb        DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS completed_tasks jsonb      DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS life_area_activity jsonb   DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS day_rating    text,
      ADD COLUMN IF NOT EXISTS ai_narrative  text,
      ADD COLUMN IF NOT EXISTS user_notes    jsonb        DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS updated_at    timestamptz  DEFAULT now();
  `, "journal_entries: add structured columns");

  await runSQL(`
    CREATE UNIQUE INDEX IF NOT EXISTS journal_entries_user_date_idx
      ON journal_entries (user_id, date);
  `, "journal_entries: unique index on (user_id, date)");

  console.log("\nAll migrations complete.");
}

main().catch(e => { console.error(e.message); process.exit(1); });
