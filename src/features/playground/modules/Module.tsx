import { RotateCcw } from 'lucide-react';
import { useId } from 'react';
import { Led, ToyButton } from '@/components/toy/toy';
import { cn } from '@/lib/cn';

export type ModuleState = 'ok' | 'mod' | 'hot';
export type ModuleTone = 'sky' | 'grape' | 'leaf' | 'tomato';

const strip: Record<ModuleTone, string> = {
  sky: 'bg-sky',
  grape: 'bg-grape',
  leaf: 'bg-leaf',
  tomato: 'bg-tomato',
};

const stateLed: Record<ModuleState, { text: string; level: 'ok' | 'warn' | 'hot' }> = {
  ok: { text: 'IDLE', level: 'ok' },
  mod: { text: 'ON', level: 'warn' },
  hot: { text: 'HOT', level: 'hot' },
};

type ModuleProps = {
  title: string;
  tagline: string;
  tone: ModuleTone;
  icon: React.ReactNode;
  state: ModuleState;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
  children: React.ReactNode;
};

/** A plug-in module on the control deck: colored strip, LED state, its own reset. */
export function Module({
  title,
  tagline,
  tone,
  icon,
  state,
  onReset,
  resetLabel,
  className,
  children,
}: ModuleProps) {
  const headingId = useId();
  const led = stateLed[state];
  return (
    <section
      aria-labelledby={headingId}
      className={cn('toy-surface lab-module flex flex-col overflow-hidden', className)}
    >
      <div
        className={cn(
          'flex flex-none items-center gap-2 border-b-[2.5px] border-toy-ink px-3 py-1.5',
          strip[tone],
        )}
      >
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-lg border-2 border-toy-ink bg-toy-paper"
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1 leading-none">
          <h2
            id={headingId}
            className="m-0 font-toy text-[15px] font-black tracking-[0.04em] uppercase"
          >
            {title}
          </h2>
          <p className="m-0 mt-0.5 truncate font-toy text-[11.5px] font-semibold text-toy-ink">
            {tagline}
          </p>
        </div>
        <Led level={led.level} className="h-6 min-w-11 text-[10px]">
          <span className="sr-only">{title} state: </span>
          {led.text}
        </Led>
        {onReset && (
          <ToyButton
            size="sm"
            className="size-[30px] rounded-[9px] px-0"
            onClick={onReset}
            disabled={state === 'ok'}
            aria-label={resetLabel}
          >
            <RotateCcw size={14} strokeWidth={2.8} aria-hidden="true" />
          </ToyButton>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-auto px-3 pt-2.5 pb-3">
        {children}
      </div>
    </section>
  );
}
