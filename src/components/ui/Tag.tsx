import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { tagTones, type TagTone } from './tagStyles';

type TagProps = HTMLAttributes<HTMLSpanElement> & { tone?: TagTone };

export function Tag({ tone = 'neutral', className, ...rest }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[26px] items-center gap-1.5 rounded-[7px] border px-2 font-mono text-[11.5px] leading-none font-semibold whitespace-nowrap',
        tagTones[tone],
        className,
      )}
      {...rest}
    />
  );
}
