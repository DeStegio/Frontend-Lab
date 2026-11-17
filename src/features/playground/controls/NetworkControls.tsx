import { Wifi } from 'lucide-react';
import { useId } from 'react';
import { RangeField } from '@/components/ui/RangeField';
import { Switch } from '@/components/ui/Switch';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { formatSeconds, GROUP_DEFAULTS, isGroupModified, levels } from '@/simulation/conditions';
import { ControlCard, ControlLabel, ControlRow } from './ControlCard';

export function NetworkControls({ className }: { className?: string }) {
  const engine = useEngine();
  const config = useSimulation((s) => s.config);
  const { latencyMs, offline, failurePercent } = config.network;
  const lv = levels(config);
  const offlineId = useId();
  const hot = offline || lv.latency === 'hot' || lv.failure === 'hot';

  return (
    <ControlCard
      className={className}
      title="Network"
      subtitle="How the server answers"
      glyph="net"
      icon={<Wifi size={16} />}
      state={hot ? 'hot' : isGroupModified(config, 'network') ? 'mod' : 'flat'}
      onReset={() => engine.setConfig(GROUP_DEFAULTS.network)}
      resetLabel="Reset network controls"
    >
      <RangeField
        label="Latency"
        min={0}
        max={60}
        step={0.5}
        value={latencyMs / 1000}
        onChange={(s) => engine.setConfig({ network: { latencyMs: s * 1000 } })}
        display={latencyMs === 0 ? 'instant' : formatSeconds(latencyMs)}
        level={lv.latency}
        ticks={['0 s', '10 s', '30 s', '60 s']}
      />
      <ControlRow>
        <ControlLabel htmlFor={offlineId} label="Offline" hint="Every request fails at once" />
        <Switch
          id={offlineId}
          tone="danger"
          checked={offline}
          onCheckedChange={(v) => engine.setConfig({ network: { offline: v } })}
        />
      </ControlRow>
      <RangeField
        label="Request failure"
        min={0}
        max={100}
        step={5}
        value={failurePercent}
        onChange={(v) => engine.setConfig({ network: { failurePercent: v } })}
        display={`${failurePercent}%`}
        level={lv.failure}
        ticks={['0%', '50%', '100%']}
      />
    </ControlCard>
  );
}
