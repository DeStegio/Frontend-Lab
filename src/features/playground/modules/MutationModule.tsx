import { Type } from 'lucide-react';
import { ToyFader } from '@/components/toy/toy';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { GROUP_DEFAULTS, isGroupModified, levels } from '@/simulation/conditions';
import { Module } from './Module';

export function MutationModule() {
  const engine = useEngine();
  const config = useSimulation((s) => s.config);
  const { contentLength, itemCount, textExpansion } = config.mutation;
  const lv = levels(config);
  const hot = lv.content === 'hot' || lv.items === 'hot' || lv.expansion === 'hot';

  return (
    <Module
      title="Mutation"
      tagline="Content the layout didn’t expect"
      tone="leaf"
      icon={<Type size={15} strokeWidth={2.8} />}
      state={hot ? 'hot' : isGroupModified(config, 'mutation') ? 'mod' : 'ok'}
      onReset={() => engine.setConfig(GROUP_DEFAULTS.mutation)}
      resetLabel="Reset UI mutation controls"
    >
      <ToyFader
        label="Rendered items"
        min={1}
        max={240}
        step={1}
        value={itemCount}
        onChange={(v) => engine.setConfig({ mutation: { itemCount: v } })}
        display={String(itemCount)}
        level={lv.items}
      />
      <ToyFader
        label="Content length"
        min={0}
        max={100}
        step={5}
        value={contentLength}
        onChange={(v) => engine.setConfig({ mutation: { contentLength: v } })}
        display={contentLength === 0 ? 'as written' : `+${contentLength}%`}
        level={lv.content}
      />
      <ToyFader
        label="Text expansion"
        min={0}
        max={100}
        step={5}
        value={textExpansion}
        onChange={(v) => engine.setConfig({ mutation: { textExpansion: v } })}
        display={textExpansion === 0 ? 'original' : `+${textExpansion}%`}
        level={lv.expansion}
      />
    </Module>
  );
}
