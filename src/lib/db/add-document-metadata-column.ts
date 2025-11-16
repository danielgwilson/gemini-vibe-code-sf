import { config } from 'dotenv';
import postgres from 'postgres';

config({
  path: '.env.local',
});

async function main() {
  const url = process.env.POSTGRES_URL;

  if (!url) {
    throw new Error('POSTGRES_URL is not defined in .env.local');
  }

  const sql = postgres(url, { max: 1 });

  try {
    console.log('⏳ Ensuring Document.metadata column exists...');
    await sql`ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "metadata" jsonb`;
    console.log('✅ Document.metadata column is present.');
  } finally {
    await sql.end({ timeout: 5_000 });
  }
}

main().catch((error) => {
  console.error('❌ Failed to ensure Document.metadata column exists');
  console.error(error);
  process.exit(1);
});

