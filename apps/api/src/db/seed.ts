import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { getPool, closePool, query } from './pool';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const TAGS = [
  { name: 'Philosophy', slug: 'philosophy', color: '#8b5cf6', description: 'Thinking about thinking' },
  { name: 'Technology', slug: 'technology', color: '#06b6d4', description: 'The machines are learning' },
  { name: 'Culture', slug: 'culture', color: '#f59e0b', description: 'What we are becoming' },
  { name: 'Science', slug: 'science', color: '#10b981', description: 'Evidence-based wandering' },
  { name: 'Opinion', slug: 'opinion', color: '#ef4444', description: 'Wrong, but confidently' },
  { name: 'Satire', slug: 'satire', color: '#f97316', description: 'Funny because it is true' },
];

const SEED_CONTENT = `
## The Premise

We live in an era of **performative expertise** — where the confidence of the explanation has entirely decoupled from the accuracy of the claim. Everyone has a hot take. Nobody has footnotes.

This is not a problem. This is, in fact, the human condition wearing new clothes.

## What We Actually Mean

Fake intellect is not stupidity in disguise. It is *the impulse to sound reasoned while reasoning poorly* — a phenomenon that predates the internet, predates literacy, predates language itself if we are being generous.

The caveman who explained thunder as "sky angry" was doing fake intellect. The medieval scholar who explained plague as "bad air" was doing fake intellect. The LinkedIn thought leader explaining disruption as a \`paradigm oscillation\` is, perhaps, doing the finest fake intellect the species has yet produced.

## Why This Site Exists

Because the antidote to fake intellect is not *more* intellect — it is \`self-awareness\`.

We write here with the full knowledge that:
1. We are probably wrong about some of this
2. We are definitely overconfident about most of this
3. The writing is better for acknowledging both

Pull up a chair. Pretend you know things. We will fit right in.
`;

