import React, { useState, useEffect } from 'react';
import type { RealtimePostStats } from '@fakeintellect/types';

interface Props {
  postId: string;
  initialStats: RealtimePostStats;
}

export default function PostReactions({ postId, initialStats }: Props) {
  const [stats, setStats] = useState<RealtimePostStats>(initialStats ?? {
    viewCount: 0, likeCount: 0, commentCount: 0, activeReaders: 0,
  });
  const [liked, setLiked] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);

  // Try to connect to Firebase for live updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function connectFirebase() {
      try {
        const { initializeApp, getApps } = await import('firebase/app');
        const { getDatabase, ref, onValue } = await import('firebase/database');

        const firebaseConfig = (window as any).__FIREBASE_CONFIG__;
        if (!firebaseConfig) return;

        const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const statsRef = ref(db, `post_stats/${postId}`);

        onValue(statsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) setStats(data);
        });

        unsubscribe = () => {};
      } catch {
        // Firebase not available, use initial stats
      }
    }

    connectFirebase();
    return () => unsubscribe?.();
  }, [postId]);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikeAnimation(true);
    setStats((s) => ({ ...s, likeCount: s.likeCount + 1 }));

    setTimeout(() => setLikeAnimation(false), 600);

    await fetch(`/api/v1/posts/${postId}/like`, { method: 'POST' }).catch(() => {});
  };

  const monoFont = 'ui-monospace, monospace';
  const accentColor = '#a3e635';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      padding: '1rem 1.5rem',
      border: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      {/* Like button */}
      <button
        onClick={handleLike}
        style={{
          background: liked ? `${accentColor}18` : 'transparent',
          border: `1px solid ${liked ? accentColor + '50' : 'rgba(255,255,255,0.12)'}`,
          padding: '0.5rem 1rem',
          cursor: liked ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: monoFont,
          fontSize: '0.8rem',
          color: liked ? accentColor : '#8a8580',
          transition: 'all 0.3s ease',
          transform: likeAnimation ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        <span style={{ fontSize: '1rem', transition: 'transform 0.3s', transform: likeAnimation ? 'scale(1.4)' : 'scale(1)' }}>
          {liked ? '♥' : '♡'}
        </span>
        <span>{stats.likeCount.toLocaleString()}</span>
      </button>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {[
          { icon: '👁', value: stats.viewCount.toLocaleString(), label: 'views' },
          { icon: '💬', value: stats.commentCount.toLocaleString(), label: 'comments' },
          ...(stats.activeReaders > 0
            ? [{ icon: '●', value: stats.activeReaders.toString(), label: 'reading now' }]
            : []),
        ].map(({ icon, value, label }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontFamily: monoFont, fontSize: '0.75rem', color: '#6b6560',
          }}>
            <span style={{ fontSize: '0.85rem' }}>{icon}</span>
            <span style={{ color: '#a8a29e' }}>{value}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
