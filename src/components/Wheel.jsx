import { useState } from 'react';
import { Wheel as RouletteWheel } from 'react-custom-roulette';

const TYPE_COLORS = {
  movie: '#8b5cf6',
  game: '#22c55e',
  music: '#f59e0b',
};

export default function Wheel({ items, onResult }) {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);

  if (!items || items.length < 2) {
    return (
      <div className="text-center text-gray-400 p-8">
        Нужно минимум 2 элемента в колесе
      </div>
    );
  }

  const data = items.map((item) => ({
    option: truncate(item.title, 18),
    style: {
      backgroundColor: TYPE_COLORS[item.type] || '#6b7280',
      textColor: '#ffffff',
    },
  }));

  const handleSpinClick = () => {
    if (mustSpin) return;
    const next = Math.floor(Math.random() * items.length);
    setPrizeIndex(next);
    setMustSpin(true);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <RouletteWheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeIndex}
        data={data}
        onStopSpinning={() => {
          setMustSpin(false);
          onResult(items[prizeIndex]);
        }}
        outerBorderColor="#1f2937"
        outerBorderWidth={6}
        radiusLineColor="#1f2937"
        radiusLineWidth={2}
        fontSize={14}
        textDistance={62}
      />
      <button
        type="button"
        onClick={handleSpinClick}
        disabled={mustSpin}
        className="px-10 py-4 text-xl font-bold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
      >
        КРУТИТЬ
      </button>
    </div>
  );
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
