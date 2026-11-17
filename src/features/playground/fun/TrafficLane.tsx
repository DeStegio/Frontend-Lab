import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import type { Flight, LogEntry } from '@/simulation/types';

/** Packets drawn at once; the rest is summarised by the counter. */
const MAX_PACKETS = 24;
const MAX_RESULTS = 6;

/** Small stable offsets so packets and results don't sit on one line. */
const jitter = (id: number, span: number) => (((id * 2654435761) >>> 0) % span) - span / 2;

function Packet({ flight, offline }: { flight: Flight; offline: boolean }) {
  const engine = useEngine();
  // Fixed at mount: a re-render must not restart or jump the animation.
  const [delay] = useState(() => -(engine.clock.now() - flight.startedAt));
  const burst = flight.calls > 1;
  return (
    <span
      className={cn(
        'lab-packet absolute top-1/2 grid h-[18px] min-w-[18px] place-items-center rounded-full border-[2.5px] border-toy-ink px-1 font-pixel text-[8px] leading-none',
        flight.method === 'POST' ? 'bg-bubble' : 'bg-sky',
        offline && 'lab-packet--wall',
      )}
      style={{
        animationDuration: `${flight.durationMs}ms`,
        animationDelay: `${delay}ms`,
        marginTop: -9 + jitter(flight.id, 14),
      }}
    >
      {burst ? `×${flight.calls}` : ''}
    </span>
  );
}

const resultStyle: Record<LogEntry['kind'], string> = {
  ok: 'bg-leaf',
  bad: 'bg-tomato',
  off: 'bg-cream-2',
  cancel: 'bg-toy-paper',
};

function shortStatus(e: LogEntry): string {
  if (e.kind === 'cancel') return 'X';
  if (e.status.startsWith('ERR')) return e.status.slice(4).toUpperCase();
  return e.status.split(' ')[0] ?? e.status;
}

/**
 * The wire between the store and the server. Every packet is a real in-flight request from
 * the engine, travelling for exactly its simulated duration; results pop at the far end.
 */
export function TrafficLane({
  className,
  compact = false,
  action,
}: {
  className?: string;
  compact?: boolean;
  /** Optional control at the server end of the wire. */
  action?: React.ReactNode;
}) {
  const flights = useSimulation((s) => s.flights);
  const log = useSimulation((s) => s.log);
  const offline = useSimulation((s) => s.config.network.offline);
  const shown = flights.slice(-MAX_PACKETS);
  const results = log.filter((e) => !e.path.includes(' burst')).slice(0, MAX_RESULTS);
  const calls = flights.reduce((n, f) => n + f.calls, 0);

  return (
    <div
      className={cn(
        'toy-surface relative flex items-center gap-3 overflow-hidden px-3',
        compact ? 'h-11' : 'h-16',
        className,
      )}
    >
      <span className="led flex-none" aria-hidden="true">
        STORE
      </span>

      <div aria-hidden="true" className="relative h-full min-w-0 flex-1">
        <span className="absolute inset-x-0 top-1/2 h-0 border-t-[3px] border-dashed border-toy-ink/35" />
        {offline && (
          <span className="lab-wall absolute top-1.5 bottom-1.5 left-[12%] w-3.5 rounded-[3px] border-2 border-toy-ink" />
        )}
        {shown.map((f) => (
          <Packet key={f.id} flight={f} offline={offline} />
        ))}
        {results.map((e) => (
          <span
            key={e.id}
            className={cn(
              'lab-result absolute top-1/2 rounded-md border-2 border-toy-ink px-1 py-0.5 font-pixel text-[9px] leading-none',
              resultStyle[e.kind],
              e.kind === 'off' ? 'left-[calc(12%-34px)]' : 'right-0',
            )}
            style={{ marginTop: -8 + jitter(e.id, 18) }}
          >
            {shortStatus(e)}
          </span>
        ))}
      </div>

      <span className="led flex-none" data-level={calls > 40 ? 'hot' : calls > 10 ? 'warn' : 'ok'}>
        <span className="sr-only">Requests on the wire: </span>
        {calls > 0 ? `${calls} ON WIRE` : 'SERVER'}
      </span>
      {action}
    </div>
  );
}
