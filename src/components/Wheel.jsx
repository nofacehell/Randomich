import { useEffect, useRef, useState } from 'react';
import { Wheel as RouletteWheel } from 'react-custom-roulette';
import { playTick, playDing } from '../utils/sounds';

// Cream-on-cream segment shades — type identity comes from a coloured dot
// on the rim, not from saturated sectors. Keeps the editorial mood.
const TYPE_SHADES = {
  movie: ['#efe5cf', '#e7dabe'],
  game: ['#e8e3d0', '#dfd6bb'],
};
const FALLBACK_SHADES = ['#efe5cf', '#e7dabe'];

const RIM_TEXT_THRESHOLD = 25;
// Multiplier on top of react-custom-roulette's internal 11.35s default.
// 0.8 ≈ 9 seconds total spin — long enough to feel suspenseful, short
// enough not to get boring.
const SPIN_DURATION = 0.8;
// Approximate total animation time in ms; mirrors how the lib calculates
// internally so we know when to fade out the tick loop.
const TOTAL_MS = (2600 + 750 + 8000) * SPIN_DURATION;

export default function Wheel({ items, muted, onResult }) {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const tickTimerRef = useRef(null);

  // Tick scheduler: emits a click sound at a frequency that mirrors the
  // wheel's perceived speed — fast at first, slowing toward the end.
  useEffect(() => {
    if (!mustSpin || muted) return;
    let cancelled = false;
    const startedAt = performance.now();

    const schedule = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startedAt;
      const t = Math.min(1, elapsed / TOTAL_MS);
      // Ease-out: visual speed eases (1-t)^2; ticks should follow.
      // Map progress → tick interval (ms): 55 ms at start, 380 ms near end.
      const interval = 55 + (380 - 55) * (t * t);
      tickTimerRef.current = window.setTimeout(() => {
        if (cancelled) return;
        playTick();
        if (elapsed < TOTAL_MS - 100) schedule();
      }, interval);
    };

    // Skip the very first 200 ms — gives the wheel a moment to begin
    // moving so the first tick lands with motion, not before it.
    tickTimerRef.current = window.setTimeout(schedule, 200);

    return () => {
      cancelled = true;
      if (tickTimerRef.current) {
        clearTimeout(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };
  }, [mustSpin, muted]);

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
          if (!muted) playDing();
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
        spinDuration={SPIN_DURATION}
        disableInitialAnimation={true}
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
