// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Author {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  twitterHandle: string | null;
  githubHandle: string | null;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  postCount: number;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content: string; // Markdown
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  readingTimeMinutes: number;
  status: PostStatus;
  isFeatured: boolean;
  isPinned: boolean;
  author: Author;
  tags: Tag[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PostStatus = 'draft' | 'published' | 'archived';

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  coverImageUrl: string | null;
  readingTimeMinutes: number;
  status: PostStatus;
  isFeatured: boolean;
  isPinned: boolean;
  author: Pick<Author, 'id' | 'displayName' | 'avatarUrl' | 'username'>;
  tags: Pick<Tag, 'id' | 'name' | 'slug' | 'color'>[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
  coverImageAlt: string | null;   // ← add this
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string;
  authorAvatarUrl: string | null;
  content: string;
  isApproved: boolean;
  likeCount: number;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

// ─── API Request / Response Types ────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PostListParams {
  page?: number;
  pageSize?: number;
  tag?: string;
  search?: string;
  featured?: boolean;
  status?: PostStatus;
}

export interface CreateCommentPayload {
  postId: string;
  parentId?: string;
  authorName: string;
  authorEmail: string;
  content: string;
}

export interface PostReactionPayload {
  postId: string;
  type: 'like';
}

// ─── Firebase Realtime Types ──────────────────────────────────────────────────

export interface RealtimePostStats {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  activeReaders: number;
}

export interface RealtimeComment extends Omit<Comment, 'replies'> {
  firebaseId: string;
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export interface NewsletterSubscribePayload {
  email: string;
  name?: string;
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}
