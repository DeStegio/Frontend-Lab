import { Type } from 'lucide-react';
import { RangeField } from '@/components/ui/RangeField';
import { useEngine, useSimulation } from '@/simulation/adapters/hooks';
import { GROUP_DEFAULTS, isGroupModified, levels } from '@/simulation/conditions';
import { ControlCard } from './ControlCard';

export function MutationControls({ className }: { className?: string }) {
  const engine = useEngine();
  const config = useSimulation((s) => s.config);
  const { contentLength, itemCount, textExpansion } = config.mutation;
  const lv = levels(config);
  const hot = lv.content === 'hot' || lv.items === 'hot' || lv.expansion === 'hot';

  return (
    <ControlCard
      className={className}
      title="UI mutation"
      subtitle="Content the layout didn’t expect"
      glyph="mut"
      icon={<Type size={16} />}
      state={hot ? 'hot' : isGroupModified(config, 'mutation') ? 'mod' : 'flat'}
      onReset={() => engine.setConfig(GROUP_DEFAULTS.mutation)}
      resetLabel="Reset UI mutation controls"
    >
      <RangeField
        label="Content length"
        min={0}
        max={100}
        step={5}
        value={contentLength}
        onChange={(v) => engine.setConfig({ mutation: { contentLength: v } })}
        display={contentLength === 0 ? 'as written' : `+${contentLength}%`}
        level={lv.content}
        ticks={['as written', 'essay']}
      />
      <RangeField
        label="Rendered items"
        min={1}
        max={240}
        step={1}
        value={itemCount}
        onChange={(v) => engine.setConfig({ mutation: { itemCount: v } })}
        display={String(itemCount)}
        level={lv.items}
        ticks={['1', '12', '240']}
      />
      <RangeField
        label="Text expansion"
        min={0}
        max={100}
        step={5}
        value={textExpansion}
        onChange={(v) => engine.setConfig({ mutation: { textExpansion: v } })}
        display={textExpansion === 0 ? 'original' : `+${textExpansion}%`}
        level={lv.expansion}
        ticks={['original', 'Wörtërlängé']}
      />
    </ControlCard>
  );
}
