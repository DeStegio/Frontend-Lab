import { RotateCcw } from 'lucide-react';
import { NavLink } from 'react-router';
import { Button, ButtonAnchor } from '@/components/ui/Button';
import { GithubIcon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/Logo';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { REPO_URL, ROUTES } from '@/lib/links';

const navLink =
  'inline-flex h-9 items-center rounded-sm px-3 text-sm font-semibold text-ink-2 no-underline hover:bg-surface-2 hover:text-ink';

// Phase 1 placeholder: app bar + empty stage. Preview, clusters and dock land in Phase 2.
export function PlaygroundPage() {
  return (
    <div className="flex h-dvh min-h-[600px] flex-col overflow-hidden bg-paper">
      <title>Playground | Frontend Lab</title>
      <header className="relative z-3 flex h-14 flex-none items-center gap-2.5 border-b border-line bg-surface px-3 lab-md:h-16 lab-md:gap-5 lab-md:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden gap-1 lab-md:flex">
          <NavLink
            to={ROUTES.playground}
            className={({ isActive }) =>
              cn(
                navLink,
                isActive && 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--color-line)]',
              )
            }
          >
            Playground
          </NavLink>
          <NavLink to={ROUTES.about} className={navLink}>
            About
          </NavLink>
        </nav>
        <div className="flex-1" />
        <StatusPill>Idle · normal conditions</StatusPill>
        <Button size="sm" aria-label="Reset all conditions">
          <RotateCcw size={16} aria-hidden="true" />
          <span className="hidden lab-md:inline">Reset all</span>
        </Button>
        <ButtonAnchor
          href={REPO_URL}
          size="sm"
          variant="ghost"
          icon
          aria-label="Frontend Lab on GitHub"
          className="hidden lab-md:inline-flex"
        >
          <GithubIcon />
        </ButtonAnchor>
      </header>
      <main id="main" className="lab-dots flex-1" aria-label="Playground" />
    </div>
  );
}
