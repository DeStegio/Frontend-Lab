import { ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router';
import { ToyLink } from '@/components/toy/toy';
import { GithubIcon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';
import { REPO_URL, ROUTES } from '@/lib/links';

export const siteLinkClass =
  'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 font-toy text-[15px] font-bold text-toy-ink no-underline decoration-[3px] underline-offset-[6px] hover:underline';

export const siteLinkActiveClass = 'underline decoration-tomato';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b-[2.5px] border-toy-ink bg-cream">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 site-md:h-[72px] site-md:gap-6 site-md:px-10">
        <Logo />
        <nav aria-label="Main" className="ml-2 hidden gap-1 site-md:flex">
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
            <GithubIcon size={16} />
            GitHub
          </a>
        </nav>
        <div className="flex-1" />
        <ToyLink to={ROUTES.playground} tone="tomato" size="sm">
          <span className="max-site-md:hidden">Enter Playground</span>
          <span className="site-md:hidden">Play</span>
          <ArrowRight size={16} strokeWidth={2.8} aria-hidden="true" />
        </ToyLink>
      </div>
    </header>
  );
}
