import { useEffect, useRef, useState } from 'react';

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function AnimatedCounter({ target }) {
  const [val, setVal] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const start = Date.now();
    const duration = 800;
    const run = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.round(easeOut(progress) * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(run);
    };
    frameRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target]);

  return <span>₹{val.toLocaleString('en-IN')}</span>;
}

export default function StatsCard({ title, value, icon, color, delay = 0 }) {
  const bgMap = {
    '#f87171': 'rgba(248,113,113,0.15)',
    '#22d3a0': 'rgba(34,211,160,0.15)',
    '#6c63ff': 'rgba(108,99,255,0.15)',
    '#fbbf24': 'rgba(251,191,36,0.15)',
    '#60a5fa': 'rgba(96,165,250,0.15)',
  };
  const bg = bgMap[color] || 'rgba(108,99,255,0.12)';

  return (
    <div className="stats-card-wrap" style={{ animationDelay: `${delay}ms` }}>
      <div className="stats-card-icon" style={{ background: bg }}>
        <span style={{ filter: 'none' }}>{icon}</span>
      </div>
      <div className="stats-card-label">{title}</div>
      <div className="stats-card-value" style={{ color }}>
        {typeof value === 'number' ? (
          title.toLowerCase().includes('count') || title.toLowerCase().includes('#')
            ? value
            : <AnimatedCounter target={value} />
        ) : value}
      </div>
    </div>
  );
}
