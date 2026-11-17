import { useId, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';
import type { Level } from '@/simulation/conditions';

export type ToyTone = 'paper' | 'tomato' | 'sun' | 'sky' | 'grape' | 'leaf' | 'bubble' | 'ink';
type ToySize = 'sm' | 'md' | 'lg';
type ToyStyle = { tone?: ToyTone; size?: ToySize };

const toyAttrs = ({ tone = 'paper', size = 'md' }: ToyStyle) => ({
  'data-tone': tone,
  'data-size': size,
});

/** Chunky plastic button that physically presses down. */
export function ToyButton({
  tone,
  size,
  className,
  type,
  ...rest
}: ToyStyle & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type ?? 'button'}
      className={cn('toy-btn', className)}
      {...toyAttrs({ tone, size })}
      {...rest}
    />
  );
}

export function ToyLink({ tone, size, className, ...rest }: ToyStyle & LinkProps) {
  return <Link className={cn('toy-btn', className)} {...toyAttrs({ tone, size })} {...rest} />;
}

export function ToyAnchor({
  tone,
  size,
  className,
  ...rest
}: ToyStyle & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      className={cn('toy-btn', className)}
      {...toyAttrs({ tone, size })}
      {...rest}
    />
  );
}

/** LED readout. Level changes its color, and the text itself always carries the value. */
export function Led({
  level = 'ok',
  children,
  className,
}: {
  level?: Level;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('led', className)} data-level={level}>
      {children}
    </span>
  );
}

type FaderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Readout text, also announced as aria-valuetext. */
  display: string;
  level?: Level;
  ticks?: [string, string];
};

export function ToyFader({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  level = 'ok',
  ticks,
}: FaderProps) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="font-toy text-[13px] font-bold text-toy-ink">
          {label}
        </label>
        <Led level={level}>{display}</Led>
      </div>
      <input
        id={id}
        type="range"
        className="toy-fader"
        data-level={level}
        style={{ '--fill': `${fill}%` } as React.CSSProperties}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {ticks && (
        <div
          aria-hidden="true"
          className="flex justify-between font-pixel text-[9px] text-toy-ink-3 uppercase"
        >
          <span>{ticks[0]}</span>
          <span>{ticks[1]}</span>
        </div>
      )}
    </div>
  );
}

type ToySwitchProps = {
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  danger?: boolean;
  children?: React.ReactNode;
};

export function ToySwitch({
  label,
  hint,
  checked,
  onCheckedChange,
  danger,
  children,
}: ToySwitchProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-2.5">
      <div className="min-w-0">
        <label htmlFor={id} className="font-toy text-[13px] font-bold text-toy-ink">
          {label}
        </label>
        {hint && <div className="font-toy text-[11.5px] text-toy-ink-3">{hint}</div>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <input
          id={id}
          type="checkbox"
          role="switch"
          className="toy-switch"
          data-tone={danger ? 'danger' : undefined}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
      </div>
    </div>
  );
}

type KeysProps<T extends string | number> = {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  tone?: ToyTone;
  className?: string;
};

/** A row of chunky toggle keys; the pressed one stays down. */
export function ToyKeys<T extends string | number>({
  label,
  options,
  value,
  onChange,
  tone = 'sun',
  className,
}: KeysProps<T>) {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span id={id} className="font-toy text-[13px] font-bold text-toy-ink">
        {label}
      </span>
      <div role="group" aria-labelledby={id} className="flex gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className="toy-btn min-w-0 flex-1 px-1"
            data-size="sm"
            data-tone={o.value === value ? tone : 'paper'}
          >
            <span className="truncate">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
