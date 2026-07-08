import type { FastifyInstance } from 'fastify';
import * as tagsRepo from '../repositories/tags';
import { query } from '../db/pool';

export async function tagsRoutes(app: FastifyInstance) {
  app.get('/tags', async (_req, reply) => {
    const tags = await tagsRepo.getAllTags();
    return reply.send({ data: tags });
  });

  app.get<{ Params: { slug: string } }>('/tags/:slug', async (req, reply) => {
    const tag = await tagsRepo.getTagBySlug(req.params.slug);
    if (!tag) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Tag not found' });
    return reply.send({ data: tag });
  });
}

export async function newsletterRoutes(app: FastifyInstance) {
  app.post<{ Body: { email: string; name?: string } }>('/newsletter/subscribe', async (req, reply) => {
    const { email, name } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: 'Valid email required' });
    }

    await query(
      `INSERT INTO newsletter_subscribers (email, name)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING`,
      [email, name ?? null]
    );

    return reply.status(201).send({ message: 'Subscribed! Check your inbox for confirmation.' });
  });
}
