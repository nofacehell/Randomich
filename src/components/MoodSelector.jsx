import { MOODS } from '../utils/moodFilter';

const RU_LABEL = {
  any: 'Всё равно',
  chill: 'Расслабиться',
  hype: 'Бодро',
  sad: 'Погрустить',
  fun: 'Угарнуть',
};

export default function MoodSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {MOODS.map((mood) => {
        const active = selected === mood.id;
        return (
          <button
            key={mood.id}
            type="button"
            onClick={() => onSelect(mood.id)}
            className={[
              'group relative aspect-[4/5] rounded-2xl border transition-all',
              'flex flex-col items-center justify-center gap-2 p-2',
              active
                ? 'bg-ink-900 border-ember-400/60 ring-1 ring-ember-400/30'
                : 'bg-black/40 border-ink-500/15 hover:border-ink-500/40',
            ].join(' ')}
          >
            <div className="text-2xl leading-none">{mood.emoji}</div>
            <div className="font-sans text-[11px] text-ink-50 leading-tight text-center break-words w-full">
              {RU_LABEL[mood.id]}
            </div>
            {active && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-ember-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
