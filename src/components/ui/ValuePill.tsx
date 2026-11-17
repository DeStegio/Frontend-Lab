import { cn } from '@/lib/cn';

export type Level = 'ok' | 'warn' | 'hot';

const levels: Record<Level, string> = {
  ok: 'bg-surface-2 text-ink border-line',
  warn: 'bg-amber-soft text-amber-ink border-amber-line',
  hot: 'bg-coral-soft text-coral-ink border-coral-line',
};

/** Monospace readout next to a control; color tracks how extreme the value is. */
export function ValuePill({
  level = 'ok',
  children,
  className,
}: {
  level?: Level;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'min-w-14 rounded-xs border px-2 py-[5px] text-center font-mono text-xs leading-none font-semibold whitespace-nowrap',
        'transition-colors duration-200',
        levels[level],
        className,
      )}
    >
      {children}
    </span>
  );
}
