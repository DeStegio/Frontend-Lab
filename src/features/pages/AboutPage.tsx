import { ArrowRight, Network, RotateCcw, Shuffle, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { GithubIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { REPO_URL, ROUTES } from '@/lib/links';

const FACTS = [
  {
    title: 'Simulated, not hosted',
    text: 'Every request is faked inside your browser. Nothing is sent to a real server.',
    icon: <Network size={16} />,
    tone: 'bg-accent-soft text-accent-ink',
  },
  {
    title: 'Everything combines',
    text: 'Eight conditions, all stackable, with presets and a Chaos mode for extremes.',
    icon: <Shuffle size={16} />,
    tone: 'bg-mint-soft text-mint-ink',
  },
  {
    title: 'One-click reset',
    text: 'Reset cancels pending requests and returns the store to a clean state.',
    icon: <RotateCcw size={16} />,
    tone: 'bg-amber-soft text-amber-ink',
  },
];

const NOT = ['a course', 'quizzes', 'scores', 'achievements', 'a DevTools replacement'];

const STACK = [
  'React 19',
  'TypeScript (strict)',
  'Vite',
  'Tailwind CSS 4',
  'React Router',
  'TanStack Virtual',
  'Vitest',
  'Testing Library',
  'Playwright',
];

const h2 = 'mt-12 mb-3 text-[22px] font-extrabold tracking-[-0.015em]';
const body = 'mb-3.5 text-[16.5px] leading-[1.7] text-ink-2';
const linkCard =
  'flex items-center gap-3.5 rounded-lg border border-line bg-surface p-[18px] text-ink no-underline transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-accent-line hover:shadow-2';

export function AboutPage() {
  return (
    <>
      <title>About | Frontend Lab</title>
      <article className="mx-auto max-w-[760px] px-4 pt-11 pb-[72px] site-md:px-10 site-md:pt-[72px] site-md:pb-24">
        <span className="inline-flex h-[30px] items-center gap-2 rounded-full border border-line bg-surface px-3 text-[13px] font-semibold text-ink-2">
          <span aria-hidden="true" className="size-[7px] rounded-full bg-mint-ink" />
          About the project
        </span>
        <h1 className="mt-[22px] mb-5 text-[40px] leading-[1.04] font-extrabold tracking-[-0.035em] site-md:text-[56px]">
          A small store you’re allowed to break.
        </h1>
        <p className={body}>
          Frontend Lab is a browser playground built around one miniature web app, the Demo Store.
          Around it sit a handful of controls that change how the network, the server and the
          content behave. Change them, use the store, and watch what holds up.
        </p>
        <p className={body}>
          It exists because the interesting parts of an interface are the moments nobody designs
          for: the request that takes forty seconds, the button pressed twelve times, the product
          name three times longer than expected.
        </p>

        <div className="mt-9 grid grid-cols-1 gap-3 site-md:grid-cols-3">
          {FACTS.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-[18px]"
            >
              <span
                aria-hidden="true"
                className={cn('grid size-[30px] place-items-center rounded-[9px]', f.tone)}
              >
                {f.icon}
              </span>
              <h3 className="m-0 text-[15px] font-bold">{f.title}</h3>
              <p className="m-0 text-[13.5px] leading-[1.55] text-ink-2">{f.text}</p>
            </div>
          ))}
        </div>

        <h2 className={h2}>What it isn’t</h2>
        <ul className="m-0 mt-1.5 flex list-none flex-wrap gap-2 p-0">
          {NOT.map((n) => (
            <li
              key={n}
              className="rounded-sm border border-line bg-surface px-2.5 py-1.5 font-mono text-[12.5px] font-semibold text-ink-2 line-through decoration-coral-strong decoration-2"
            >
              {n}
            </li>
          ))}
        </ul>

        <h2 className={h2}>Built with</h2>
        <p className={body}>
          A framework-agnostic simulation engine in TypeScript drives every request: seeded
          randomness for reproducible runs, AbortController cancellation, and bounded stress so the
          page never freezes. The interface is React on top of it.
        </p>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {STACK.map((s) => (
            <li
              key={s}
              className="rounded-sm border border-line bg-surface px-2.5 py-1.5 font-mono text-[12.5px] font-semibold text-ink-2"
            >
              {s}
            </li>
          ))}
        </ul>

        <h2 className={h2}>Source</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 site-md:grid-cols-2">
          <a className={linkCard} href={REPO_URL} target="_blank" rel="noreferrer">
            <span
              aria-hidden="true"
              className="grid size-10 flex-none place-items-center rounded-[11px] bg-ink text-white"
            >
              <GithubIcon size={18} />
            </span>
            <div>
              <b className="block text-[15px]">GitHub repository</b>
              <span className="text-[13px] text-ink-3">DeStegio/Frontend-Lab</span>
            </div>
            <ArrowRight size={16} aria-hidden="true" className="ml-auto text-ink-3" />
          </a>
          <Link className={linkCard} to={ROUTES.playground}>
            <span
              aria-hidden="true"
              className="grid size-10 flex-none place-items-center rounded-[11px] bg-accent-soft text-accent-ink"
            >
              <Zap size={18} />
            </span>
            <div>
              <b className="block text-[15px]">Open the playground</b>
              <span className="text-[13px] text-ink-3">Start experimenting</span>
            </div>
            <ArrowRight size={16} aria-hidden="true" className="ml-auto text-ink-3" />
          </Link>
        </div>
      </article>
    </>
  );
}
