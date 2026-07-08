import React, { useState, useEffect, useRef } from 'react';
import type { PostSummary } from '@fakeintellect/types';
import { TimeInterval } from 'rxjs/internal/operators/timeInterval';

interface Props {
  onClose?: () => void;
}

export default function SearchModal({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    inputRef.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/posts?search=${encodeURIComponent(query)}&pageSize=5`);
        const data = await res.json();
        setResults(data.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const monoFont = 'ui-monospace, monospace';
  const accentColor = '#a3e635';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div style={{
        width: '100%', maxWidth: '640px', margin: '0 1rem',
        border: '1px solid rgba(255,255,255,0.12)',
        background: '#111',
        overflow: 'hidden',
      }}>
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ color: '#6b6560', fontSize: '1rem' }}>⌕</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search essays..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontFamily: monoFont, fontSize: '0.9rem', color: '#e8e6e1',
            }}
          />
          {loading && <span style={{ fontFamily: monoFont, fontSize: '0.7rem', color: '#4a4540' }}>searching...</span>}
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.08)',
            color: '#6b6560', fontFamily: monoFont, fontSize: '0.65rem',
            padding: '0.2rem 0.4rem', cursor: 'pointer',
          }}>ESC</button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {results.map((post) => (
              <a
                key={post.id}
                href={`/posts/${post.slug}`}
                style={{
                  display: 'block', padding: '1rem 1.25rem', textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(163,230,53,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: '1rem', color: '#e8e6e1', marginBottom: '0.25rem',
                }}>
                  {post.title}
                </div>
                <div style={{ fontFamily: monoFont, fontSize: '0.7rem', color: '#6b6560' }}>
                  {post.readingTimeMinutes}m · {post.author.displayName}
                </div>
              </a>
            ))}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', fontFamily: monoFont, fontSize: '0.75rem', color: '#4a4540' }}>
            No results for "{query}" — try different words
          </div>
        )}

        {!query && (
          <div style={{ padding: '1.25rem', fontFamily: monoFont, fontSize: '0.7rem', color: '#4a4540' }}>
            Start typing to search essays...
          </div>
        )}
      </div>
    </div>
  );
}
