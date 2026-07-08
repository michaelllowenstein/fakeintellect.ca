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