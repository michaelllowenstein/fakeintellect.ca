/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * import-content.ts
 * FakeIntellect — standalone content import (tags, posts, comments)
 *
 * Self-contained: uses pg directly, no workspace imports.
 * Idempotent: safe to run multiple times — uses ON CONFLICT DO UPDATE.
 *
 * Usage:
 *   # Against Neon (production)
 *   DATABASE_URL="postgresql://..." npx tsx scripts/import-content.ts
 *
 *   # Against local Docker postgres
 *   npx tsx scripts/import-content.ts   # reads apps/api/.env automatically
 *
 *   # Or via npm script (after adding to package.json):
 *   DATABASE_URL="..." npm run import:content --workspace=apps/api
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Pool, QueryResultRow, Submittable } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

// Load .env from apps/api if DATABASE_URL not already set
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });
}

if (!process.env.DATABASE_URL) {
  console.error('❌  DATABASE_URL is required. Set it in the environment or in apps/api/.env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 3,
});

async function q<T extends any[] | QueryResultRow | Submittable = any>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await pool.query<T>(text, params);
  return res.rows;
}

// ── Colour helpers ─────────────────────────────────────────────────────────────
const c = {
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  cyan:   (s: string) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
};

const ok   = (msg: string) => console.log(`  ${c.green('✓')} ${msg}`);
const warn = (msg: string) => console.log(`  ${c.yellow('⚠')} ${msg}`);
const info = (msg: string) => console.log(`  ${c.cyan('▸')} ${msg}`);

// ══════════════════════════════════════════════════════════════════════════════
// TAGS
// ══════════════════════════════════════════════════════════════════════════════

const TAGS = [
  // Base tags
  { name: 'Philosophy', slug: 'philosophy', color: '#8b5cf6', description: 'Thinking about thinking' },
  { name: 'Technology', slug: 'technology', color: '#06b6d4', description: 'The machines are learning' },
  { name: 'Culture',    slug: 'culture',    color: '#f59e0b', description: 'What we are becoming' },
  { name: 'Science',    slug: 'science',    color: '#10b981', description: 'Evidence-based wandering' },
  { name: 'Opinion',    slug: 'opinion',    color: '#ef4444', description: 'Wrong, but confidently' },
  { name: 'Satire',     slug: 'satire',     color: '#f97316', description: 'Funny because it is true' },
  // Technical tags
  { name: 'Engineering', slug: 'engineering', color: '#3b82f6', description: 'The practice of building things that work' },
  { name: 'Frontend',    slug: 'frontend',    color: '#f59e0b', description: 'What users actually see and touch' },
  { name: 'Backend',     slug: 'backend',     color: '#10b981', description: 'The part nobody notices until it breaks' },
  { name: 'Databases',   slug: 'databases',   color: '#8b5cf6', description: 'Where the truth lives' },
  { name: 'AI Ethics',   slug: 'ai-ethics',   color: '#ef4444', description: 'The questions we are not asking loudly enough' },
];

// ══════════════════════════════════════════════════════════════════════════════
// POSTS
// ══════════════════════════════════════════════════════════════════════════════

interface PostDef {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  readingTime: number;
  isFeatured: boolean;
  isPinned: boolean;
  tags: string[];
  daysAgo: number; // controls published_at spread
}

