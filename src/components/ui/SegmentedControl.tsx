import { cn } from '@/lib/cn';

type Option<T> = { value: T; label: string };

type SegmentedControlProps<T extends string | number> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** id of the visible label for the group */
  labelledBy: string;
  className?: string;
};

/** Toggle-button group (aria-pressed), matching the design's `.seg`. */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  labelledBy,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className={cn(
        'flex flex-1 gap-0.5 rounded-[10px] border border-line bg-surface-2 p-[3px]',
        className,
      )}
    >
      {options.map((o) => {
        const pressed = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-[30px] flex-1 cursor-pointer rounded-[7px] border-0 font-mono text-xs leading-none font-semibold transition-colors duration-150',
              pressed
                ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(22,26,44,.12),0_0_0_1px_var(--color-line)]'
                : 'bg-transparent text-ink-2 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
