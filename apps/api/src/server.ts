import 'dotenv/config';
import { buildApp } from './app';
import { logger } from './utils/logger';
import { closePool } from './db/pool';

async function bootstrap() {
  const app = buildApp();

  const port = parseInt(process.env.PORT ?? '3000', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen({ port, host });
  logger.info(`🚀  FakeIntellect API running at http://${host}:${port}`);
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, async () => {
    logger.info(`Received ${signal}, shutting down...`);
    await closePool();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
