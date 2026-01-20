import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://cbboaievahhobnzgqypn.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYm9haWV2YWhob2JuemdxeXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjY2NzAsImV4cCI6MjA4MTg0MjY3MH0.siMaiYCdqu4Isynn63AvNSAPvGsTxbGkp2bxx1XAa8o';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

// SQL commands to execute one by one
const sqlCommands = [
  "ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check CASCADE",
  "ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_deposit_percent_check CASCADE",
  "ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_product_position_check CASCADE",
  "ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check CASCADE",
  "ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_deposit_percent_check CASCADE",
  "ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_product_position_check CASCADE",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS combo_product_position INTEGER DEFAULT 9",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS combo_multiplier NUMERIC(10,2) DEFAULT 3",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS combo_deposit_percent NUMERIC(10,2) DEFAULT 50",
  "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS combo_enabled BOOLEAN DEFAULT false",
  "ALTER TABLE profiles ADD CONSTRAINT profiles_combo_product_position_check CHECK (combo_product_position >= 1 AND combo_product_position <= 25)",
  "ALTER TABLE profiles ADD CONSTRAINT profiles_combo_multiplier_check CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500)",
  "ALTER TABLE profiles ADD CONSTRAINT profiles_combo_deposit_percent_check CHECK (combo_deposit_percent >= 5 AND combo_deposit_percent <= 5000)",
  "UPDATE profiles SET combo_multiplier = 3 WHERE combo_multiplier IS NOT NULL AND (combo_multiplier < 1 OR combo_multiplier > 500)",
  "UPDATE profiles SET combo_deposit_percent = 50 WHERE combo_deposit_percent IS NOT NULL AND (combo_deposit_percent < 5 OR combo_deposit_percent > 5000)",
  "UPDATE profiles SET combo_product_position = 9 WHERE combo_product_position IS NOT NULL AND (combo_product_position < 1 OR combo_product_position > 25)"
];

async function main() {
  console.log('Starting migration fix...\n');

  for (let i = 0; i < sqlCommands.length; i++) {
    const sql = sqlCommands[i];
    console.log(`[${i + 1}/${sqlCommands.length}] Executing: ${sql.substring(0, 70)}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        console.error(`  ❌ Error: ${error.message}`);
      } else {
        console.log('  ✓ Success');
      }
    } catch (err) {
      console.error(`  ❌ Exception: ${err.message}`);
    }

    // Small delay between commands
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✅ Migration complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
