import React, { useState, useEffect } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '64px', // below navbar
      left: 0,
      width: '100%',
      height: '2px',
      background: 'rgba(255,255,255,0.04)',
      zIndex: 40,
      pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%',
        background: 'linear-gradient(90deg, #a3e635, #84cc16)',
        width: `${progress}%`,
        transition: 'width 0.1s linear',
        boxShadow: '0 0 8px rgba(163,230,53,0.5)',
      }} />
    </div>
  );
}
