-- ═══════════════════════════════════════════════════════════════
-- FakeIntellect Blog — PostgreSQL Schema
-- Run: npm run migrate (from apps/api)
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; 
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Authors ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS authors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username        VARCHAR(50)  UNIQUE NOT NULL,
  display_name    VARCHAR(100) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   TEXT         NOT NULL,
  bio             TEXT,
  avatar_url      TEXT,
  twitter_handle  VARCHAR(50),
  github_handle   VARCHAR(50),
  is_admin        BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Tags ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(50)  UNIQUE NOT NULL,
  slug        VARCHAR(50)  UNIQUE NOT NULL,
  description TEXT,
  color       VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Posts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                  VARCHAR(255) UNIQUE NOT NULL,
  title                 VARCHAR(500) NOT NULL,
  subtitle              VARCHAR(500),
  excerpt               TEXT NOT NULL,
  content               TEXT NOT NULL,          -- Markdown
  cover_image_url       TEXT,
  cover_image_alt       TEXT,
  reading_time_minutes  INT  NOT NULL DEFAULT 1,
  status                VARCHAR(20)  NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','published','archived')),
  is_featured           BOOLEAN      NOT NULL DEFAULT FALSE,
  is_pinned             BOOLEAN      NOT NULL DEFAULT FALSE,
  author_id             UUID         NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  view_count            BIGINT       NOT NULL DEFAULT 0,
  like_count            BIGINT       NOT NULL DEFAULT 0,
  published_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Post Tags (junction) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ── Comments ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id          UUID         NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id        UUID         REFERENCES comments(id) ON DELETE CASCADE,
  author_name      VARCHAR(100) NOT NULL,
  author_email     VARCHAR(255) NOT NULL,
  author_avatar_url TEXT,
  content          TEXT         NOT NULL,
  is_approved      BOOLEAN      NOT NULL DEFAULT FALSE,
  like_count       INT          NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Newsletter Subscribers ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        VARCHAR(255) UNIQUE NOT NULL,
  name         VARCHAR(100),
  is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  token        TEXT    NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Post View Log (for analytics, one row per unique visit) ──────
CREATE TABLE IF NOT EXISTS post_views (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  ip_hash    VARCHAR(64) NOT NULL,
  user_agent TEXT,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_status_published
  ON posts(status, published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_posts_author
  ON posts(author_id);

CREATE INDEX IF NOT EXISTS idx_posts_featured
  ON posts(is_featured) WHERE is_featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_posts_pinned
  ON posts(is_pinned) WHERE is_pinned = TRUE;

-- Full-text search index on title + excerpt
CREATE INDEX IF NOT EXISTS idx_posts_search
  ON posts USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(subtitle,'') || ' ' || excerpt)
  );

-- trigram index for ILIKE search
CREATE INDEX IF NOT EXISTS idx_posts_title_trgm
  ON posts USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_comments_post
  ON comments(post_id, is_approved, created_at)
  WHERE is_approved = TRUE;

CREATE INDEX IF NOT EXISTS idx_post_views_post
  ON post_views(post_id, viewed_at);

-- ── Updated-at trigger ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_updated_at    ON posts;
DROP TRIGGER IF EXISTS trg_authors_updated_at  ON authors;
DROP TRIGGER IF EXISTS trg_comments_updated_at ON comments;

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
