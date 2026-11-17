import { ButtonLink } from '@/components/ui/Button';
import { ROUTES } from '@/lib/links';

export function NotFoundPage() {
  return (
    <>
      <title>Not found | Frontend Lab</title>
      <section className="mx-auto flex max-w-[760px] flex-col items-start gap-4 px-4 py-24 site-md:px-10">
        <span className="font-mono text-xs font-semibold tracking-[0.08em] text-accent-ink uppercase">
          404 · ERR not found
        </span>
        <h1 className="text-[40px] leading-none font-extrabold tracking-[-0.035em]">
          This page misbehaved a little too well.
        </h1>
        <p className="text-[16.5px] leading-[1.7] text-ink-2">
          Nothing lives at this address. The playground is still where you left it.
        </p>
        <ButtonLink to={ROUTES.playground} variant="primary">
          Enter Playground
        </ButtonLink>
      </section>
    </>
  );
}
