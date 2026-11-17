import { RotateCcw, Shuffle } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ChaosIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/cn';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { activeConditions, CONDITION_COUNT } from '@/simulation/conditions';
import { CHAOS_LEVELS, CHAOS_PROFILES } from '@/simulation/scenarios';
import type { ChaosLevel } from '@/simulation/types';
import type { Lab } from '../useLab';
import { ControlCard } from './ControlCard';

const LEVEL_OPTIONS = CHAOS_LEVELS.map((l) => ({ value: l, label: CHAOS_PROFILES[l].label }));

export function ChaosControls({ lab, className }: { lab: Lab; className?: string }) {
  const engine = useEngine();
  const config = useSimulation((s) => s.config);
  const inFlight = useSimulation((s) => s.stats.inFlight);
  const { enabled, level, seed } = config.chaos;
  const active = activeConditions(config).length;
  const levelLabelId = useId();
  const seedId = useId();

  // Local draft so typing a seed doesn't fight the engine on every keystroke. A draft only
  // applies while the engine still holds the seed it was typed against.
  const [draft, setDraft] = useState({ against: seed, text: String(seed) });
  const seedDraft = draft.against === seed ? draft.text : String(seed);
  const setSeedDraft = (text: string) => setDraft({ against: seed, text });
  const commitSeed = () => {
    const n = Number.parseInt(seedDraft, 10);
    if (Number.isFinite(n) && n >= 0) engine.setConfig({ chaos: { seed: n } });
    else setSeedDraft(String(seed));
  };

  const pickLevel = (l: ChaosLevel) => {
    engine.setConfig({ chaos: { level: l } });
    if (enabled) lab.engageChaos(l); // already chaotic: re-roll at the new intensity
  };

  return (
    <ControlCard
      className={className}
      title="Chaos mode"
      subtitle="Everything, all at once"
      glyph="chaos"
      icon={<ChaosIcon size={16} />}
      state={enabled ? 'hot' : 'flat'}
    >
      <div className="flex flex-col gap-[7px]">
        <div className="grid grid-cols-8 gap-1" aria-hidden="true">
          {Array.from({ length: CONDITION_COUNT }, (_, i) => (
            <i
              key={i}
              className={cn(
                'h-1.5 rounded-[3px] transition-colors duration-300',
                i < active ? 'bg-coral-strong' : 'bg-[#E3E6ED]',
              )}
            />
          ))}
        </div>
        <div className="flex justify-between font-mono text-[11.5px] font-semibold text-ink-3">
          <span>
            {active} of {CONDITION_COUNT} active
          </span>
          <span>{inFlight > 0 ? `${inFlight} in flight` : 'idle'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-[7px]">
        <span id={levelLabelId} className="text-[13px] font-semibold text-ink-2">
          Intensity
        </span>
        <SegmentedControl
          labelledBy={levelLabelId}
          options={LEVEL_OPTIONS}
          value={level}
          onChange={pickLevel}
          className="[&_button]:px-0.5 [&_button]:text-[11px]"
        />
      </div>

      <Button
        block
        variant={enabled ? 'danger' : 'ink'}
        aria-pressed={enabled}
        onClick={() => (enabled ? lab.calmDown() : lab.engageChaos())}
      >
        <ChaosIcon size={16} />
        {enabled ? 'Calm it down' : 'Engage chaos'}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" onClick={lab.randomize}>
          <Shuffle size={14} aria-hidden="true" />
          Randomize
        </Button>
        <Button size="sm" onClick={lab.resetAll}>
          <RotateCcw size={14} aria-hidden="true" />
          Reset all
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2.5">
        <div>
          <label htmlFor={seedId} className="text-[13px] font-semibold text-ink-2">
            Seed
          </label>
          <div className="mt-0.5 text-[11.5px] font-medium text-ink-3">Same seed, same run</div>
        </div>
        <input
          id={seedId}
          inputMode="numeric"
          pattern="[0-9]*"
          value={seedDraft}
          onChange={(e) => setSeedDraft(e.target.value.replace(/\D/g, ''))}
          onBlur={commitSeed}
          onKeyDown={(e) => e.key === 'Enter' && commitSeed()}
          className="h-8 w-[112px] rounded-sm border border-line-2 bg-surface px-2 text-right font-mono text-xs font-semibold text-ink lab-mobile:h-10"
        />
      </div>
    </ControlCard>
  );
}
