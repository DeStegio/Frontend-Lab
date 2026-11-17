import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  tone?: 'accent' | 'danger';
};

/** Native checkbox exposed as a switch, so keyboard (Space) and forms work for free. */
export function Switch({
  checked,
  onCheckedChange,
  tone = 'accent',
  className,
  ...rest
}: SwitchProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      aria-checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-tone={tone}
      className={cn('lab-switch', className)}
      {...rest}
    />
  );
}
