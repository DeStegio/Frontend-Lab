import { Check, CircleAlert, Maximize2, Minimize2, MousePointer2, X } from 'lucide-react';
import { ToyButton } from '@/components/toy/toy';
import type { RefObject } from 'react';
import type { Toast } from '@/features/demo-store/storeState';
import type { DemoStore } from '@/features/demo-store/useDemoStore';
import type { Device } from '@/hooks/useDevice';
import { cn } from '@/lib/cn';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { clearCondition, type ActiveCondition, type ConditionTone } from '@/simulation/conditions';
import { loadLevel } from './fun/mood';
import type { Lab } from './useLab';

const toastIcon: Record<Toast['kind'], { icon: React.ReactNode; tone: string }> = {
  ok: { icon: <Check size={14} />, tone: 'bg-mint-soft text-mint-ink' },
  err: { icon: <CircleAlert size={14} />, tone: 'bg-coral-soft text-coral-ink' },
  info: { icon: <MousePointer2 size={14} />, tone: 'bg-accent-soft text-accent-ink' },
};

const stickerTone: Record<ConditionTone, string> = {
  net: 'bg-sun',
  err: 'bg-tomato',
  load: 'bg-grape',
  ui: 'bg-leaf',
};

type ScreenProps = {
  /** Whether the screen fills the stage; undefined hides the toggle (phones are already full). */
  expanded?: boolean;
  onToggleExpanded?: () => void;
  store: DemoStore;
  lab: Lab;
  device: Device;
  conditions: ActiveCondition[];
  scrollRef: RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
};

/**
 * The arcade screen. The Demo Store keeps its ordinary web-shop look inside; the dark bezel
 * around it carries the lab: live status, condition stickers, and the chaos hazard tape.
 * The store scrolls and overflows inside, so the lab around it never moves.
 */
export function Screen({
  expanded,
  onToggleExpanded,
  store,
  lab,
  device,
  conditions,
  scrollRef,
  children,
}: ScreenProps) {
  const engine = useEngine();
  const inFlight = useSimulation((s) => s.stats.inFlight);
  const offline = useSimulation((s) => s.config.network.offline);
  const { state } = store;
  const loading = state.status === 'loading';
  const busy = inFlight > 0;
  const load = loadLevel(inFlight);

  const maxStickers = device === 'mobile' ? 2 : device === 'tablet' ? 4 : 5;
  const stickers = conditions.slice(0, maxStickers);
  const moreStickers = conditions.length - stickers.length;
  const maxToasts = device === 'mobile' ? 2 : 3;
  const toasts = state.toasts.slice(0, maxToasts);
  const moreToasts = state.toasts.length - toasts.length;

  const liveText = loading
    ? 'LOADING…'
    : busy
      ? `${inFlight} IN FLIGHT`
      : offline
        ? 'NO SIGNAL'
        : 'READY';
  const path =
    '/shop' +
    (state.resolved.category !== 'All' ? `/${state.resolved.category.toLowerCase()}` : '') +
    (state.resolved.query ? `?q=${state.resolved.query}` : '');

  return (
    <section
      aria-label="Live preview of Demo Store"
      className="lab-screen lab-screen-frame toy-surface relative flex min-h-0 flex-col bg-toy-ink p-2 transition-[padding] duration-300"
    >
      <div className="flex min-h-[38px] flex-none items-center gap-2.5 px-1.5 pb-2">
        <span className="inline-flex items-center gap-2 rounded-lg bg-toy-ink px-2 py-1 font-pixel text-[11px] whitespace-nowrap text-cream">
          <span
            aria-hidden="true"
            className={cn(
              'size-2.5 rounded-full border-2 border-cream',
              busy || loading ? 'animate-pulse bg-sun' : offline ? 'bg-tomato' : 'bg-leaf',
            )}
          />
          {liveText}
        </span>
        {device !== 'mobile' && (
          <span className="min-w-0 truncate rounded-md bg-[#3a3150] px-2 py-1 font-pixel text-[10px] text-cream">
            demo-store.app{path}
          </span>
        )}
        <ul
          aria-label="Active conditions"
          className="m-0 ml-auto flex min-w-0 list-none items-center gap-1.5 p-0"
        >
          {stickers.map((c, i) => (
            <li
              key={c.key}
              className={cn(
                'inline-flex h-7 flex-none animate-pop items-center gap-1 rounded-lg border-2 border-toy-ink pr-0.5 pl-2 font-pixel text-[10px] text-toy-ink',
                stickerTone[c.tone],
                i % 2 ? 'rotate-2' : '-rotate-2',
              )}
            >
              {c.label}
              <button
                type="button"
                aria-label={`Remove ${c.name}`}
                onClick={() => engine.setConfig(clearCondition(c.key))}
                className="grid size-6 cursor-pointer place-items-center rounded-md hover:bg-toy-ink/15"
              >
                <X size={12} strokeWidth={3} aria-hidden="true" />
              </button>
            </li>
          ))}
          {moreStickers > 0 && (
            <li className="flex-none rounded-lg border-2 border-cream/60 px-1.5 py-1 font-pixel text-[10px] text-cream">
              +{moreStickers}
            </li>
          )}
          {conditions.length === 0 && device !== 'mobile' && (
            <li className="font-pixel text-[10px] text-cream/70">ALL CONDITIONS NORMAL</li>
          )}
        </ul>
        {onToggleExpanded && (
          <ToyButton
            size="sm"
            tone={expanded ? 'sun' : 'paper'}
            aria-pressed={expanded}
            onClick={onToggleExpanded}
            className="h-8 flex-none px-2.5"
          >
            {expanded ? (
              <Minimize2 size={14} strokeWidth={2.8} aria-hidden="true" />
            ) : (
              <Maximize2 size={14} strokeWidth={2.8} aria-hidden="true" />
            )}
            {expanded ? 'Shrink store' : 'Expand store'}
          </ToyButton>
        )}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] border-2 border-toy-ink bg-white">
        <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-auto">
          <div className={cn('min-h-full origin-top', load > 0 && `lab-load-${load}`)}>
            {children}
          </div>
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
                device === 'mobile' ? 'w-auto' : 'w-[300px]',
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

        {lab.countdown !== null && (
          <div
            role="status"
            className="absolute inset-0 z-10 grid place-items-center bg-toy-ink/55"
          >
            <span className="sr-only">Chaos in </span>
            <span
              key={lab.countdown}
              className="lab-countdown font-pixel text-[120px] leading-none text-sun [text-shadow:6px_6px_0_var(--color-toy-ink)]"
            >
              {lab.countdown}
            </span>
          </div>
        )}
        {lab.foam > 0 && (
          <div key={lab.foam} aria-hidden="true" className="lab-foam absolute inset-0 z-10" />
        )}
      </div>
    </section>
  );
}
