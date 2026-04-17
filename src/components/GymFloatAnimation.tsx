import { useMemo } from 'react';

// Gym equipment emojis — a mix of training + energy icons
const GYM_ICONS = [
  '🏋️', '🏋️‍♂️', '🏋️‍♀️', '💪', '🥊', '🥋', '⚡', '🎯',
  '🔥', '💥', '🏃‍♂️', '🤸‍♂️', '🏋️', '💪', '🎽', '🥇',
  '🏆', '⚡', '🔥', '💪', '🏋️‍♂️', '🥊', '🎯', '🏃‍♀️',
];

interface FloatingItem {
  id: number;
  icon: string;
  left: string;
  fontSize: string;
  animDuration: string;
  animDelay: string;
  opacity: number;
  driftX: number; // horizontal drift in px
}

function seeded(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface GymFloatAnimationProps {
  /** Number of floating items. Default 24. */
  count?: number;
}

export default function GymFloatAnimation({ count = 24 }: GymFloatAnimationProps) {
  const items = useMemo<FloatingItem[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      icon: GYM_ICONS[i % GYM_ICONS.length],
      left: `${seeded(i * 3) * 100}%`,
      fontSize: `${16 + seeded(i * 7) * 24}px`,
      animDuration: `${10 + seeded(i * 5) * 12}s`,
      animDelay: `${seeded(i * 11) * 15}s`,
      opacity: 0.06 + seeded(i * 13) * 0.1,
      driftX: (seeded(i * 17) - 0.5) * 60,
    })),
  [count]);

  return (
    <>
      <style>{`
        @keyframes gym-float {
          0%   { transform: translateY(110vh) translateX(0px)   rotate(0deg);   }
          50%  { transform: translateY(50vh)  translateX(var(--drift))  rotate(180deg); }
          100% { transform: translateY(-80px) translateX(0px)   rotate(360deg); }
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {items.map((item) => (
          <span
            key={item.id}
            style={{
              position: 'absolute',
              bottom: '-80px',
              left: item.left,
              fontSize: item.fontSize,
              opacity: item.opacity,
              animation: `gym-float ${item.animDuration} ${item.animDelay} infinite linear`,
              '--drift': `${item.driftX}px`,
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
