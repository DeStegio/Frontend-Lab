import { Play, Zap } from 'lucide-react';
import { useId } from 'react';
import { Button } from '@/components/ui/Button';
import { RangeField } from '@/components/ui/RangeField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { GROUP_DEFAULTS, isGroupModified, levels } from '@/simulation/conditions';
import { ControlCard, ControlLabel, ControlRow } from './ControlCard';

const CLICK_OPTIONS = [10, 25, 100, 250].map((v) => ({ value: v, label: `×${v}` }));
const REPEAT_OPTIONS = [500, 1_000, 2_000, 5_000];

export function StressControls({
  onRunClicks,
  className,
}: {
  onRunClicks: () => void;
  className?: string;
}) {
  const engine = useEngine();
  const config = useSimulation((s) => s.config);
  const { burst, clickCount, repeat, repeatEveryMs } = config.stress;
  const lv = levels(config);
  const clicksLabelId = useId();
  const repeatId = useId();
  const everyId = useId();
  const isPreset = CLICK_OPTIONS.some((o) => o.value === clickCount);

  return (
    <ControlCard
      className={className}
      title="Interaction stress"
      subtitle="More clicks than any human"
      glyph="int"
      icon={<Zap size={16} />}
      state={lv.burst === 'hot' ? 'hot' : isGroupModified(config, 'stress') ? 'mod' : 'flat'}
      onReset={() => engine.setConfig(GROUP_DEFAULTS.stress)}
      resetLabel="Reset interaction controls"
    >
      <RangeField
        label="Request burst"
        min={1}
        max={100}
        step={1}
        value={burst}
        onChange={(v) => engine.setConfig({ stress: { burst: v } })}
        display={`×${burst}`}
        level={lv.burst}
        ticks={['×1', 'parallel calls per action', '×100']}
      />
      <div className="flex flex-col gap-[7px]">
        <span id={clicksLabelId} className="text-[13px] font-semibold text-ink-2">
          Rapid clicks
          {!isPreset && (
            <span className="ml-1.5 font-mono text-[11.5px] text-ink-3">
              ×{clickCount.toLocaleString('en')} (chaos)
            </span>
          )}
        </span>
        <ControlRow>
          <SegmentedControl
            labelledBy={clicksLabelId}
            options={CLICK_OPTIONS}
            value={clickCount}
            onChange={(v) => engine.setConfig({ stress: { clickCount: v } })}
          />
          <Button
            size="sm"
            variant="primary"
            onClick={onRunClicks}
            aria-label={`Simulate ${clickCount.toLocaleString('en')} rapid clicks on Add to cart`}
          >
            <Play size={13} aria-hidden="true" />
            Run
          </Button>
        </ControlRow>
      </div>
      <ControlRow>
        <ControlLabel
          htmlFor={repeatId}
          label="Repeat last action"
          hint="Re-fires search, filter or add"
        />
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={everyId}>
            Repeat interval
          </label>
          <select
            id={everyId}
            value={repeatEveryMs}
            disabled={!repeat}
            onChange={(e) =>
              engine.setConfig({ stress: { repeatEveryMs: Number(e.target.value) } })
            }
            className="h-8 cursor-pointer rounded-sm border border-line-2 bg-surface px-2 font-mono text-xs font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-45 lab-mobile:h-10"
          >
            {REPEAT_OPTIONS.map((ms) => (
              <option key={ms} value={ms}>
                {ms / 1000} s
              </option>
            ))}
          </select>
          <Switch
            id={repeatId}
            checked={repeat}
            onCheckedChange={(v) => engine.setConfig({ stress: { repeat: v } })}
          />
        </div>
      </ControlRow>
    </ControlCard>
  );
}
