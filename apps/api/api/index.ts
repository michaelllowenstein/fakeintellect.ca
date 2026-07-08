/**
 * Vercel Serverless Function — FakeIntellect API
 *
 * This file is the entry point for all /api/* requests in production.
 * It wraps the Fastify app so it can run as a stateless Vercel function.
 *
 * Key differences from local dev (server.ts):
 * - No app.listen() — Vercel handles the HTTP server
 * - app instance is cached across warm invocations (module-level singleton)
 * - Pool is limited to 1 connection (Neon PgBouncer handles external pooling)
 */

import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';

// ── Singleton — reused across warm lambda invocations ────────────────────────
let app: FastifyInstance | null = null;
let isReady = false;

async function getApp(): Promise<FastifyInstance> {
  if (!app) {
    app = buildApp();
  }
  if (!isReady) {
    await app.ready();
    isReady = true;
  }
  return app;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const fastify = await getApp();

  // Fastify processes the request by emitting it directly into Node's http server
  fastify.server.emit('request', req, res);
}
