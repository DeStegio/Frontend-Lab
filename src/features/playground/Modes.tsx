import { cn } from '@/lib/cn';
import { useSimulation } from '@/simulation/adapters/hooks';
import { matchPreset, PRESETS } from '@/simulation/scenarios';
import type { Lab } from './useLab';

/** Presets as chunky cartridge keys. The one matching the current config stays pressed. */
export function Modes({ lab, className }: { lab: Lab; className?: string }) {
  const config = useSimulation((s) => s.config);
  const current = matchPreset(config);
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <span id="modes-label" className="font-pixel text-[10px] whitespace-nowrap text-toy-ink-2">
        QUICK MODES
      </span>
      <div
        role="group"
        aria-labelledby="modes-label"
        className="flex min-w-0 gap-1.5 overflow-x-auto px-0.5 pt-0.5 pb-1.5"
      >
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            title={p.hint}
            aria-pressed={current === p.key}
            onClick={() => lab.pickPreset(p)}
            className="toy-btn flex-none lab-mobile:h-10"
            data-size="sm"
            data-tone={current === p.key ? 'sun' : 'paper'}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
