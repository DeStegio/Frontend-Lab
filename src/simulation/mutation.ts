/**
 * Pure content transforms used by the UI-mutation experiments. They only ever return plain
 * strings, which React renders as text, so generated content can never inject markup.
 */

const ACCENTS: Record<string, string> = {
  a: 'å',
  e: 'é',
  i: 'î',
  o: 'ö',
  u: 'û',
  c: 'ç',
  n: 'ñ',
  y: 'ÿ',
  A: 'Å',
  E: 'É',
  O: 'Ö',
  U: 'Û',
};

export function accentuate(text: string): string {
  return text.replace(/[aeioucnyAEOU]/g, (c) => ACCENTS[c] ?? c);
}

/** Longest a word may grow: 1 + 2.2 = 3.2× at 100%. */
const STRETCH_FACTOR = 2.2;

/** Pseudo-localisation: accents plus words up to 3.2× longer at 100%. */
export function expandText(text: string, percent: number): string {
  if (percent <= 0) return text;
  const stretched = text
    .split(' ')
    .map((word) => {
      const extra = Math.round(((word.length * percent) / 100) * STRETCH_FACTOR);
      if (extra === 0 || word.length === 0) return word;
      const lower = word.toLowerCase();
      return word + lower.repeat(Math.ceil(extra / lower.length)).slice(0, extra);
    })
    .join(' ');
  return accentuate(stretched);
}

export const FILLER_SENTENCES = [
  'Made in small batches.',
  'Ships in recycled packaging.',
  'Hand-finished, so each piece varies slightly.',
  'Safe for everyday use and easy to clean.',
  'Designed to last for years of daily use.',
  'Pairs well with the rest of the collection.',
  'Free returns within thirty days.',
  'Restocked every few weeks.',
] as const;

/** At 100% this appends 14 extra sentences. */
export const MAX_FILLER_SENTENCES = 14;

export function appendFiller(text: string, percent: number): string {
  const count = Math.round((Math.max(0, percent) / 100) * MAX_FILLER_SENTENCES);
  let out = text;
  for (let i = 0; i < count; i++) out += ' ' + FILLER_SENTENCES[i % FILLER_SENTENCES.length];
  return out;
}
