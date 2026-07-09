import * as dotenv from 'dotenv';
import * as path from 'path';
import { getPool, closePool, query } from './pool';
import { time } from 'console';
import { on } from 'events';
import { write } from 'fs';
import Module from 'module';
import { platform, type } from 'os';
import { title } from 'process';

dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });

// ─── Tag slugs expected to exist (from base seed) ─────────────────────────
// philosophy, technology, culture, science, opinion, satire
// We add: engineering, frontend, backend, databases, ai-ethics

const NEW_TAGS = [
  { name: 'Engineering',  slug: 'engineering', color: '#3b82f6', description: 'The practice of building things that work' },
  { name: 'Frontend',     slug: 'frontend',    color: '#f59e0b', description: 'What users actually see and touch' },
  { name: 'Backend',      slug: 'backend',     color: '#10b981', description: 'The part nobody notices until it breaks' },
  { name: 'Databases',    slug: 'databases',   color: '#8b5cf6', description: 'Where the truth lives' },
  { name: 'AI Ethics',    slug: 'ai-ethics',   color: '#ef4444', description: 'The questions we are not asking loudly enough' },
];

const POSTS: Array<{
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  readingTime: number;
  isFeatured: boolean;
  isPinned: boolean;
  tags: string[];
}> = [

// ══════════════════════════════════════════════════════════════════════════
// POST 1
// ══════════════════════════════════════════════════════════════════════════
{
  slug: 'eleven-years-with-angular-a-complicated-love-story',
  title: 'Eleven Years With Angular: A Complicated Love Story',
  subtitle: 'It is not the framework you want. It is the framework you deserve.',
  excerpt: 'I have been writing Angular since before it was Angular. Back when it was AngularJS, back when two-way data binding felt like magic and $scope felt like God. A lot has changed. My feelings have not simplified.',
  readingTime: 9,
  isFeatured: true,
  isPinned: false,
  tags: ['engineering', 'frontend', 'opinion'],
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

What standalone components also did, quietly, was make Angular composable in a way it never quite was before. You can now embed Angular components in non-Angular contexts more cleanly. You can lazy-load more aggressively. You can colocate templates, styles, and logic in ways that would have felt almost heretical five years ago.

This matters more than it sounds. It is what made me start thinking about hybrid architectures — which I will get to.

## The Honest Criticism

Angular moves slowly compared to the alternatives. If something ships in React's ecosystem in Q1, it will be in Angular's in Q3 at the earliest and fully stabilized by the following Q1. The velocity gap is real.

The learning curve is real. Sending a junior developer to build their first Angular component is a different experience than sending them to build their first React component. Neither is easier objectively — React's apparent simplicity conceals complexity that surfaces later, while Angular's apparent complexity surfaces immediately — but the first-week experience in Angular genuinely requires more scaffolding.

And the bundle size conversation is one I have had in too many performance audits. Angular's baseline is heavier than it needs to be for simple cases. For complex applications, that baseline amortizes quickly. For marketing sites and content pages, it does not, which is why Angular is not the right answer for everything.

## What Eleven Years Actually Teaches You

It teaches you that the framework is not the point. The point is whether the people using it can build something maintainable, testable, and scalable. Angular's opinionated structure makes that easier at scale. React's flexibility makes it easier at the start. These are different tradeoffs for different contexts, not evidence that one is superior.

It teaches you that the version you learned is not the framework that exists today. If your opinion of Angular was formed before standalone components, or before Signals, or before the new control flow syntax with \`@if\` and \`@for\`, then your opinion is based on a framework that no longer exists in that form.

And it teaches you — this is the one I think about most — that loyalty to a tool is less valuable than understanding why you use it. I use Angular when I need enterprise-grade structure, strong conventions, and a team that can onboard reliably. I reach for something else when those are not the constraints.

That said: when the problem fits, Angular is still the most complete answer I have found. Eleven years in, I do not say that lightly.
  `.trim(),
},

// ══════════════════════════════════════════════════════════════════════════
// POST 2
// ══════════════════════════════════════════════════════════════════════════
{
  slug: 'why-i-stopped-picking-one-framework-and-started-using-all-of-them',
  title: 'Why I Stopped Picking One Framework and Started Using All of Them',
  subtitle: 'The architecture nobody tells you about because it feels like cheating.',
  excerpt: 'The question I kept getting asked in code reviews and architecture meetings was always a version of the same thing: Angular or React? As if the answer was binary. As if the frameworks were religions and picking one meant rejecting the other.',
  readingTime: 10,
  isFeatured: true,
  isPinned: false,
  tags: ['engineering', 'frontend', 'technology'],
  content: `
## The Question Nobody Was Asking

The question I kept getting asked in code reviews and architecture meetings was always a version of the same thing: Angular or React? As if the answer was binary. As if the frameworks were religions and picking one meant rejecting the other.

I spent a long time trying to give a clean answer to this question. For several years I defaulted to Angular for everything because it was what I knew best and because, for the kinds of applications I was building — enterprise line-of-business tools, authenticated dashboards, complex multi-step workflows — it was genuinely the right call. Then I spent some time building smaller things and found myself reaching for React because the overhead of Angular's structure was more than the problem warranted. Then I spent time in Vue and found a framework that had clearly learned from both of its predecessors and made its own interesting compromises.

At some point I stopped asking which framework to use and started asking a different question: *what if I used the right framework for each part of the problem?*

This is the question that led me to what I now think of as the island architecture, and it has changed how I build frontend applications in ways I did not fully anticipate.

## The Problem With Framework Loyalty

Framework loyalty is a cultural artifact, not an engineering one. It exists because:

1. Hiring pipelines are organized around individual frameworks
2. Tutorial ecosystems create strong onboarding paths to single tools
3. Most teams are too busy to justify learning two things when one works adequately

None of these are reasons to make a permanent architectural commitment to a single rendering approach for every part of a large application.

Consider the actual requirements of a typical enterprise application. You have authenticated routes with complex forms, state management, role-based access, and deep integration with backend services. You have data dashboards with real-time updates, interactive charts, and filtered views. You have content pages, landing sections, marketing copy. You have maybe a live chat widget, a notification system, a calendar component.

These things do not all have the same requirements. The form handling that makes Angular's reactive forms compelling is irrelevant for a marketing banner. The component ecosystem and animation libraries that make React attractive for interactive UIs are overkill for a server-rendered content page. Treating all of these as the same problem and solving them with the same tool is... not wrong exactly, but it is not optimal.

## What Islands Architecture Actually Is

The term "islands architecture" comes from Astro and the static site generation world, where it was used to describe selectively hydrating interactive components into an otherwise static page. I borrowed the concept and adapted it for something slightly different: using Angular as the application shell and router while mounting React (or Vue) islands for specific components where their ecosystems or capabilities are a better fit.

The mechanics matter here. When you mount a React component inside an Angular application, you need to do two things correctly or you will create problems worse than the ones you solved.

**First: stay out of Angular's zone.** Zone.js is Angular's change detection mechanism. If React's event system fires inside Angular's zone, you get double renders, unpredictable behavior, and performance characteristics that are hard to debug. The solution is to run React outside the zone using \`NgZone.runOutsideAngular()\`. This is not optional. Everything you render into a React island should be invisible to Angular's change detection.

**Second: establish a communication contract.** Your React islands are isolated by design, which means they cannot access Angular's dependency injection system directly. This is fine. The solution is to pass what the island needs as props — data, callbacks, configuration — and let Angular's service layer remain the single source of truth. The island renders. Angular orchestrates.

Here is what that mount function actually looks like:

\`\`\`ts
// react-bridge.component.ts (simplified)
this.ngZone.runOutsideAngular(async () => {
  const { mountIsland } = await import('./islands/mount');
  this.unmountFn = mountIsland(
    this.mountPoint.nativeElement,
    this.componentName,
    { ...this.props, ngZone: this.ngZone }
  );
});
\`\`\`

The island registry is a dynamic import map. Each island is code-split automatically. The Angular component that hosts it is a generic bridge that takes a component name and props. The individual islands have no knowledge of Angular at all — they are just React components.

## What I Actually Use This For

Not everything. That is the first and most important thing to say. Angular handles routing, authentication, HTTP interceptors, form-heavy pages, and the application shell. Those stay in Angular. I am not rewriting Angular components in React because React is fun.

Where React islands earn their place:

**Interactive content that benefits from React's ecosystem.** Comment threads with threaded replies and optimistic updates. Rich text editors. Complex drag-and-drop interfaces. Animation-heavy components where Framer Motion is exactly what the problem calls for. React's component ecosystem here is genuinely larger and more mature than Angular's.

**Real-time data displays.** Components that subscribe to Firebase Realtime Database or WebSocket streams and need to re-render frequently. React's fine-grained re-rendering behavior with \`useState\` and \`useMemo\` is slightly easier to tune for high-frequency updates than Angular's change detection in my experience.

**Isolated widgets with clear prop boundaries.** A reading progress bar. A like button with an animation. A newsletter signup form with its own state machine. Things that are self-contained enough that their isolation is an architectural virtue, not a compromise.

## What Vue Brings to This

Vue is the one I reach for least in this setup, but that is not a criticism of Vue — it is a reflection of my ecosystem. Where Vue becomes relevant is in content-heavy contexts where its template syntax and reactivity system make component authoring fast and the output is lightweight.

I have used Vue for internal tooling, for CMS-integrated front ends where the content team needed to understand the templates, and for admin panels where the simplicity of Vue's options API was more appropriate than either Angular's structure or React's freedom. Vue 3's Composition API also shares enough conceptual DNA with React hooks that context-switching between the two is manageable for a developer who knows both.

The honest answer is that Vue sits between Angular and React in most of the tradeoffs, which makes it the right answer less often than either extreme. But when it is the right answer, it is noticeably better than either alternative.

## The Part That Makes People Uncomfortable

Shipping multiple frameworks in one application increases the bundle size. That is true. It also increases the cognitive surface area for developers who need to maintain it. Also true.

My position on this is that both concerns are context-dependent. For large, long-lived enterprise applications where different teams own different parts of the product, the tradeoffs of framework flexibility often outweigh the bundle size cost — particularly when each island is properly code-split and lazy-loaded. For smaller applications where a single team owns the whole codebase, the overhead probably is not justified.

The thing I push back on is the idea that mixing frameworks is inherently wrong. The framework exists to serve the product. When the product has multiple distinct interaction patterns with genuinely different requirements, using multiple tools is not a symptom of indecision. It is a symptom of actually thinking about the problem.

## What Changed

I am building better products than I was when I was framework-loyal. That is the metric I care about. The routing, authentication, and application structure that Angular provides are excellent. The React component ecosystems I reach into for specific interactive components are excellent. These things do not have to be in conflict.

The mental model shift that made this possible was simple: Angular is the architect. React and Vue are specialist contractors. The architect runs the project. The specialists own their scope. Everyone does the work they are best at.

It took me years to arrive at this position. I am not sure why it took that long, except that the industry's framework tribalism is genuinely pervasive and hard to think outside of until you have built enough things to stop caring about the tribal identity.
  `.trim(),
},

// ══════════════════════════════════════════════════════════════════════════
// POST 3
// ══════════════════════════════════════════════════════════════════════════
{
  slug: 'in-defence-of-vue-the-framework-nobody-argues-about',
  title: 'In Defence of Vue: The Framework Nobody Argues About',
  subtitle: 'Which should tell you something.',
  excerpt: 'Nobody has a strong opinion about Vue. I mean that as a compliment. In a space where React developers and Angular developers approach framework discussions with the energy of people defending ancestral homelands, Vue exists as the Switzerland of frontend — technically neutral, well-organized, and quietly effective.',
  readingTime: 7,
  isFeatured: false,
  isPinned: false,
  tags: ['frontend', 'engineering', 'opinion'],
  content: `
## The Absence of Drama

Nobody has a strong opinion about Vue. I mean that as a compliment.

In a space where React developers and Angular developers approach framework discussions with the energy of people defending ancestral homelands, Vue exists as the Switzerland of frontend — technically neutral, well-organized, and quietly effective. People do not evangelize Vue at conferences with the same fervor. There are no "Vue vs. React" wars in comment sections that last forty-seven replies. Nobody has written a viral thread called "Why I Left Angular for Vue and You Should Too."

The absence of drama around Vue is worth examining because it is not the absence of quality. It might, in fact, be evidence of quality.

## What Vue Got Right by Watching Others Get It Wrong

Vue 2 shipped in 2016, which meant Evan You and the team had the extraordinary advantage of watching both Angular (in both its incarnations) and React establish themselves first. They could see what worked, what did not, what the community responded to, and what caused maintainability problems at scale.

The result was a framework with a remarkably clear design philosophy. Single file components. An approachable template syntax that reads like HTML rather than JSX. Two-way binding that actually worked without AngularJS's digest cycle problems. A reactivity system that was intuitive without being magic.

Vue 2 felt like someone had taken the lessons from the first generation of frontend frameworks and distilled them into the cleanest possible expression. It was never the most powerful option. It was frequently the most usable one.

## Vue 3 and the Composition API

Vue 3 is a different conversation. The Composition API — \`setup()\`, \`ref()\`, \`reactive()\`, \`computed()\` — is conceptually close enough to React hooks that anyone comfortable in React will find the mapping intuitive. But it ships alongside the Options API rather than replacing it, which is a decision I respect: it acknowledges that the people who found Vue 2's structure pleasant do not have to abandon it.

The Options API is worth defending, by the way. I know the frontend community has largely moved on to composition-based patterns, and I agree that for complex logic composition, the Composition API is superior. But the Options API's explicit separation of \`data\`, \`computed\`, \`methods\`, and \`lifecycle\` hooks is extraordinarily readable. I have handed Vue 2 components to developers who had never seen Vue and watched them understand the code in ten minutes. The structured layout carries meaning.

The Composition API sacrifices some of that immediate readability for flexibility and logic reuse. It is the right tradeoff for large, complex components. It is slightly over-engineered for small ones. Vue 3 lets you make that call per component, which is either pragmatic or inconsistent depending on your team's discipline level.

## Where I Actually Use Vue

I have used Vue in three distinct contexts over the years.

**Internal tooling.** Admin panels, internal dashboards, CRUD interfaces for operations teams. Vue's gentle learning curve means that a developer who primarily writes backend code can contribute to a Vue frontend without a significant ramp-up period. I have found this genuinely valuable in small teams where everyone touches everything.

**CMS-integrated frontends.** When the content team needs to understand the templates, Vue's template syntax — which reads like annotated HTML — is significantly more approachable than JSX. I have worked on projects where non-engineering stakeholders needed to audit or lightly modify template code. Vue was the right choice.

**Prototyping.** When I need to validate a UI concept quickly, Vue gets out of the way. The scaffolding is minimal, the reactivity system requires less boilerplate than either Angular or React, and the CDN-included version still works for small proofs of concept. For a prototype, this matters.

What I have not used Vue for is large-scale enterprise applications with teams of more than five or six developers. This is not a criticism — it is a scope observation. Angular's enforced conventions become significantly more valuable as team size and codebase complexity increase. Vue's flexibility, which is an asset at small scale, becomes a liability when you have ten developers with ten different opinions about folder structure.

## The Honest Comparison

React has a larger ecosystem and more corporate backing. Angular has better structural conventions for large teams. Vue has the best out-of-the-box developer experience and the most approachable learning curve. These are all true simultaneously and none of them make one framework objectively better than the others.

What Vue does better than both alternatives is progressive adoption. You can add Vue to an existing HTML page with a script tag. You can write a Vue application that is as structured as Angular or as free-form as React. You can use the Options API for simple components and the Composition API for complex ones. The framework meets you where you are and scales up as needed rather than imposing a ceiling or a floor.

This progressive quality is undervalued in technical discussions because it does not make for exciting arguments. "This framework works well at various scales and for various team compositions" does not land as a conference talk title. But it is an enormously practical property for a tool that needs to survive contact with real organizational constraints.

## Why You Should Know It Even If You Do Not Use It Daily

Vue has influenced both React and Angular. The Composition API influenced the thinking around React hooks more than the React team publicly acknowledges. Vue's template compilation approach has been referenced in Angular's compiler discussions. Understanding Vue gives you a useful reference point for why certain decisions were made in the other two frameworks.

More practically: client requirements are unpredictable. I have inherited Vue codebases that needed maintenance and extension. I have been brought into consulting engagements where Vue was the existing choice and the mandate was to build on it, not replace it. Having a working understanding of Vue meant I could contribute immediately rather than after a significant learning period.

The framework nobody argues about turns out to be the framework everyone should probably spend a week getting comfortable with. That is not a lukewarm endorsement. It is a genuinely practical one.
  `.trim(),
},

// ══════════════════════════════════════════════════════════════════════════
// POST 4
// ══════════════════════════════════════════════════════════════════════════
{
  slug: 'raw-sql-is-not-a-character-flaw',
  title: 'Raw SQL Is Not a Character Flaw',
  subtitle: 'A defence of writing the queries yourself.',
  excerpt: 'I do not use ORMs for new projects. This is the kind of statement that triggers a reaction in people, and the reaction is almost always the same: a furrowed brow, a slight lean forward, and "what do you do about migrations?" Let me explain.',
  readingTime: 8,
  isFeatured: false,
  isPinned: false,
  tags: ['backend', 'databases', 'engineering'],
  content: `
## The Confession

I do not use ORMs for new projects.

This is the kind of statement that triggers a reaction in people, and the reaction is almost always the same: a furrowed brow, a slight lean forward, and "what do you do about migrations?"

Let me explain what I mean, what I have tried, and why I landed where I did. This is not a polemic against ORMs in general. It is a description of a deliberate choice that I have made and defended across multiple production codebases over the past several years, and an explanation of why I think that choice is underappreciated.

## What I Have Used

I have used Entity Framework with .NET, which is mature, powerful, and deeply integrated into the .NET ecosystem. I have used SQLAlchemy with Python, which is the best ORM I have worked with — its Core layer in particular strikes a better balance between abstraction and control than almost anything else in the space. I have used Sequelize and TypeORM with Node.js, both of which I find significantly less pleasant than their Python and .NET counterparts. I have used Prisma, which generates the cleanest TypeScript types of any ORM I have tried, and which I have also found to be the most opinionated in ways that eventually create friction.

I have reached the following conclusion: ORMs are excellent for getting started and a source of compounding complexity as systems mature. The abstraction earns its cost early in a project's life and begins to lose that argument as query complexity grows, performance requirements tighten, and the team's SQL fluency develops.

## The Case For PostgreSQL and Raw SQL

PostgreSQL is remarkable software. It has been in active development since 1996, it is the most feature-complete open-source relational database in existence, and it does things that most application-layer code cannot — correctly, efficiently, and with the full benefit of a battle-tested query planner.

When I write raw SQL against PostgreSQL, I have access to:

- Window functions that express complex analytical queries in ten lines that would take a hundred in ORM syntax
- Full-text search with GIN indexes and \`tsvector\` that are dramatically more capable than any ORM's search layer
- CTEs (Common Table Expressions) that let me compose complex queries in ways that remain readable
- JSONB columns that give me structured, queryable JSON storage with indexing support
- \`pg_trgm\` for trigram-based similarity search
- \`uuid_generate_v4()\` at the database layer where it belongs
- Triggers, stored procedures, and functions when the logic genuinely belongs in the database
- Partial indexes that let me index only the rows I actually query against

An ORM can expose some of these through raw query escape hatches. But the moment you are reaching for the escape hatch, you have already paid the ORM's overhead without getting its benefits. You are writing SQL wrapped in an abstraction that was designed to hide SQL.

## The Practical Pattern I Use

I write SQL in the repository layer. Each domain concept — posts, authors, tags, comments — has its own repository file with typed query functions. Those functions use a thin pool wrapper that provides typed generics over \`pg.Pool\`.

The pattern looks like this in practice:

\`\`\`ts
export async function queryOne<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await getPool().query<T>(text, params);
  return result.rows[0] ?? null;
}
\`\`\`

Then in the repository:

\`\`\`ts
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const row = await queryOne<PostRow>(
    \`SELECT p.*, a.display_name AS author_display_name
     FROM posts p
     JOIN authors a ON a.id = p.author_id
     WHERE p.slug = $1 AND p.status = 'published'\`,
    [slug]
  );
  return row ? mapRowToPost(row) : null;
}
\`\`\`

The mapper function — \`mapRowToPost\` — converts the snake_case database row to the camelCase application interface. This is the only transformation layer. It is explicit, testable, and completely transparent about what it does.

## The Migration Question

This is always the first objection, and it is a fair one. ORMs handle migrations automatically, or at least generate them. Without one, you are writing migration SQL yourself.

My answer is: yes, and this is fine, and here is why.

Migration SQL that you write yourself is SQL that you understand completely. When something goes wrong in production at 11pm and you need to understand exactly what a migration did and why, you want to be reading SQL, not reverse-engineering ORM-generated SQL back into what it was trying to do. I have done both. The former is faster.

My migration runner is a Node script that reads a \`schema.sql\` file and applies it idempotently — every table creation uses \`CREATE TABLE IF NOT EXISTS\`, every index uses \`CREATE INDEX IF NOT EXISTS\`. For more complex migrations that need to be sequential, I maintain a \`migrations/\` directory with numbered SQL files and a \`schema_migrations\` table that tracks which ones have run. This is essentially what every ORM migration runner does, but transparent.

Is it more work than running \`npx prisma migrate dev\`? Marginally. Is it more work than debugging why Prisma generated an unexpected schema change that dropped a column in staging? Not remotely.

## When ORMs Are Actually The Right Answer

I am not going to pretend this is a universal position. ORMs are the right answer when:

The team has weak SQL skills and building that SQL fluency is not realistic given project constraints. Teaching your team to write good SQL queries takes time. If the project timeline does not allow for it, an ORM's guardrails are genuinely protective.

The application's data access patterns are genuinely simple. CRUD operations with straightforward filters and sorts. If you are not joining more than two tables or using aggregations, an ORM's query builder is fast to write and easy to read.

Rapid prototyping. Prisma in particular generates beautiful TypeScript types from your schema. For a prototype where you need to validate a data model quickly, that type generation is a significant time saver. I would switch to raw SQL as the application matures, but I would not start there for every project.

## What Eleven Years of Database Work Actually Taught Me

Every performance problem I have investigated in production applications — and I have investigated many — has ultimately been a query problem. Not a caching problem, not an infrastructure problem, not a framework problem. A query problem. Indexes that did not exist. N+1 queries that the ORM generated without anyone noticing. Transactions held open longer than necessary. Joins performed in application code instead of the database.

The developers who caught those problems quickly were the ones who understood what was happening at the SQL layer. The developers who struggled were the ones who had been so thoroughly abstracted from the SQL that they did not know where to start looking.

I would rather have a team that writes and understands its own SQL than one that ships faster initially and then spends its maintenance budget trying to understand what the ORM generated on their behalf. That tradeoff gets clearer the longer a system runs.

PostgreSQL deserves to be used as PostgreSQL. Not as a persistence layer behind an abstraction that treats all relational databases as interchangeable. They are not interchangeable. The specific capabilities of the database you choose should inform how you use it. Writing raw SQL is not a character flaw. It is evidence that you took the database seriously.
  `.trim(),
},

// ══════════════════════════════════════════════════════════════════════════
// POST 5
// ══════════════════════════════════════════════════════════════════════════
{
  slug: 'python-on-the-backend-when-it-earns-it',
  title: 'Python on the Backend: When It Actually Earns Its Place',
  subtitle: 'Not every API should be a FastAPI. But some should.',
  excerpt: "Python is not my primary backend language. I want to be upfront about that so nobody miscalibrates what follows. My primary backend environment is TypeScript — Fastify or NestJS depending on the scale and team conventions. Python enters the picture under specific conditions, and when those conditions are met, it earns its place clearly enough that I do not feel the need to apologize for using it.",
  readingTime: 8,
  isFeatured: false,
  isPinned: false,
  tags: ['backend', 'engineering', 'technology'],
  content: `
## Setting the Context

Python is not my primary backend language. I want to be upfront about that so nobody miscalibrates what follows.

My primary backend environment is TypeScript — Fastify or NestJS depending on the scale and team conventions. Python enters the picture under specific conditions, and when those conditions are met, it earns its place clearly enough that I do not feel the need to apologize for using it.

Those conditions are: machine learning integration, data pipeline work, scientific computing requirements, or a team composition where Python fluency significantly outweighs TypeScript fluency. Outside of those conditions, I use TypeScript and I am comfortable with that choice.

What I want to discuss here is what Python actually looks like in production backend contexts, what FastAPI has changed about Python API development specifically, and where I still find myself reaching for it even as a primarily TypeScript-native developer.

## What Python Does Better Than It Gets Credit For

The internet has a strong and stable opinion about Python's performance relative to compiled languages or even JavaScript's V8 runtime. That opinion is largely correct. CPython is slower than Node.js for most web API workloads, and significantly slower than .NET or Java.

The thing the internet underweights is how often that performance gap is irrelevant. If your API call takes 50ms and 40ms of that is a database query, the 10ms difference between Python and Node.js in the compute portion is not your problem. Your problem is the database query. Optimize that.

The cases where Python's runtime performance actually becomes a bottleneck in API contexts are narrower than the discourse suggests. They tend to involve CPU-bound work — image processing, complex computation, serialization of large datasets — without appropriate offloading to worker processes or native extensions. For I/O-bound API work, Python with asyncio is competitive enough that the performance argument is frequently not the relevant consideration.

What Python does better than its reputation suggests:

**Readability at the data transformation layer.** Python code that transforms, aggregates, or reshapes data is frequently more readable than equivalent TypeScript. The language's expressiveness for list comprehensions, generator expressions, and dictionary operations produces dense, readable data processing code that I genuinely prefer to equivalent TypeScript in some contexts.

**The scientific and ML ecosystem.** This is not a subtle advantage. NumPy, pandas, scikit-learn, PyTorch, Hugging Face — these libraries exist in Python first and are ported to other languages as afterthoughts, if at all. If your backend needs to do anything in this space, Python is not a preference, it is a requirement.

**SQLAlchemy Core.** I mentioned in the raw SQL post that I avoid ORMs. SQLAlchemy Core is the exception — it provides a composable, Pythonic query construction layer that still produces clean SQL and gives you full control over what is executed. It is the best query builder I have used in any language.

## FastAPI Changed the Conversation

I want to be specific about this because it matters. Before FastAPI, building a Python API meant Flask or Django REST Framework. Flask is fine — it is minimal, flexible, and well-understood. Django REST Framework is powerful and opinionated. Neither of them offered anything that made Python attractive for API development specifically.

FastAPI changed that.

Automatic OpenAPI documentation generated from your code. Dependency injection that actually works idiomatically. Request validation via Pydantic that produces meaningful error messages without boilerplate. Async request handling via Starlette. Type annotations that actually drive runtime behavior rather than just existing as documentation.

More importantly: FastAPI performance benchmarks that are competitive with Express and Fastify for I/O-bound work. The common benchmark suite puts FastAPI consistently in the same tier as Node.js frameworks for typical API workloads.

The development experience of FastAPI is also genuinely pleasant in a way that Flask was not. Defining an endpoint, its dependencies, its request and response shapes, and having all of that automatically reflected in a live-updating OpenAPI spec is a workflow that reduces the gap between implementation and documentation to nearly zero. That has real value.

\`\`\`python
from fastapi import FastAPI, Depends
from pydantic import BaseModel

class PostCreate(BaseModel):
    title: str
    content: str
    tag_ids: list[str]

@app.post("/posts", response_model=PostResponse)
async def create_post(
    payload: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PostResponse:
    # FastAPI validates payload, injects db and user automatically
    return await post_service.create(db, payload, current_user)
\`\`\`

The type annotation on the function signature is the API contract. That is clean.

## The Market-Lens Architecture Pattern

The most complex Python backend I have built was for a stock and crypto technical analysis platform. The Python service — handling indicator calculation, TimescaleDB time-series queries, and real-time streaming — ran as a separate microservice alongside a NestJS API gateway.

The architecture made sense: Python owned the domain where Python was genuinely best (numerical computation, technical indicators, scientific libraries), and TypeScript owned the domain where TypeScript was better (authentication, real-time WebSocket management, client-facing API surface, Firebase integration).

This is the pattern I keep coming back to. Python is not a replacement for a TypeScript backend. It is a complement to one in architectures where the problem space genuinely requires it. The market lens platform would have been technically implementable in TypeScript — you can do technical analysis in JavaScript — but it would have been slower to develop, harder to maintain, and less capable than the Python equivalent given the available libraries.

## The Deployment Reality

Python deployment has improved dramatically. Docker made the environment reproducibility problem mostly go away. Uvicorn + Gunicorn is a production-grade serving configuration. Alembic handles migrations. The toolchain is mature.

What has not improved enough is the Python packaging and dependency management story. \`pip\` with \`requirements.txt\` is functional. Poetry is better. Neither is as straightforward as \`npm\` or \`cargo\`. This is a real operational cost, particularly in CI environments where you want reproducible builds without long install times.

My pragmatic solution: Docker images with pinned dependencies and a \`requirements.lock\` file. Not elegant, but reliable.

## The Honest Summary

Use Python on the backend when you need its ecosystem. Machine learning integration: Python. Data pipelines: Python. Scientific computation: Python. APIs that front primarily numeric or analytical work: Python is at minimum a very strong candidate.

Use TypeScript when you need the language uniformity with your frontend, when the team is primarily JavaScript-native, when Firebase integration is central, or when you want the strongest possible type safety across the API surface.

The decision is not "which language is better." That framing produces bad architecture. The decision is "which language is better for this specific part of this specific system." Python earns its place in the specific domains where it earns it. I reach for it there without hesitation and reach for TypeScript everywhere else with equal confidence.
  `.trim(),
},

// ══════════════════════════════════════════════════════════════════════════
// POST 7
// ══════════════════════════════════════════════════════════════════════════
{
  slug: 'nestjs-typescript-all-the-way-down',
  title: 'NestJS: TypeScript All the Way Down',
  subtitle: 'When you want Angular\'s architecture on the server.',
  excerpt: "NestJS is what happens when Angular developers get tired of context-switching to the backend. I say this as someone who contributed to that tired feeling and who now thinks that the resulting framework, whatever its origin story, is one of the more interesting things to happen to Node.js backend development in the last several years.",
  readingTime: 7,
  isFeatured: false,
  isPinned: false,
  tags: ['backend', 'engineering', 'technology'],
  content: `
## The Origin Story

NestJS is what happens when Angular developers get tired of context-switching to the backend. I say this as someone who contributed to that tired feeling, and who now thinks that the resulting framework — whatever its origin story — is one of the more interesting things to happen to Node.js backend development in the last several years.

The structural parallel to Angular is deliberate and transparent. Modules. Decorators. Dependency injection. Guards (analogous to route guards). Interceptors (analogous to HTTP interceptors). Pipes for validation and transformation. Providers with lifecycle management. If you have spent significant time in Angular, reading a NestJS codebase for the first time produces a strong sense of familiarity that is both useful and slightly uncanny.

The question worth asking is whether that Angular-derived structure is appropriate for a Node.js backend, or whether it is an imported aesthetic that creates unnecessary complexity in a context that did not call for it. My position: it depends on the scale and the team, and for the right contexts, it is genuinely excellent.

## What NestJS Adds Over Plain Fastify or Express

I build APIs in both plain Fastify and NestJS. They are not in competition for the same use cases in my mental model.

Fastify is what I reach for when I want maximum control and minimum abstraction overhead. Small to medium APIs, services that need to be lean, contexts where the team will write and own all the plumbing. Fastify's plugin system is composable and transparent. You know exactly what is loaded and why.

NestJS is what I reach for when the team is larger, the API surface is complex, and I want conventions that enforce consistency across contributors without requiring a style guide document.

Concretely, NestJS provides:

**Module-based code organization** that mirrors domain boundaries. A \`PostsModule\` contains the controller, service, and repository for posts. That module declares its dependencies and its exports. The application module imports it. This pattern scales to large codebases without the folder structure becoming a matter of preference and therefore a matter of argument.

**Decorators as the API contract.** \`@Controller()\`, \`@Get()\`, \`@Post()\`, \`@Body()\`, \`@Param()\`. The endpoint definition lives with the handler, is readable without documentation, and is enforced at the type level. This is similar to what you get with FastAPI in Python and it produces similarly legible code.

**Guards and interceptors at the framework level.** Authentication guards, role guards, logging interceptors, cache interceptors — these are framework-native concepts with clear interfaces. You implement the interface, register the guard, and it applies. No middleware chaining required.

**Validation pipes with class-validator.** Define a DTO class, decorate the properties with validation rules, inject the \`ValidationPipe\` globally, and NestJS validates every incoming request against your DTO before it reaches the handler. Malformed requests return structured 400 errors automatically.

\`\`\`ts
@IsString()
@IsNotEmpty()
@MaxLength(500)
title: string;

@IsArray()
@IsUUID('4', { each: true })
tagIds: string[];
\`\`\`

These decorators on a DTO class are the validation layer. No separate validation library. No manual check in the handler. It is integrated.

## The Dependency Injection System

NestJS's DI is close enough to Angular's that I will not spend long on it. The key difference: whereas Angular's DI is primarily about services and the component tree, NestJS's DI is purely about services and modules. There is no component tree — the rendering layer does not exist on the server.

What matters in practice is that the DI system is explicit and testable. You can substitute mock providers in tests without sinon or jest.mock shenanigans. Your service constructors declare their dependencies clearly. The relationship graph between services is inspectable.

This is the part of NestJS that I think gets undervalued in the "NestJS is just Angular on the server" criticism. The DI system is not a cosmetic similarity. It is a structural decision that makes large codebases significantly more maintainable.

## Where I Have Friction

Two places.

**TypeScript compilation overhead.** NestJS uses decorators extensively, and TypeScript decorator compilation with \`emitDecoratorMetadata\` enabled adds build time. On large NestJS codebases, incremental TypeScript compilation in watch mode is noticeably slower than equivalent Fastify code. This matters during development and in CI pipelines. SWC (the Rust-based TypeScript compiler) as a NestJS build tool helps significantly — the NestJS CLI now supports it directly.

**The abstraction can fight you.** When NestJS's patterns align with your problem, the framework feels effortless. When they do not — when you are building something that fits awkwardly into the module/controller/service pattern — you spend time working around the framework rather than with it. This is true of all opinionated frameworks, Angular included. It is worth naming.

## The Fastify Adapter

One detail that changed my evaluation of NestJS significantly: it supports Fastify as its underlying HTTP adapter, replacing Express. Express is fine. Fastify is noticeably faster and has better TypeScript support. Running NestJS on Fastify gives you the structural benefits of NestJS with the performance profile of Fastify.

\`\`\`ts
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter()
);
\`\`\`

For production applications where throughput matters, this is worth doing. It is not the default, but it should be.

## When To Use It

Large APIs with multiple developers where consistency is more valuable than flexibility. Systems where the Angular-derived patterns genuinely fit the domain structure. Teams where TypeScript-first backend development is the goal and nobody wants to debate folder structure or dependency injection conventions.

Not for: small, lean APIs where Fastify or Express is sufficient. Not for microservices that are more infrastructure than business logic. Not for contexts where the team is not already TypeScript-comfortable and you would be paying both the NestJS learning curve and the TypeScript learning curve simultaneously.

TypeScript all the way down — frontend to backend, Angular to NestJS — is a genuinely compelling approach for teams that can support it. The cognitive context-switching between a TypeScript frontend and a TypeScript backend is minimal in a way that switching between TypeScript and Python, or TypeScript and C#, is not. That has compound value on a team over time.
  `.trim(),
},

// ══════════════════════════════════════════════════════════════════════════
// POST 8
// ══════════════════════════════════════════════════════════════════════════
{
  slug: 'nosql-the-cases-where-i-actually-reach-for-it',
  title: 'NoSQL: The Cases Where I Actually Reach for It',
  subtitle: 'Not as a default. As a deliberate choice for specific problems.',
  excerpt: "I am a relational database person. PostgreSQL is my default answer to 'what database should we use' because it is correct most of the time. But I have found several contexts where NoSQL solutions are not just acceptable but genuinely better than the relational alternative, and those cases are worth being specific about.",
  readingTime: 7,
  isFeatured: false,
  isPinned: false,
  tags: ['databases', 'engineering', 'backend'],
  content: `
## The Default and the Exceptions

I am a relational database person. PostgreSQL is my default answer to "what database should we use" because it is the correct answer most of the time. Structured data, relationships between entities, transactional integrity, complex queries, full-text search, time-series with TimescaleDB, vector search with pgvector — PostgreSQL handles all of this with a maturity and correctness that no NoSQL database matches.

But I have found several contexts where NoSQL is not just acceptable but genuinely better than the relational alternative, and those cases are worth being specific about. The NoSQL conversation in my experience tends to go one of two directions: either "NoSQL is for web scale" (wrong, or at least significantly oversimplified) or "NoSQL is a toy for people who do not understand schemas" (also wrong). The actual answer is that specific NoSQL databases solve specific problems very well, and the engineering question is whether your problem is actually one of those.

Here are the cases where I reach for it.

## Firebase Realtime Database: Presence and Live State

Firebase Realtime Database is not a general-purpose database. It is a database purpose-built for one specific thing: synchronizing state between clients in real time, with conflict resolution handled automatically. For that specific problem, it is dramatically better than anything you can build on top of PostgreSQL without significant infrastructure.

The pattern I use most frequently: presence tracking and live counters. When a user opens a blog post, I write their session to \`active_readers/{postId}/{sessionId}\`. When they close the tab, \`onDisconnect().remove()\` cleans up automatically. Every client subscribed to \`active_readers/{postId}\` sees the count change in real time with zero polling.

Try to build this with PostgreSQL. You will end up with a \`sessions\` table, a scheduled cleanup job for stale sessions, a polling mechanism or WebSocket server for broadcast, and a connection that can detect disconnection. None of this is impossible, but it is significantly more infrastructure than a five-line Firebase configuration.

Where Firebase fails: complex queries. You can filter on a single property with ordering. You cannot join, you cannot aggregate, you cannot do anything resembling a SQL \`WHERE\` clause with multiple conditions. The moment I need to query data, I reach for PostgreSQL. The moment I need to broadcast state changes to all connected clients instantly, I reach for Firebase.

The architecture that works: PostgreSQL for truth (posts, comments, users, tags), Firebase for real-time ephemeral state (view counts in the last five minutes, active readers, live reaction updates). The two coexist without competing because they own different domains.

## Redis: The Thing Nobody Calls a Database But Is

Redis calls itself a data structure server, which is more accurate than "NoSQL database" but less useful as a category for people trying to decide whether to use it.

What Redis actually is in the architectures I have built: a fast, ephemeral layer between my application and everything that would otherwise be expensive.

**Rate limiting.** Sliding window rate limiters implemented in Redis with Lua scripts. Accurate, fast, and ephemeral — you do not want rate limit state in PostgreSQL because it writes on every request and the data has no long-term value.

**Session storage.** JWT blacklists (revoked tokens), session invalidation sets, temporary auth codes — these are all things that need to be checked on every authenticated request, need to expire automatically, and are read-heavy enough that a PostgreSQL lookup would be measurable overhead. Redis with a \`TTL\` on each key handles all of this with sub-millisecond reads.

**Pub/sub for WebSocket broadcast.** When you have multiple Node.js processes (and in production, you almost always do), a WebSocket message sent to process A cannot automatically reach clients connected to process B. Redis pub/sub provides the broadcast channel. Process A publishes to Redis. All processes subscribe and forward to their local clients. This is how Socket.io's Redis adapter works under the hood.

**Caching.** The obvious one, but worth naming because the implementation details matter. Cache keys should include the full query parameters to prevent cache poisoning. TTLs should be shorter than you think during initial deployment. Cache invalidation should be explicit, not rely on TTL alone for user-facing data.

## TimescaleDB: PostgreSQL for Time-Series

TimescaleDB is technically a PostgreSQL extension, which is why I hesitate to call it NoSQL, but it deserves mention in this context because it changes the behavior and use case significantly enough that it warrants separate consideration.

The market analysis platform I built used TimescaleDB for price history, indicator values, and volume data. The core value proposition: automatic partitioning of time-series data by time intervals, continuous aggregates that pre-compute aggregations and stay current as new data arrives, and compression of older data that dramatically reduces storage without losing queryability.

For time-series data — stock prices, sensor readings, log events, metric timeseries — TimescaleDB gives you SQL querying on data that would be impractical to query in standard PostgreSQL at scale, without requiring you to learn a new query language or abandon your existing tooling.

The query for "what was the 20-day moving average of AAPL's close price over the last three months" in TimescaleDB is SQL. That is not true in InfluxDB or Prometheus's query languages.

## MongoDB: The One I Use Least

I will be honest: MongoDB is the NoSQL database I have the most mixed feelings about. Not because it is a bad database — it is not — but because I have seen it used as the default when PostgreSQL was the correct choice more often than I have seen it used well for what it is actually good at.

What MongoDB is good at: document storage for genuinely unstructured or variable-schema data. Content management systems where the document structure varies by content type. Catalogs with highly variable attributes (e-commerce products where a shirt has different attributes than a television). Event logs where the event schema varies by event type.

What MongoDB is frequently used for that it is not the best tool for: data that has clear relationships, data that needs transactional integrity across multiple documents, data that needs complex multi-field aggregations and analytical queries.

The \`$lookup\` aggregation stage in MongoDB — the join equivalent — is functional. It is also a reliable indicator that your data model might be better served by a relational database. When you are joining documents in a document database, you are fighting the model.

## The Actual Decision Framework

Use PostgreSQL unless you have a specific, identifiable reason not to.

Use Firebase RTDB when you need real-time state synchronization between clients without building the WebSocket infrastructure yourself.

Use Redis when you need fast ephemeral data access, rate limiting, pub/sub broadcast, or caching.

Use TimescaleDB (on PostgreSQL) when your primary data type is time-series and your query patterns are time-window-based.

Use MongoDB when your document schemas are genuinely variable and your query patterns are primarily document-retrieval rather than relational.

The reason I spend time on this is that database selection is one of the hardest migrations to make after the fact. Choosing the wrong database is not a refactor. It is a rewrite that affects every layer of the application. Getting it right at the start, even if it requires a longer conversation, is significantly cheaper than getting it right later.
  `.trim(),
},

// ══════════════════════════════════════════════════════════════════════════
// POST 9
// ══════════════════════════════════════════════════════════════════════════
{
  slug: 'integrating-ai-into-existing-software-without-rewriting-everything',
  title: 'Integrating AI Into Existing Software Without Rewriting Everything',
  subtitle: 'The unglamorous, practical version of what AI in production actually looks like.',
  excerpt: "Most of the AI integration content I read describes greenfield systems — applications built from scratch with AI as a first-class architectural concern. This is useful for maybe five percent of the software engineers working today. The other ninety-five percent are looking at existing codebases, existing deployments, existing teams, and asking a much harder question: how do we add AI capabilities to what we already have?",
  readingTime: 9,
  isFeatured: true,
  isPinned: false,
  tags: ['technology', 'engineering', 'backend'],
  content: `
## The Problem With Most AI Integration Content

Most of the AI integration content I read describes greenfield systems — applications built from scratch with AI as a first-class architectural concern. This is useful for maybe five percent of the software engineers working today. The other ninety-five percent are looking at existing codebases, existing deployments, existing teams, and asking a much harder question: how do we add AI capabilities to what we already have, without breaking what already works, without a three-month rewrite, and without betting the production system on a technology that is still changing monthly?

That is the question I have been living with across several projects over the past two years. This is what the practical version looks like.

## The Proxy Pattern: LiteLLM as the AI Layer

The most important architectural decision I made early in this work was to never let application code call an LLM provider API directly.

Every direct API call in your application code is a coupling. It means your code has opinions about which model, which provider, which API format. When Anthropic releases a new model or OpenAI changes a pricing tier or you decide you want to run inference locally, you are editing application code.

LiteLLM solves this. It is an open-source proxy that exposes a single OpenAI-compatible API and routes to over a hundred providers behind it — Anthropic, OpenAI, Google, Cohere, Hugging Face, Ollama for local models, and more. Your application sends a request to \`http://localhost:4000/v1/chat/completions\`. LiteLLM decides which actual provider handles it based on configuration.

\`\`\`ts
// application code — provider-agnostic
const response = await fetch('http://litellm:4000/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${LITELLM_KEY}\` },
  body: JSON.stringify({
    model: 'claude-haiku',   // LiteLLM resolves this to anthropic/claude-haiku-4-5
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
  }),
});
\`\`\`

When we needed to switch from Claude Haiku to a local Ollama model for a client with strict data residency requirements, the application code change was one line in a config file. The application had no idea anything changed.

This is the proxy pattern and it is the first thing I implement now in any project that involves LLM calls.

## Task Categorization: Where AI Earns Its Keep Quickly

The fastest path to visible AI value in an existing system is automated categorization. It is not glamorous. It does not make for impressive demos. But it is where AI ROI is most reliably positive.

Email triage is the version I have implemented most recently. The application receives emails. Historically, a human read each one and assigned it to the right queue, the right agent, the right priority. With a small language model — Claude Haiku, which is fast and cheap — you can write a classifier prompt that reads the email, outputs a JSON structure with category, priority, and summary, and routes automatically with better than 90% accuracy on well-structured prompts.

The integration point is surgical. One new service. One new database column for the classification result. One new pipeline stage between "email received" and "email in queue." The rest of the application — the queue, the agent interface, the reporting — is unchanged.

The prompt structure that produces reliable JSON:

\`\`\`
Classify this email. Respond ONLY with valid JSON, no other text.

Schema:
{
  "category": "billing" | "support" | "sales" | "spam" | "other",
  "priority": "high" | "medium" | "low",
  "summary": string (max 100 chars),
  "confidence": number (0.0 to 1.0)
}

Email:
---
{email_content}
\`\`\`

Low confidence results go to a human review queue. High confidence results route automatically. After a month of operation, you review the human review queue to identify prompt improvements. The system gets better without retraining anything.

## The Mock Mode Requirement

Any AI integration needs a mock mode. This is not optional.

Development environments that make real API calls are slow to iterate on, expensive at scale, and unpredictable in test runs. Every AI integration I build has a \`MOCK_MODE\` flag. When it is set, the AI service returns a deterministic mock response instead of making an API call. The mock response is valid enough to exercise downstream code. The real API is only called in integration tests and production.

This is the same principle I apply to external APIs generally — the mock-forge pattern where a service adapts between real and mock implementations based on environment — applied to AI specifically. The LLM is just another external dependency. Treat it like one.

## Vector Search: Adding Semantic Capability to Existing Data

pgvector is a PostgreSQL extension that adds a vector column type and similarity search operators. This means you can add semantic search to an existing PostgreSQL database without a new infrastructure component, a new database technology to operate, or a significant schema migration.

The workflow: when a document is created or updated, generate an embedding for it (a vector representation of its semantic content) using an embedding model, and store that vector in a \`content_embedding\` column. When a user searches, generate an embedding for their query and find the rows with the most similar vectors.

\`\`\`sql
-- Find the 10 most semantically similar posts to a query vector
SELECT id, title, excerpt,
       1 - (content_embedding <=> $1::vector) AS similarity
FROM posts
WHERE status = 'published'
ORDER BY content_embedding <=> $1::vector
LIMIT 10;
\`\`\`

This gives you semantic search — finding content by meaning rather than keyword match — on top of your existing PostgreSQL database. The operational complexity added is: one additional API call to generate embeddings on write, one additional column per table you want to search, one index on that column.

The tradeoff: embedding generation adds latency to write operations. Embedding API calls cost money. For high-write-volume systems, you want to generate embeddings asynchronously rather than in the request path.

## What Does Not Work: AI As The Architecture

The integration approaches above work because they are additive. They add a capability to an existing system without replacing the system's existing logic.

What consistently fails in my observation is AI positioned as the architecture — systems where LLM calls are in the critical path of every user interaction, where the system's correctness depends on the reliability and consistency of model outputs, where there is no fallback when the model returns something unexpected.

LLMs are not deterministic. They are expensive relative to database queries. They have latency that is orders of magnitude higher than a cache hit. Designing a system where user-facing functionality blocks on an LLM call without a fallback is designing a system for the demo, not for production.

The pattern that works: AI in the background, improving results, classifying, summarizing, suggesting. Not AI in the foreground, blocking on inference, returning results that cannot be validated.

## The Self-Hosted Option

For applications with data residency requirements, privacy constraints, or cost sensitivity at scale, Ollama running local models is now a serious option. Models like Llama 3, Phi-3, and Mistral run on hardware that is available in standard cloud configurations. The quality gap between frontier models and local models has narrowed significantly for specific, well-defined tasks.

My current local AI stack for development: Ollama serving models locally, Open WebUI as an interface for prompt testing, ChromaDB for vector storage, LiteLLM proxying everything. Production routing goes to Anthropic for quality-critical tasks and Ollama for high-volume classification tasks where the model quality tradeoff is acceptable and the cost difference is not.

The self-hosted option is not yet the right answer for everything. It is the right answer for more things than it was a year ago and will be the right answer for more things still a year from now.
  `.trim(),
},

// ══════════════════════════════════════════════════════════════════════════
// POST 10
// ══════════════════════════════════════════════════════════════════════════
{
  slug: 'the-questions-ai-forces-us-to-ask-that-we-are-not-asking',
  title: 'The Questions AI Forces Us to Ask That We Are Not Asking',
  subtitle: 'I am going to be blunt about this because I think the softness is the problem.',
  excerpt: 'There is a version of the AI ethics conversation that happens in the places where this conversation is supposed to happen — policy papers, academic conferences, responsible AI frameworks published by the companies building the systems — and it is not moving fast enough, not by a significant margin.',
  readingTime: 11,
  isFeatured: true,
  isPinned: true,
  tags: ['ai-ethics', 'technology', 'opinion'],
  content: `
## A Note Before I Start

I am going to be blunt about this. I think the softness — the careful hedging, the "on one hand / on the other hand" framing that dominates most public discourse about AI ethics — is itself part of the problem. The people who are building these systems are moving fast. The discourse about the implications is moving slowly. And the gap between those two speeds is where the damage happens.

I am a software engineer with eleven years of production experience and a strong working knowledge of what these systems actually do. I am not a philosopher. I am not a policy expert. What I have is a practitioner's understanding of the technology and a genuinely alarmed perspective on the questions we are treating as future problems rather than current ones.

This is not a post about whether AI will take your job. That conversation, while real, is also a distraction from the questions that are harder and more important.

## The Consent Question

Every large language model currently in production was trained on data that was not consented to.

Let me be precise about what I mean. The Common Crawl dataset — a primary training source for most large models — contains text scraped from every publicly accessible corner of the internet. Personal essays. Forum posts where people disclosed medical diagnoses. Fiction written by authors who never imagined it would be ingested as training material. Code written by developers who open-sourced their work under licenses that do not obviously contemplate this use.

The argument made by the companies building these systems is that publicly available means implicitly consented to. This argument is coherent enough to have survived legal scrutiny so far. It is also, I think, deeply uncomfortable if you take it seriously.

Public availability and consent are not the same thing. If I write a blog post describing my experience with a chronic illness and someone reads it, I have consented to that. If that same post is used to train a system that generates medical content for thousands of other users, I have not been consulted about that use. The nature of the use is categorically different, and the assumption that public availability covers both uses is a legal convenience, not an ethical argument.

The consent question is not going away. It is going to get harder as training data becomes scarcer, as models become more capable, and as the value extracted from that data becomes more clearly quantifiable. We do not have a framework for this. We need one and the people building the systems have a strong commercial interest in making sure we do not develop one that inconveniences them.

## The Accountability Gap

When an AI system makes a consequential mistake — a medical triage tool misclassifies a symptom, a hiring algorithm discriminates by proxy, a credit scoring model produces systematically biased outputs — who is responsible?

Currently: nobody, in any meaningful sense. The model developer disclaims responsibility through terms of service. The company that integrated the model disclaims responsibility by pointing to the model developer. The end user who was harmed has no clear recourse and often no knowledge that an AI system was involved in the decision that affected them.

This accountability gap is not an accident. It is a structural feature of how these systems have been deployed, and it is going to remain a structural feature until legal frameworks catch up to the technology. The EU AI Act is a meaningful start. It will not be enough.

Here is what concerns me specifically as someone who builds these integrations: the companies deploying AI systems in consequential domains — healthcare, legal, employment, financial services — are moving fast, and the regulatory environment is moving slow, and in that gap, real harm is accumulating. Biased hiring decisions. Incorrect medical recommendations. Discriminatory credit denials. These are not hypothetical. They are documented and ongoing.

The defense that AI systems are no more biased than human systems — which is sometimes true and sometimes not — misses the point. The scale at which AI systems make decisions means that systematic biases are amplified beyond anything a human system could produce. A biased human hiring manager makes biased decisions at a rate limited by the number of applications they can review. A biased AI system makes biased decisions at a rate limited only by compute.

## The Labour Question Nobody Wants to Have

I will not pretend I do not have professional self-interest here. I am a software engineer and AI systems are being deployed to do things that software engineers have historically done. I am aware of the conflict of interest.

But I also think the labour question is being handled dishonestly, and the dishonesty deserves naming.

The argument being made by the largest technology companies is that AI will not replace jobs, it will augment workers and create new categories of work. This argument has historical analogues — it was made about computers, about the internet, about automation generally — and those analogues are informative in complicated ways. The internet did create new categories of work. It also devastated entire industries with a speed that left affected communities with inadequate time to adapt and inadequate support when they did not.

The difference this time is the breadth and speed of the disruption. Previous automation waves affected specific, categorizable job types — assembly line work, clerical data entry, telephone operators. AI is affecting work across the full cognitive spectrum, from routine cognitive tasks to creative work, from customer service to software development, from legal research to medical diagnosis.

The ethical question is not "will AI create net new jobs." It might. It probably will, eventually. The ethical question is: who bears the cost of the transition, and who captures the value? Because those answers are different. The value is concentrating rapidly. The transition costs — lost jobs, retraining requirements, wage pressure, psychological impact of economic uncertainty — are distributed much more broadly.

We are not having an honest conversation about this distribution. The companies capturing the value are funding think tanks and commissioning research that supports optimistic transition narratives. The people bearing the transition costs do not have equivalent resources for counter-narrative. This asymmetry in the public conversation is itself an ethical problem.

## The Autonomy and Manipulation Problem

I build software that uses AI to classify emails, summarize content, suggest responses, and route information. These are relatively benign applications. The same underlying capabilities — understanding language, modeling intent, predicting response — are also the capabilities that power recommendation systems optimized for engagement rather than wellbeing, political advertising personalization at scale, and chatbots designed to form emotional attachments with vulnerable users.

The line between helpful personalization and manipulative persuasion is not always clear. What is clear is that the same technical capabilities enable both, that the commercial incentives generally favor the latter, and that users frequently do not know which side of that line the system they are interacting with is on.

Autonomy — the capacity of people to make decisions based on their own reasoning rather than on reasoning that has been shaped by systems they cannot see — is a foundational liberal value. AI systems that are designed to influence belief and behavior, at scale, without disclosure, are a direct challenge to that value. The social media industry already demonstrated what happens when recommendation algorithms are optimized for engagement: polarization, radicalization, documented harm to mental health, particularly in adolescents.

AI capabilities amplify this problem by an order of magnitude. More personalized. More persuasive. More difficult to detect. The answer cannot be "trust the companies deploying these systems to self-regulate." That trust has already been forfeited.

## What I Think Engineers Specifically Should Do

I am writing this for engineers in particular because I think we carry specific responsibility that we are not always willing to acknowledge.

We build these systems. Not in the abstract — specifically, the people reading this build integrations, APIs, features, and products that incorporate AI. The decisions we make in that work — what data we use, how we handle bias testing, whether we implement explainability, whether we disclose AI involvement to end users, whether we push back when the product decision is unethical — those decisions matter.

The "just an engineer following instructions" defense was not sufficient at Nuremberg and it is not sufficient here. I say that knowing it is a strong comparison. I make it deliberately because I think the casual acceptance of ethical responsibility transfer — "the company decided, I just built it" — is a serious moral error that we as a profession have not adequately examined.

Concretely:

**Disclose.** If the product you are building uses AI to make or influence a decision that affects users, those users should know. This is a product decision, but you can advocate for it.

**Test for bias.** Before deploying a classification system, test it against representative data segmented by the demographic dimensions relevant to your use case. Document the results. If the results are unacceptable, say so.

**Build opt-outs.** AI-assisted features should be opt-outable for users who prefer human interaction or human decision-making. This is both ethically correct and, increasingly, legally required.

**Hold the line on consequential domains.** If you are asked to deploy AI in contexts — medical, legal, child welfare, criminal justice — where errors have irreversible consequences and human oversight is being removed rather than augmented, push back. Hard.

## The Conversation We Are Not Having

The AI ethics conversation that happens in the mainstream is largely either "AI is going to kill us all" or "AI is going to save us all." Both are content-marketing framings for the actual discussion, which is quieter, harder, and more important.

The actual discussion is about power. Who controls the systems. Who decides how they are trained. Who captures the economic value. Who bears the costs when they fail. Who has recourse when they cause harm.

These are not new questions. They are the same questions that have organized social and political life for centuries, now instantiated in a new technology context. The technology is new. The questions are ancient. The reason we are having trouble with the answers is that the technology is moving faster than our institutional capacity to apply those ancient lessons.

I do not have a clean conclusion for this. I am genuinely uncertain about how this turns out. What I am certain about is that the uncertainty is not a reason for engineers to disengage from the question. It is a reason to engage with it more seriously, more honestly, and more urgently than the current pace of that engagement reflects.

We are building the thing. We have some responsibility for what it becomes.
  `.trim(),
},

]; // end POSTS array

