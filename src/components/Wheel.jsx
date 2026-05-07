import { useState } from 'react';
import { Wheel as RouletteWheel } from 'react-custom-roulette';

// Cream-on-cream segment shades — type identity comes from a coloured dot
// on the rim, not from saturated sectors. Keeps the editorial mood.
const TYPE_SHADES = {
  movie: ['#efe5cf', '#e7dabe'],
  game: ['#e8e3d0', '#dfd6bb'],
  music: ['#ece1d5', '#e3d4c1'],
};
const FALLBACK_SHADES = ['#efe5cf', '#e7dabe'];

const RIM_TEXT_THRESHOLD = 25;

export default function Wheel({ items, onResult }) {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);

  if (!items || items.length < 2) {
    return (
      <div className="text-center text-ink-400 p-8 font-sans text-sm">
        Нужно минимум 2 элемента на колесе
      </div>
    );
  }

  const showText = items.length <= RIM_TEXT_THRESHOLD;

  const data = items.map((item, i) => {
    const palette = TYPE_SHADES[item.type] || FALLBACK_SHADES;
    return {
      option: showText ? truncate(item.title, 18) : '',
      style: {
        backgroundColor: palette[i % palette.length],
        textColor: showText ? '#3a3327' : 'transparent',
      },
    };
  });

  const handleSpinClick = () => {
    if (mustSpin) return;
    const next = Math.floor(Math.random() * items.length);
    setPrizeIndex(next);
    setMustSpin(true);
  };

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
        outerBorderColor="#faf6ec"
        outerBorderWidth={0}
        innerBorderColor="#faf6ec"
        innerBorderWidth={0}
        innerRadius={28}
        radiusLineColor="#d8caa9"
        radiusLineWidth={showText ? 1 : 0}
        fontFamily="Inter, sans-serif"
        fontSize={10}
        fontWeight={400}
        textDistance={88}
        perpendicularText={false}
        pointerProps={{
          style: {
            filter: 'drop-shadow(0 2px 4px rgba(247, 107, 28, 0.25))',
          },
        }}
      />

      {/* Centre hub — the SPIN button. */}
      <button
        type="button"
        onClick={handleSpinClick}
        disabled={mustSpin}
        className="wheel-hub absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper-50 border border-ink-900/15 hover:border-ember-500 transition-colors disabled:cursor-not-allowed group flex flex-col items-center justify-center"
      >
        {mustSpin ? (
          <>
            <span className="label-caps text-ember-500 text-[8px] mb-1">
              picking your fate
            </span>
            <span className="font-serif italic text-ink-900 text-2xl leading-none">
              spinning
            </span>
          </>
        ) : (
          <>
            <span className="label-caps text-ink-500 text-[9px] mb-1">
              {items.length} items
            </span>
            <span className="font-serif text-ink-900 text-2xl leading-none group-hover:text-ember-500 transition-colors">
              SPIN
            </span>
            <span className="label-caps text-ink-500 text-[8px] mt-1.5">
              tap below
            </span>
          </>
        )}
      </button>
    </div>
  );
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
