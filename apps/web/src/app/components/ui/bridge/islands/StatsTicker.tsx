import React, { useEffect, useState } from 'react';

const TICKER_ITEMS = [
  '✦ confidence ≠ correctness',
  '◆ all opinions provisional',
  '✦ citations available upon demand',
  '◆ this essay will age poorly',
  '✦ the author knows less than implied',
  '◆ reading is not endorsement',
  '✦ nuance preserved where possible',
  '◆ updated when wrong, which is often',
  '✦ opinions expressed are the author\'s own, unfortunately',
  '◆ side effects include: reconsidering everything',
];

export default function StatsTicker() {
  const [offset, setOffset] = useState(0);
  const itemWidth = 340;

  useEffect(() => {
    const id = setInterval(() => {
      setOffset((prev) => {
        const next = prev - 1;
        return next <= -(TICKER_ITEMS.length * itemWidth) ? 0 : next;
      });
    }, 25);
    return () => clearInterval(id);
  }, []);

  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <div
        style={{
          display: 'inline-flex',
          transform: `translateX(${offset}px)`,
          willChange: 'transform',
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: i % 2 === 0 ? '#a3e635' : '#6b6560',
              paddingRight: '3rem',
              minWidth: `${itemWidth}px`,
              display: 'inline-block',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
