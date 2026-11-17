import { useId } from 'react';
import { ValuePill, type Level } from './ValuePill';

type RangeFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Human readout, also used as aria-valuetext. */
  display: string;
  level?: Level;
  ticks?: string[];
  disabled?: boolean;
};

export function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  level = 'ok',
  ticks,
  disabled,
}: RangeFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-[7px]">
      <div className="flex items-center justify-between gap-2.5">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">
          {label}
        </label>
        <ValuePill level={level}>{display}</ValuePill>
      </div>
      <input
        id={id}
        type="range"
        className="lab-range"
        data-level={level}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {ticks && (
        <div
          aria-hidden="true"
          className="flex justify-between font-mono text-[10.5px] leading-none font-medium text-ink-3"
        >
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
