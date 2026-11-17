/** net = latency/amber · err = failures/coral · load = stress/violet · ui = mutation/mint */
export type TagTone = 'neutral' | 'net' | 'err' | 'load' | 'ui';

export const tagTones: Record<TagTone, string> = {
  neutral: 'bg-surface text-ink-2 border-line',
  net: 'bg-amber-soft text-amber-ink border-amber-line',
  err: 'bg-coral-soft text-coral-ink border-coral-line',
  load: 'bg-accent-soft text-accent-ink border-accent-line',
  ui: 'bg-mint-soft text-mint-ink border-mint-line',
};
