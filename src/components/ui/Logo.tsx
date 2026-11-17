import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/lib/links';

type LogoProps = { compact?: boolean; className?: string };

/** Two stacked toy blocks with a code glyph; the top block lifts on hover. */
export function Logo({ compact = false, className }: LogoProps) {
  return (
    <Link
      to={ROUTES.home}
      aria-label="Frontend Lab, home"
      className={cn(
        'group inline-flex items-center gap-2.5 font-toy font-black tracking-[-0.01em] whitespace-nowrap text-toy-ink uppercase no-underline',
        compact ? 'text-[15px]' : 'text-[18px]',
        className,
      )}
    >
      <span className="relative size-[34px] flex-none" aria-hidden="true">
        <i className="absolute top-[6px] left-[6px] size-7 rounded-[9px] border-[2.5px] border-toy-ink bg-tomato" />
        <i className="absolute top-0 left-0 grid size-7 place-items-center rounded-[9px] border-[2.5px] border-toy-ink bg-sun transition-transform duration-200 ease-lab group-hover:-translate-x-0.5 group-hover:-translate-y-1 group-hover:-rotate-6">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
          </svg>
        </i>
      </span>
      <span>
        Frontend <span className="text-tomato-dark">Lab</span>
      </span>
    </Link>
  );
}
