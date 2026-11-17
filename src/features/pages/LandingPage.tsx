import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { ROUTES } from '@/lib/links';

// Phase 1 placeholder: hero copy only. Full landing (bench preview, five ways, band) lands in Phase 2.
export function LandingPage() {
  return (
    <>
      <title>Frontend Lab | Make the web misbehave</title>
      <section className="mx-auto max-w-[1280px] px-4 py-16 site-md:px-10 site-md:py-20">
        <h1 className="text-[46px] leading-none font-extrabold tracking-[-0.04em] site-md:text-[64px] site-lg:text-[76px]">
          Make the web{' '}
          <span className="inline-block text-accent [text-shadow:4px_4px_0_var(--color-coral-shadow)]">
            misbehave.
          </span>
        </h1>
        <p className="mt-6 mb-8 max-w-[520px] text-[17px] leading-relaxed text-ink-2 site-md:text-[19px]">
          A playful frontend playground where you can push interfaces to their limits, trigger
          unexpected behaviors, and see what happens.
        </p>
        <ButtonLink to={ROUTES.playground} variant="primary" size="lg">
          Enter Playground
          <ArrowRight size={18} aria-hidden="true" />
        </ButtonLink>
      </section>
    </>
  );
}
