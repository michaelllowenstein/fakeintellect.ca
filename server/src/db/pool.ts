/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * pool.ts — Dual-transport database pool
 *
 * Serverless (Vercel): uses @neondatabase/serverless (WebSocket transport)
 * Local dev / Docker:  uses pg (TCP transport)
 *
 * The API surface is identical — every consumer imports from this file
 * and gets the right transport automatically.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { PoolClient, QueryResult, QueryResultRow } from 'pg';

const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// ── Dynamic pool import ──────────────────────────────────────────────────────
// We use a unified Pool variable. Both `pg` and `@neondatabase/serverless`
// expose a compatible Pool class, so consumers never need to know which
// transport is active.

let pool: InstanceType<typeof import('pg').Pool> | null = null;

async function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  if (isServerless) {
    // ── Serverless: WebSocket-based pool (Neon driver) ──────────────
    const { Pool: NeonPool, neonConfig } = await import('@neondatabase/serverless');

    // Use WebSocket constructor from 'ws' in Node environments.
    // Vercel's runtime provides a built-in WebSocket, but if running
    // in a standard Node serverless function, 'ws' is the fallback.
    try {
      const ws = await import('ws');
      neonConfig.webSocketConstructor = ws.default;
    } catch {
      // In edge/Vercel runtime, native WebSocket is available — no ws needed
    }

    pool = new NeonPool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 5_000,
      connectionTimeoutMillis: 10_000,
      // Neon serverless driver handles SSL internally via the
      // WebSocket proxy — no need for ssl config here.
    }) as any;
  } else {
    // ── Local / Docker: standard TCP pool (pg) ──────────────────────
    const { Pool: PgPool } = await import('pg');

    pool = new PgPool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: process.env.DATABASE_URL.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    });
  }

  // Attach error handler regardless of transport
  (pool as any).on('error', (err: Error) => {
    console.error('Unexpected pg client error', err);
  });

  return pool;
}

export function getPool() {
  if (!pool) {
    // Synchronous initialisation guard — callers should await ensurePool()
    // for the first call, but this keeps backward compat for the sync
    // getPool() pattern used throughout the repositories.
    throw new Error(
      'Pool not initialised. Call ensurePool() before first query.',
    );
  }
  return pool;
}

/**
 * Initialise the pool once. Safe to call multiple times — no-ops after first.
 * Call this in your Fastify `buildApp()` or serverless handler bootstrap.
 */
export async function ensurePool() {
  if (!pool) {
    await createPool();
  }
  return pool!;
}

// ── Query helpers (unchanged API) ─────────────────────────────────────────────

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const p = pool ?? (await ensurePool());
  return p.query<T>(text, params);
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

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const p = pool ?? (await ensurePool());
  const client = await (p as any).connect();
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

export async function closePool(): Promise<void> {
  if (pool) {
    await (pool as any).end();
    pool = null;
  }
}