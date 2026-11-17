// Phase 1 placeholder: heading and intro. Facts, lists and link cards land in Phase 2.
export function AboutPage() {
  return (
    <>
      <title>About | Frontend Lab</title>
      <article className="mx-auto max-w-[760px] px-4 pt-11 pb-[72px] site-md:px-10 site-md:pt-[72px] site-md:pb-24">
        <h1 className="mt-[22px] mb-5 text-[40px] leading-[1.04] font-extrabold tracking-[-0.035em] site-md:text-[56px]">
          A small store you’re allowed to break.
        </h1>
        <p className="text-[16.5px] leading-[1.7] text-ink-2">
          Frontend Lab is a browser playground built around one miniature web app, the Demo Store.
          Around it sit a handful of controls that change how the network, the server and the
          content behave. Change them, use the store, and watch what holds up.
        </p>
      </article>
    </>
  );
}
