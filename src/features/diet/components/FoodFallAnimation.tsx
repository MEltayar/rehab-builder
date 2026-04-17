import { useMemo } from 'react';

const FOOD_EMOJIS = [
  '🍎','🍊','🍋','🍇','🍓','🫐','🥝','🍑','🍒','🥭',
  '🍍','🥥','🥑','🥦','🥕','🧅','🥚','🥩','🍗','🧀',
  '🥜','🌽','🍅','🧄','🍌','🍐','🍈','🫒','🥬','🫑',
  '🍠','🥔','🧆','🥗','🥛','🫙','🥞','🍳','🥓','🥙',
];

interface FallingItem {
  id: number;
  emoji: string;
  left: string;
  fontSize: string;
  animationDuration: string;
  animationDelay: string;
  opacity: number;
}

// Seeded pseudo-random so items are stable across renders
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function FoodFallAnimation() {
  const items = useMemo<FallingItem[]>(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
      left: `${seededRand(i * 3) * 100}%`,
      fontSize: `${18 + seededRand(i * 7) * 22}px`,
      animationDuration: `${7 + seededRand(i * 5) * 9}s`,
      animationDelay: `${seededRand(i * 11) * 12}s`,
      opacity: 0.12 + seededRand(i * 13) * 0.14,
    }));
  }, []);

  return (
    <>
      <style>{`
        @keyframes food-fall {
          0%   { transform: translateY(-70px) rotate(0deg); }
          100% { transform: translateY(110vh)  rotate(380deg); }
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
              top: '-70px',
              left: item.left,
              fontSize: item.fontSize,
              opacity: item.opacity,
              animation: `food-fall ${item.animationDuration} ${item.animationDelay} infinite linear`,
              userSelect: 'none',
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>
    </>
  );
}
