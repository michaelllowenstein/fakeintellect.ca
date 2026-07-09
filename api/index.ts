import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../apps/api/src/app';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance | null = null;
let isReady = false;

async function getApp(): Promise<FastifyInstance> {
  if (!app) app = buildApp();
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
  fastify.server.emit('request', req, res);
}