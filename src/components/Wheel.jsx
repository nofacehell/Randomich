import { useState } from 'react';
import { Wheel as RouletteWheel } from 'react-custom-roulette';

// Per-type segment palettes. Two near-shades per type so adjacent same-type
// sectors still show a subtle break, but the type identity dominates.
// Tuned dark so the wheel keeps the editorial mood, not a Twister board.
const TYPE_SHADES = {
  movie: ['#3a1a0a', '#2c1408'], // ember-tinted
  game: ['#0f2a1d', '#0b2118'],  // green-tinted
  music: ['#28163a', '#1f112c'], // violet-tinted
};
const FALLBACK_SHADES = ['#15110d', '#1a1410'];

export default function Wheel({ items, onResult, idleLabel = 'SPIN' }) {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);

  if (!items || items.length < 2) {
    return (
      <div className="text-center text-ink-400 p-8 font-sans text-sm">
        Нужно минимум 2 элемента на колесе
      </div>
    );
  }

  const data = items.map((item, i) => {
    const palette = TYPE_SHADES[item.type] || FALLBACK_SHADES;
    return {
      option: '', // no labels — titles live in the side list
      style: {
        backgroundColor: palette[i % palette.length],
        textColor: 'transparent',
      },
    };
  });

  const handleSpinClick = () => {
    if (mustSpin) return;
    const next = Math.floor(Math.random() * items.length);
    setPrizeIndex(next);
    setMustSpin(true);
  };

  // Hide thin segment lines for very long lists — at 200+ items they're noise.
  const denseList = items.length > 60;

  return (
    <div className="wheel-stage relative">
      <RouletteWheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeIndex}
        data={data}
        onStopSpinning={() => {
          setMustSpin(false);
          onResult(items[prizeIndex]);
        }}
        outerBorderColor="#0c0a08"
        outerBorderWidth={0}
        innerBorderColor="#0c0a08"
        innerBorderWidth={0}
        innerRadius={26}
        radiusLineColor={denseList ? 'transparent' : '#231b14'}
        radiusLineWidth={denseList ? 0 : 1}
        fontFamily="Inter, sans-serif"
        fontSize={1}
        textDistance={0}
        pointerProps={{
          style: {
            filter: 'drop-shadow(0 2px 6px rgba(247, 107, 28, 0.4))',
          },
        }}
      />

      {/* Centre hub — sits exactly over the wheel via absolute centring. */}
      <button
        type="button"
        onClick={handleSpinClick}
        disabled={mustSpin}
        className="wheel-hub absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-950 border border-ink-500/30 hover:border-ember-400 transition-all disabled:cursor-not-allowed group flex flex-col items-center justify-center"
      >
        <span className="label-caps text-ink-500 text-[9px] mb-1">
          {items.length} items
        </span>
        {mustSpin ? (
          <>
            <span className="font-serif italic text-ember-400 text-xl leading-none">
              spinning
            </span>
            <span className="label-caps text-ink-500 text-[9px] mt-2">
              picking your fate
            </span>
          </>
        ) : (
          <>
            <span className="font-serif text-ink-50 text-3xl leading-none group-hover:text-ember-400 transition-colors">
              {idleLabel}
            </span>
            <span className="label-caps text-ink-500 text-[9px] mt-2">
              tap to spin
            </span>
          </>
        )}
      </button>
    </div>
  );
}
