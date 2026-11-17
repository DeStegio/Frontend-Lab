import { Dices } from 'lucide-react';
import { useId, useState } from 'react';
import { ToyButton, ToyKeys } from '@/components/toy/toy';
import { ChaosIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { activeConditions, CONDITION_COUNT } from '@/simulation/conditions';
import { CHAOS_LEVELS, CHAOS_PROFILES } from '@/simulation/scenarios';
import type { ChaosLevel } from '@/simulation/types';
import type { Lab } from '../useLab';
import { Module } from './Module';

const LEVEL_OPTIONS = CHAOS_LEVELS.map((l) => ({ value: l, label: CHAOS_PROFILES[l].label }));

export function ChaosModule({ lab }: { lab: Lab }) {
  const engine = useEngine();
  const config = useSimulation((s) => s.config);
  const { enabled, level, seed } = config.chaos;
  const active = activeConditions(config).length;
  const seedId = useId();
  const armed = lab.countdown !== null;

  // Typed seed draft; it only applies while the engine still holds the seed it was typed against.
  const [draft, setDraft] = useState({ against: seed, text: String(seed) });
  const seedText = draft.against === seed ? draft.text : String(seed);
  const commitSeed = () => {
    const n = Number.parseInt(seedText, 10);
    if (Number.isFinite(n) && n >= 0) engine.setConfig({ chaos: { seed: n } });
    else setDraft({ against: seed, text: String(seed) });
  };

  const pickLevel = (l: ChaosLevel) => {
    engine.setConfig({ chaos: { level: l } });
    if (enabled) lab.engageChaos(l, { instant: true }); // already chaotic: re-roll at the new level
  };

  return (
    <Module
      title="Chaos"
      tagline="Everything, all at once"
      tone="tomato"
      icon={<ChaosIcon size={15} strokeWidth={2.8} />}
      state={enabled ? 'hot' : 'ok'}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-3 pt-1.5 pl-1.5">
          <button
            type="button"
            className="lab-big-btn"
            aria-pressed={enabled}
            disabled={armed}
            onClick={() => (enabled ? lab.calmDown() : lab.engageChaos())}
          >
            <span className="max-w-[78px] text-center">
              {enabled ? 'Calm it down' : armed ? 'Armed…' : 'Engage chaos'}
            </span>
          </button>
          <div className="grid w-[108px] grid-cols-8 gap-[3px]" aria-hidden="true">
            {Array.from({ length: CONDITION_COUNT }, (_, i) => (
              <i
                key={i}
                className={cn(
                  'h-2 rounded-sm border-[1.5px] border-toy-ink',
                  i < active ? 'bg-tomato' : 'bg-cream-2',
                )}
              />
            ))}
          </div>
          <span className="font-pixel text-[9px] text-toy-ink-2 uppercase">
            {active} of {CONDITION_COUNT} active
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <ToyKeys
            label="Intensity"
            tone="sun"
            options={LEVEL_OPTIONS}
            value={level}
            onChange={pickLevel}
            className="[&_[role=group]]:grid [&_[role=group]]:grid-cols-2"
          />
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <label htmlFor={seedId} className="font-toy text-[13px] font-bold text-toy-ink">
                Seed
              </label>
              <input
                id={seedId}
                inputMode="numeric"
                pattern="[0-9]*"
                value={seedText}
                onChange={(e) =>
                  setDraft({ against: seed, text: e.target.value.replace(/\D/g, '') })
                }
                onBlur={commitSeed}
                onKeyDown={(e) => e.key === 'Enter' && commitSeed()}
                aria-describedby={`${seedId}-hint`}
                className="led mt-1 h-[34px] w-full justify-start text-left text-[12px] outline-offset-2"
              />
              <span id={`${seedId}-hint`} className="sr-only">
                Same seed, same run.
              </span>
            </div>
            <ToyButton size="sm" tone="sun" onClick={lab.randomize}>
              <Dices size={15} strokeWidth={2.6} aria-hidden="true" />
              Randomize
            </ToyButton>
          </div>
        </div>
      </div>
    </Module>
  );
}
