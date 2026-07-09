/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * api/index.ts — Vercel Serverless Function entry point
 *
 * Bridges Vercel's (req, res) to Fastify via inject(), which is more
 * reliable than server.emit('request') in serverless environments where
 * the underlying http.Server may not be listening.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
 
import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../server/src/app';
import { ensurePool } from '../server/src/db/pool';
import type { FastifyInstance } from 'fastify';
 
let app: FastifyInstance | null = null;
let isReady = false;
 
async function getApp(): Promise<FastifyInstance> {
  if (!app) {
    // Initialise the database pool BEFORE Fastify boots.
    // This ensures the Neon WebSocket connection is established
    // before any route handler tries to query.
    await ensurePool();
    app = buildApp();
  }
  if (!isReady) {
    await app!.ready();
    isReady = true;
  }
  return app!;
}
 
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const fastify = await getApp();
 
  // Build the inject payload from the Vercel request.
  // Fastify's inject() runs the full middleware/hook/route chain
  // without needing an active http.Server listener.
  const injectResult = await fastify.inject({
    method: req.method as any,
    url: req.url!,
    headers: req.headers as Record<string, string>,
    payload: req.body ? JSON.stringify(req.body) : undefined,
  });
 
  // Forward the Fastify response back to Vercel's response object
  res.writeHead(injectResult.statusCode, injectResult.headers as any);
  res.end(injectResult.rawPayload);
}