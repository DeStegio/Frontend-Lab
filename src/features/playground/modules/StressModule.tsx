import { Play, Zap } from 'lucide-react';
import { useId } from 'react';
import { ToyButton, ToyFader, ToyKeys, ToySwitch } from '@/components/toy/toy';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { GROUP_DEFAULTS, isGroupModified, levels } from '@/simulation/conditions';
import { Module } from './Module';

const CLICK_OPTIONS = [10, 25, 100, 250].map((v) => ({ value: v, label: `×${v}` }));
const REPEAT_OPTIONS = [500, 1_000, 2_000, 5_000];

export function StressModule({ onRunClicks }: { onRunClicks: () => void }) {
  const engine = useEngine();
  const config = useSimulation((s) => s.config);
  const { burst, clickCount, repeat, repeatEveryMs } = config.stress;
  const lv = levels(config);
  const everyId = useId();
  const preset = CLICK_OPTIONS.some((o) => o.value === clickCount);

  return (
    <Module
      title="Stress"
      tagline="More clicks than any human"
      tone="grape"
      icon={<Zap size={15} strokeWidth={2.8} />}
      state={lv.burst === 'hot' ? 'hot' : isGroupModified(config, 'stress') ? 'mod' : 'ok'}
      onReset={() => engine.setConfig(GROUP_DEFAULTS.stress)}
      resetLabel="Reset interaction controls"
    >
      <ToyFader
        label="Request burst"
        min={1}
        max={100}
        step={1}
        value={burst}
        onChange={(v) => engine.setConfig({ stress: { burst: v } })}
        display={`×${burst}`}
        level={lv.burst}
      />
      <div className="flex items-end gap-2">
        <ToyKeys
          className="min-w-0 flex-1"
          label={preset ? 'Rapid clicks' : `Rapid clicks (×${clickCount.toLocaleString('en')})`}
          tone="grape"
          options={CLICK_OPTIONS}
          value={preset ? clickCount : null}
          onChange={(v) => engine.setConfig({ stress: { clickCount: v } })}
        />
        <ToyButton
          size="sm"
          tone="leaf"
          onClick={onRunClicks}
          aria-label={`Simulate ${clickCount.toLocaleString('en')} rapid clicks on Add to cart`}
        >
          <Play size={13} strokeWidth={3} aria-hidden="true" />
          Run
        </ToyButton>
      </div>
      <ToySwitch
        label="Repeat last action"
        hint="Search, filter or add, again"
        checked={repeat}
        onCheckedChange={(v) => engine.setConfig({ stress: { repeat: v } })}
      >
        <label className="sr-only" htmlFor={everyId}>
          Repeat interval
        </label>
        <select
          id={everyId}
          value={repeatEveryMs}
          disabled={!repeat}
          onChange={(e) => engine.setConfig({ stress: { repeatEveryMs: Number(e.target.value) } })}
          className="h-8 cursor-pointer rounded-[10px] border-[2.5px] border-toy-ink bg-toy-paper px-1.5 font-pixel text-[11px] text-toy-ink disabled:cursor-not-allowed disabled:opacity-45 lab-mobile:h-10"
        >
          {REPEAT_OPTIONS.map((ms) => (
            <option key={ms} value={ms}>
              {ms / 1000}s
            </option>
          ))}
        </select>
      </ToySwitch>
    </Module>
  );
}
