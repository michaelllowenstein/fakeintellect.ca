import React, { useState } from 'react';
import type { PostSummary } from '@fakeintellect/types';

interface Props {
  posts: PostSummary[];
}

function PostCard({ post, index }: { post: PostSummary; index: number }): any {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      style={{
        border: `1px solid ${hovered ? post.tags[0]?.color + '80' : 'rgba(255,255,255,0.08)'}`,
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        animationDelay: `${index * 120}ms`,
      }}
      className="relative p-6 space-y-4 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { window.location.href = `/posts/${post.slug}`; }}
    >
      {/* Animated top border */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, height: '2px',
          backgroundColor: post.tags[0]?.color ?? '#a3e635',
          width: hovered ? '100%' : '0%',
          transition: 'width 0.4s ease',
        }}
      />

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {post.tags.slice(0, 2).map((tag) => (
          <span
            key={tag.id}
            style={{
              color: tag.color,
              borderColor: tag.color + '50',
              backgroundColor: tag.color + '12',
            }}
            className="font-mono text-xs px-2 py-0.5 border tracking-widest uppercase"
          >
            {tag.name}
          </span>
        ))}
        {post.isFeatured && (
          <span className="font-mono text-xs px-2 py-0.5 border border-yellow-500/30 text-yellow-400 bg-yellow-500/10 tracking-widest uppercase">
            Featured
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: index === 0 ? '1.5rem' : '1.125rem',
          lineHeight: 1.25,
          color: hovered ? post.tags[0]?.color ?? '#a3e635' : '#e8e6e1',
          transition: 'color 0.3s ease',
        }}
      >
        {post.title}
      </h3>

      {post.subtitle && (
        <p style={{ fontStyle: 'italic', color: '#8a8580', fontSize: '0.875rem' }}>
          {post.subtitle}
        </p>
      )}

      {/* Excerpt */}
      <p
        style={{
          color: '#6b6560',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {post.excerpt}
      </p>

      {/* Meta */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontFamily: 'ui-monospace, monospace',
        fontSize: '0.75rem',
        color: '#6b6560',
      }}>
        <span>{post.author.displayName}</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span>👁 {post.viewCount.toLocaleString()}</span>
          <span>{post.readingTimeMinutes}m read</span>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedPostsGrid({ posts }: Props) {
  if (!posts?.length) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: posts.length >= 3
          ? 'repeat(3, 1fr)'
          : `repeat(${posts.length}, 1fr)`,
        gap: '1.5rem',
      }}
      className="featured-grid"
    >
      <style>{`
        @media (max-width: 1024px) { .featured-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  { .featured-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} index={i} />
      ))}
    </div>
  ) as any;
}
