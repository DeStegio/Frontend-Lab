import { Search, ShoppingBag, WifiOff } from 'lucide-react';
import { useId, type RefObject } from 'react';
import { buttonClass } from '@/components/ui/buttonStyles';
import { cn } from '@/lib/cn';
import { useSimulation } from '@/simulation/adapters/hooks';
import { CLIENT_TIMEOUT_MS } from '../api';
import { CATEGORY_FILTERS } from '../catalog';
import type { DemoStore as Store } from '../useDemoStore';
import { ProductGrid } from './ProductGrid';
import { SkeletonCard } from './ProductCard';
import { StoreMessage } from './StoreMessage';

type DemoStoreProps = {
  store: Store;
  scrollRef: RefObject<HTMLElement | null>;
  onRenderedCountChange?: (count: number) => void;
};

/** The miniature web app the experiments target. Fully usable with every control at default. */
export function DemoStore({ store, scrollRef, onRenderedCountChange }: DemoStoreProps) {
  const { state, products, itemCount } = store;
  const offline = useSimulation((s) => s.config.network.offline);
  const mutation = useSimulation((s) => s.config.mutation);
  const searchId = useId();

  const loading = state.status === 'loading';
  const count =
    state.status === 'ready'
      ? `${products.length} ${products.length === 1 ? 'product' : 'products'}`
      : loading
        ? 'loading…'
        : '-';

  return (
    <div className="@container/store flex min-h-full flex-col bg-white text-ink">
      {offline && (
        <div
          role="status"
          className="flex animate-tin items-center gap-2.5 bg-ink px-5 py-2.5 text-[13px] font-semibold text-white"
        >
          <WifiOff size={16} aria-hidden="true" />
          <span>You’re offline. The store is still here, but nothing can reach the server.</span>
        </div>
      )}

      <div className="flex items-center gap-4 border-b border-[#EEF0F4] px-5 py-4 @max-lg/store:flex-wrap @max-lg/store:gap-2.5 @max-lg/store:p-3">
        <div className="flex items-center gap-2 text-base font-extrabold tracking-[-0.02em] whitespace-nowrap">
          <b aria-hidden="true" className="inline-block size-5 rounded-[50%_50%_50%_4px] bg-ink" />
          Demo Store
        </div>
        <label
          htmlFor={searchId}
          className={cn(
            'flex h-10 max-w-[420px] flex-1 items-center gap-2 rounded-[10px] border border-line bg-surface-2 px-3 text-ink-3',
            'transition-[border-color,box-shadow,background-color] duration-150',
            'focus-within:border-ink focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(22,26,44,.1)]',
            '@max-lg/store:order-3 @max-lg/store:h-11 @max-lg/store:max-w-none @max-lg/store:basis-full',
          )}
        >
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search products</span>
          <input
            id={searchId}
            type="search"
            placeholder="Search mugs, lamps, linen…"
            value={state.query}
            onChange={(e) => store.setQuery(e.target.value)}
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-[#656B82]"
          />
        </label>
        <button
          type="button"
          aria-label={`Cart, ${state.cart} ${state.cart === 1 ? 'item' : 'items'}`}
          className={cn(buttonClass({ size: 'sm' }), 'relative ml-auto pr-5 @max-lg/store:h-10')}
        >
          <ShoppingBag size={16} aria-hidden="true" />
          <span className="@max-lg/store:hidden">Cart</span>
          <span
            key={state.cartBumps}
            aria-hidden="true"
            className={cn(
              'absolute -top-[7px] -right-[7px] box-content h-5 min-w-5 rounded-full border-2 border-white bg-coral-ink px-[5px] text-center font-mono text-[11px] leading-5 font-bold text-white',
              state.cartBumps > 0 && 'animate-bump',
            )}
          >
            {state.cart}
          </span>
        </button>
      </div>

      <div
        role="group"
        aria-label="Filter by category"
        className="flex flex-wrap items-center gap-2 px-5 pt-3.5 pb-2.5 @max-lg/store:flex-nowrap @max-lg/store:overflow-x-auto @max-lg/store:px-3 @max-lg/store:pt-2.5 @max-lg/store:pb-2"
      >
        {CATEGORY_FILTERS.map((c) => {
          const pressed = state.category === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={pressed}
              onClick={() => store.setCategory(c)}
              className={cn(
                'h-8 cursor-pointer rounded-full border px-[13px] text-[13px] font-semibold whitespace-nowrap transition-colors duration-150 @max-lg/store:h-9',
                pressed
                  ? 'border-ink bg-ink text-white'
                  : 'border-[#DDE1E8] bg-white text-ink-2 hover:border-[#B9BFCC] hover:text-ink',
              )}
            >
              {c}
            </button>
          );
        })}
        <span className="ml-auto font-mono text-xs font-medium whitespace-nowrap text-ink-3 @max-lg/store:hidden">
          {count}
        </span>
      </div>

      <div aria-busy={loading} className="flex-1">
        {loading && (
          <div className="grid grid-cols-3 items-start gap-4 px-5 pt-1.5 pb-7 @max-lg/store:grid-cols-2 @max-lg/store:gap-2.5 @max-lg/store:px-3 @max-lg/store:pb-4 @min-[56rem]/store:grid-cols-4 @min-[80rem]/store:grid-cols-5 @min-[102rem]/store:grid-cols-6">
            {Array.from({ length: Math.max(1, Math.min(itemCount, 8)) }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
        {state.status !== 'loading' && state.status !== 'ready' && (
          <div className="px-5 pt-1.5 pb-7 @max-lg/store:px-3">
            {state.status === 'error' && (
              <StoreMessage
                kind="error"
                title="Products didn’t load"
                body="The server answered with an error. Your filters are kept, so you can try again."
                action="Try again"
                onAction={store.retry}
              />
            )}
            {state.status === 'offline' && (
              <StoreMessage
                kind="offline"
                title="No connection"
                body="Products can’t be fetched while you’re offline. Reconnect, then retry."
                action="Retry"
                onAction={store.retry}
              />
            )}
            {state.status === 'timeout' && (
              <StoreMessage
                kind="timeout"
                title="The server took too long"
                body={`No answer after ${CLIENT_TIMEOUT_MS / 1000} s, so the store gave up. Lower the latency or try again.`}
                action="Try again"
                onAction={store.retry}
              />
            )}
          </div>
        )}
        {state.status === 'ready' && products.length === 0 && (
          <div className="px-5 pt-1.5 pb-7 @max-lg/store:px-3">
            <StoreMessage
              kind="empty"
              title={`Nothing matches “${state.resolved.query}”`}
              body="Try another word or clear the search to see every product."
              action="Clear search"
              onAction={store.clearSearch}
            />
          </div>
        )}
        {state.status === 'ready' && products.length > 0 && (
          <ProductGrid
            products={products}
            adds={state.adds}
            mutation={mutation}
            onAdd={store.addToCart}
            scrollRef={scrollRef}
            onRenderedCountChange={onRenderedCountChange}
          />
        )}
      </div>
    </div>
  );
}
