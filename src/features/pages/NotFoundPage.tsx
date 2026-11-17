import { ToyLink } from '@/components/toy/toy';
import { ServerMascot } from '@/features/playground/fun/ServerMascot';
import { ROUTES } from '@/lib/links';

export function NotFoundPage() {
  return (
    <>
      <title>Not found | Frontend Lab</title>
      <section className="mx-auto flex max-w-[760px] flex-col items-start gap-5 px-4 py-20 site-md:px-10">
        <ServerMascot mood="offline" size={120} />
        <span className="font-pixel text-[13px] text-tomato-dark">404 · ERR NOT FOUND</span>
        <h1 className="m-0 font-toy text-[44px] leading-none font-black tracking-[-0.02em] uppercase">
          This page misbehaved a little too well.
        </h1>
        <p className="m-0 font-toy text-[17px] leading-[1.6] font-medium text-toy-ink-2">
          Nothing lives at this address. The playground is still where you left it.
        </p>
        <ToyLink to={ROUTES.playground} tone="tomato">
          Enter Playground
        </ToyLink>
      </section>
    </>
  );
}
