import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type LockTier = 'pro' | 'yearly';

function upgradeCopy(tier: LockTier, feature: string) {
  if (tier === 'yearly') return `${feature} is available on Pro Yearly`;
  return `${feature} is available on Pro`;
}

function upgradeCTA(tier: LockTier) {
  return tier === 'yearly' ? 'Upgrade to Yearly →' : 'Upgrade to Pro →';
}

interface LockedButtonProps {
  locked: boolean;
  feature: string;
  tier?: LockTier;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

/** Wraps a button — if locked, navigates to /pricing instead of calling onClick */
export function LockedButton({ locked, feature, tier = 'pro', onClick, children, className }: LockedButtonProps) {
  const navigate = useNavigate();

  if (!locked) {
    return (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/pricing')}
      title={upgradeCopy(tier, feature)}
      className={`${className ?? ''} opacity-60 cursor-not-allowed relative`}
    >
      <span className="flex items-center gap-1.5">
        <Lock size={13} />
        {children}
      </span>
    </button>
  );
}

interface LockedSectionProps {
  locked: boolean;
  feature: string;
  tier?: LockTier;
  /** Extra classes on the overlay card, e.g. 'items-start pt-16' to shift the badge */
  overlayAlign?: string;
  children: React.ReactNode;
}

/**
 * Shows the content blurred + dimmed with an upgrade overlay on top.
 * The child content is always rendered (great teaser UX).
 */
export function LockedSection({ locked, feature, tier = 'pro', overlayAlign, children }: LockedSectionProps) {
  const navigate = useNavigate();

  if (!locked) return <>{children}</>;

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Blurred, pointer-blocked content — still rendered so user sees shapes */}
      <div
        className="pointer-events-none select-none"
        style={{ filter: 'blur(4px) grayscale(30%)', opacity: 0.35 }}
      >
        {children}
      </div>

      {/* Floating upgrade card */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-3 ${overlayAlign ?? ''}`}
        style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(2px)' }}
      >
        <div className="flex flex-col items-center gap-2.5 px-6 py-5 rounded-2xl border border-orange-200/60 shadow-lg text-center max-w-xs"
          style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 32px rgba(249,115,22,0.12)' }}>
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
            <Lock size={16} className="text-orange-500" />
          </div>
          <p className="text-sm font-semibold text-gray-800 leading-snug">
            {upgradeCopy(tier, feature)}
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="px-5 py-2 rounded-lg text-white text-xs font-bold transition-transform hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
          >
            {upgradeCTA(tier)}
          </button>
        </div>
      </div>
    </div>
  );
}
