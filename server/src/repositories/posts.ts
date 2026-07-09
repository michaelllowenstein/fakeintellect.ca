import { queryOne, queryMany, query, withTransaction } from '../db/pool';
import type { Post, PostSummary, PostListParams, PaginatedResponse } from '@fakeintellect/types';

// ── Row-level types (snake_case from DB) ──────────────────────────────────────

interface PostRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  reading_time_minutes: number;
  status: string;
  is_featured: boolean;
  is_pinned: boolean;
  view_count: string; // bigint comes as string from pg
  like_count: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined author fields
  author_id: string;
  author_username: string;
  author_display_name: string;
  author_bio: string | null;
  author_avatar_url: string | null;
  author_twitter: string | null;
  author_github: string | null;
  author_created_at: string;
  // Aggregated tag JSON
  tags: string; // JSON array from string_agg
  comment_count: string;
}

// ── SQL fragments ─────────────────────────────────────────────────────────────

const POST_SELECT = `
  SELECT
    p.id, p.slug, p.title, p.subtitle, p.excerpt, p.content,
    p.cover_image_url, p.cover_image_alt, p.reading_time_minutes,
    p.status, p.is_featured, p.is_pinned,
    p.view_count, p.like_count,
    p.published_at, p.created_at, p.updated_at,
    a.id          AS author_id,
    a.username    AS author_username,
    a.display_name AS author_display_name,
    a.bio         AS author_bio,
    a.avatar_url  AS author_avatar_url,
    a.twitter_handle AS author_twitter,
    a.github_handle  AS author_github,
    a.created_at  AS author_created_at,
    COALESCE(
      '[' || string_agg(
        json_build_object(
          'id', t.id,
          'name', t.name,
          'slug', t.slug,
          'color', t.color,
          'description', t.description
        )::text,
        ','
        ORDER BY t.name
      ) || ']',
      '[]'
    ) AS tags,
    (SELECT COUNT(*)::text FROM comments c WHERE c.post_id = p.id AND c.is_approved = TRUE) AS comment_count
  FROM posts p
  JOIN authors a ON a.id = p.author_id
  LEFT JOIN post_tags pt ON pt.post_id = p.id
  LEFT JOIN tags t ON t.id = pt.tag_id
`;

const GROUP_BY = `GROUP BY p.id, a.id`;

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapRowToPost(row: PostRow): Post {
  const tags = JSON.parse(row.tags ?? '[]');
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt,
    readingTimeMinutes: row.reading_time_minutes,
    status: row.status as Post['status'],
    isFeatured: row.is_featured,
    isPinned: row.is_pinned,
    viewCount: parseInt(row.view_count, 10),
    likeCount: parseInt(row.like_count, 10),
    commentCount: parseInt(row.comment_count, 10),
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: {
      id: row.author_id,
      username: row.author_username,
      displayName: row.author_display_name,
      bio: row.author_bio,
      avatarUrl: row.author_avatar_url,
      twitterHandle: row.author_twitter,
      githubHandle: row.author_github,
      createdAt: row.author_created_at,
    },
    tags,
  };
}

function mapRowToSummary(row: PostRow): PostSummary {
  const full = mapRowToPost(row);
  return {
    id: full.id,
    slug: full.slug,
    title: full.title,
    subtitle: full.subtitle,
    excerpt: full.excerpt,
    coverImageUrl: full.coverImageUrl,
    coverImageAlt: full.coverImageAlt,
    readingTimeMinutes: full.readingTimeMinutes,
    status: full.status,
    isFeatured: full.isFeatured,
    isPinned: full.isPinned,
    author: {
      id: full.author.id,
      displayName: full.author.displayName,
      avatarUrl: full.author.avatarUrl,
      username: full.author.username,
    },
    tags: full.tags.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, color: t.color })),
    viewCount: full.viewCount,
    likeCount: full.likeCount,
    commentCount: full.commentCount,
    publishedAt: full.publishedAt,
  };
}

