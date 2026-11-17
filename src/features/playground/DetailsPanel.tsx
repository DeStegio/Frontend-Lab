import { CodeXml, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Device } from '@/hooks/useDevice';
import { cn } from '@/lib/cn';
import { useSimulation } from '@/simulation/adapters/hooks';
import type { LogKind } from '@/simulation/types';

const kindColor: Record<LogKind, string> = {
  ok: 'text-diag-ok',
  bad: 'text-diag-bad',
  off: 'text-diag-off',
  cancel: 'text-diag-muted',
};

const pad = (n: number, l = 2) => String(n).padStart(l, '0');
function clock(ms: number) {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

type DetailsPanelProps = {
  device: Device;
  renderedCards: number;
  totalItems: number;
  onClose: () => void;
};

/** Optional request log and counters, straight from the engine. */
export function DetailsPanel({ device, renderedCards, totalItems, onClose }: DetailsPanelProps) {
  const stats = useSimulation((s) => s.stats);
  const log = useSimulation((s) => s.log);
  const seed = useSimulation((s) => s.config.chaos.seed);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);

  const settled = stats.succeeded + stats.failed;
  const simulated = stats.simulatedActions;
  const cells: [string, string][] = [
    ['Sent', String(stats.sent)],
    ['Succeeded', String(stats.succeeded)],
    ['Failed', String(stats.failed)],
    ['In flight', String(stats.inFlight)],
    ['Avg. duration', settled ? `${Math.round(stats.totalDurationMs / settled)} ms` : '-'],
    ['Cards rendered', `${renderedCards} of ${totalItems}`],
  ];
  const compact = device !== 'desktop';
  const rowGrid =
    device === 'mobile'
      ? 'grid-cols-[44px_minmax(0,1fr)_58px_64px] gap-2 px-3'
      : 'grid-cols-[110px_60px_minmax(0,1fr)_92px_84px] gap-3 px-4';

  return (
    <section
      aria-label="Technical details"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      className={cn(
        'absolute z-20 flex animate-pop flex-col overflow-hidden rounded-[18px] border-[2.5px] border-toy-ink bg-ink text-diag-text shadow-[0_6px_0_var(--color-toy-ink)]',
        device === 'desktop' && 'inset-x-5 bottom-[18px] max-h-[min(440px,55%)]',
        device === 'tablet' && 'inset-x-4 top-[600px] max-h-[440px]',
        device === 'mobile' && 'inset-x-2.5 bottom-[70px] max-h-[62%]',
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-diag-line py-3 pr-3 pl-4">
        <span
          aria-hidden="true"
          className="grid size-[26px] place-items-center rounded-[7px] bg-diag-raised text-accent-line"
        >
          <CodeXml size={14} />
        </span>
        <h2 className="m-0 text-sm font-bold text-white">Technical details</h2>
        <span className="mr-auto truncate font-mono text-[11.5px] text-diag-muted">
          simulated in your browser · seed {seed}
          {simulated > 0 && ` · ${simulated.toLocaleString('en')} actions simulated`}
        </span>
        <button
          ref={closeRef}
          type="button"
          aria-label="Close technical details"
          onClick={onClose}
          className="grid size-8 cursor-pointer place-items-center rounded-sm text-[#C3C7D6] hover:bg-diag-raised hover:text-white"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <dl
        className={cn(
          'm-0 grid border-b border-diag-line',
          compact ? 'grid-cols-3' : 'grid-cols-6',
        )}
      >
        {cells.map(([label, value], i) => (
          <div
            key={label}
            className={cn(
              'flex flex-col gap-1 border-diag-line px-4 py-2.5',
              device === 'mobile' && 'px-3 py-2',
              compact ? (i % 3 !== 2 ? 'border-r' : '') : i < 5 ? 'border-r' : '',
              compact && i < 3 && 'border-b',
            )}
          >
            <dt className="text-[11px] font-semibold text-diag-muted">{label}</dt>
            <dd className="m-0 font-mono text-base font-semibold text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <div
        role="table"
        aria-label="Request log, newest first"
        className="overflow-auto pt-1 pb-2 font-mono text-xs leading-[1.4] font-medium"
      >
        <div role="rowgroup" className="sticky top-0 bg-ink">
          <div
            role="row"
            className={cn('grid items-center py-[5px] text-[11px] text-diag-muted', rowGrid)}
          >
            {device !== 'mobile' && <span role="columnheader">Time</span>}
            <span role="columnheader">Method</span>
            <span role="columnheader">Endpoint</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Duration</span>
          </div>
        </div>
        <div role="rowgroup">
          {log.map((r) => (
            <div key={r.id} role="row" className={cn('grid items-center py-[5px]', rowGrid)}>
              {device !== 'mobile' && (
                <span role="cell" className="truncate">
                  {clock(r.at)}
                </span>
              )}
              <span role="cell">{r.method}</span>
              <span role="cell" className="truncate" title={r.path}>
                {r.path}
              </span>
              <span role="cell" className={cn('truncate', kindColor[r.kind])}>
                {r.status}
              </span>
              <span role="cell">{r.durationMs} ms</span>
            </div>
          ))}
        </div>
        {log.length === 0 && (
          <p className="m-0 p-4 font-sans text-[12.5px] text-diag-muted">
            No requests yet. Search, filter or add something to the cart.
          </p>
        )}
      </div>
    </section>
  );
}
