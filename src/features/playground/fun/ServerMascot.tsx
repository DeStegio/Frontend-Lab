import { cn } from '@/lib/cn';
import { MOOD_LABEL, type Mood } from './mood';

const BODY: Record<Mood, string> = {
  happy: 'var(--color-sky)',
  sleepy: 'var(--color-sun)',
  sweaty: 'var(--color-sun)',
  stressed: 'var(--color-tomato)',
  offline: 'var(--color-cream-2)',
  chaos: 'var(--color-tomato)',
};

const ink = 'var(--color-toy-ink)';
const stroke = { stroke: ink, strokeWidth: 3.5, strokeLinecap: 'round', fill: 'none' } as const;

function Eyes({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'sleepy':
      return (
        <>
          <path d="M34 50q6 5 12 0M64 50q6 5 12 0" {...stroke} />
          <text x="86" y="30" fontFamily="var(--font-pixel)" fontSize="13" fill={ink}>
            z
          </text>
          <text x="94" y="20" fontFamily="var(--font-pixel)" fontSize="9" fill={ink}>
            z
          </text>
        </>
      );
    case 'offline':
      return <path d="M35 44l10 10M45 44 35 54M65 44l10 10M75 44 65 54" {...stroke} />;
    case 'chaos':
      return (
        <path
          d="M40 49a3 3 0 1 1 3-3 6 6 0 1 1-6-6 9 9 0 1 1 9 9M70 49a3 3 0 1 1 3-3 6 6 0 1 1-6-6 9 9 0 1 1 9 9"
          {...stroke}
          strokeWidth={2.8}
        />
      );
    case 'stressed':
      return (
        <>
          <circle cx="40" cy="49" r="7" fill="#fff" stroke={ink} strokeWidth={3} />
          <circle cx="70" cy="49" r="7" fill="#fff" stroke={ink} strokeWidth={3} />
          <circle cx="40" cy="49" r="2.5" fill={ink} />
          <circle cx="70" cy="49" r="2.5" fill={ink} />
        </>
      );
    default:
      return (
        <>
          <circle cx="40" cy="49" r="4.5" fill={ink} />
          <circle cx="70" cy="49" r="4.5" fill={ink} />
        </>
      );
  }
}

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'happy':
      return <path d="M42 66q13 11 26 0" {...stroke} />;
    case 'sleepy':
      return <ellipse cx="55" cy="68" rx="5" ry="4" fill={ink} />;
    case 'sweaty':
      return <path d="M40 69q5-5 10 0t10 0 10 0" {...stroke} />;
    case 'stressed':
      return <ellipse cx="55" cy="70" rx="8" ry="6" fill={ink} />;
    case 'offline':
      return <path d="M44 69h22" {...stroke} />;
    case 'chaos':
      return <path d="M40 70l6-6 6 6 6-6 6 6 6-6" {...stroke} />;
  }
}

/**
 * The "server" as a small toy character. Its face is a summary of the conditions,
 * so the lab state reads at a glance; the caption says the same thing in words.
 */
export function ServerMascot({ mood, size = 120 }: { mood: Mood; size?: number }) {
  const moving = mood !== 'offline';
  return (
    <svg
      role="img"
      aria-label={`Server mood: ${MOOD_LABEL[mood]}`}
      viewBox="0 0 110 110"
      width={size}
      height={size}
      className={cn(
        'flex-none overflow-visible',
        moving && (mood === 'stressed' || mood === 'chaos' ? 'animate-wobble-3' : 'animate-bob'),
      )}
      style={{ '--wobble': '2deg' } as React.CSSProperties}
    >
      {/* antenna */}
      <path d="M55 18V8" {...stroke} />
      <circle
        cx="55"
        cy="7"
        r="5"
        fill={mood === 'happy' ? 'var(--color-leaf)' : 'var(--color-tomato)'}
        stroke={ink}
        strokeWidth={3}
      />
      {/* shadow + body */}
      <rect x="14" y="23" width="84" height="78" rx="20" fill={ink} />
      <rect
        x="11"
        y="18"
        width="84"
        height="78"
        rx="20"
        fill={BODY[mood]}
        stroke={ink}
        strokeWidth={3.5}
      />
      {/* rack slots */}
      <path d="M26 84h20M26 90h12" stroke={ink} strokeWidth={3} strokeLinecap="round" />
      <circle
        cx="80"
        cy="86"
        r="3.5"
        fill={mood === 'offline' ? '#8a8299' : 'var(--color-leaf)'}
        stroke={ink}
        strokeWidth={2}
      />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      {(mood === 'sweaty' || mood === 'stressed') && (
        <path
          d="M89 34q5 8 0 11q-5-3 0-11z"
          fill="var(--color-sky)"
          stroke={ink}
          strokeWidth={2.5}
        />
      )}
      {mood === 'offline' && (
        <path
          d="M11 70q-12 4-8 18M2 90l6-3"
          stroke={ink}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === 'chaos' && (
        <path
          d="M78 18q4-12-3-16q9 2 9 12q4-5 2-10q8 7 2 16z"
          fill="var(--color-sun)"
          stroke={ink}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
