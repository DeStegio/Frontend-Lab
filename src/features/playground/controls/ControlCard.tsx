import { RotateCcw } from 'lucide-react';
import { useId } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export type CardState = 'flat' | 'mod' | 'hot';
export type Glyph = 'net' | 'int' | 'mut' | 'chaos';

const glyphTones: Record<Glyph, string> = {
  net: 'bg-amber-soft text-amber-ink',
  int: 'bg-accent-soft text-accent-ink',
  mut: 'bg-mint-soft text-mint-ink',
  chaos: 'bg-coral-soft text-coral-ink',
};

const ring: Record<CardState, string> = {
  flat: 'border-line',
  mod: 'border-accent-line shadow-[0_0_0_3px_var(--color-accent-soft)]',
  hot: 'border-coral-line shadow-[0_0_0_3px_var(--color-coral-soft)]',
};

type ControlCardProps = {
  title: string;
  subtitle: string;
  glyph: Glyph;
  icon: React.ReactNode;
  state: CardState;
  /** Shown when given: resets just this group. */
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
  children: React.ReactNode;
};

/** One experiment cluster. Its ring shows whether anything inside differs from default. */
export function ControlCard({
  title,
  subtitle,
  glyph,
  icon,
  state,
  onReset,
  resetLabel,
  className,
  children,
}: ControlCardProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'lab-card flex min-h-0 flex-col gap-4 rounded-lg border bg-surface p-4 shadow-1',
        'transition-[border-color,box-shadow] duration-250',
        ring[state],
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={cn(
            'grid size-[30px] flex-none place-items-center rounded-[9px]',
            glyphTones[glyph],
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="m-0 text-sm font-bold tracking-[-0.005em]">
            {title}
          </h2>
          <p className="mt-0.5 mb-0 text-xs font-medium text-ink-3">{subtitle}</p>
        </div>
        {onReset && (
          <Button
            size="sm"
            variant="ghost"
            icon
            onClick={onReset}
            disabled={state === 'flat'}
            aria-label={resetLabel}
          >
            <RotateCcw size={15} aria-hidden="true" />
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}

export function ControlRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-2.5">{children}</div>;
}

export function ControlLabel({
  htmlFor,
  label,
  hint,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink-2">
        {label}
      </label>
      {hint && <div className="mt-0.5 text-[11.5px] font-medium text-ink-3">{hint}</div>}
    </div>
  );
}
