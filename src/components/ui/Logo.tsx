import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/lib/links';

type LogoProps = { compact?: boolean; className?: string };

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <Link
      to={ROUTES.home}
      aria-label="Frontend Lab, home"
      className={cn(
        'group inline-flex items-center gap-2.5 font-extrabold tracking-[-0.02em] whitespace-nowrap text-ink no-underline',
        compact ? 'text-[15px]' : 'text-[17px]',
        className,
      )}
    >
      <span className="relative size-[30px] flex-none" aria-hidden="true">
        <i className="absolute top-1 left-1 size-[26px] rounded-sm bg-coral" />
        <i className="absolute top-0 left-0 grid size-[26px] place-items-center rounded-sm bg-accent transition-transform duration-250 ease-lab group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="#fff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
          </svg>
        </i>
      </span>
      <span>Frontend Lab</span>
    </Link>
  );
}
