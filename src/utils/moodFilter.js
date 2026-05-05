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
    music: ['lo-fi', 'lofi', 'ambient', 'acoustic', 'chill'],
  },
  hype: {
    movie: ['action', 'thriller', 'adventure'],
    game: ['action', 'fps', 'shooter', 'sports', 'racing'],
    music: ['hip-hop', 'hip hop', 'rap', 'electronic', 'rock', 'metal'],
  },
  sad: {
    movie: ['drama', 'romance'],
    game: ['story rich', 'atmospheric', 'narrative'],
    music: ['sad', 'indie', 'singer-songwriter', 'singer songwriter'],
  },
  fun: {
    movie: ['comedy', 'animation', 'family'],
    game: ['party', 'co-op', 'multiplayer', 'funny', 'comedy'],
    music: ['party', 'pop', 'energetic', 'dance'],
  },
};

export function filterByMood(items, moodId) {
  if (!moodId || moodId === 'any') return items;
  const rules = MOOD_KEYWORDS[moodId];
  if (!rules) return items;

  return items.filter((item) => {
    const keywords = rules[item.type];
    if (!keywords) return false;
    if (!item.genres || item.genres.length === 0) return false;
    const haystack = item.genres.map((g) => g.toLowerCase());
    return keywords.some((kw) =>
      haystack.some((g) => g.includes(kw))
    );
  });
}
