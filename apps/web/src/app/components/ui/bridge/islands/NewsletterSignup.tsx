import React, { useState } from 'react';

type State = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('error');
      setMessage('A valid email is required. We promise not to be annoying.');
      return;
    }

    setState('loading');
    try {
      const res = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (res.ok) {
        setState('success');
        setMessage(data.message ?? 'Subscribed!');
      } else {
        setState('error');
        setMessage(data.message ?? 'Something went wrong.');
      }
    } catch {
      setState('error');
      setMessage('Network error. Try again.');
    }
  };

  const accentColor = '#a3e635';

  return (
    <div
      style={{
        border: '1px solid rgba(163,230,53,0.2)',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(163,230,53,0.03) 0%, transparent 60%)',
      }}
    >
      {/* Decorative corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '120px', height: '120px',
        borderLeft: `1px solid ${accentColor}20`,
        borderBottom: `1px solid ${accentColor}20`,
      }} />

      <div style={{ maxWidth: '640px' }}>
        <div style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: accentColor,
          marginBottom: '1rem',
        }}>
          Dispatches from the uncertainty frontier
        </div>

        <h2 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: '2.25rem',
          fontWeight: 700,
          color: '#e8e6e1',
          marginBottom: '0.75rem',
          lineHeight: 1.2,
        }}>
          Subscribe, if you dare.
        </h2>

        <p style={{
          color: '#8a8580',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}>
          New essays, irregular intervals, no nonsense. We are well aware of the irony
          of a blog about overconfidence having a newsletter.
        </p>

        {state === 'success' ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1.5rem',
            border: `1px solid ${accentColor}40`,
            background: `${accentColor}10`,
          }}>
            <span style={{ color: accentColor, fontSize: '1.5rem' }}>✓</span>
            <span style={{
              fontFamily: 'ui-monospace, monospace', fontSize: '0.875rem', color: '#e8e6e1'
            }}>
              {message}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '0.875rem 1rem',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.875rem',
                color: '#e8e6e1',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = accentColor + '80')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
            />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: `1px solid ${state === 'error' ? '#ef4444' : 'rgba(255,255,255,0.12)'}`,
                  padding: '0.875rem 1rem',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '0.875rem',
                  color: '#e8e6e1',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = accentColor + '80')}
                onBlur={(e) => (e.target.style.borderColor = state === 'error' ? '#ef4444' : 'rgba(255,255,255,0.12)')}
              />
              <button
                onClick={handleSubmit}
                disabled={state === 'loading'}
                style={{
                  background: state === 'loading' ? 'rgba(163,230,53,0.5)' : accentColor,
                  color: '#0a0a0a',
                  border: 'none',
                  padding: '0 1.5rem',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: state === 'loading' ? 'wait' : 'pointer',
                  transition: 'opacity 0.2s',
                  minWidth: '100px',
                }}
              >
                {state === 'loading' ? '...' : 'Subscribe'}
              </button>
            </div>

            {state === 'error' && (
              <p style={{ color: '#ef4444', fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem' }}>
                {message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
