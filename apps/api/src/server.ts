import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { postsRoutes } from './routes/posts';
import { tagsRoutes, newsletterRoutes } from './routes/tags';
import { logger } from './utils/logger';
import { closePool } from './db/pool';

const app = Fastify({
  logger: false, // Using pino separately
  trustProxy: true,
});

async function bootstrap() {
  // ── Security ──────────────────────────────────────────────────────────────
  await app.register(helmet, { contentSecurityPolicy: false });

  await app.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.register(rateLimit, {
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
  await app.register(postsRoutes, { prefix: '/api/v1' });
  await app.register(tagsRoutes, { prefix: '/api/v1' });
  await app.register(async (instance: any) => {
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

  // ── Start ─────────────────────────────────────────────────────────────────
  const port = parseInt(process.env.PORT ?? '3000', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen({ port, host });
  logger.info(`🚀  FakeIntellect API running at http://${host}:${port}`);
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, async () => {
    logger.info(`Received ${signal}, shutting down...`);
    await app.close();
    await closePool();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});
