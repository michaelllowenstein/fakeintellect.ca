import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { logger } from '../utils/logger';

// ── Detect serverless environment ─────────────────────────────────────────────
// In serverless (Vercel), connection pools must be kept minimal.
// Neon's PgBouncer (enabled via ?pgbouncer=true in DATABASE_URL) handles
// external pooling — we just need 1 connection per function instance.
const isServerless = !!(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY
);

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Serverless: keep max at 1 — Neon PgBouncer handles external pooling
      // Local dev: use a real pool for concurrent queries
      max: isServerless ? 1 : 20,
      idleTimeoutMillis: isServerless ? 5_000 : 30_000,
      connectionTimeoutMillis: 5_000,
      // Always use SSL for Neon / cloud databases
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : (process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false),
    });

    pool.on('error', (err) => {
      logger.error({ err }, 'Unexpected error on idle pg client');
    });
  }
  return pool;
}

// ── Query helpers ─────────────────────────────────────────────────────────────

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await getPool().query<T>(text, params);
  const duration = Date.now() - start;
  logger.debug({ duration, rows: result.rowCount }, 'SQL executed');
  return result;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] ?? null;
}

export async function queryMany<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

// ── Transaction helper ────────────────────────────────────────────────────────

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
// Only relevant in local dev — serverless functions don't persist

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    logger.info('Database pool closed');
  }
}