const POSTS: PostDef[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'eleven-years-with-angular-a-complicated-love-story',
    title: 'Eleven Years With Angular: A Complicated Love Story',
    subtitle: 'It is not the framework you want. It is the framework you deserve.',
    excerpt: 'I have been writing Angular since before it was Angular. Back when it was AngularJS, back when two-way data binding felt like magic and $scope felt like God. A lot has changed. My feelings have not simplified.',
    readingTime: 9,
    isFeatured: true,
    isPinned: false,
    tags: ['engineering', 'frontend', 'opinion'],
    daysAgo: 58,
    content: `
## The Beginning

I have been writing Angular since before it was Angular. Back when it was AngularJS, back when two-way data binding felt like magic and \`$scope\` felt like God. A lot has changed. My feelings have not simplified.

There is a particular kind of relationship you develop with a framework you have used for eleven years across fifteen production applications, three complete rewrites, and more migration guides than I care to count. It is not love exactly. It is closer to the feeling you have about a city you grew up in — you know every shortcut, you know where the potholes are, and you have a deeply personal relationship with its specific brand of dysfunction.

## Why I Keep Choosing It

Let me be direct about something that the React community tends to gloss over: Angular is an *application framework*, not a UI library. This distinction sounds pedantic until you are six months into a team project and you realize that React's flexibility — the thing everyone celebrates — is actually just transferred decision-making. Someone still has to decide on state management. Someone still has to pick a router. Someone still has to enforce patterns. In large teams, that someone is either a very disciplined architect or, more commonly, nobody, and the codebase becomes a collection of individually reasonable decisions that collectively make no sense.

Angular makes those decisions for you. Aggressively. Opinionatedly. Sometimes infuriatingly.

And here is the thing I will defend to anyone who wants to have this argument: for business-critical software with teams larger than three people and timelines longer than six months, that is not a weakness. That is the entire point.

## What Angular 2 Through Angular 19 Taught Me

The Angular 2 rewrite in 2016 was a legitimate crisis. If you were building Angular 1 applications and you got that news, it felt like a betrayal. I remember it. We had production AngularJS apps and suddenly the framework we had bet on was being deprecated in spirit if not in name.

What I did not understand at the time — and what took me probably three more years to fully appreciate — was that the team was making the right call. AngularJS had fundamental architectural problems that could not be patched. The rewrite was painful because the right thing often is.

This is worth remembering every time Angular releases a major version and the internet briefly melts down about breaking changes. The people building Angular are playing a longer game than the people complaining about it.

**TypeScript first.** When Angular 2 shipped with TypeScript as the default, I was skeptical in the way that everyone was skeptical in 2016. By 2019, I could not imagine writing a large application without it. By 2022, I was imposing \`strict: true\` on every project I touched. The directional bet Angular made on TypeScript before TypeScript was fashionable is one of the most prescient decisions in modern frontend history.

**Dependency injection.** I have now used Angular's DI system for long enough that using React without it feels like building furniture without a drill. You can do it. People do it all the time. But there are moments when you are threading a service three levels deep through props and you think: there is a better way, and I know exactly what it looks like.

**RxJS.** This one is more complicated. RxJS is genuinely powerful for the problems it is designed to solve — async data streams, complex event orchestration, real-time updates. It is also genuinely confusing for the problems where you just wanted to fetch some data and render it. The good news is that Angular Signals, introduced properly in Angular 16 and now first-class in 19+, solve the "just fetch and render" case elegantly without removing RxJS for the cases where it genuinely earns its complexity. This is the correct answer. It took a while to arrive at.

## The Standalone Component Era

Angular 14 introduced standalone components. Angular 15 made them production-ready. Angular 17 made them the default. This is, without qualification, the biggest quality-of-life improvement Angular has shipped in the last five years.

If you are still writing NgModules for new code, please stop. Not because NgModules are wrong — they solved a real problem for a decade — but because standalone components solve the same problem with less ceremony and better tree-shaking. The migration is almost always worth the afternoon it takes.

## The Honest Criticism

Angular moves slowly compared to the alternatives. If something ships in React's ecosystem in Q1, it will be in Angular's in Q3 at the earliest and fully stabilized by the following Q1. The velocity gap is real.

The learning curve is real. Sending a junior developer to build their first Angular component is a different experience than sending them to build their first React component. Neither is easier objectively — React's apparent simplicity conceals complexity that surfaces later, while Angular's apparent complexity surfaces immediately — but the first-week experience in Angular genuinely requires more scaffolding.

## What Eleven Years Actually Teaches You

It teaches you that the framework is not the point. The point is whether the people using it can build something maintainable, testable, and scalable. Angular's opinionated structure makes that easier at scale. React's flexibility makes it easier at the start. These are different tradeoffs for different contexts, not evidence that one is superior.

It teaches you that the version you learned is not the framework that exists today. If your opinion of Angular was formed before standalone components, or before Signals, or before the new control flow syntax with \`@if\` and \`@for\`, then your opinion is based on a framework that no longer exists in that form.

And it teaches you — this is the one I think about most — that loyalty to a tool is less valuable than understanding why you use it. I use Angular when I need enterprise-grade structure, strong conventions, and a team that can onboard reliably. That said: when the problem fits, Angular is still the most complete answer I have found. Eleven years in, I do not say that lightly.
    `.trim(),
  },

  // ── 2 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'why-i-stopped-picking-one-framework-and-started-using-all-of-them',
    title: 'Why I Stopped Picking One Framework and Started Using All of Them',
    subtitle: 'The architecture nobody tells you about because it feels like cheating.',
    excerpt: 'The question I kept getting asked in code reviews and architecture meetings was always a version of the same thing: Angular or React? As if the answer was binary. As if the frameworks were religions and picking one meant rejecting the other.',
    readingTime: 10,
    isFeatured: true,
    isPinned: false,
    tags: ['engineering', 'frontend', 'technology'],
    daysAgo: 51,
    content: `
## The Question Nobody Was Asking

The question I kept getting asked in code reviews and architecture meetings was always a version of the same thing: Angular or React? As if the answer was binary. As if the frameworks were religions and picking one meant rejecting the other.

At some point I stopped asking which framework to use and started asking a different question: *what if I used the right framework for each part of the problem?*

This is the question that led me to what I now think of as the island architecture, and it has changed how I build frontend applications in ways I did not fully anticipate.

## The Problem With Framework Loyalty

Framework loyalty is a cultural artifact, not an engineering one. It exists because hiring pipelines are organized around individual frameworks, tutorial ecosystems create strong onboarding paths to single tools, and most teams are too busy to justify learning two things when one works adequately.

None of these are reasons to make a permanent architectural commitment to a single rendering approach for every part of a large application.

Consider the actual requirements of a typical enterprise application. You have authenticated routes with complex forms, state management, role-based access, and deep integration with backend services. You have data dashboards with real-time updates, interactive charts, and filtered views. You have content pages, landing sections, marketing copy.

These things do not all have the same requirements. Treating all of these as the same problem and solving them with the same tool is not wrong exactly, but it is not optimal.

## What Islands Architecture Actually Is

The term "islands architecture" comes from Astro and the static site generation world. I borrowed the concept and adapted it: using Angular as the application shell and router while mounting React islands for specific components where their ecosystems or capabilities are a better fit.

The mechanics matter. When you mount a React component inside an Angular application, you need to do two things correctly or you will create problems worse than the ones you solved.

**First: stay out of Angular's zone.** Zone.js is Angular's change detection mechanism. If React's event system fires inside Angular's zone, you get double renders and unpredictable behavior. The solution is to run React outside the zone using \`NgZone.runOutsideAngular()\`. This is not optional.

**Second: establish a communication contract.** Your React islands are isolated by design, which means they cannot access Angular's dependency injection system directly. Pass what the island needs as props — data, callbacks, configuration — and let Angular's service layer remain the single source of truth. The island renders. Angular orchestrates.

\`\`\`ts
this.ngZone.runOutsideAngular(async () => {
  const { mountIsland } = await import('./islands/mount');
  this.unmountFn = mountIsland(
    this.mountPoint.nativeElement,
    this.componentName,
    { ...this.props, ngZone: this.ngZone }
  );
});
\`\`\`

The island registry is a dynamic import map. Each island is code-split automatically. The Angular component that hosts it is a generic bridge. The individual islands have no knowledge of Angular at all — they are just React components.

## What I Actually Use This For

Not everything. Angular handles routing, authentication, HTTP interceptors, form-heavy pages, and the application shell. Those stay in Angular.

Where React islands earn their place: interactive content that benefits from React's ecosystem, real-time data displays, and isolated widgets with clear prop boundaries. A reading progress bar. A like button with animation. A threaded comment system. A newsletter signup form with its own state machine.

## What Changed

I am building better products than I was when I was framework-loyal. The mental model shift was simple: Angular is the architect. React and Vue are specialist contractors. The architect runs the project. The specialists own their scope. Everyone does the work they are best at.
    `.trim(),
  },

  // ── 3 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'in-defence-of-vue-the-framework-nobody-argues-about',
    title: 'In Defence of Vue: The Framework Nobody Argues About',
    subtitle: 'Which should tell you something.',
    excerpt: 'Nobody has a strong opinion about Vue. I mean that as a compliment. In a space where React and Angular developers approach framework discussions with the energy of people defending ancestral homelands, Vue exists as the Switzerland of frontend.',
    readingTime: 7,
    isFeatured: false,
    isPinned: false,
    tags: ['frontend', 'engineering', 'opinion'],
    daysAgo: 44,
    content: `
## The Absence of Drama

Nobody has a strong opinion about Vue. I mean that as a compliment.

In a space where React developers and Angular developers approach framework discussions with the energy of people defending ancestral homelands, Vue exists as the Switzerland of frontend — technically neutral, well-organized, and quietly effective. People do not evangelize Vue at conferences with the same fervor. There are no "Vue vs. React" wars in comment sections that last forty-seven replies.

The absence of drama around Vue is worth examining because it is not the absence of quality. It might, in fact, be evidence of quality.

## What Vue Got Right by Watching Others Get It Wrong

Vue 2 shipped in 2016, which meant Evan You and the team had the extraordinary advantage of watching both Angular and React establish themselves first. They could see what worked, what did not, what the community responded to, and what caused maintainability problems at scale.

The result was a framework with a remarkably clear design philosophy. Single file components. An approachable template syntax that reads like HTML rather than JSX. Two-way binding that actually worked. A reactivity system that was intuitive without being magic.

## Vue 3 and the Composition API

Vue 3's Composition API — \`setup()\`, \`ref()\`, \`reactive()\`, \`computed()\` — is conceptually close enough to React hooks that anyone comfortable in React will find the mapping intuitive. But it ships alongside the Options API rather than replacing it, which is a decision I respect.

The Options API is worth defending. Its explicit separation of \`data\`, \`computed\`, \`methods\`, and lifecycle hooks is extraordinarily readable. I have handed Vue 2 components to developers who had never seen Vue and watched them understand the code in ten minutes.

## Where I Actually Use Vue

**Internal tooling.** Admin panels, internal dashboards, CRUD interfaces for operations teams. Vue's gentle learning curve means a developer who primarily writes backend code can contribute to a Vue frontend without significant ramp-up.

**CMS-integrated frontends.** When the content team needs to understand the templates, Vue's template syntax is significantly more approachable than JSX.

**Prototyping.** When I need to validate a UI concept quickly, Vue gets out of the way.

## The Honest Comparison

React has a larger ecosystem and more corporate backing. Angular has better structural conventions for large teams. Vue has the best out-of-the-box developer experience and the most approachable learning curve. These are all true simultaneously.

The framework nobody argues about turns out to be the framework everyone should probably spend a week getting comfortable with. That is not a lukewarm endorsement. It is a genuinely practical one.
    `.trim(),
  },

  // ── 4 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'raw-sql-is-not-a-character-flaw',
    title: 'Raw SQL Is Not a Character Flaw',
    subtitle: 'A defence of writing the queries yourself.',
    excerpt: 'I do not use ORMs for new projects. This is the kind of statement that triggers a reaction in people, and the reaction is almost always the same: a furrowed brow, a slight lean forward, and "what do you do about migrations?"',
    readingTime: 8,
    isFeatured: false,
    isPinned: false,
    tags: ['backend', 'databases', 'engineering'],
    daysAgo: 37,
    content: `
## The Confession

I do not use ORMs for new projects.

This is the kind of statement that triggers a reaction in people, and the reaction is almost always the same: a furrowed brow, a slight lean forward, and "what do you do about migrations?"

Let me explain what I mean, what I have tried, and why I landed where I did.

## What I Have Used

I have used Entity Framework with .NET, which is mature and deeply integrated into the .NET ecosystem. I have used SQLAlchemy with Python — the best ORM I have worked with, its Core layer strikes a better balance between abstraction and control than almost anything else in the space. I have used Sequelize and TypeORM with Node.js. I have used Prisma, which generates the cleanest TypeScript types of any ORM I have tried.

My conclusion: ORMs are excellent for getting started and a source of compounding complexity as systems mature. The abstraction earns its cost early and begins losing that argument as query complexity grows and the team's SQL fluency develops.

## The Case For PostgreSQL and Raw SQL

PostgreSQL is remarkable software. When I write raw SQL against it, I have access to window functions, full-text search with GIN indexes, CTEs for composing complex queries, JSONB columns with indexing support, \`pg_trgm\` for trigram similarity search, partial indexes, triggers, and stored procedures.

An ORM can expose some of these through raw query escape hatches. But the moment you are reaching for the escape hatch, you have already paid the ORM's overhead without getting its benefits.

## The Practical Pattern

I write SQL in the repository layer. Each domain concept has its own repository file with typed query functions over a thin \`pg.Pool\` wrapper.

\`\`\`ts
export async function queryOne<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await getPool().query<T>(text, params);
  return result.rows[0] ?? null;
}
\`\`\`

The mapper function converts snake_case database rows to camelCase application interfaces. This is the only transformation layer. Explicit, testable, transparent.

## The Migration Question

Migration SQL that you write yourself is SQL that you understand completely. When something goes wrong in production at 11pm, you want to be reading SQL, not reverse-engineering ORM-generated SQL back into what it was trying to do. I have done both. The former is faster.

## What Eleven Years of Database Work Actually Taught Me

Every performance problem I have investigated in production has ultimately been a query problem. Indexes that did not exist. N+1 queries the ORM generated without anyone noticing. Joins performed in application code instead of the database.

The developers who caught those problems quickly were the ones who understood what was happening at the SQL layer. PostgreSQL deserves to be used as PostgreSQL. Writing raw SQL is not a character flaw. It is evidence that you took the database seriously.
    `.trim(),
  },

  // ── 5 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'python-on-the-backend-when-it-earns-it',
    title: 'Python on the Backend: When It Actually Earns Its Place',
    subtitle: 'Not every API should be a FastAPI. But some should.',
    excerpt: 'Python is not my primary backend language. My primary backend environment is TypeScript. Python enters the picture under specific conditions, and when those conditions are met, it earns its place clearly enough that I do not feel the need to apologize for using it.',
    readingTime: 8,
    isFeatured: false,
    isPinned: false,
    tags: ['backend', 'engineering', 'technology'],
    daysAgo: 30,
    content: `
## Setting the Context

Python is not my primary backend language. My primary backend environment is TypeScript — Fastify or NestJS depending on the scale and team conventions. Python enters the picture under specific conditions: machine learning integration, data pipeline work, scientific computing requirements, or a team where Python fluency significantly outweighs TypeScript fluency.

## What Python Does Better Than It Gets Credit For

The performance gap between CPython and Node.js is real. What the internet underweights is how often it is irrelevant. If your API call takes 50ms and 40ms of that is a database query, the difference between Python and Node.js in the compute portion is not your problem. Your problem is the database query.

What Python genuinely does better: readability at the data transformation layer, and the scientific and ML ecosystem. NumPy, pandas, scikit-learn, PyTorch, Hugging Face — these exist in Python first and are ported to other languages as afterthoughts. If your backend needs to do anything in this space, Python is not a preference, it is a requirement.

## FastAPI Changed the Conversation

Before FastAPI, building a Python API meant Flask or Django REST Framework. FastAPI changed that. Automatic OpenAPI documentation generated from your code. Dependency injection that works idiomatically. Request validation via Pydantic. Async request handling. Type annotations that drive runtime behavior.

\`\`\`python
@app.post("/posts", response_model=PostResponse)
async def create_post(
    payload: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PostResponse:
    return await post_service.create(db, payload, current_user)
\`\`\`

The type annotation on the function signature is the API contract. That is clean.

## The Market-Lens Architecture Pattern

The most complex Python backend I have built was for a stock and crypto technical analysis platform. The Python service — handling indicator calculation, TimescaleDB time-series queries, and real-time streaming — ran as a separate microservice alongside a NestJS API gateway.

Python owned the domain where Python was genuinely best. TypeScript owned the domain where TypeScript was better. This is the pattern I keep coming back to. Python is not a replacement for a TypeScript backend. It is a complement to one in architectures where the problem space genuinely requires it.

## The Honest Summary

Use Python on the backend when you need its ecosystem. Machine learning integration, data pipelines, scientific computation. Use TypeScript when you need language uniformity with your frontend, Firebase integration, or the strongest possible type safety across the API surface.

The decision is not "which language is better." That framing produces bad architecture. The decision is "which language is better for this specific part of this specific system."
    `.trim(),
  },

  // ── 6 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'dotnet-core-the-enterprise-workhorse-that-became-something-more',
    title: '.NET Core: The Enterprise Workhorse That Became Something More',
    subtitle: 'What happens when Microsoft actually listens.',
    excerpt: 'My relationship with .NET is the most improved relationship in my professional life. That is a low bar to set if you remember what .NET was like in 2008. But credit belongs where it is due.',
    readingTime: 8,
    isFeatured: false,
    isPinned: false,
    tags: ['backend', 'engineering', 'technology'],
    daysAgo: 24,
    content: `
## A Relationship That Required Repair

My relationship with .NET is the most improved relationship in my professional life.

That is a low bar to set if you remember what .NET was like in 2008 — Windows-only, IIS-dependent, license-gated, with a deployment story that involved copying folders to a server and hoping the right registry keys were in place. But credit belongs where it is due: .NET Core, and what eventually became just .NET 5 onwards, is a genuinely excellent platform. Open source. Cross-platform. Performance-first. These were not words Microsoft was known for in the context of their developer tools. They are now accurate.

## What C# 10, 11, 12 Actually Look Like

If you formed your opinion of C# before version 9, please update it. The language has evolved more in the last four years than it did in the preceding decade.

Nullable reference types enforced at compile time. Record types for immutable data structures. Pattern matching for complex conditional logic. Global usings. Primary constructors. Required members that enforce initialization at the type level.

\`\`\`csharp
public record CreatePostRequest(
    string Title,
    string Content,
    string[] TagIds
);
\`\`\`

Ten years ago this would have been a class with fifteen lines of boilerplate. Progress is possible.

## ASP.NET Core: The Part That Actually Changed

ASP.NET Core redesigned the pipeline as a middleware stack — a concept borrowed from Node's Express, acknowledged publicly by the team. Authentication. Logging. Rate limiting. Compression. CORS. All middleware. All composable. All transparent.

The startup configuration changed from magic web.config XML to explicit C# code. Explicit configuration is readable, diffable, and navigable. XML configuration is none of those things.

Performance under .NET 7 and 8 is genuinely competitive. ASP.NET Core consistently places in the top tier of web framework benchmarks. This is not the .NET of 2008. The performance work done on the CLR and the Kestrel HTTP server has been significant and sustained.

## Where .NET Core Is Not The Answer

.NET is a poor choice when your team is primarily JavaScript or Python native. The ramp-up is not trivial. It is a poor choice when you need the Python ML ecosystem. And it remains most at home on Azure — if your infrastructure is primarily AWS or GCP without Windows nodes, the operational familiarity advantage disappears.

## What I Would Tell Someone Starting With It Now

Start with Minimal APIs in ASP.NET Core. Not controllers. Not full MVC. Minimal APIs removed significant ceremony and the result is more legible and easier to test. Take nullable reference types seriously from day one. Learn the DI container before you build anything complex. .NET Core is a platform worth taking seriously even if you are not an enterprise developer.
    `.trim(),
  },

  // ── 7 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'nestjs-typescript-all-the-way-down',
    title: 'NestJS: TypeScript All the Way Down',
    subtitle: "When you want Angular's architecture on the server.",
    excerpt: "NestJS is what happens when Angular developers get tired of context-switching to the backend. I say this as someone who contributed to that tired feeling and who now thinks the resulting framework is one of the more interesting things to happen to Node.js backend development in recent years.",
    readingTime: 7,
    isFeatured: false,
    isPinned: false,
    tags: ['backend', 'engineering', 'technology'],
    daysAgo: 18,
    content: `
## The Origin Story

NestJS is what happens when Angular developers get tired of context-switching to the backend. The structural parallel to Angular is deliberate and transparent. Modules. Decorators. Dependency injection. Guards. Interceptors. Pipes. Providers with lifecycle management.

If you have spent significant time in Angular, reading a NestJS codebase for the first time produces a strong sense of familiarity that is both useful and slightly uncanny.

## What NestJS Adds Over Plain Fastify

I build APIs in both plain Fastify and NestJS. They are not competing for the same use cases in my mental model.

Fastify is what I reach for when I want maximum control and minimum abstraction overhead. Small to medium APIs, services that need to be lean. NestJS is what I reach for when the team is larger, the API surface is complex, and I want conventions that enforce consistency without requiring a style guide document.

Concretely, NestJS provides module-based code organization that mirrors domain boundaries, decorators as the API contract, guards and interceptors at the framework level, and validation pipes with class-validator.

\`\`\`ts
@IsString()
@IsNotEmpty()
@MaxLength(500)
title: string;

@IsArray()
@IsUUID('4', { each: true })
tagIds: string[];
\`\`\`

These decorators on a DTO class are the validation layer. No separate validation library. No manual check in the handler. Integrated.

## The Fastify Adapter

NestJS supports Fastify as its underlying HTTP adapter. Running NestJS on Fastify gives you the structural benefits of NestJS with the performance profile of Fastify.

\`\`\`ts
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter()
);
\`\`\`

For production applications where throughput matters, this is worth doing.

## When To Use It

Large APIs with multiple developers where consistency is more valuable than flexibility. Systems where the Angular-derived patterns genuinely fit the domain structure. Teams where TypeScript-first backend development is the goal.

TypeScript all the way down — frontend to backend, Angular to NestJS — is a genuinely compelling approach for teams that can support it. The cognitive context-switching between a TypeScript frontend and a TypeScript backend is minimal in a way that switching between TypeScript and Python is not. That has compound value on a team over time.
    `.trim(),
  },

  // ── 8 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'nosql-the-cases-where-i-actually-reach-for-it',
    title: 'NoSQL: The Cases Where I Actually Reach for It',
    subtitle: 'Not as a default. As a deliberate choice for specific problems.',
    excerpt: "I am a relational database person. PostgreSQL is my default answer to 'what database should we use' because it is correct most of the time. But there are several contexts where NoSQL is not just acceptable but genuinely better than the relational alternative.",
    readingTime: 7,
    isFeatured: false,
    isPinned: false,
    tags: ['databases', 'engineering', 'backend'],
    daysAgo: 14,
    content: `
## The Default and the Exceptions

I am a relational database person. PostgreSQL is my default answer to "what database should we use" because it is the correct answer most of the time. But I have found several contexts where NoSQL is genuinely better than the relational alternative, and those cases are worth being specific about.

## Firebase Realtime Database: Presence and Live State

Firebase Realtime Database is purpose-built for one specific thing: synchronizing state between clients in real time, with conflict resolution handled automatically. For that specific problem, it is dramatically better than anything you can build on top of PostgreSQL without significant infrastructure.

The pattern I use most frequently: presence tracking and live counters. When a user opens a post, I write their session to \`active_readers/{postId}/{sessionId}\`. When they close the tab, \`onDisconnect().remove()\` cleans up automatically. Every client subscribed to that path sees the count change in real time with zero polling.

Where Firebase fails: complex queries. The moment I need to query data, I reach for PostgreSQL. The moment I need to broadcast state changes to all connected clients instantly, I reach for Firebase. The architecture that works: PostgreSQL for truth, Firebase for real-time ephemeral state.

## Redis: The Thing Nobody Calls a Database But Is

Redis is a fast, ephemeral layer between my application and everything that would otherwise be expensive.

Rate limiting with Lua scripts. JWT blacklists and session invalidation sets that check on every authenticated request and expire automatically. Pub/sub for WebSocket broadcast across multiple Node.js processes. Caching with explicit invalidation. Sub-millisecond reads on data that has no long-term value.

## TimescaleDB: PostgreSQL for Time-Series

The market analysis platform I built used TimescaleDB for price history and indicator values. Automatic partitioning by time intervals, continuous aggregates that pre-compute and stay current, compression of older data. The query for a 20-day moving average is SQL. That is not true in InfluxDB or Prometheus.

## The Actual Decision Framework

Use PostgreSQL unless you have a specific, identifiable reason not to. Use Firebase RTDB for real-time state synchronization. Use Redis for ephemeral data, rate limiting, pub/sub, and caching. Use TimescaleDB when your primary data type is time-series. Use MongoDB when your document schemas are genuinely variable.

Database selection is one of the hardest migrations to make after the fact. Getting it right at the start is significantly cheaper than getting it right later.
    `.trim(),
  },

  // ── 9 ───────────────────────────────────────────────────────────────────────
  {
    slug: 'integrating-ai-into-existing-software-without-rewriting-everything',
    title: 'Integrating AI Into Existing Software Without Rewriting Everything',
    subtitle: 'The unglamorous, practical version of what AI in production actually looks like.',
    excerpt: 'Most AI integration content describes greenfield systems built from scratch with AI as a first-class concern. This is useful for maybe five percent of engineers working today. The rest are looking at existing codebases asking a harder question: how do we add AI to what we already have?',
    readingTime: 9,
    isFeatured: true,
    isPinned: false,
    tags: ['technology', 'engineering', 'backend'],
    daysAgo: 8,
    content: `
## The Problem With Most AI Integration Content

Most of the AI integration content I read describes greenfield systems — applications built from scratch with AI as a first-class architectural concern. This is useful for maybe five percent of the software engineers working today. The other ninety-five percent are looking at existing codebases, existing deployments, existing teams, and asking a much harder question: how do we add AI capabilities to what we already have, without breaking what works, without a three-month rewrite, and without betting the production system on a technology still changing monthly?

## The Proxy Pattern: LiteLLM as the AI Layer

The most important architectural decision I made early was to never let application code call an LLM provider API directly.

Every direct API call is a coupling. It means your code has opinions about which model, which provider, which API format. When Anthropic releases a new model or OpenAI changes a pricing tier or you decide you want to run inference locally, you are editing application code.

LiteLLM solves this. It exposes a single OpenAI-compatible API and routes to over a hundred providers behind it. Your application sends a request to \`http://localhost:4000/v1/chat/completions\`. LiteLLM decides which actual provider handles it based on configuration. When we needed to switch from Claude Haiku to a local Ollama model for a client with strict data residency requirements, the application code change was one line in a config file.

## Task Categorization: Where AI Earns Its Keep Quickly

The fastest path to visible AI value in an existing system is automated categorization. Email triage. Document classification. Support ticket routing. With a small language model — Claude Haiku, which is fast and cheap — you can write a classifier prompt that outputs structured JSON and routes automatically with better than 90% accuracy on well-structured prompts.

The integration point is surgical. One new service. One new database column. One new pipeline stage. The rest of the application is unchanged.

## The Mock Mode Requirement

Any AI integration needs a mock mode. This is not optional. Development environments that make real API calls are slow, expensive, and unpredictable in test runs. Every AI integration I build has a \`MOCK_MODE\` flag. When set, the AI service returns a deterministic mock response. The LLM is just another external dependency. Treat it like one.

## What Does Not Work: AI As The Architecture

LLMs are not deterministic. They are expensive relative to database queries. They have latency orders of magnitude higher than a cache hit. Designing a system where user-facing functionality blocks on an LLM call without a fallback is designing a system for the demo, not for production.

The pattern that works: AI in the background, improving results, classifying, summarizing, suggesting. Not AI in the foreground, blocking on inference, returning results that cannot be validated.
    `.trim(),
  },

  // ── 10 ──────────────────────────────────────────────────────────────────────
  {
    slug: 'the-questions-ai-forces-us-to-ask-that-we-are-not-asking',
    title: 'The Questions AI Forces Us to Ask That We Are Not Asking',
    subtitle: 'I am going to be blunt about this because I think the softness is the problem.',
    excerpt: 'There is a version of the AI ethics conversation that happens where it is supposed to happen — policy papers, academic conferences, responsible AI frameworks — and it is not moving fast enough, not by a significant margin.',
    readingTime: 11,
    isFeatured: true,
    isPinned: true,
    tags: ['ai-ethics', 'technology', 'opinion'],
    daysAgo: 3,
    content: `
## A Note Before I Start

I am going to be blunt about this. I think the softness — the careful hedging, the "on one hand / on the other hand" framing that dominates most public discourse about AI ethics — is itself part of the problem. The people building these systems are moving fast. The discourse about the implications is moving slowly. And the gap between those two speeds is where the damage happens.

## The Consent Question

Every large language model currently in production was trained on data that was not consented to.

The Common Crawl dataset contains text scraped from every publicly accessible corner of the internet. Personal essays. Forum posts where people disclosed medical diagnoses. Fiction written by authors who never imagined it would be ingested as training material. Code written by developers who open-sourced their work under licenses that do not obviously contemplate this use.

The argument made by the companies building these systems is that publicly available means implicitly consented to. This argument is coherent enough to have survived legal scrutiny so far. It is also deeply uncomfortable if you take it seriously.

Public availability and consent are not the same thing. The nature of the use is categorically different, and the assumption that public availability covers both is a legal convenience, not an ethical argument.

## The Accountability Gap

When an AI system makes a consequential mistake — a medical triage tool misclassifies a symptom, a hiring algorithm discriminates by proxy, a credit scoring model produces systematically biased outputs — who is responsible?

Currently: nobody, in any meaningful sense. The model developer disclaims responsibility through terms of service. The company that integrated the model disclaims responsibility by pointing to the model developer. The end user who was harmed has no clear recourse and often no knowledge that an AI system was involved in the decision that affected them.

This accountability gap is not an accident. It is a structural feature of how these systems have been deployed. Real harm is accumulating. The scale at which AI systems make decisions means systematic biases are amplified beyond anything a human system could produce.

## The Labour Question Nobody Wants to Have

I will not pretend I do not have professional self-interest here. I am a software engineer and AI systems are being deployed to do things software engineers have historically done. I am aware of the conflict of interest.

The argument that AI will not replace jobs but will augment workers and create new categories of work has historical analogues. The internet did create new categories of work. It also devastated entire industries with a speed that left affected communities with inadequate time to adapt.

The ethical question is not "will AI create net new jobs." It might. The ethical question is: who bears the cost of the transition, and who captures the value? The value is concentrating rapidly. The transition costs are distributed much more broadly. We are not having an honest conversation about this distribution.

## What I Think Engineers Specifically Should Do

We build these systems. The decisions we make in that work — what data we use, how we handle bias testing, whether we disclose AI involvement to end users, whether we push back when the product decision is unethical — those decisions matter.

Concretely: **Disclose.** If the product uses AI to influence a decision that affects users, those users should know. **Test for bias.** Before deploying a classification system, test it against representative data. Document the results. **Build opt-outs.** AI-assisted features should be opt-outable. **Hold the line on consequential domains.** If you are asked to deploy AI in medical, legal, or child welfare contexts where errors are irreversible and human oversight is being removed rather than augmented, push back. Hard.

## The Conversation We Are Not Having

The actual discussion is about power. Who controls the systems. Who decides how they are trained. Who captures the economic value. Who bears the costs when they fail. Who has recourse when they cause harm.

These are not new questions. They are the same questions that have organized social and political life for centuries, now instantiated in a new technology context. I do not have a clean conclusion. What I am certain of is that uncertainty is not a reason for engineers to disengage. It is a reason to engage more seriously, more honestly, and more urgently.

We are building the thing. We have some responsibility for what it becomes.
    `.trim(),
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// COMMENTS
// ══════════════════════════════════════════════════════════════════════════════

interface CommentDef {
  postSlug: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  replies?: { authorName: string; authorEmail: string; content: string; isApproved: boolean }[];
}

const COMMENTS: CommentDef[] = [
  {
    postSlug: 'eleven-years-with-angular-a-complicated-love-story',
    authorName: 'Jordan K.',
    authorEmail: 'jordan@example.com',
    content: 'The point about transferred decision-making in React teams is exactly right. I have watched three different teams at my company make three completely different architectural decisions for basically identical problems. Nobody is wrong per se, but the inconsistency has a cost that compounds.',
    isApproved: true,
    replies: [
      {
        authorName: 'Sam R.',
        authorEmail: 'sam@example.com',
        content: "This is what I keep trying to explain to people who say Angular is 'too opinionated.' The opinions are the product. You are not fighting the framework, you are reading the documentation.",
        isApproved: true,
      },
    ],
  },
  {
    postSlug: 'eleven-years-with-angular-a-complicated-love-story',
    authorName: 'Dev T.',
    authorEmail: 'dev@example.com',
    content: 'Coming from a Vue background and recently picking up Angular for a new role — the learning curve comment is accurate. Rough first two weeks. Third week something clicked and now I get why the structure is the way it is.',
    isApproved: true,
  },
  {
    postSlug: 'why-i-stopped-picking-one-framework-and-started-using-all-of-them',
    authorName: 'Alex M.',
    authorEmail: 'alex@example.com',
    content: 'The zone.js isolation point is critical and I wish more people talked about it. We had a nasty bug last year where React state updates were triggering Angular change detection cycles and the debugging was genuinely painful.',
    isApproved: true,
    replies: [
      {
        authorName: 'Chris P.',
        authorEmail: 'chris@example.com',
        content: 'We hit the same thing. runOutsideAngular is now a first-class part of our island mounting template. Non-negotiable.',
        isApproved: true,
      },
    ],
  },
  {
    postSlug: 'raw-sql-is-not-a-character-flaw',
    authorName: 'Mo D.',
    authorEmail: 'mo@example.com',
    content: 'The N+1 query point is where I lost faith in ORMs permanently. Watched a TypeORM-backed endpoint go from 12ms to 1400ms between dev and production because the query count scaled with result size and nobody noticed until load testing.',
    isApproved: true,
    replies: [
      {
        authorName: 'Priya S.',
        authorEmail: 'priya@example.com',
        content: 'Prisma has query logging that surfaces this but most teams have it off by default. By the time they turn it on there are already fifty endpoints to audit.',
        isApproved: true,
      },
    ],
  },
  {
    postSlug: 'raw-sql-is-not-a-character-flaw',
    authorName: 'Lee W.',
    authorEmail: 'lee@example.com',
    content: 'I use SQLAlchemy Core for exactly the reasons described here. Best of both worlds — the Pythonic query composition without the magic. The moment I start using the ORM layer I always regret it six months later.',
    isApproved: true,
  },
  {
    postSlug: 'nosql-the-cases-where-i-actually-reach-for-it',
    authorName: 'Taylor B.',
    authorEmail: 'taylor@example.com',
    content: 'The Firebase presence tracking pattern with onDisconnect is one of those things that looks like magic the first time you see it. Implementing the same thing with WebSockets and a PostgreSQL sessions table took us three weeks and we still had edge cases.',
    isApproved: true,
  },
  {
    postSlug: 'integrating-ai-into-existing-software-without-rewriting-everything',
    authorName: 'Robin C.',
    authorEmail: 'robin@example.com',
    content: 'The mock mode point cannot be overstated. Every team I have seen skip this ends up with flaky tests, unpredictable CI costs, and developers who avoid touching the AI-integrated code paths because they are afraid of accidentally burning API credits.',
    isApproved: true,
    replies: [
      {
        authorName: 'Pat H.',
        authorEmail: 'pat@example.com',
        content: 'We treat LLM calls exactly like we treat payment gateway calls. Mock in dev, test with real providers in a dedicated integration test suite only, never in unit tests.',
        isApproved: true,
      },
    ],
  },
  {
    postSlug: 'the-questions-ai-forces-us-to-ask-that-we-are-not-asking',
    authorName: 'Sam O.',
    authorEmail: 'samo@example.com',
    content: 'The accountability gap section is the part of this conversation I find most frustrating. We have clear frameworks for product liability in physical goods. A manufacturer cannot disclaim their way out of responsibility for a defective product. Why is software different, and why are we so comfortable with that difference?',
    isApproved: true,
    replies: [
      {
        authorName: 'Kai N.',
        authorEmail: 'kai@example.com',
        content: 'Because software liability would immediately expose how much of what we ship is genuinely not fit for the purpose it is being used for. The industry has a strong economic interest in keeping the legal framework vague.',
        isApproved: true,
      },
      {
        authorName: 'Morgan L.',
        authorEmail: 'morgan@example.com',
        content: 'The EU AI Act at least creates some teeth here for high-risk applications. Not enough, but something.',
        isApproved: true,
      },
    ],
  },
  {
    postSlug: 'the-questions-ai-forces-us-to-ask-that-we-are-not-asking',
    authorName: 'Casey F.',
    authorEmail: 'casey@example.com',
    content: "The Nuremberg reference will get people's backs up but I think you are right to make it. The 'I just built what I was asked to build' framing has a long and uncomfortable history and we should be wary of reaching for it.",
    isApproved: true,
  },
  {
    postSlug: 'the-questions-ai-forces-us-to-ask-that-we-are-not-asking',
    authorName: 'Dana R.',
    authorEmail: 'dana@example.com',
    content: 'Pending moderation — curious about the consent argument specifically. Do you think there is a workable opt-out framework that could be applied retroactively to existing models, or is that ship sailed?',
    isApproved: false, // intentionally unapproved to demo the moderation workflow
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// RUNNER
// ══════════════════════════════════════════════════════════════════════════════

async function importContent() {
  const divider = () => console.log(c.dim('  ' + '─'.repeat(54)));

  console.log('');
  console.log(c.bold(c.cyan('  FakeIntellect — Content Import')));
  console.log(c.dim(`  Target: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] ?? 'local'}`));
  divider();

  // ── Verify connection ──────────────────────────────────────────────────────
  info('Verifying database connection...');
  try {
    await q('SELECT 1');
    ok('Connected');
  } catch (err: any) {
    console.error(c.red(`\n  ✗ Connection failed: ${err.message}`));
    process.exit(1);
  }

  // ── Ensure author exists ───────────────────────────────────────────────────
  divider();
  info('Ensuring author exists...');
  
  const hash   = await bcrypt.hash('fakeintellect2024!', 12);

  const [author] = await q<{ id: string }>(
    `INSERT INTO authors (username, display_name, email, password_hash, bio, is_admin)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
     RETURNING id`,
    ['ghost', 'The Ghost Writer', 'ghost@fakeintellect.ca', hash,
     'Professionally ambiguous. Occasionally right. Always opinionated.', true],
  );
  ok(`Author: ${author.id}`);

  // ── Upsert tags ────────────────────────────────────────────────────────────
  divider();
  info('Upserting tags...');

  const tagIds: Record<string, string> = {};
  for (const tag of TAGS) {
    const [row] = await q<{ id: string }>(
      `INSERT INTO tags (name, slug, color, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET
         name        = EXCLUDED.name,
         color       = EXCLUDED.color,
         description = EXCLUDED.description
       RETURNING id`,
      [tag.name, tag.slug, tag.color, tag.description],
    );
    tagIds[tag.slug] = row.id;
    ok(`Tag: ${tag.name}`);
  }

  // ── Upsert posts ───────────────────────────────────────────────────────────
  divider();
  info('Upserting posts...');

  const postIds: Record<string, string> = {};
  for (const post of POSTS) {
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - post.daysAgo);

    const [row] = await q<{ id: string }>(
      `INSERT INTO posts (
         slug, title, subtitle, excerpt, content, reading_time_minutes,
         is_featured, is_pinned, author_id, status, published_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'published',$10)
       ON CONFLICT (slug) DO UPDATE SET
         title                = EXCLUDED.title,
         subtitle             = EXCLUDED.subtitle,
         excerpt              = EXCLUDED.excerpt,
         content              = EXCLUDED.content,
         reading_time_minutes = EXCLUDED.reading_time_minutes,
         is_featured          = EXCLUDED.is_featured,
         is_pinned            = EXCLUDED.is_pinned,
         updated_at           = NOW()
       RETURNING id`,
      [
        post.slug, post.title, post.subtitle, post.excerpt, post.content,
        post.readingTime, post.isFeatured, post.isPinned,
        author.id, publishedAt.toISOString(),
      ],
    );
    postIds[post.slug] = row.id;

    // Sync tags — delete existing then re-insert to avoid stale links
    await q(`DELETE FROM post_tags WHERE post_id = $1`, [row.id]);
    for (const tagSlug of post.tags) {
      if (tagIds[tagSlug]) {
        await q(
          `INSERT INTO post_tags (post_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [row.id, tagIds[tagSlug]],
        );
      } else {
        warn(`Unknown tag slug '${tagSlug}' on post '${post.slug}' — skipped`);
      }
    }

    ok(`Post: "${post.title}"`);
  }

  // ── Upsert comments ────────────────────────────────────────────────────────
  divider();
  info('Upserting comments...');

  let commentCount = 0;
  let replyCount   = 0;

  for (const def of COMMENTS) {
    const postId = postIds[def.postSlug];
    if (!postId) {
      warn(`Post not found for comment: ${def.postSlug}`);
      continue;
    }

    // Check for existing comment by author + post to keep idempotent
    const existing = await q<{ id: string }>(
      `SELECT id FROM comments WHERE post_id = $1 AND author_email = $2 AND parent_id IS NULL LIMIT 1`,
      [postId, def.authorEmail],
    );

    let commentId: string;
    if (existing[0]) {
      // Update content only
      await q(
        `UPDATE comments SET content = $1, is_approved = $2 WHERE id = $3`,
        [def.content, def.isApproved, existing[0].id],
      );
      commentId = existing[0].id;
    } else {
      const [row] = await q<{ id: string }>(
        `INSERT INTO comments (post_id, author_name, author_email, content, is_approved)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id`,
        [postId, def.authorName, def.authorEmail, def.content, def.isApproved],
      );
      commentId = row.id;
    }
    commentCount++;

    // Replies
    for (const reply of def.replies ?? []) {
      const existingReply = await q<{ id: string }>(
        `SELECT id FROM comments WHERE parent_id = $1 AND author_email = $2 LIMIT 1`,
        [commentId, reply.authorEmail],
      );

      if (existingReply[0]) {
        await q(
          `UPDATE comments SET content = $1, is_approved = $2 WHERE id = $3`,
          [reply.content, reply.isApproved, existingReply[0].id],
        );
      } else {
        await q(
          `INSERT INTO comments (post_id, parent_id, author_name, author_email, content, is_approved)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [postId, commentId, reply.authorName, reply.authorEmail, reply.content, reply.isApproved],
        );
      }
      replyCount++;
    }
  }

  ok(`${commentCount} top-level comments`);
  ok(`${replyCount} replies`);
  ok(`1 comment pending approval (for moderation demo)`);

  // ── Summary ────────────────────────────────────────────────────────────────
  divider();
  const [stats] = await q<{ posts: string; tags: string; comments: string }>(
    `SELECT
       (SELECT COUNT(*)::text FROM posts WHERE status='published') AS posts,
       (SELECT COUNT(*)::text FROM tags)                           AS tags,
       (SELECT COUNT(*)::text FROM comments)                       AS comments`
  );

  console.log('');
  console.log(c.bold(c.green('  ✅  Import complete')));
  console.log('');
  console.log(`  ${c.dim('Posts:')}    ${c.bold(stats.posts)}`);
  console.log(`  ${c.dim('Tags:')}     ${c.bold(stats.tags)}`);
  console.log(`  ${c.dim('Comments:')} ${c.bold(stats.comments)}`);
  console.log('');
  console.log(c.dim('  Admin login:'));
  console.log(c.dim('  Email:    ghost@fakeintellect.ca'));
  console.log(c.dim('  Password: fakeintellect2024!'));
  console.log('');

  await pool.end();
}

importContent().catch((err) => {
  console.error(c.red(`\n  ✗ Import failed: ${err.message}`));
  console.error(err.stack);
  process.exit(1);
});