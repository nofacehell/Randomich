// Mood → genre keywords. Matched case-insensitive, substring against item.genres.
// "any" → no filter (passthrough).
export const MOODS = [
  { id: 'any', emoji: '🎲', label: 'Всё равно' },
  { id: 'chill', emoji: '😴', label: 'Расслабиться' },
  { id: 'hype', emoji: '🔥', label: 'Бодро' },
  { id: 'sad', emoji: '😢', label: 'Погрустить' },
  { id: 'fun', emoji: '🤪', label: 'Угарнуть' },
];

// Per-mood, per-type keyword lists. Lowercase. Matched as substring.
const MOOD_KEYWORDS = {
  chill: {
    movie: ['drama', 'romance', 'documentary'],
    game: ['casual', 'relaxing', 'exploration', 'cozy'],
  },
  hype: {
    movie: ['action', 'thriller', 'adventure'],
    game: ['action', 'fps', 'shooter', 'sports', 'racing'],
  },
  sad: {
    movie: ['drama', 'romance'],
    game: ['story rich', 'atmospheric', 'narrative'],
  },
  fun: {
    movie: ['comedy', 'animation', 'family'],
    game: ['party', 'co-op', 'multiplayer', 'funny', 'comedy'],
  },
};

export function filterByMood(items, moodId) {
  if (!moodId || moodId === 'any') return items;
  const rules = MOOD_KEYWORDS[moodId];
  if (!rules) return items;

  return items.filter((item) => {
    const keywords = rules[item.type];
    if (!keywords) return false;
    // Items without any genre data pass through — better to include
    // them than silently drop films TMDB hasn't tagged yet.
    if (!item.genres || item.genres.length === 0) return true;
    const haystack = item.genres.map((g) => g.toLowerCase());
    return keywords.some((kw) =>
      haystack.some((g) => g.includes(kw))
    );
  });
}

// Count of items that actually matched on a genre tag (skips ungenred
// passthrough items). Useful for the UI to show "matched 47 of 229 by genre".
export function countMatched(items, moodId) {
  if (!moodId || moodId === 'any') return items.length;
  const rules = MOOD_KEYWORDS[moodId];
  if (!rules) return items.length;
  let n = 0;
  for (const item of items) {
    const keywords = rules[item.type];
    if (!keywords) continue;
    if (!item.genres || item.genres.length === 0) continue;
    const haystack = item.genres.map((g) => g.toLowerCase());
    if (keywords.some((kw) => haystack.some((g) => g.includes(kw)))) n++;
  }
  return n;
}