// ── Repository methods ────────────────────────────────────────────────────────

export async function listPosts(
  params: PostListParams,
): Promise<PaginatedResponse<PostSummary>> {
  const { page = 1, pageSize = 10, tag, search, featured, status = 'published' } = params;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [`p.status = $1`];
  const args: unknown[] = [status];
  let idx = 2;

  if (tag) {
    conditions.push(`EXISTS (
      SELECT 1 FROM post_tags pt2
      JOIN tags t2 ON t2.id = pt2.tag_id
      WHERE pt2.post_id = p.id AND t2.slug = $${idx++}
    )`);
    args.push(tag);
  }

  if (search) {
    conditions.push(`(
      to_tsvector('english', p.title || ' ' || COALESCE(p.subtitle,'') || ' ' || p.excerpt)
      @@ plainto_tsquery('english', $${idx++})
      OR p.title ILIKE '%' || $${idx++} || '%'
    )`);
    args.push(search, search);
    idx++;
  }

  if (featured === true) {
    conditions.push(`p.is_featured = TRUE`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  // Total count
  const countSql = `SELECT COUNT(DISTINCT p.id) AS total
    FROM posts p
    JOIN authors a ON a.id = p.author_id
    LEFT JOIN post_tags pt ON pt.post_id = p.id
    LEFT JOIN tags t ON t.id = pt.tag_id
    ${where}`;

  const countRow = await queryOne<{ total: string }>(countSql, args);
  const total = parseInt(countRow?.total ?? '0', 10);

  // Data query
  const dataSql = `
    ${POST_SELECT}
    ${where}
    ${GROUP_BY}
    ORDER BY p.is_pinned DESC, p.published_at DESC
    LIMIT $${idx++} OFFSET $${idx}
  `;

  const rows = await queryMany<PostRow>(dataSql, [...args, pageSize, offset]);
  const data = rows.map(mapRowToSummary);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrev: page > 1,
    },
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const sql = `${POST_SELECT} WHERE p.slug = $1 ${GROUP_BY}`;
  const row = await queryOne<PostRow>(sql, [slug]);
  return row ? mapRowToPost(row) : null;
}

export async function getPostById(id: string): Promise<Post | null> {
  const sql = `${POST_SELECT} WHERE p.id = $1 ${GROUP_BY}`;
  const row = await queryOne<PostRow>(sql, [id]);
  return row ? mapRowToPost(row) : null;
}

export async function getFeaturedPosts(limit = 3): Promise<PostSummary[]> {
  const sql = `
    ${POST_SELECT}
    WHERE p.status = 'published' AND p.is_featured = TRUE
    ${GROUP_BY}
    ORDER BY p.published_at DESC
    LIMIT $1
  `;
  const rows = await queryMany<PostRow>(sql, [limit]);
  return rows.map(mapRowToSummary);
}

export async function incrementViewCount(postId: string): Promise<void> {
  await query(
    `UPDATE posts SET view_count = view_count + 1 WHERE id = $1`,
    [postId]
  );
}

export async function incrementLikeCount(postId: string): Promise<void> {
  await query(
    `UPDATE posts SET like_count = like_count + 1 WHERE id = $1`,
    [postId]
  );
}

export async function getRelatedPosts(postId: string, limit = 3): Promise<PostSummary[]> {
  const sql = `
    ${POST_SELECT}
    WHERE p.status = 'published'
      AND p.id != $1
      AND EXISTS (
        SELECT 1 FROM post_tags pt1
        WHERE pt1.post_id = p.id
          AND pt1.tag_id IN (
            SELECT tag_id FROM post_tags WHERE post_id = $1
          )
      )
    ${GROUP_BY}
    ORDER BY p.published_at DESC
    LIMIT $2
  `;
  const rows = await queryMany<PostRow>(sql, [postId, limit]);
  return rows.map(mapRowToSummary);
}
