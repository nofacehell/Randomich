# Wheel of Fate — рабочий чек-лист

Живой документ: что сделано, что в работе, что осталось. Обновляю по ходу разработки.

Полный план: `/Users/ea/.claude/plans/nifty-knitting-lake.md`

## Стек (зафиксировано)

- Vite + React (JS)
- Tailwind CSS
- react-custom-roulette
- localStorage для настроек/истории
- corsproxy.io для Steam (CORS)
- Деплой пока не делаем

## Прогресс

### ✅ Сделано
- **Этап 1. Каркас проекта**
  - [x] Vite + React 18 (даунгрейд для совместимости с react-custom-roulette)
  - [x] Tailwind v3 + PostCSS, react-custom-roulette
  - [x] Структура `src/components/ | hooks/ | utils/`
  - [x] `.env.example` + `.env` в .gitignore
  - [x] Dev-сервер на `http://localhost:5173`

- **Этап 2. MVP-колесо**
  - [x] `components/Wheel.jsx` — обёртка react-custom-roulette, цвета по типу
  - [x] `components/ResultModal.jsx` — постер/жанры/кнопки «Открыть»/«Крутить ещё»
  - [x] 6 моковых элементов в `App.jsx`, end-to-end проверено пользователем

- **Этап 3. Settings UI**
  - [x] `utils/storage.js` — get/save/remove с префиксом `wof:`
  - [x] `components/Settings.jsx` — аккордеон с тремя полями
  - [x] Сохранение в localStorage + автозагрузка при старте — проверено пользователем

- **Этап 4. Mood selector**
  - [x] `utils/moodFilter.js` — 5 настроений + функция фильтрации (substring по жанрам)
  - [x] `components/MoodSelector.jsx` — кнопки с эмодзи, активная подсвечена
  - [x] Индикатор «В колесе: N» + сообщение если <2 элементов

### 🟡 В работе
- **Этап 5. Letterboxd RSS**
  - [ ] `hooks/useLetterboxd.js` — fetch RSS, парсинг через DOMParser
  - [ ] Запрос к TMDB по title+year для получения жанров
  - [ ] Кеш в localStorage с TTL 24h

### ⬜ В очереди

- **Этап 6. Steam wishlist**
  - `hooks/useSteam.js` через corsproxy.io
  - MVP: только числовой 64-bit Steam ID
  - Обработка приватных профилей

- **Этап 7. YouTube playlist**
  - `hooks/useYoutube.js` (Data API v3)
  - Парсинг playlistId из URL

- **Этап 8. Объединение и фильтрация**
  - В `App.jsx` собрать единый список `{ type, title, image, genres, url }`
  - Фильтрация по mood
  - Сообщение если <2 элементов

- **Этап 9. Полировка**
  - Кнопки «только фильмы / только игры / только музыка»
  - История последних 10 спинов в localStorage
  - Лоадеры
  - Обработка ошибок
  - Mobile-адаптив

- **Этап 10. README**
  - Инструкция по API-ключам
  - Команды установки/запуска

## Открытые вопросы / TODO

- Resolve Steam vanity URL → SteamID64 (для MVP — обходим, требуем числовой ID)
- TMDB rate limits — насколько агрессивно кешировать
