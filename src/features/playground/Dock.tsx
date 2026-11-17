import { CodeXml, SlidersHorizontal, WifiOff, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChaosIcon } from '@/components/ui/icons';
import { tagTones } from '@/components/ui/tagStyles';
import type { Device } from '@/hooks/useDevice';
import { cn } from '@/lib/cn';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { clearCondition, type ActiveCondition } from '@/simulation/conditions';
import { matchPreset, PRESETS } from '@/simulation/scenarios';
import type { Lab } from './useLab';

type DockProps = {
  lab: Lab;
  device: Device;
  conditions: ActiveCondition[];
  detailsOpen: boolean;
  onToggleDetails: () => void;
  sheetOpen: boolean;
  onOpenSheet: () => void;
};

export function PresetButtons({ lab, className }: { lab: Lab; className?: string }) {
  const config = useSimulation((s) => s.config);
  const current = matchPreset(config);
  return (
    <>
      {PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          aria-pressed={current === p.key}
          title={p.hint}
          onClick={() => lab.pickPreset(p)}
          className={cn(
            'h-[34px] flex-none cursor-pointer rounded-full border px-[13px] text-[13px] font-semibold whitespace-nowrap transition-colors duration-150 lab-mobile:h-10',
            current === p.key
              ? 'border-accent-line bg-accent-soft text-accent-ink'
              : 'border-line-2 bg-surface text-ink-2 hover:border-accent-line hover:text-ink',
            className,
          )}
        >
          {p.label}
        </button>
      ))}
    </>
  );
}

const dockLabel = 'text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-ink-3 uppercase';

export function Dock({
  lab,
  device,
  conditions,
  detailsOpen,
  onToggleDetails,
  sheetOpen,
  onOpenSheet,
}: DockProps) {
  const engine = useEngine();
  const offline = useSimulation((s) => s.config.network.offline);
  const chaos = useSimulation((s) => s.config.chaos.enabled);

  if (device === 'mobile') {
    const chip =
      'inline-flex h-11 flex-none cursor-pointer items-center gap-1 rounded-md border px-2.5 text-[13px] font-semibold whitespace-nowrap';
    return (
      <div className="lab-dock flex min-h-14 items-center gap-1.5 rounded-[14px] border border-line bg-surface p-2 shadow-1">
        <Button
          variant="primary"
          className="h-11 min-w-0 flex-1 gap-1.5 px-2.5"
          onClick={onOpenSheet}
          aria-expanded={sheetOpen}
          aria-haspopup="dialog"
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          Controls
          <span className="rounded-xs bg-white/22 px-1.5 py-1 font-mono text-[11px] leading-none font-bold">
            {conditions.length}
          </span>
        </Button>
        <button
          type="button"
          aria-pressed={offline}
          onClick={() => engine.setConfig({ network: { offline: !offline } })}
          className={cn(
            chip,
            offline ? 'border-ink bg-ink text-white' : 'border-line-2 bg-surface text-ink-2',
          )}
        >
          <WifiOff size={16} aria-hidden="true" />
          Offline
        </button>
        <button
          type="button"
          aria-pressed={chaos}
          onClick={() => (chaos ? lab.calmDown() : lab.engageChaos())}
          className={cn(
            chip,
            chaos
              ? 'border-coral-line bg-coral-soft text-coral-ink'
              : 'border-line-2 bg-surface text-ink-2',
          )}
        >
          <ChaosIcon size={16} />
          Chaos
        </button>
        <Button
          icon
          className="size-11 flex-none"
          on={detailsOpen}
          onClick={onToggleDetails}
          aria-label="Technical details"
          aria-expanded={detailsOpen}
        >
          <CodeXml size={18} aria-hidden="true" />
        </Button>
      </div>
    );
  }

  const tablet = device === 'tablet';
  return (
    <div className="lab-dock flex min-h-14 items-center rounded-[14px] border border-line bg-surface py-[9px] pr-2.5 pl-4 shadow-1">
      <div
        className={cn('flex w-full min-w-0 items-center gap-3.5', tablet && 'flex-wrap gap-y-2.5')}
      >
        <span className={dockLabel} id="dock-presets">
          Presets
        </span>
        <div className="flex gap-1.5" role="group" aria-labelledby="dock-presets">
          <PresetButtons lab={lab} />
        </div>
        {!tablet && <span aria-hidden="true" className="w-px self-stretch bg-line" />}
        <div
          className={cn('flex min-w-0 flex-1 items-center gap-3.5', tablet && 'order-9 basis-full')}
        >
          <span className={dockLabel} id="dock-active">
            Active
          </span>
          <ul
            aria-labelledby="dock-active"
            className="m-0 flex min-w-0 flex-1 list-none items-center gap-1.5 overflow-x-auto p-0 [scrollbar-width:thin]"
          >
            {conditions.length === 0 && (
              <li className="text-[13px] whitespace-nowrap text-ink-3">
                Nothing modified. The store behaves normally.
              </li>
            )}
            {conditions.map((c) => (
              <li
                key={c.key}
                className={cn(
                  'inline-flex h-[30px] flex-none animate-tin items-center gap-1.5 rounded-[7px] border pr-[3px] pl-[9px] font-mono text-[11.5px] leading-none font-semibold whitespace-nowrap',
                  tagTones[c.tone],
                )}
              >
                {c.label}
                <button
                  type="button"
                  aria-label={`Remove ${c.name}`}
                  onClick={() => engine.setConfig(clearCondition(c.key))}
                  className="grid size-6 cursor-pointer place-items-center rounded-xs text-current hover:bg-ink/8"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Button size="sm" on={detailsOpen} onClick={onToggleDetails} aria-expanded={detailsOpen}>
          <CodeXml size={15} aria-hidden="true" />
          Technical details
        </Button>
      </div>
    </div>
  );
}
