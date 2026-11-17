import { useState } from 'react';
import { MOOD_LABEL, type Mood } from '@/features/playground/fun/mood';
import { ServerMascot } from '@/features/playground/fun/ServerMascot';

const MOODS: Mood[] = ['happy', 'sleepy', 'sweaty', 'stressed', 'chaos', 'offline'];

const STICKERS = [
  { text: 'LATENCY 12 S', cls: 'bg-sun -rotate-6 top-[6%] left-[2%]' },
  { text: 'FAIL 35%', cls: 'bg-tomato rotate-3 top-[22%] right-[0%]' },
  { text: '×250 CLICKS', cls: 'bg-grape rotate-6 bottom-[30%] left-[-2%]' },
  { text: '240 ITEMS', cls: 'bg-leaf -rotate-3 bottom-[16%] right-[4%]' },
];

/** The server character on a pedestal. Poking it cycles through its moods. */
export function HeroArt() {
  const [i, setI] = useState(0);
  const mood = MOODS[i % MOODS.length]!;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <div
        aria-hidden="true"
        className="toy-surface absolute inset-[8%] rounded-[48px] bg-sky-soft"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-[18%] bottom-[14%] h-[14%] rounded-[50%] border-[2.5px] border-toy-ink bg-cream-2"
      />

      {STICKERS.map((s) => (
        <span
          key={s.text}
          aria-hidden="true"
          className={`toy-surface absolute z-2 rounded-xl px-3 py-2 font-pixel text-[11px] site-md:text-[13px] ${s.cls}`}
        >
          {s.text}
        </span>
      ))}

      <div
        aria-hidden="true"
        className="absolute inset-x-[10%] top-[50%] z-1 h-0 border-t-[3px] border-dashed border-toy-ink/40"
      >
        {[0, 1, 2].map((n) => (
          <span
            key={n}
            className="hero-packet absolute -top-[11px] size-[18px] rounded-full border-[2.5px] border-toy-ink bg-bubble"
            style={{ animationDelay: `${n * 0.9}s` }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setI((n) => n + 1)}
        aria-label={`Poke the server. It is ${MOOD_LABEL[mood]}.`}
        className="absolute top-[29%] left-1/2 z-2 -translate-x-1/2 cursor-pointer rounded-[32px] p-2 transition-transform duration-150 active:scale-95"
      >
        <ServerMascot mood={mood} size={220} />
      </button>
      <p
        aria-live="polite"
        className="absolute inset-x-0 bottom-[3%] z-2 m-0 text-center font-pixel text-[12px] text-toy-ink-2"
      >
        SERVER IS {MOOD_LABEL[mood].toUpperCase()} · POKE IT
      </p>
    </div>
  );
}
