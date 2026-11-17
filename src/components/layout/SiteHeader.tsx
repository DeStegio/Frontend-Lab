import { ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router';
import { ButtonLink } from '@/components/ui/Button';
import { GithubIcon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';
import { REPO_URL, ROUTES } from '@/lib/links';

export const siteLinkClass =
  'inline-flex h-9 items-center gap-1.5 rounded-sm px-3 text-sm font-semibold text-ink-2 no-underline hover:bg-ink/5 hover:text-ink';

export const siteLinkActiveClass = 'text-ink bg-surface shadow-[inset_0_0_0_1px_var(--color-line)]';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper">
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center gap-3 px-4 site-md:h-[68px] site-md:gap-7 site-md:px-10">
        <Logo />
        <nav aria-label="Main" className="ml-3 hidden gap-1 site-md:flex">
          <NavLink
            to={ROUTES.playground}
            className={({ isActive }) => cn(siteLinkClass, isActive && siteLinkActiveClass)}
          >
            Playground
          </NavLink>
          <NavLink
            to={ROUTES.about}
            className={({ isActive }) => cn(siteLinkClass, isActive && siteLinkActiveClass)}
          >
            About
          </NavLink>
          <a className={siteLinkClass} href={REPO_URL} target="_blank" rel="noreferrer">
            <GithubIcon size={15} />
            GitHub
          </a>
        </nav>
        <div className="flex-1" />
        <ButtonLink to={ROUTES.playground} variant="primary" size="sm">
          Enter Playground
          <ArrowRight size={15} aria-hidden="true" />
        </ButtonLink>
      </div>
    </header>
  );
}
