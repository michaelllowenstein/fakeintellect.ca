import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getPool, closePool } from './pool';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function migrate() {
  console.log('🔄  Running migrations...');
  const pool = getPool();

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    await pool.query(sql);
    console.log('✅  Schema applied successfully');
  } catch (err) {
    console.error('❌  Migration failed:', err);
    process.exit(1);
  } finally {
    await closePool();
  }
}

migrate();
