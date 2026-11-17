import { cn } from '@/lib/cn';
import { useSimulation } from '@/simulation/adapters/hooks';
import { formatSeconds } from '@/simulation/conditions';
import type { Incident } from './fun/incidents';
import { MOOD_LABEL, serverMood } from './fun/mood';
import { ServerMascot } from './fun/ServerMascot';

const pad = (n: number, l = 2) => String(n).padStart(l, '0');
const clock = (ms: number) => {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const toneDot: Record<Incident['tone'], string> = {
  ok: 'bg-leaf',
  info: 'bg-sky',
  warn: 'bg-sun',
  bad: 'bg-tomato',
};

export function ServerCard({ className }: { className?: string }) {
  const config = useSimulation((s) => s.config);
  const stats = useSimulation((s) => s.stats);
  const mood = serverMood(config, stats);
  const { latencyMs, failurePercent, offline } = config.network;
  return (
    <div className={cn('toy-surface flex items-center gap-3 bg-sky-soft p-3', className)}>
      <ServerMascot mood={mood} size={96} />
      <div className="min-w-0">
        <p className="m-0 font-pixel text-[10px] text-toy-ink-2">SERVER IS</p>
        <p className="m-0 font-toy text-[22px] leading-tight font-black text-toy-ink uppercase">
          {MOOD_LABEL[mood]}
        </p>
        <p className="m-0 mt-1 font-pixel text-[10px] leading-relaxed text-toy-ink-2">
          {offline
            ? 'NO ROUTE'
            : `${latencyMs === 0 ? 'INSTANT' : formatSeconds(latencyMs)} · ${failurePercent}% FAIL`}
          <br />
          {stats.sent.toLocaleString('en')} SENT · {stats.failed.toLocaleString('en')} FAILED
        </p>
      </div>
    </div>
  );
}

export function IncidentLog({
  incidents,
  className,
}: {
  incidents: Incident[];
  className?: string;
}) {
  return (
    <section
      aria-labelledby="incident-title"
      className={cn('toy-surface flex min-h-0 flex-col overflow-hidden', className)}
    >
      <h2
        id="incident-title"
        className="m-0 flex flex-none items-center gap-2 border-b-[2.5px] border-toy-ink bg-sun px-3 py-2 font-toy text-[14px] font-black tracking-[0.04em] uppercase"
      >
        Incident log
      </h2>
      <ol role="log" className="m-0 min-h-0 flex-1 list-none overflow-auto p-0">
        {incidents.map((i) => (
          <li
            key={i.id}
            className="flex animate-tin gap-2 border-b-2 border-dashed border-toy-ink/12 px-3 py-2"
          >
            <span
              aria-hidden="true"
              className={cn(
                'mt-1 size-2.5 flex-none rounded-full border-2 border-toy-ink',
                toneDot[i.tone],
              )}
            />
            <div className="min-w-0">
              <time className="block font-pixel text-[9px] text-toy-ink-3">{clock(i.at)}</time>
              <p className="m-0 font-toy text-[13px] leading-snug font-medium text-toy-ink">
                {i.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SidePanel({ incidents }: { incidents: Incident[] }) {
  return (
    <aside aria-label="Server" className="lab-side flex min-h-0 flex-col gap-3.5">
      <ServerCard className="flex-none" />
      <IncidentLog incidents={incidents} className="min-h-0 flex-1" />
    </aside>
  );
}
