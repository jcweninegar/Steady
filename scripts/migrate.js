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

  // tasks: add client-side sync columns
  await runSQL(`
    ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS client_id   text,
      ADD COLUMN IF NOT EXISTS label       text,
      ADD COLUMN IF NOT EXISTS area        text         DEFAULT 'work',
      ADD COLUMN IF NOT EXISTS urgency     text         DEFAULT 'soon',
      ADD COLUMN IF NOT EXISTS due_date    text,
      ADD COLUMN IF NOT EXISTS hours       text         DEFAULT '0h',
      ADD COLUMN IF NOT EXISTS mins        text         DEFAULT '30m',
      ADD COLUMN IF NOT EXISTS description text,
      ADD COLUMN IF NOT EXISTS steps       jsonb        DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS subtasks    jsonb        DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS notes       text,
      ADD COLUMN IF NOT EXISTS done        boolean      DEFAULT false,
      ADD COLUMN IF NOT EXISTS updated_at  timestamptz  DEFAULT now();
  `, "tasks: add sync columns");

  await runSQL(`
    CREATE UNIQUE INDEX IF NOT EXISTS tasks_user_client_idx
      ON tasks (user_id, client_id)
      WHERE client_id IS NOT NULL;
  `, "tasks: unique index (user_id, client_id)");

  // life_areas: add sync columns
  await runSQL(`
    ALTER TABLE life_areas
      ADD COLUMN IF NOT EXISTS area_key   text,
      ADD COLUMN IF NOT EXISTS baseline   text,
      ADD COLUMN IF NOT EXISTS status     text,
      ADD COLUMN IF NOT EXISTS goals      jsonb        DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS updated_at timestamptz  DEFAULT now();
  `, "life_areas: add sync columns");

  await runSQL(`
    CREATE UNIQUE INDEX IF NOT EXISTS life_areas_user_key_idx
      ON life_areas (user_id, area_key)
      WHERE area_key IS NOT NULL;
  `, "life_areas: unique index (user_id, area_key)");

  console.log("\nAll migrations complete.");
}

main().catch(e => { console.error(e.message); process.exit(1); });
