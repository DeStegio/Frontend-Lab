import { ArrowRight, Network, RotateCcw, Shuffle, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { Led } from '@/components/toy/toy';
import { GithubIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { REPO_URL, ROUTES } from '@/lib/links';

const FACTS = [
  {
    title: 'Simulated, not hosted',
    text: 'Every request is faked inside your browser. Nothing is sent to a real server.',
    icon: <Network size={18} strokeWidth={2.6} />,
    tone: 'bg-sky',
  },
  {
    title: 'Everything combines',
    text: 'Eight conditions, all stackable, with quick modes and a big red Chaos button.',
    icon: <Shuffle size={18} strokeWidth={2.6} />,
    tone: 'bg-leaf',
  },
  {
    title: 'One-click reset',
    text: 'The extinguisher cancels pending requests and returns the store to a clean state.',
    icon: <RotateCcw size={18} strokeWidth={2.6} />,
    tone: 'bg-sun',
  },
];

const NOT = ['a course', 'quizzes', 'scores', 'achievements', 'a DevTools replacement'];

const STACK = [
  'React 19',
  'TypeScript strict',
  'Vite',
  'Tailwind CSS 4',
  'React Router',
  'TanStack Virtual',
  'Vitest',
  'Testing Library',
  'Playwright',
];

const h2 = 'mt-14 mb-4 font-toy text-[26px] font-black uppercase tracking-[-0.01em]';
const body = 'mb-4 font-toy text-[17px] leading-[1.65] font-medium text-toy-ink-2';
const linkCard =
  'toy-surface flex items-center gap-4 p-5 text-toy-ink no-underline transition-transform duration-150 hover:-translate-y-1 active:translate-y-1';

export function AboutPage() {
  return (
    <>
      <title>About | Frontend Lab</title>
      <article className="mx-auto max-w-[800px] px-4 pt-12 pb-20 site-md:px-10 site-md:pt-20 site-md:pb-28">
        <span className="toy-surface inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-pixel text-[11px]">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full border-2 border-toy-ink bg-leaf"
          />
          ABOUT THE PROJECT
        </span>
        <h1 className="mt-7 mb-7 font-toy text-[44px] leading-[0.98] font-black tracking-[-0.03em] uppercase site-md:text-[64px]">
          A small store you’re{' '}
          <span className="toy-surface inline-block rotate-2 rounded-[18px] bg-sun px-3">
            allowed
          </span>{' '}
          to break.
        </h1>
        <p className={body}>
          Frontend Lab is a toy lab built around one miniature web app, the Demo Store. Around it
          sit controls that change how the network, the server and the content behave. Change them,
          use the store, and watch what holds up.
        </p>
        <p className={body}>
          It exists because the interesting parts of an interface are the moments nobody designs
          for: the request that takes forty seconds, the button pressed twelve times, the product
          name three times longer than expected.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 site-md:grid-cols-3">
          {FACTS.map((f, i) => (
            <div
              key={f.title}
              className={cn(
                'toy-surface flex flex-col gap-3 p-5',
                i === 1 ? 'site-md:rotate-1' : 'site-md:-rotate-1',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-10 place-items-center rounded-xl border-[2.5px] border-toy-ink',
                  f.tone,
                )}
              >
                {f.icon}
              </span>
              <h3 className="m-0 font-toy text-[17px] font-black uppercase">{f.title}</h3>
              <p className="m-0 font-toy text-[14px] leading-[1.5] font-medium text-toy-ink-2">
                {f.text}
              </p>
            </div>
          ))}
        </div>

        <h2 className={h2}>What it isn’t</h2>
        <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
          {NOT.map((n, i) => (
            <li
              key={n}
              className={cn(
                'toy-surface rounded-xl px-3 py-2 font-toy text-[14px] font-bold line-through decoration-tomato decoration-[3px]',
                i % 2 ? 'rotate-2' : '-rotate-2',
              )}
            >
              {n}
            </li>
          ))}
        </ul>

        <h2 className={h2}>Built with</h2>
        <p className={body}>
          A framework-agnostic simulation engine in TypeScript drives every request: seeded
          randomness for reproducible runs, AbortController cancellation, and bounded stress so the
          page never freezes. The toy lab is React on top of it.
        </p>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {STACK.map((s) => (
            <li key={s}>
              <Led>{s.toUpperCase()}</Led>
            </li>
          ))}
        </ul>

        <h2 className={h2}>Source</h2>
        <div className="grid grid-cols-1 gap-5 site-md:grid-cols-2">
          <a className={linkCard} href={REPO_URL} target="_blank" rel="noreferrer">
            <span
              aria-hidden="true"
              className="grid size-12 flex-none place-items-center rounded-xl border-[2.5px] border-toy-ink bg-toy-ink text-cream"
            >
              <GithubIcon size={20} />
            </span>
            <div>
              <b className="block font-toy text-[17px] font-black uppercase">GitHub repository</b>
              <span className="font-pixel text-[10px] text-toy-ink-3">DESTEGIO/FRONTEND-LAB</span>
            </div>
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" className="ml-auto" />
          </a>
          <Link className={linkCard} to={ROUTES.playground}>
            <span
              aria-hidden="true"
              className="grid size-12 flex-none place-items-center rounded-xl border-[2.5px] border-toy-ink bg-tomato"
            >
              <Zap size={20} strokeWidth={2.6} />
            </span>
            <div>
              <b className="block font-toy text-[17px] font-black uppercase">Open the playground</b>
              <span className="font-pixel text-[10px] text-toy-ink-3">START BREAKING THINGS</span>
            </div>
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" className="ml-auto" />
          </Link>
        </div>
      </article>
    </>
  );
}
