import { ArrowRight, Check } from 'lucide-react';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { GithubIcon } from '@/components/ui/icons';
import { Tag } from '@/components/ui/Tag';
import { REPO_URL, ROUTES } from '@/lib/links';
import { LandingBench } from './LandingBench';

const wrap = 'mx-auto max-w-[1280px] px-4 site-md:px-10';

const SPECS: [string, string][] = [
  ['latency', '0–60 s'],
  ['failure', '0–100%'],
  ['items', '1–240'],
  ['conditions', '8, stackable'],
];

function WayVisual({ n }: { n: number }) {
  const box =
    'relative flex h-[108px] justify-center gap-2 overflow-hidden rounded-md border border-line bg-surface-2 p-3.5';
  const column = `${box} flex-col`;
  const chips = `${box} flex-row flex-wrap content-center items-center gap-1.5 [&>*]:h-6 [&>*]:px-1.5 [&>*]:text-[10.5px]`;
  switch (n) {
    case 1:
      return (
        <div className={column} aria-hidden="true">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink-2">Latency</span>
            <span className="rounded-xs border border-amber-line bg-amber-soft px-2 py-[5px] font-mono text-xs leading-none font-semibold text-amber-ink">
              8.5 s
            </span>
          </div>
          <div className="relative h-1.5 rounded-[3px] bg-[#E3E6ED]">
            <i className="absolute inset-y-0 left-0 w-[30%] rounded-[3px] bg-amber-strong" />
            <b className="absolute top-1/2 left-[30%] -mt-[9px] -ml-[9px] size-[18px] rounded-full border-2 border-amber-strong bg-white shadow-1" />
          </div>
        </div>
      );
    case 2:
      return (
        <div className={chips} aria-hidden="true">
          <Tag tone="err">500</Tag>
          <Tag tone="err">503</Tag>
          <Tag>ERR offline</Tag>
          <Tag tone="ui">200</Tag>
        </div>
      );
    case 3:
      return (
        <div className={`${column} gap-[5px]`} aria-hidden="true">
          <div className="flex items-center gap-2 rounded-[9px] border border-line bg-white px-2 py-1.5 text-[11.5px] font-semibold shadow-1">
            <span className="grid size-[18px] place-items-center rounded-[5px] bg-mint-soft text-mint-ink">
              <Check size={11} />
            </span>
            ×250 clicks
          </div>
        </div>
      );
    case 4:
      return (
        <div className={column} aria-hidden="true">
          <div className="w-[76%] rounded-sm border border-dashed border-coral-line bg-white px-2.5 py-2">
            <div className="text-[17px] font-extrabold tracking-[-0.01em] whitespace-nowrap">
              Çéråmîççéråmîç Mûgmûg
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className={chips} aria-hidden="true">
          <Tag tone="net">latency 20 s</Tag>
          <Tag tone="err">fail 60%</Tag>
          <Tag tone="load">burst ×50</Tag>
          <Tag tone="ui">160 items</Tag>
        </div>
      );
  }
}

const WAYS = [
  ['Slow things down', 'Stretch every request from instant to a full minute.'],
  ['Break requests', 'Fail a share of calls, or cut the network entirely.'],
  ['Overload interactions', 'Fire bursts, rapid clicks and endless repeats.'],
  ['Distort layouts', 'Inflate copy, multiply items, stretch every word.'],
  ['Combine everything', 'Stack conditions freely, or hit Chaos and watch.'],
] as const;

