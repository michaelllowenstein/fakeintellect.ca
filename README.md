# FakeIntellect

> *A blog for the confidently uncertain — hosted at [fakeintellect.ca](https://fakeintellect.ca)*

Production-grade blog platform built as a monorepo with Angular 20, React islands, a Fastify/TypeScript API, PostgreSQL, and Firebase Realtime Database.

---

## Architecture

```
fakeintellect/
├── apps/
│   ├── api/                 # Fastify + TypeScript backend
│   │   ├── src/
│   │   │   ├── db/          # pool.ts (raw pg), schema.sql, migrate.ts, seed.ts, firebase.ts
│   │   │   ├── repositories/  # posts, comments, tags — raw SQL, no ORM
│   │   │   ├── routes/      # posts.routes.ts, tags.routes.ts
│   │   │   ├── utils/       # logger (pino)
│   │   │   └── server.ts    # Fastify bootstrap
│   │   └── Dockerfile
│   └── web/                 # Angular 20 SPA
│       ├── src/app/
│       │   ├── app.config.ts          # provideRouter, provideHttpClient
│       │   ├── app.routes.ts          # lazy-loaded routes
│       │   ├── core/
│       │   │   ├── interceptors/      # apiInterceptor (base URL)
│       │   │   └── services/          # PostsService, RealtimeService, ConfigService
│       │   ├── features/
│       │   │   ├── home/              # Hero + featured grid + recent posts
│       │   │   ├── post-detail/       # Full post with sidebar, reactions, comments
│       │   │   ├── post-list/         # Paginated list + search + tag filter
│       │   │   ├── about/
│       │   │   └── not-found/
│       │   └── shared/
│       │       ├── navbar/
│       │       ├── footer/
│       │       ├── postcard/
│       │       └── bridge/      # Zone-isolated React island host
│       │           └── react-islands/
│       │               ├── mount.ts               # Dynamic island registry
│       │               ├── FeaturedPostsGrid.tsx  # Hover-animated post grid
│       │               ├── StatsTicker.tsx        # Scrolling marquee
│       │               ├── NewsletterSignup.tsx   # Validated subscribe form
│       │               ├── CommentThread.tsx      # Threaded comments + replies
│       │               ├── PostReactions.tsx      # Like + live view counter
│       │               ├── ReadingProgress.tsx    # Sticky progress bar
│       │               └── SearchModal.tsx        # Debounced full-text search
│       └── Dockerfile
├── packages/
│   └── shared-types/        # TypeScript interfaces shared by API + web
├── docker/
│   ├── docker-compose.yml   # postgres, redis, api, web, nginx
│   └── nginx.conf           # Reverse proxy + HTTPS
└── scripts/
    └── scaffold-fakeintellect.sh
```

---

## Stack Decision: Why Fastify + TypeScript?

| Factor | Fastify/TS | Python/FastAPI | .NET Core |
|--------|-----------|----------------|-----------|
| Language unity with Angular/React | ✅ single TS stack | ❌ context switch | ❌ context switch |
| Shared types (API ↔ web) | ✅ `@fakeintellect/shared-types` | ❌ requires codegen | ❌ requires codegen |
| Raw SQL ergonomics | ✅ `pg` pool, direct | ✅ SQLAlchemy raw | ✅ Dapper |
| Performance | ✅ ~70k req/s | ✅ comparable | ✅ comparable |
| Firebase Admin SDK | ✅ first-class | ✅ good | ⚠️ community |
| Deploy size | ✅ 80MB image | ⚠️ 250MB+ | ⚠️ 200MB+ |

---

## Quickstart

### Prerequisites
- Node.js 20+
- Docker Desktop (or Docker Engine + Compose v2)
- A Firebase project with Realtime Database enabled

### 1. Clone & scaffold

```bash
git clone https://github.com/yourusername/fakeintellect
cd fakeintellect
chmod +x scripts/scaffold-fakeintellect.sh
./scripts/scaffold-fakeintellect.sh
```

The script handles: `npm install` → shared-types build → Docker up → migrate → seed.

### 2. Configure Firebase

**apps/api/.env**
```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account", ...}
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

**apps/web/src/environments/environment.ts**
```ts
export const environment = {
  firebase: {
    apiKey: 'your-api-key',
    databaseURL: 'https://your-project-default-rtdb.firebaseio.com',
    // ...
  }
};
```

### 3. Run dev

```bash
npm run dev
# Angular → http://localhost:4200
# Fastify  → http://localhost:3000
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/posts` | Paginated post list (search, tag, featured filters) |
| `GET` | `/api/v1/posts/featured` | Top 3 featured posts |
| `GET` | `/api/v1/posts/:slug` | Full post + increments view count |
| `GET` | `/api/v1/posts/:slug/related` | Related posts by shared tags |
| `POST` | `/api/v1/posts/:id/like` | Increment like count |
| `GET` | `/api/v1/posts/:slug/comments` | Approved comments tree |
| `POST` | `/api/v1/posts/:slug/comments` | Submit new comment (pending approval) |
| `POST` | `/api/v1/comments/:id/like` | Like a comment |
| `GET` | `/api/v1/tags` | All tags with post counts |
| `GET` | `/api/v1/tags/:slug` | Single tag |
| `POST` | `/api/v1/newsletter/subscribe` | Subscribe email |
| `GET` | `/health` | Service health check |

---

## React Islands

Angular handles routing, auth, DI, HTTP, and page structure.
React islands are mounted **outside Angular's `zone.js`** to prevent change detection pollution.

| Island | Trigger | Description |
|--------|---------|-------------|
| `FeaturedPostsGrid` | Home hero | Hover-animated post cards, tag colours |
| `StatsTicker` | Home mid-section | Scrolling disclaimer marquee |
| `NewsletterSignup` | Home footer, sidebar | Validated email form with states |
| `CommentThread` | Post detail | Threaded comments, replies, likes |
| `PostReactions` | Post detail | Like button + live Firebase stats |
| `ReadingProgress` | Post detail | Sticky progress bar (scroll %) |
| `SearchModal` | Triggered from navbar | Debounced full-text search overlay |

---

## Database Schema

PostgreSQL with raw SQL (no ORM). Key tables:

- `authors` — blog authors with auth fields
- `posts` — full content + metadata, GIN full-text index
- `tags` + `post_tags` — M:N tag junction
- `comments` — threaded (self-referential), approval workflow
- `newsletter_subscribers` — email list with confirm token
- `post_views` — analytics log

Firebase Realtime DB paths:
- `post_stats/{postId}` — live view/like/comment counts
- `active_readers/{postId}/{sessionId}` — presence tracking

---

## Production Deployment

```bash
# Build all Docker images and start full stack
npm run docker:up

# Or individual services
docker compose -f docker/docker-compose.yml up -d postgres redis api web nginx
```

For TLS: add SSL certs to `docker/ssl/` (`fullchain.pem`, `privkey.pem`).
[Let's Encrypt via Certbot](https://certbot.eff.org/) is recommended.

---

## Content Management

Posts are created via direct database inserts or a future admin UI.
The seed provides 4 sample posts. All comments require approval (`is_approved = TRUE`).

```sql
-- Approve a pending comment
UPDATE comments SET is_approved = TRUE WHERE id = '<uuid>';

-- Publish a draft post
UPDATE posts SET status = 'published', published_at = NOW() WHERE slug = 'my-draft';
```

---

*Built with Angular 20, React 18, Fastify 4, PostgreSQL 16, Firebase RTDB*
*© 2024 fakeintellect.ca*
