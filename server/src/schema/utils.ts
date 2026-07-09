import { Comment } from '@fakeintellect/types';


export const mapRow = (row: CommentRow): Comment => {
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
};