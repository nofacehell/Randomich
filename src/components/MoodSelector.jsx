import { MOODS } from '../utils/moodFilter';

const RU_LABEL = {
  any: 'Всё равно',
  chill: 'Расслабиться',
  hype: 'Бодро',
  sad: 'Погрустить',
  fun: 'Угарнуть',
};

const SUBTITLES = {
  any: 'Surprise me',
  chill: 'Slow & easy',
  hype: 'Energy & rush',
  sad: 'Melancholy',
  fun: 'Pure dopamine',
};

export default function MoodSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-5 gap-2.5">
      {MOODS.map((mood) => {
        const active = selected === mood.id;
        return (
          <button
            key={mood.id}
            type="button"
            onClick={() => onSelect(mood.id)}
            className={[
              'group relative aspect-[4/5] rounded-2xl border transition-all',
              'flex flex-col items-center justify-between p-2 pt-3',
              active
                ? 'bg-paper-50 border-ink-900 ring-1 ring-ink-900/20'
                : 'bg-paper-50 border-paper-200 hover:border-paper-300',
            ].join(' ')}
          >
            <div className="text-2xl leading-none">{mood.emoji}</div>
            <div className="w-full text-center pb-0.5">
              <div className="font-sans text-[11px] text-ink-900 leading-tight break-words">
                {RU_LABEL[mood.id]}
              </div>
              <div
                className="font-sans text-[9px] text-ink-500 mt-0.5 no-translate"
                lang="en"
              >
                {SUBTITLES[mood.id]}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
