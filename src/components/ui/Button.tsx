import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';
import { buttonClass, type ButtonStyleProps } from './buttonStyles';

type ButtonProps = ButtonStyleProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant, size, icon, block, on, className, type, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cn(buttonClass({ variant, size, icon, block, on }), className)}
      {...rest}
    />
  );
}

type ButtonLinkProps = ButtonStyleProps & LinkProps;

/** In-app navigation styled as a button. */
export function ButtonLink({
  variant,
  size,
  icon,
  block,
  on,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={cn(buttonClass({ variant, size, icon, block, on }), className)} {...rest} />
  );
}

type ButtonAnchorProps = ButtonStyleProps & AnchorHTMLAttributes<HTMLAnchorElement>;

/** External link styled as a button. */
export function ButtonAnchor({
  variant,
  size,
  icon,
  block,
  on,
  className,
  ...rest
}: ButtonAnchorProps) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      className={cn(buttonClass({ variant, size, icon, block, on }), className)}
      {...rest}
    />
  );
}
