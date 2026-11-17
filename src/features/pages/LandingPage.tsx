import { ArrowRight, Shuffle, Timer, Type, Unplug, Zap } from 'lucide-react';
import { Led, ToyAnchor, ToyLink } from '@/components/toy/toy';
import { GithubIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { REPO_URL, ROUTES } from '@/lib/links';
import { HeroArt } from './HeroArt';

const wrap = 'mx-auto max-w-[1280px] px-4 site-md:px-10';

const SPECS: [string, string][] = [
  ['latency', '0-60 s'],
  ['failure', '0-100%'],
  ['items', '1-240'],
  ['conditions', '8, stackable'],
];

const WAYS = [
  {
    title: 'Slow things down',
    text: 'Stretch every request from instant to a full minute. Watch packets crawl.',
    icon: <Timer size={22} strokeWidth={2.6} />,
    tone: 'bg-sky',
  },
  {
    title: 'Break requests',
    text: 'Fail a share of calls, or pull the cable and watch them hit a wall.',
    icon: <Unplug size={22} strokeWidth={2.6} />,
    tone: 'bg-tomato',
  },
  {
    title: 'Overload it',
    text: 'Bursts, 250 rapid clicks, endless repeats. The store starts to shake.',
    icon: <Zap size={22} strokeWidth={2.6} />,
    tone: 'bg-grape',
  },
  {
    title: 'Distort layouts',
    text: 'Inflate copy, multiply items, stretch every wörd until cards give up.',
    icon: <Type size={22} strokeWidth={2.6} />,
    tone: 'bg-leaf',
  },
  {
    title: 'Hit the red button',
    text: 'Chaos mode stacks everything at once. Same seed, same mess, every time.',
    icon: <Shuffle size={22} strokeWidth={2.6} />,
    tone: 'bg-sun',
  },
];

export function LandingPage() {
  return (
    <>
      <title>Frontend Lab | Make the web misbehave</title>

      <section
        aria-labelledby="hero-title"
        className={`${wrap} grid grid-cols-1 items-center gap-10 pt-10 pb-16 site-md:pt-16 site-lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] site-lg:gap-12 site-lg:pt-20 site-lg:pb-24`}
      >
        <div>
          <span className="toy-surface inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-pixel text-[11px]">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full border-2 border-toy-ink bg-leaf"
            />
            RUNS IN YOUR BROWSER · NOTHING TO INSTALL
          </span>
          <h1
            id="hero-title"
            className="mt-7 mb-6 font-toy text-[52px] leading-[0.95] font-black tracking-[-0.03em] uppercase site-md:text-[76px] site-lg:text-[88px]"
          >
            Make the web{' '}
            <span className="toy-surface mt-2 inline-block -rotate-3 rounded-[22px] bg-tomato px-4 pb-1 transition-transform duration-200 ease-lab hover:scale-105 hover:rotate-2">
              misbehave.
            </span>
          </h1>
          <p className="mb-9 max-w-[540px] font-toy text-[18px] leading-[1.55] font-medium text-toy-ink-2 site-md:text-[20px]">
            A toy lab with one tiny web store inside. Slow it down, break its requests, flood it
            with clicks, then hit the big red button and watch everything go wrong.
          </p>
          <div className="flex flex-wrap gap-4 max-site-md:[&>*]:w-full">
            <ToyLink to={ROUTES.playground} tone="tomato" size="lg">
              Enter Playground
              <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
            </ToyLink>
            <ToyAnchor href={REPO_URL} size="lg">
              <GithubIcon size={20} />
              View source
            </ToyAnchor>
          </div>
          <dl className="mt-10 mb-0 flex flex-wrap gap-2.5">
            {SPECS.map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <dt className="font-pixel text-[11px] text-toy-ink-3 uppercase">{k}</dt>
                <dd className="m-0">
                  <Led>{v.toUpperCase()}</Led>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroArt />
      </section>

      <section aria-labelledby="ways-title" className={`${wrap} pb-24`}>
        <div className="mb-9 flex flex-col items-start justify-between gap-5 site-md:flex-row site-md:items-end">
          <div>
            <span className="font-pixel text-[12px] text-tomato-dark">WHAT YOU CAN DO</span>
            <h2
              id="ways-title"
              className="mt-2 mb-0 font-toy text-[36px] leading-none font-black tracking-[-0.02em] uppercase site-md:text-[48px]"
            >
              Five ways to misbehave
            </h2>
          </div>
          <p className="m-0 max-w-[420px] font-toy text-[16px] leading-[1.55] font-medium text-toy-ink-2">
            Every control changes how the store behaves the next time it does something. Stack them,
            push them, put them back with the extinguisher.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 site-md:grid-cols-2 site-lg:grid-cols-5">
          {WAYS.map((w, i) => (
            <article
              key={w.title}
              className={cn(
                'toy-surface flex flex-col gap-4 p-5 transition-transform duration-200 ease-lab hover:-translate-y-1',
                i % 2 ? 'hover:rotate-1' : 'hover:-rotate-1',
                'site-md:last:col-span-full site-lg:last:col-span-1',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-12 place-items-center rounded-2xl border-[2.5px] border-toy-ink',
                  w.tone,
                )}
              >
                {w.icon}
              </span>
              <div>
                <span className="font-pixel text-[11px] text-toy-ink-3">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-1 mb-0 font-toy text-[19px] leading-tight font-black uppercase">
                  {w.title}
                </h3>
                <p className="mt-2 mb-0 font-toy text-[14.5px] leading-[1.5] font-medium text-toy-ink-2">
                  {w.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="band-title" className={`${wrap} pb-24`}>
        <div className="toy-surface overflow-hidden bg-toy-ink text-cream">
          <div aria-hidden="true" className="hazard h-5 border-b-[2.5px] border-toy-ink" />
          <div className="flex flex-col items-start justify-between gap-8 px-6 py-10 site-md:px-12 site-md:py-14 site-lg:flex-row site-lg:items-center">
            <div>
              <h2
                id="band-title"
                className="m-0 max-w-[720px] font-toy text-[32px] leading-[1.02] font-black tracking-[-0.02em] uppercase site-md:text-[48px]"
              >
                No lessons. No scores. Just a store you’re allowed to break.
              </h2>
              <p className="mt-4 mb-0 max-w-[560px] font-toy text-[17px] leading-[1.55] font-medium text-cream/80">
                Open the playground and start pulling levers. The extinguisher puts everything back
                in one click.
              </p>
            </div>
            <ToyLink to={ROUTES.playground} tone="sun" size="lg">
              Enter Playground
              <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
            </ToyLink>
          </div>
        </div>
      </section>
    </>
  );
}
