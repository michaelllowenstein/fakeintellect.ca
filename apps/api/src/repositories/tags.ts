import { queryMany, queryOne } from '../db/pool';
import type { Tag } from '@fakeintellect/types';

interface TagRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  post_count: string;
  created_at: string;
}

function mapRow(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    color: row.color,
    postCount: parseInt(row.post_count, 10),
  };
}

export async function getAllTags(): Promise<Tag[]> {
  const rows = await queryMany<TagRow>(`
    SELECT t.*, COUNT(pt.post_id)::text AS post_count
    FROM tags t
    LEFT JOIN post_tags pt ON pt.tag_id = t.id
    LEFT JOIN posts p ON p.id = pt.post_id AND p.status = 'published'
    GROUP BY t.id
    ORDER BY post_count DESC, t.name ASC
  `);
  return rows.map(mapRow);
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const row = await queryOne<TagRow>(`
    SELECT t.*, COUNT(pt.post_id)::text AS post_count
    FROM tags t
    LEFT JOIN post_tags pt ON pt.tag_id = t.id
    LEFT JOIN posts p ON p.id = pt.post_id AND p.status = 'published'
    WHERE t.slug = $1
    GROUP BY t.id
  `, [slug]);
  return row ? mapRow(row) : null;
}