// ── Seed runner ───────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱  Seeding 10 blog posts...\n');

  // Get the ghost author
  const authorRow = await getPool().query<{ id: string }>(
    `SELECT id FROM authors WHERE username = 'ghost' LIMIT 1`
  );
  if (!authorRow.rows[0]) {
    throw new Error('Ghost author not found — run base seed first');
  }
  const authorId = authorRow.rows[0].id;

  // Ensure all tags exist
  const tagIds: Record<string, string> = {};
  for (const tag of NEW_TAGS) {
    const res = await query<{ id: string }>(
      `INSERT INTO tags (name, slug, color, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [tag.name, tag.slug, tag.color, tag.description]
    );
    tagIds[tag.slug] = res.rows[0].id;
    console.log(`  ✓ Tag: ${tag.name}`);
  }

  // Fetch existing tag IDs from base seed
  const existingTags = await getPool().query<{ id: string; slug: string }>(
    `SELECT id, slug FROM tags`
  );
  for (const row of existingTags.rows) {
    tagIds[row.slug] = row.id;
  }

  console.log('');

  // Insert posts
  for (const post of POSTS) {
    const res = await query<{ id: string }>(
      `INSERT INTO posts (
         slug, title, subtitle, excerpt, content, reading_time_minutes,
         is_featured, is_pinned, author_id, status, published_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'published', NOW() - (random() * interval '60 days'))
       ON CONFLICT (slug) DO UPDATE SET
         title    = EXCLUDED.title,
         subtitle = EXCLUDED.subtitle,
         excerpt  = EXCLUDED.excerpt,
         content  = EXCLUDED.content
       RETURNING id`,
      [
        post.slug, post.title, post.subtitle, post.excerpt, post.content,
        post.readingTime, post.isFeatured, post.isPinned, authorId,
      ]
    );
    const postId = res.rows[0].id;

    for (const tagSlug of post.tags) {
      if (tagIds[tagSlug]) {
        await query(
          `INSERT INTO post_tags (post_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [postId, tagIds[tagSlug]]
        );
      } else {
        console.warn(`  ⚠ Unknown tag slug: ${tagSlug}`);
      }
    }

    console.log(`  ✓ "${post.title}"`);
  }

  console.log('\n✅  10 posts seeded successfully.');
  await closePool();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});