async function seed() {
  console.log('🌱  Seeding database...');

  // Create author
  const passwordHash = await bcrypt.hash('fakeintellect2024!', 12);
  const authorResult = await query(
    `INSERT INTO authors (username, display_name, email, password_hash, bio, twitter_handle, github_handle, is_admin)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
     RETURNING id`,
    ['ghost', 'The Ghost Writer', 'ghost@fakeintellect.ca', passwordHash,
     'Professionally ambiguous. Occasionally right. Always opinionated.', 'fakeintellect', 'fakeintellect', true]
  );
  const authorId = authorResult.rows[0].id;
  console.log(`  ✓ Author: ${authorId}`);

  // Create tags
  const tagIds: Record<string, string> = {};
  for (const tag of TAGS) {
    const res = await query(
      `INSERT INTO tags (name, slug, color, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [tag.name, tag.slug, tag.color, tag.description]
    );
    tagIds[tag.slug] = res.rows[0].id;
  }
  console.log('  ✓ Tags created');

  // Create sample posts
  const posts = [
    {
      slug: 'welcome-to-fake-intellect',
      title: 'Welcome to Fake Intellect',
      subtitle: 'A blog for the confidently uncertain',
      excerpt: 'We are all just making this up as we go. The least we can do is be articulate about it.',
      content: SEED_CONTENT,
      readingTime: 4,
      isFeatured: true,
      isPinned: true,
      tags: ['philosophy', 'culture'],
    },
    {
      slug: 'ai-thinks-therefore-i-am-confused',
      title: 'AI Thinks, Therefore I Am Confused',
      subtitle: 'Notes from the philosophical wreckage',
      excerpt: 'The question is no longer whether machines can think. The question is whether thinking ever meant what we thought it did.',
      content: `## On Definitions\n\nDescartes said *cogito ergo sum* — I think therefore I am. He said this from a warm room, in France, before electricity.\n\nHe did not say it after watching a language model write a sonnet in his style, in his voice, with his cadences, in 1.3 seconds.\n\nWe are operating his philosophy on updated hardware.\n\n## The Actual Problem\n\nThe problem is not that machines think. The problem is that we never had a watertight definition of thinking in the first place — and the machines have now surfaced that sloppiness in an embarrassing way.\n\nConsider: what separates a "genuine" thought from a very sophisticated pattern match? Be specific. Use examples. Do not use the word "consciousness" without defining it.\n\nYou cannot. Neither can I. Neither could Descartes, if he was being honest after his third glass of wine.\n\n## A Modest Proposal\n\nLet us agree that "thinking" is a *spectrum*, not a binary. That machines occupy a strange new position on that spectrum. That this is interesting rather than threatening.\n\nOr, alternatively, let us panic. Both responses are historically well-supported.`,
      readingTime: 6,
      isFeatured: true,
      isPinned: false,
      tags: ['philosophy', 'technology'],
    },
    {
      slug: 'the-linkedin-glossary',
      title: 'The Definitive LinkedIn Glossary',
      subtitle: 'A translation guide for the modern professional',
      excerpt: 'Every platform develops its own dialect. LinkedIn developed several, none of which mean anything.',
      content: `## Terms and Their Translations\n\n**Synergy**: We put two things near each other.\n\n**Paradigm shift**: Something changed.\n\n**Thought leadership**: Having opinions while employed.\n\n**Disruptive innovation**: A product that exists.\n\n**Ecosystem**: More than one company.\n\n**Circle back**: A meeting about the meeting.\n\n**Bandwidth**: Time, but corporate.\n\n**Leverage**: Use (verb), used by people who cannot stop themselves.\n\n**Alignment**: Everyone in the room nodded.\n\n**Value add**: The thing the product does.\n\n**Learnings**: Things you learned, pluralized unnecessarily.\n\n**Impactful**: Had impact. The "-ful" is silent in its meaning.\n\n## Usage in the Wild\n\n*"We need to leverage our synergies to create a disruptive paradigm shift that adds value to our ecosystem stakeholders."*\n\nTranslation: *"We should probably do something."*\n\nYou are welcome.`,
      readingTime: 3,
      isFeatured: false,
      isPinned: false,
      tags: ['satire', 'culture'],
    },
    {
      slug: 'on-the-aesthetics-of-knowing-nothing',
      title: 'On the Aesthetics of Knowing Nothing',
      subtitle: 'A defense of productive ignorance',
      excerpt: 'The Socratic method was essentially a man going around asking questions he already knew would embarrass people. We should do more of this.',
      content: `## The Underrated Virtue\n\nSocrates claimed to know nothing. This is obviously false — he knew geometry, rhetoric, the layout of Athens, and exactly how to make everyone at a dinner party uncomfortable.\n\nWhat he meant was that *claimed certainty* was the enemy of *actual understanding*. The person who knows they do not know has a significant structural advantage over the person who does not know that they do not know.\n\nThe latter person is, statistically, at every conference you have attended.\n\n## The Aesthetic Dimension\n\nThere is something beautiful about calibrated uncertainty. The scientist who says "the data suggests, though we cannot yet rule out..." is doing something aesthetically superior to the pundit who says "clearly, obviously, without question."\n\nThe beauty is in the *fit* — the epistemic claim scaled appropriately to the evidence. It is the same beauty as a well-fitted jacket, or a sentence that ends precisely where it should.\n\n## In Practice\n\nSaying "I don't know" is now a power move. The room full of people who all pretend to know will be disrupted by the one person who says clearly: "I am not certain about this."\n\nThey will assume expertise. They will be largely correct.`,
      readingTime: 5,
      isFeatured: false,
      isPinned: false,
      tags: ['philosophy', 'opinion'],
    },
  ];

  for (const post of posts) {
    const res = await query(
      `INSERT INTO posts (slug, title, subtitle, excerpt, content, reading_time_minutes,
                          is_featured, is_pinned, author_id, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'published',NOW())
       ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
       RETURNING id`,
      [post.slug, post.title, post.subtitle, post.excerpt, post.content,
       post.readingTime, post.isFeatured, post.isPinned, authorId]
    );
    const postId = res.rows[0].id;

    for (const tagSlug of post.tags) {
      if (tagIds[tagSlug]) {
        await query(
          `INSERT INTO post_tags (post_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [postId, tagIds[tagSlug]]
        );
      }
    }
    console.log(`  ✓ Post: "${post.title}"`);
  }

  console.log('\n✅  Seed complete!');
  console.log('   Admin login: ghost@fakeintellect.ca / fakeintellect2024!');
  await closePool();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
