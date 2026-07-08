import React, { useState, useEffect } from 'react';
import type { Comment, CreateCommentPayload } from '@fakeintellect/types';

interface Props {
  postSlug: string;
}

const accentColor = '#a3e635';
const monoFont = 'ui-monospace, monospace';
const serifFont = '"Playfair Display", Georgia, serif';

function CommentItem({ comment, postSlug, depth = 0 }: {
  comment: Comment; postSlug: string; depth?: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(comment.likeCount);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLocalLikes((n) => n + 1);
    await fetch(`/api/v1/comments/${comment.id}/like`, { method: 'POST' }).catch(() => {});
  };

  const date = new Date(comment.createdAt).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div style={{ paddingLeft: depth > 0 ? '1.5rem' : 0, borderLeft: depth > 0 ? `1px solid rgba(255,255,255,0.06)` : 'none', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.875rem' }}>
        {/* Avatar */}
        <div style={{
          width: '32px', height: '32px', flexShrink: 0,
          border: `1px solid ${accentColor}30`,
          background: `${accentColor}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: monoFont, fontSize: '0.75rem', color: accentColor,
        }}>
          {comment.authorName.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: monoFont, fontSize: '0.8rem', color: '#e8e6e1' }}>
              {comment.authorName}
            </span>
            <span style={{ fontFamily: monoFont, fontSize: '0.7rem', color: '#4a4540' }}>
              {date}
            </span>
          </div>

          {/* Content */}
          <p style={{ color: '#a8a29e', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>
            {comment.content}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <button
              onClick={handleLike}
              style={{
                background: 'none', border: 'none', cursor: liked ? 'default' : 'pointer',
                fontFamily: monoFont, fontSize: '0.7rem',
                color: liked ? accentColor : '#6b6560',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                transition: 'color 0.2s',
                padding: 0,
              }}
            >
              ♥ {localLikes}
            </button>
            {depth === 0 && (
              <button
                onClick={() => setReplyOpen((o) => !o)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: monoFont, fontSize: '0.7rem',
                  color: replyOpen ? accentColor : '#6b6560',
                  letterSpacing: '0.05em', padding: 0,
                  transition: 'color 0.2s',
                }}
              >
                {replyOpen ? 'cancel' : 'reply'}
              </button>
            )}
          </div>

          {/* Reply form */}
          {replyOpen && (
            <CommentForm
              postSlug={postSlug}
              parentId={comment.id}
              onSubmit={() => setReplyOpen(false)}
              compact
            />
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} postSlug={postSlug} depth={depth + 1} />
      ))}
    </div>
  );
}

function CommentForm({
  postSlug, parentId, onSubmit, compact = false
}: {
  postSlug: string; parentId?: string; onSubmit?: () => void; compact?: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/v1/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: name, authorEmail: email, content, parentId }),
      });
      setDone(true);
      setName(''); setEmail(''); setContent('');
      onSubmit?.();
    } catch {
      // handle
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '0.625rem 0.875rem',
    fontFamily: monoFont,
    fontSize: '0.8rem',
    color: '#e8e6e1',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  };

  if (done) {
    return (
      <p style={{ fontFamily: monoFont, fontSize: '0.75rem', color: accentColor, marginTop: '1rem' }}>
        ✓ Comment submitted — it will appear after review.
      </p>
    );
  }

  return (
    <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {!compact && (
        <p style={{ fontFamily: monoFont, fontSize: '0.7rem', color: '#6b6560', letterSpacing: '0.05em' }}>
          LEAVE A COMMENT — moderated, not censored
        </p>
      )}
      {!compact && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          <input placeholder="Email (not published)" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        </div>
      )}
      {compact && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        </div>
      )}
      <textarea
        placeholder="Say something. Make it interesting."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={compact ? 2 : 4}
        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
      />
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          background: accentColor,
          color: '#0a0a0a',
          border: 'none',
          padding: '0.625rem 1.5rem',
          fontFamily: monoFont,
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: submitting ? 'wait' : 'pointer',
          alignSelf: 'flex-start',
          opacity: submitting ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {submitting ? '...' : 'Submit'}
      </button>
    </div>
  );
}

export default function CommentThread({ postSlug }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/posts/${postSlug}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(data.data ?? []))
      .finally(() => setLoading(false));
  }, [postSlug]);

  return (
    <div style={{ fontFamily: serifFont }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem',
        paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h3 style={{
          fontFamily: serifFont, fontSize: '1.5rem', color: '#e8e6e1', margin: 0
        }}>
          Responses
        </h3>
        <span style={{
          fontFamily: monoFont, fontSize: '0.75rem', color: '#6b6560',
          border: '1px solid rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem',
        }}>
          {comments.length}
        </span>
      </div>

      {/* Comments */}
      {loading ? (
        <div style={{ fontFamily: monoFont, fontSize: '0.75rem', color: '#4a4540' }}>
          loading responses...
        </div>
      ) : comments.length === 0 ? (
        <div style={{
          padding: '2rem', border: '1px dashed rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: monoFont, fontSize: '0.75rem', color: '#4a4540' }}>
            No responses yet. Be the first to be wrong in public.
          </p>
        </div>
      ) : (
        <div>
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} postSlug={postSlug} />
          ))}
        </div>
      )}

      {/* New comment form */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <CommentForm postSlug={postSlug} />
      </div>
    </div>
  );
}
