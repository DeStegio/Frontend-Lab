import { cn } from '@/lib/cn';

export type ButtonVariant = 'secondary' | 'primary' | 'ghost' | 'danger' | 'ink' | 'light';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Square, icon-only button. Requires an aria-label. */
  icon?: boolean;
  block?: boolean;
  /** Toggled-on look (e.g. an open panel). */
  on?: boolean;
};

const base =
  'inline-flex items-center justify-center gap-2 border font-semibold leading-none whitespace-nowrap no-underline cursor-pointer select-none ' +
  'transition-[background-color,border-color,box-shadow,transform,color] duration-150 active:translate-y-px ' +
  'disabled:cursor-not-allowed disabled:opacity-40 disabled:translate-y-0 [&_svg]:flex-none';

const variants: Record<ButtonVariant, string> = {
  secondary:
    'bg-surface border-line-2 text-ink hover:bg-surface-2 hover:border-line-hover disabled:hover:bg-surface disabled:hover:border-line-2',
  primary: 'bg-accent border-accent text-white hover:bg-accent-hover hover:border-accent-hover',
  ghost: 'bg-transparent border-transparent text-ink-2 hover:bg-ink/6',
  danger:
    'bg-coral-soft border-coral-line text-coral-ink hover:bg-[#FFD8D7] hover:border-[#EFA0A0]',
  ink: 'bg-ink border-ink text-white hover:bg-ink-hover hover:border-ink-hover',
  light: 'bg-white border-white text-ink hover:bg-[#ECEEF3] hover:border-[#ECEEF3]',
};

const sizes: Record<ButtonSize, { box: string; icon: string }> = {
  sm: { box: 'h-[34px] px-3 text-[13px] rounded-[9px]', icon: 'w-[34px] px-0' },
  md: { box: 'h-10 px-4 text-sm rounded-[10px]', icon: 'w-10 px-0' },
  lg: { box: 'h-[52px] px-[22px] text-base rounded-xl', icon: 'w-[52px] px-0' },
};

const onState = 'bg-accent-soft border-accent-line text-accent-ink hover:bg-accent-soft';

export function buttonClass({
  variant = 'secondary',
  size = 'md',
  icon = false,
  block = false,
  on = false,
}: ButtonStyleProps = {}): string {
  return cn(
    base,
    on ? onState : variants[variant],
    sizes[size].box,
    icon && sizes[size].icon,
    block && 'w-full',
  );
}
