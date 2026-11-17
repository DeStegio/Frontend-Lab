import { CircleAlert, Search, ShoppingBag, X } from 'lucide-react';
import { ChaosIcon } from '@/components/ui/icons';
import { Tag } from '@/components/ui/Tag';
import { ProductCard } from '@/features/demo-store/components/ProductCard';

const float = 'absolute z-3 rounded-lg border border-line bg-surface shadow-3';

/** Illustration of the playground mid-experiment. Decorative: described by its aria-label. */
export function LandingBench() {
  return (
    <div
      role="img"
      aria-label="Preview of the playground: the Demo Store running with 12 seconds of latency and 35% request failure, one card still loading, one product name overflowing its card, and an error notification."
      className="lab-dots relative rounded-2xl border border-line px-3 pt-10 pb-11 site-md:mx-6 site-md:px-12 site-md:py-14 site-lg:mx-0"
    >
      <div aria-hidden="true">
        <div
          className={`${float} top-[-22px] left-2 flex w-[200px] flex-col gap-2 px-4 py-3.5 site-md:top-[-26px] site-md:left-[-36px] site-md:w-[232px]`}
        >
          <div className="flex items-center justify-between gap-2.5">
            <span className="text-[13px] font-semibold text-ink-2">Latency</span>
            <span className="min-w-14 rounded-xs border border-coral-line bg-coral-soft px-2 py-[5px] text-center font-mono text-xs leading-none font-semibold text-coral-ink">
              12.0 s
            </span>
          </div>
          <div className="relative h-1.5 rounded-[3px] bg-[#E3E6ED]">
            <i className="absolute inset-y-0 left-0 w-[62%] rounded-[3px] bg-coral-strong" />
            <b className="absolute top-1/2 left-[62%] -mt-[9px] -ml-[9px] size-[18px] rounded-full border-2 border-coral-strong bg-white shadow-1" />
          </div>
          <div className="flex justify-between font-mono text-[10.5px] leading-none font-medium text-ink-3">
            <span>0 s</span>
            <span>60 s</span>
          </div>
        </div>

        <div
          className={`${float} bottom-[92px] left-[-44px] hidden items-center gap-3 px-3.5 py-3 site-md:flex`}
        >
          <span className="grid size-[30px] place-items-center rounded-[9px] bg-coral-soft text-coral-ink">
            <CircleAlert size={16} />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-ink-2">Request failure</div>
            <div className="mt-0.5 text-[11.5px] font-medium text-ink-3">35% of calls fail</div>
          </div>
          <span className="relative h-6 w-[42px] flex-none rounded-full bg-coral-strong after:absolute after:top-[3px] after:left-[21px] after:size-[18px] after:rounded-full after:bg-white" />
        </div>

        <div
          className={`${float} right-2 bottom-[-24px] flex items-center gap-2.5 p-2.5 site-md:right-[-30px] site-md:bottom-[-30px]`}
        >
          <Tag tone="net">latency 12 s</Tag>
          <span className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-ink px-3.5 text-[13px] font-semibold whitespace-nowrap text-white">
            <ChaosIcon size={14} />
            Engage chaos
          </span>
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-[18px] border border-line bg-white shadow-3">
          <div className="flex h-11 items-center gap-2.5 border-b border-line bg-surface-2 px-3">
            <span className="inline-flex items-center gap-[7px] text-xs font-bold whitespace-nowrap text-ink-2">
              <span className="size-2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(85,70,232,.15)]" />
              3 requests in flight
            </span>
            <div className="ml-auto flex gap-1.5 [&>*:nth-child(n+2)]:hidden site-md:[&>*:nth-child(n+2)]:inline-flex">
              <Tag tone="net">latency 12 s</Tag>
              <Tag tone="err">fail 35%</Tag>
              <Tag tone="ui">text +70%</Tag>
            </div>
          </div>
          <div className="h-[3px]">
            <i className="block h-[3px] w-[46%] bg-amber-strong" />
          </div>

          <div className="@container/store bg-white">
            <div className="flex items-center gap-3 border-b border-[#EEF0F4] px-4 py-3">
              <div className="flex items-center gap-2 text-base font-extrabold tracking-[-0.02em] whitespace-nowrap">
                <b className="inline-block size-5 rounded-[50%_50%_50%_4px] bg-ink" />
                Demo Store
              </div>
              <span className="hidden h-[34px] max-w-[420px] flex-1 items-center gap-2 rounded-[10px] border border-line bg-surface-2 px-3 text-[13px] text-[#656B82] site-md:flex">
                <Search size={14} />
                Search mugs, lamps, linen…
              </span>
              <span className="relative ml-auto inline-flex h-[34px] items-center gap-2 rounded-[9px] border border-line-2 bg-surface px-3 text-[13px] font-semibold">
                <ShoppingBag size={15} />
                Cart
                <span className="absolute -top-[7px] -right-[7px] box-content h-5 min-w-5 rounded-full border-2 border-white bg-coral-ink px-[5px] text-center font-mono text-[11px] leading-5 font-bold text-white">
                  3
                </span>
              </span>
            </div>
            <div className="flex gap-2 px-4 pt-2.5 pb-1.5">
              {['All', 'Home', 'Kitchen', 'Desk'].map((c, i) => (
                <span
                  key={c}
                  className={
                    'inline-flex h-7 items-center rounded-full border px-[11px] text-xs font-semibold ' +
                    (i === 0 ? 'border-ink bg-ink text-white' : 'border-[#DDE1E8] text-ink-2')
                  }
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 items-start gap-3 px-4 pt-1.5 pb-[18px] site-md:grid-cols-3">
              <ProductCard
                still
                name="Ceramic Mug"
                plainName="Ceramic Mug"
                description="Stoneware with a soft matte glaze."
                category="Kitchen"
                price={18}
                tint="#F3E4D6"
                shape="circle"
                status="added"
              />
              <ProductCard
                still
                nowrapName
                name="Désk Låmpdéskdésk Låmplåmp"
                plainName="Desk Lamp"
                description="Wårm, dîmmåblé lîght för låté wörk."
                category="Desk"
                price={64}
                tint="#DCE4F2"
                shape="arch"
                status="failed"
              />
              <div className="hidden overflow-hidden rounded-[14px] border border-[#EEF0F4] bg-white site-md:block">
                <div className="lab-skeleton aspect-[4/3]" />
                <div className="lab-skeleton mx-3.5 mt-3 h-2.5 rounded-[5px]" />
                <div className="lab-skeleton mx-3.5 mt-3 h-2.5 w-[60%] rounded-[5px]" />
                <div className="lab-skeleton mx-3.5 mt-3 mb-4 h-2.5 w-[40%] rounded-[5px]" />
              </div>
            </div>
          </div>

          <div className="absolute inset-x-2.5 bottom-2.5 flex items-start gap-2.5 rounded-md border border-coral-line bg-white py-3 pr-2.5 pl-3 text-[13px] shadow-3 site-md:right-3.5 site-md:bottom-3.5 site-md:left-auto site-md:w-[268px]">
            <span className="grid size-6 flex-none place-items-center rounded-[7px] bg-coral-soft text-coral-ink">
              <CircleAlert size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <b className="mb-0.5 block font-bold">Couldn’t add item</b>
              <span className="block truncate text-ink-3">Desk Lamp · server error 503</span>
            </div>
            <X size={14} className="mt-1.5 mr-1.5 text-ink-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
