import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runMigration = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const sql = postgres(process.env.POSTGRES_URL);

  try {
    const migrationSQL = readFileSync(
      join(process.cwd(), 'supabase/migrations/0001_add_stream_table.sql'),
      'utf-8',
    );

    console.log('⏳ Adding missing tables (Stream, Document, Suggestion)...');

    await sql.unsafe(migrationSQL);

    console.log('✅ Missing tables added successfully!');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('ℹ️  Tables already exist, skipping...');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await sql.end();
  }
};

runMigration().catch((err) => {
  console.error('❌ Failed to add missing tables');
  console.error(err);
  process.exit(1);
});
