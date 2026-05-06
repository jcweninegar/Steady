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
  // Add new migrations here as the app grows
  // Example:
  // await runSQL(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal';`, "Add priority to tasks");
  console.log("\nAll migrations complete.");
}

main().catch(e => { console.error(e.message); process.exit(1); });
