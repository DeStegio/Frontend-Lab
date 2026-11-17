import { Link } from 'react-router';
import { Logo } from '@/components/ui/Logo';
import { REPO_URL, ROUTES } from '@/lib/links';
import { siteLinkClass } from './SiteHeader';

export function SiteFooter() {
  return (
    <footer className="border-t-[2.5px] border-toy-ink bg-cream">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-7 site-md:px-10">
        <Logo />
        <span className="font-pixel text-[11px] text-toy-ink-2">
          MAKE THE WEB MISBEHAVE · BUILT BY [YOUR NAME]
        </span>
        <div className="flex-1" />
        <nav aria-label="Footer" className="flex gap-1">
          <Link className={siteLinkClass} to={ROUTES.playground}>
            Playground
          </Link>
          <Link className={siteLinkClass} to={ROUTES.about}>
            About
          </Link>
          <a className={siteLinkClass} href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
