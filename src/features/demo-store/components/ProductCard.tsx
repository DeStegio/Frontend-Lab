import { Check, RotateCw } from 'lucide-react';
import { memo } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import type { Shape } from '../catalog';
import type { AddStatus } from '../storeState';

const shapes: Record<Shape, string> = {
  circle: 'w-[40%] aspect-square rounded-full',
  square: 'w-[40%] aspect-square rounded-[20%]',
  pill: 'w-[56%] aspect-[2/1] rounded-full',
  arch: 'w-[32%] aspect-[3/4] rounded-[999px_999px_10px_10px]',
};

const addStyles: Record<AddStatus | 'idle', string> = {
  idle: 'bg-ink border-ink text-white hover:bg-ink-hover',
  pending: 'bg-white text-ink border-line-2',
  added: 'bg-mint-ink border-mint-ink text-white',
  failed: 'bg-coral-soft text-coral-ink border-coral-line',
};

const addLabels: Record<AddStatus | 'idle', string> = {
  idle: 'Add to cart',
  pending: 'Adding…',
  added: 'Added',
  failed: 'Retry',
};

export type ProductCardProps = {
  name: string;
  /** Unmutated name, for accessible labels. */
  plainName: string;
  description: string;
  category: string;
  price: number;
  tint: string;
  shape: Shape;
  status?: AddStatus;
  onAdd?: () => void;
  /** Static rendering (landing page bench): no entrance animation, button is decorative. */
  still?: boolean;
  /** Lets a product name overflow on one line (landing bench illustration). */
  nowrapName?: boolean;
};

export const ProductCard = memo(function ProductCard({
  name,
  plainName,
  description,
  category,
  price,
  tint,
  shape,
  status,
  onAdd,
  still = false,
  nowrapName = false,
}: ProductCardProps) {
  const s = status ?? 'idle';
  const failed = s === 'failed';
  const addClass = cn(
    'inline-flex h-[34px] cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border px-3 text-[12.5px] font-semibold whitespace-nowrap',
    'transition-colors duration-150 @max-lg/store:h-10',
    addStyles[s],
  );
  const icon =
    s === 'pending' ? (
      <Spinner />
    ) : s === 'added' ? (
      <Check size={14} aria-hidden="true" />
    ) : failed ? (
      <RotateCw size={14} aria-hidden="true" />
    ) : null;

  return (
    <article
      data-status={s}
      className={cn(
        'flex flex-col rounded-[14px] border bg-white transition-[box-shadow,border-color] duration-200 hover:shadow-2',
        failed ? 'border-coral-line' : 'border-[#EAECF1]',
        !still && (failed ? 'animate-shake' : 'animate-tin'),
      )}
    >
      <div
        className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-t-[13px]"
        style={{ background: tint }}
      >
        <div className={cn('bg-white/78 shadow-[0_10px_24px_rgba(22,26,44,.10)]', shapes[shape])} />
        <span className="absolute top-2.5 left-2.5 rounded-xs bg-white/85 px-[7px] py-[5px] font-mono text-[10.5px] leading-none font-semibold text-ink-2">
          {category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 pt-3 pb-3.5 @max-lg/store:p-2.5">
        <h3
          className={cn(
            'm-0 text-sm leading-[1.3] font-bold tracking-[-0.005em] [overflow-wrap:normal] [word-break:normal]',
            nowrapName && 'whitespace-nowrap',
          )}
        >
          {name}
        </h3>
        <p className="m-0 text-[12.5px] leading-normal text-ink-3">{description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 @max-lg/store:flex-col @max-lg/store:items-stretch">
          <span className="font-mono text-sm font-bold">€{price}</span>
          {still ? (
            <span className={addClass} aria-hidden="true">
              {icon}
              {addLabels[s]}
            </span>
          ) : (
            <button
              type="button"
              className={addClass}
              onClick={onAdd}
              aria-label={`${failed ? 'Retry adding' : 'Add'} ${plainName} to cart`}
            >
              {icon}
              <span>{addLabels[s]}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

export function SkeletonCard() {
  return (
    <div
      className="overflow-hidden rounded-[14px] border border-[#EEF0F4] bg-white"
      aria-hidden="true"
    >
      <div className="lab-skeleton aspect-[4/3]" />
      <div className="lab-skeleton mx-3.5 mt-3 h-2.5 rounded-[5px]" />
      <div className="lab-skeleton mx-3.5 mt-3 h-2.5 w-[60%] rounded-[5px]" />
      <div className="lab-skeleton mx-3.5 mt-3 mb-4 h-2.5 w-[40%] rounded-[5px]" />
    </div>
  );
}
