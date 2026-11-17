import { Check, CircleAlert, Lock, MousePointer2, X } from 'lucide-react';
import type { RefObject } from 'react';
import { Tag } from '@/components/ui/Tag';
import type { Device } from '@/hooks/useDevice';
import { cn } from '@/lib/cn';
import type { DemoStore } from '@/features/demo-store/useDemoStore';
import type { Toast } from '@/features/demo-store/storeState';
import { useSimulation } from '@/simulation/adapters/hooks';
import type { ActiveCondition } from '@/simulation/conditions';

const toastIcon: Record<Toast['kind'], { icon: React.ReactNode; tone: string }> = {
  ok: { icon: <Check size={14} />, tone: 'bg-mint-soft text-mint-ink' },
  err: { icon: <CircleAlert size={14} />, tone: 'bg-coral-soft text-coral-ink' },
  info: { icon: <MousePointer2 size={14} />, tone: 'bg-accent-soft text-accent-ink' },
};

type PreviewFrameProps = {
  store: DemoStore;
  device: Device;
  conditions: ActiveCondition[];
  scrollRef: RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
};

/**
 * Browser-like frame around the Demo Store. The store scrolls and overflows inside it, so
 * however badly it breaks, the lab around it keeps its size and position.
 */
export function PreviewFrame({
  store,
  device,
  conditions,
  scrollRef,
  children,
}: PreviewFrameProps) {
  const inFlight = useSimulation((s) => s.stats.inFlight);
  const offline = useSimulation((s) => s.config.network.offline);
  const chaos = useSimulation((s) => s.config.chaos.enabled);
  const { state } = store;
  const loading = state.status === 'loading';
  const busy = inFlight > 0;

  const maxTags = device === 'mobile' ? 2 : device === 'tablet' ? 3 : 4;
  const tags = conditions.slice(0, maxTags);
  const moreTags = conditions.length - tags.length;
  const maxToasts = device === 'mobile' ? 2 : 3;
  const toasts = state.toasts.slice(0, maxToasts);
  const moreToasts = state.toasts.length - toasts.length;

  const meterPct = Math.min(100, inFlight * 2.5);
  const meterColor =
    inFlight > 40 ? 'bg-coral-strong' : inFlight > 10 ? 'bg-amber-strong' : 'bg-accent';

  const liveText = loading
    ? 'Loading products…'
    : busy
      ? `${inFlight} ${inFlight === 1 ? 'request' : 'requests'} in flight`
      : offline
        ? 'Offline'
        : 'Ready';

  const path =
    '/shop' +
    (state.resolved.category !== 'All' ? `/${state.resolved.category.toLowerCase()}` : '') +
    (state.resolved.query ? `?q=${state.resolved.query}` : '');

  return (
    <section
      aria-label="Live preview of Demo Store"
      className={cn(
        'lab-preview relative flex min-h-0 flex-col overflow-hidden rounded-xl border bg-surface',
        'transition-[box-shadow,border-color] duration-350',
        device === 'mobile' && 'rounded-lg',
        chaos
          ? 'border-coral-line shadow-[0_0_0_4px_var(--color-coral-soft),var(--shadow-3)]'
          : conditions.length > 0
            ? 'border-accent-line shadow-3'
            : 'border-line shadow-3',
      )}
    >
      <div className="flex h-[50px] flex-none items-center gap-3 border-b border-line bg-surface-2 px-3.5 lab-mobile:h-11 lab-mobile:gap-2 lab-mobile:px-2.5">
        <span className="inline-flex min-w-[150px] items-center gap-2 text-[12.5px] font-bold whitespace-nowrap text-ink-2 lab-mobile:min-w-0 lab-mobile:text-xs">
          <span
            aria-hidden="true"
            className={cn(
              'size-2 flex-none rounded-full',
              busy || loading
                ? 'animate-pulse-ring bg-accent'
                : offline
                  ? 'bg-ink-3'
                  : 'bg-mint-ink',
            )}
          />
          {liveText}
        </span>
        {device !== 'mobile' && (
          <span className="flex h-[30px] min-w-0 flex-[0_1_280px] items-center gap-[7px] overflow-hidden rounded-sm border border-line bg-surface px-[11px] font-mono text-xs font-medium whitespace-nowrap text-ink-2">
            <Lock size={12} className="text-mint-ink" aria-hidden="true" />
            <span className="truncate">demo-store.app{path}</span>
          </span>
        )}
        <div className="ml-auto flex min-w-0 gap-1.5 overflow-hidden">
          {tags.map((c) => (
            <Tag key={c.key} tone={c.tone}>
              {c.label}
            </Tag>
          ))}
          {moreTags > 0 && <Tag>+{moreTags}</Tag>}
        </div>
      </div>

      <div className="relative h-[3px] flex-none" aria-hidden="true">
        <i
          className={cn(
            'absolute inset-y-0 left-0 transition-[width,background-color] duration-350 ease-lab',
            meterColor,
          )}
          style={{ width: `${meterPct}%` }}
        />
      </div>

      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-auto bg-white">
        {children}
      </div>

      <div
        aria-live="polite"
        className={cn(
          'pointer-events-none absolute z-4 flex flex-col items-end gap-2',
          device === 'mobile' ? 'inset-x-2.5 bottom-2.5 items-stretch' : 'right-4 bottom-4',
        )}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'err' ? 'alert' : undefined}
            className={cn(
              'pointer-events-auto flex animate-tin items-start gap-2.5 rounded-md border bg-white py-3 pr-2.5 pl-3 text-[13px] shadow-3',
              device === 'mobile' ? 'w-auto' : 'w-[310px]',
              t.kind === 'err' ? 'border-coral-line' : 'border-line',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'grid size-6 flex-none place-items-center rounded-[7px]',
                toastIcon[t.kind].tone,
              )}
            >
              {toastIcon[t.kind].icon}
            </span>
            <div className="min-w-0 flex-1">
              <b className="mb-0.5 block text-[13px] font-bold">{t.title}</b>
              <span className="block truncate text-ink-3">{t.message}</span>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => store.dismissToast(t.id)}
              className="grid size-[26px] flex-none cursor-pointer place-items-center rounded-[7px] text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        {moreToasts > 0 && (
          <span className="pointer-events-auto self-end rounded-full border border-line bg-white px-2.5 py-[5px] font-mono text-[11px] font-semibold text-ink-2 shadow-1">
            +{moreToasts} more
          </span>
        )}
      </div>
    </section>
  );
}
