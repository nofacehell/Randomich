export default function ShuffleControls({ shuffled, onShuffle, onReset }) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        type="button"
        onClick={onShuffle}
        className="px-4 py-1.5 rounded-full text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
        title="Перемешать порядок элементов на колесе"
      >
        🔀 Перемешать
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={!shuffled}
        className="px-4 py-1.5 rounded-full text-sm bg-transparent hover:bg-gray-900 border border-gray-800 text-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Вернуть исходный порядок (фильмы → игры → музыка)"
      >
        ↺ Сбросить
      </button>
    </div>
  );
}
