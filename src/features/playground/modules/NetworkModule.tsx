import { Wifi } from 'lucide-react';
import { ToyFader, ToySwitch } from '@/components/toy/toy';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { formatSeconds, GROUP_DEFAULTS, isGroupModified, levels } from '@/simulation/conditions';
import { Module } from './Module';

export function NetworkModule() {
  const engine = useEngine();
  const config = useSimulation((s) => s.config);
  const { latencyMs, offline, failurePercent } = config.network;
  const lv = levels(config);
  const hot = offline || lv.latency === 'hot' || lv.failure === 'hot';

  return (
    <Module
      title="Network"
      tagline="How the server answers"
      tone="sky"
      icon={<Wifi size={15} strokeWidth={2.8} />}
      state={hot ? 'hot' : isGroupModified(config, 'network') ? 'mod' : 'ok'}
      onReset={() => engine.setConfig(GROUP_DEFAULTS.network)}
      resetLabel="Reset network controls"
    >
      <ToyFader
        label="Latency"
        min={0}
        max={60}
        step={0.5}
        value={latencyMs / 1000}
        onChange={(s) => engine.setConfig({ network: { latencyMs: s * 1000 } })}
        display={latencyMs === 0 ? 'instant' : formatSeconds(latencyMs)}
        level={lv.latency}
      />
      <ToyFader
        label="Request failure"
        min={0}
        max={100}
        step={5}
        value={failurePercent}
        onChange={(v) => engine.setConfig({ network: { failurePercent: v } })}
        display={`${failurePercent}%`}
        level={lv.failure}
      />
      <ToySwitch
        label="Offline"
        hint="Unplug the cable"
        danger
        checked={offline}
        onCheckedChange={(v) => engine.setConfig({ network: { offline: v } })}
      />
    </Module>
  );
}
