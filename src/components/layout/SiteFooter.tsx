import { Link } from 'react-router';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';
import { REPO_URL, ROUTES } from '@/lib/links';
import { siteLinkClass } from './SiteHeader';

const footLink = cn(siteLinkClass, 'h-8 text-[13.5px]');

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-6 px-4 py-7 site-md:px-10">
        <Logo />
        <span className="text-[13px] text-ink-3">
          Make the web misbehave. Designed and built by [Your name].
        </span>
        <div className="flex-1" />
        <nav aria-label="Footer" className="flex gap-1">
          <Link className={footLink} to={ROUTES.playground}>
            Playground
          </Link>
          <Link className={footLink} to={ROUTES.about}>
            About
          </Link>
          <a className={footLink} href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