export function LandingPage() {
  return (
    <>
      <title>Frontend Lab | Make the web misbehave</title>

      <section
        aria-labelledby="hero-title"
        className={`${wrap} grid grid-cols-1 items-center gap-14 pt-10 pb-16 site-md:gap-[72px] site-md:pt-14 site-md:pb-24 site-lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] site-lg:gap-16 site-lg:pt-20`}
      >
        <div>
          <span className="inline-flex h-[30px] items-center gap-2 rounded-full border border-line bg-surface px-3 text-[13px] font-semibold text-ink-2">
            <span aria-hidden="true" className="size-[7px] rounded-full bg-mint-ink" />
            Runs in your browser · nothing to install
          </span>
          <h1
            id="hero-title"
            className="mt-6 mb-[22px] text-[46px] leading-none font-extrabold tracking-[-0.04em] site-md:text-[64px] site-lg:text-[76px]"
          >
            Make the web{' '}
            <span className="inline-block text-accent transition-[text-shadow] duration-300 ease-lab [text-shadow:4px_4px_0_var(--color-coral-shadow)] hover:[text-shadow:7px_6px_0_var(--color-coral-shadow)]">
              misbehave.
            </span>
          </h1>
          <p className="mb-[34px] max-w-[520px] text-[17px] leading-[1.6] text-ink-2 site-md:text-[19px]">
            A playful frontend playground where you can push interfaces to their limits, trigger
            unexpected behaviors, and see what happens.
          </p>
          <div className="flex flex-wrap gap-3 max-site-md:[&>*]:w-full">
            <ButtonLink to={ROUTES.playground} variant="primary" size="lg">
              Enter Playground
              <ArrowRight size={18} aria-hidden="true" />
            </ButtonLink>
            <ButtonAnchor href={REPO_URL} size="lg">
              <GithubIcon />
              View source
            </ButtonAnchor>
          </div>
          <dl className="mt-10 mb-0 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-5 font-mono text-[12.5px] font-medium site-md:gap-x-6 site-md:gap-y-2.5">
            {SPECS.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-ink-3">{k}</dt>
                <dd className="m-0 font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <LandingBench />
      </section>

      <section aria-labelledby="ways-title" className={`${wrap} pb-24`}>
        <div className="mb-7 flex flex-col items-start justify-between gap-6 site-md:flex-row site-md:items-end">
          <div>
            <span className="font-mono text-xs font-semibold tracking-[0.08em] text-accent-ink uppercase">
              What you can do
            </span>
            <h2
              id="ways-title"
              className="mt-2 mb-0 text-[32px] leading-[1.05] font-extrabold tracking-[-0.03em] site-md:text-[40px]"
            >
              Five ways to misbehave
            </h2>
          </div>
          <p className="m-0 max-w-[400px] text-[15.5px] leading-[1.6] text-ink-2">
            Every control changes how the Demo Store behaves the next time it does something. Stack
            them, push them, put them back.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 site-md:grid-cols-2 site-lg:grid-cols-5">
          {WAYS.map(([title, text], i) => (
            <article
              key={title}
              className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-[18px] transition-[transform,box-shadow,border-color] duration-250 ease-lab hover:-translate-y-[3px] hover:border-line-2 hover:shadow-2 site-md:last:col-span-full site-lg:last:col-span-1"
            >
              <WayVisual n={i + 1} />
              <div>
                <span className="font-mono text-[11.5px] font-semibold text-ink-3">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="m-0 text-[17px] font-bold tracking-[-0.01em]">{title}</h3>
                <p className="mt-1.5 mb-0 text-sm leading-[1.55] text-ink-2">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="band-title" className={`${wrap} pb-[88px]`}>
        <div className="relative flex flex-col items-start justify-between gap-10 overflow-hidden rounded-[22px] bg-ink px-6 py-8 text-white site-md:rounded-2xl site-md:p-14 site-lg:flex-row site-lg:items-center">
          <span
            aria-hidden="true"
            className="absolute -top-[50px] -right-[50px] size-[150px] rotate-12 rounded-[56px] bg-accent opacity-90 site-md:-top-[60px] site-md:-right-[60px] site-md:size-[260px]"
          />
          <span
            aria-hidden="true"
            className="absolute -top-[50px] -right-[50px] size-[150px] rotate-12 rounded-[56px] border-2 border-coral site-md:-top-[44px] site-md:-right-[44px] site-md:size-[260px]"
          />
          <div className="relative z-1">
            <h2
              id="band-title"
              className="m-0 max-w-[680px] text-[30px] leading-[1.08] font-extrabold tracking-[-0.03em] site-md:text-[44px]"
            >
              No lessons. No scores. Just a store you’re allowed to break.
            </h2>
            <p className="mt-3.5 mb-0 max-w-[560px] text-base leading-[1.6] text-[#B9BED1]">
              Open the playground and start changing things. Reset puts everything back in one
              click.
            </p>
          </div>
          <ButtonLink to={ROUTES.playground} variant="light" size="lg" className="relative z-1">
            Enter Playground
            <ArrowRight size={18} aria-hidden="true" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
