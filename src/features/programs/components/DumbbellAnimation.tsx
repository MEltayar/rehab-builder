import { useMemo } from 'react';

const ICONS = [
  '🏋️', '🏋️‍♂️', '🏋️‍♀️', '💪', '🥊', '⚡', '🔥', '🎯',
  '🏆', '🥇', '💪', '🏋️', '⚡', '🔥', '🎽', '🏃‍♂️',
];

function seeded(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function DumbbellAnimation({ count = 20 }: { count?: number }) {
  const items = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      icon: ICONS[i % ICONS.length],
      left: `${seeded(i * 3) * 100}%`,
      size: `${16 + seeded(i * 7) * 22}px`,
      duration: `${9 + seeded(i * 5) * 11}s`,
      delay: `${seeded(i * 11) * 14}s`,
      opacity: 0.07 + seeded(i * 13) * 0.1,
      drift: (seeded(i * 17) - 0.5) * 60,
    })),
  [count]);

  return (
    <>
      <style>{`
        @keyframes dumbbell-float {
          0%   { transform: translateY(110vh) translateX(0px)   rotate(0deg);   }
          50%  { transform: translateY(50vh)  translateX(var(--drift)) rotate(180deg); }
          100% { transform: translateY(-80px) translateX(0px)   rotate(360deg); }
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}
      >
        {items.map((item) => (
          <span
            key={item.id}
            style={{
              position: 'absolute',
              bottom: '-80px',
              left: item.left,
              fontSize: item.size,
              opacity: item.opacity,
              animation: `dumbbell-float ${item.duration} ${item.delay} infinite linear`,
              '--drift': `${item.drift}px`,
              userSelect: 'none',
            } as React.CSSProperties}
          >
            {item.icon}
          </span>
        ))}
      </div>
    </>
  );
}
