import { MOODS } from '../utils/moodFilter';

export default function MoodSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {MOODS.map((mood) => {
        const active = selected === mood.id;
        return (
          <button
            key={mood.id}
            type="button"
            onClick={() => onSelect(mood.id)}
            className={[
              'px-4 py-2 rounded-full border transition-all text-sm md:text-base',
              active
                ? 'bg-purple-600 border-purple-400 shadow-lg scale-105'
                : 'bg-gray-900/60 border-gray-700 hover:border-gray-500',
            ].join(' ')}
          >
            <span className="mr-1">{mood.emoji}</span>
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}
