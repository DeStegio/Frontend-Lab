import { cn } from '@/lib/cn';

export type StatusTone = 'idle' | 'active' | 'chaos' | 'warn' | 'ok';

const tones: Record<StatusTone, { box: string; dot: string }> = {
  idle: { box: 'bg-surface-2 border-line text-ink-2', dot: 'bg-muted' },
  active: { box: 'bg-accent-soft border-accent-line text-accent-ink', dot: 'bg-accent' },
  chaos: { box: 'bg-coral-soft border-coral-line text-coral-ink', dot: 'bg-coral-strong' },
  warn: { box: 'bg-amber-soft border-amber-line text-amber-ink', dot: 'bg-amber-strong' },
  ok: { box: 'bg-mint-soft border-mint-line text-mint-ink', dot: 'bg-mint-ink' },
};

type StatusPillProps = {
  tone?: StatusTone;
  busy?: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Live region announcing the lab's overall state. */
export function StatusPill({ tone = 'idle', busy = false, children, className }: StatusPillProps) {
  const t = tones[tone];
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex h-[34px] items-center gap-2 rounded-full border px-3 text-[13px] font-semibold whitespace-nowrap',
        'transition-colors duration-250',
        t.box,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-2 flex-none rounded-full', t.dot, busy && 'animate-pulse-ring')}
      />
      <span>{children}</span>
    </div>
  );
}
