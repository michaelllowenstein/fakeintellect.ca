import { queryOne, queryMany, query } from '../db/pool';
import type { Comment, CreateCommentPayload } from '@fakeintellect/types';

interface CommentRow {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  author_avatar_url: string | null;
  content: string;
  is_approved: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: CommentRow): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    parentId: row.parent_id,
    authorName: row.author_name,
    authorEmail: row.author_email,
    authorAvatarUrl: row.author_avatar_url,
    content: row.content,
    isApproved: row.is_approved,
    likeCount: row.like_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  const rows = await queryMany<CommentRow>(
    `SELECT * FROM comments
     WHERE post_id = $1 AND is_approved = TRUE AND parent_id IS NULL
     ORDER BY created_at ASC`,
    [postId]
  );

  const topLevel = rows.map(mapRow);

  // Load replies for each top-level comment
  for (const comment of topLevel) {
    const replyRows = await queryMany<CommentRow>(
      `SELECT * FROM comments
       WHERE parent_id = $1 AND is_approved = TRUE
       ORDER BY created_at ASC`,
      [comment.id]
    );
    comment.replies = replyRows.map(mapRow);
  }

  return topLevel;
}

export async function createComment(payload: CreateCommentPayload): Promise<Comment> {
  const row = await queryOne<CommentRow>(
    `INSERT INTO comments (post_id, parent_id, author_name, author_email, content)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [payload.postId, payload.parentId ?? null, payload.authorName, payload.authorEmail, payload.content]
  );
  if (!row) throw new Error('Failed to create comment');
  return mapRow(row);
}

export async function approveComment(commentId: string): Promise<void> {
  await query(`UPDATE comments SET is_approved = TRUE WHERE id = $1`, [commentId]);
}

export async function deleteComment(commentId: string): Promise<void> {
  await query(`DELETE FROM comments WHERE id = $1`, [commentId]);
}

export async function likeComment(commentId: string): Promise<void> {
  await query(`UPDATE comments SET like_count = like_count + 1 WHERE id = $1`, [commentId]);
}
