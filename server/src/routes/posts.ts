import type { FastifyInstance } from 'fastify';
import * as postsRepo from '../repositories/posts';
import * as commentsRepo from '../repositories/comments';
import { incrementPostView, incrementPostLike, syncPostStats } from '../db/firebase';
import type { PostListParams, CreateCommentPayload } from '@fakeintellect/types';

export async function postsRoutes(app: FastifyInstance) {
  // GET /posts — paginated list
  app.get<{ Querystring: PostListParams }>('/posts', async (req, reply) => {
    const params: PostListParams = {
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Math.min(Number(req.query.pageSize), 50) : 10,
      tag: req.query.tag,
      search: req.query.search,
      featured: req.query.featured === (true as any) || req.query.featured === ('true' as any),
      status: 'published',
    };
    const result = await postsRepo.listPosts(params);
    return reply.send(result);
  });

  // GET /posts/featured
  app.get('/posts/featured', async (_req, reply) => {
    const posts = await postsRepo.getFeaturedPosts(3);
    return reply.send({ data: posts });
  });

  // GET /posts/:slug
  app.get<{ Params: { slug: string } }>('/posts/:slug', async (req, reply) => {
    const post = await postsRepo.getPostBySlug(req.params.slug);
    if (!post) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Post not found' });

    // Async: increment view count in Postgres + Firebase (don't block response)
    postsRepo.incrementViewCount(post.id).then(() => {
      syncPostStats(post.id, {
        viewCount: post.viewCount + 1,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
      }).catch(() => {});
    }).catch(() => {});

    return reply.send({ data: post });
  });

  // GET /posts/:slug/related
  app.get<{ Params: { slug: string } }>('/posts/:slug/related', async (req, reply) => {
    const post = await postsRepo.getPostBySlug(req.params.slug);
    if (!post) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Post not found' });
    const related = await postsRepo.getRelatedPosts(post.id, 3);
    return reply.send({ data: related });
  });

  // POST /posts/:id/like
  app.post<{ Params: { id: string } }>('/posts/:id/like', async (req, reply) => {
    await postsRepo.incrementLikeCount(req.params.id);
    await incrementPostLike(req.params.id).catch(() => {});
    return reply.status(204).send();
  });

  // GET /posts/:slug/comments
  app.get<{ Params: { slug: string } }>('/posts/:slug/comments', async (req, reply) => {
    const post = await postsRepo.getPostBySlug(req.params.slug);
    if (!post) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Post not found' });
    const comments = await commentsRepo.getCommentsForPost(post.id);
    return reply.send({ data: comments });
  });

  // POST /posts/:slug/comments
  app.post<{
    Params: { slug: string };
    Body: Omit<CreateCommentPayload, 'postId'>;
  }>('/posts/:slug/comments', async (req, reply) => {
    const post = await postsRepo.getPostBySlug(req.params.slug);
    if (!post) return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Post not found' });

    const { authorName, authorEmail, content, parentId } = req.body;
    if (!authorName || !authorEmail || !content) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: 'authorName, authorEmail, content required' });
    }

    const comment = await commentsRepo.createComment({
      postId: post.id,
      parentId,
      authorName,
      authorEmail,
      content,
    });

    return reply.status(201).send({ data: comment });
  });

  // POST /comments/:id/like
  app.post<{ Params: { id: string } }>('/comments/:id/like', async (req, reply) => {
    await commentsRepo.likeComment(req.params.id);
    return reply.status(204).send();
  });
}
