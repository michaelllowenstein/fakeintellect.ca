import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { postsRoutes } from './routes/posts';
import { tagsRoutes, newsletterRoutes } from './routes/tags';
import { logger } from './utils/logger';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: false,
    trustProxy: true,
  });

  // ── Security ──────────────────────────────────────────────────────────────
  app.register(helmet, { contentSecurityPolicy: false });

  app.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:4200',
      'https://fakeintellect.ca',
      'https://www.fakeintellect.ca',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Slow down — your thoughts are arriving faster than we can process them.',
    }),
  });

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'fakeintellect-api',
  }));

  // ── Routes ────────────────────────────────────────────────────────────────
  app.register(postsRoutes, { prefix: '/api/v1' });
  app.register(tagsRoutes, { prefix: '/api/v1' });
  app.register(async (instance) => {
    await newsletterRoutes(instance);
  }, { prefix: '/api/v1' });

  // ── Global error handler ──────────────────────────────────────────────────
  app.setErrorHandler((error, _req, reply) => {
    logger.error({ err: error }, 'Unhandled error');
    reply.status(error.statusCode ?? 500).send({
      statusCode: error.statusCode ?? 500,
      error: error.name,
      message: error.message,
    });
  });

  return app;
}
