# 🎡 Wheel of Fate

Веб-приложение «колесо фортуны»: пользователь выбирает настроение, колесо случайно выдаёт что посмотреть/во что поиграть/что послушать из его собственных списков. Без ручного выбора — только рандом по своим источникам.

Полный план реализации (этапы, верификация): `/Users/ea/.claude/plans/nifty-knitting-lake.md`

---

## Идея

Три источника контента, в каждом — личный список пользователя:

- 🎬 **Фильмы** — Letterboxd watchlist (из CSV-экспорта; см. блокер ниже)
- 🎮 **Игры** — Steam wishlist (через CORS-прокси / serverless)
- 🎵 **Музыка** — YouTube playlist (через Data API v3)

Перед спином — выбор настроения (😴 расслабиться / 🔥 бодро / 😢 погрустить / 🤪 угарнуть / 🎲 всё равно). Настроение фильтрует контент по жанрам/тегам через словарь mood→genres.

Бэкенд минимален: Vite dev middleware + Vercel-функции для эндпоинтов, которые нельзя вызвать напрямую из браузера (Steam CORS).

---

## Стек (зафиксировано)

- **Vite + React 18** на JS (даунгрейд с 19 — `react-custom-roulette` поддерживает только 18)
- **Tailwind CSS v3**
- **react-custom-roulette** — анимация колеса
- **localStorage** — настройки, кеш TMDB-жанров, история спинов
- **Vite middleware-плагин** в `dev-api/` — для local-side прокси (steam)
- Деплой пока **не делаем** — отдельной задачей

---

## Прогресс

### ✅ Сделано (закоммичено)

- **Этап 1. Каркас**
  - Vite + React 18, Tailwind v3, react-custom-roulette
  - Структура `src/{components,hooks,utils}/`
  - `.env.example` (TMDB + YouTube), `.env` в .gitignore
  - Dev-сервер на `http://localhost:5173`

- **Этап 2. MVP-колесо**
  - `components/Wheel.jsx` — обёртка react-custom-roulette, цвета сегментов по типу
  - `components/ResultModal.jsx` — попап с постером/жанрами/кнопками «Открыть»/«Крутить ещё»
  - 6 моковых элементов в `App.jsx`, end-to-end проверено

- **Этап 3. Settings UI + localStorage**
  - `utils/storage.js` — get/save/remove с префиксом `wof:`
  - `components/Settings.jsx` — аккордеон с полями
  - Сохранение в localStorage + автозагрузка при старте

- **Этап 4. Mood selector**
  - `utils/moodFilter.js` — 5 настроений + функция фильтрации (case-insensitive substring по жанрам)
  - `components/MoodSelector.jsx` — кнопки с эмодзи, активная подсвечена
  - Индикатор «В колесе: N» + сообщение если <2 элементов

- **Этап 5. Letterboxd через CSV-импорт** ⚠️ переделано из RSS из-за Cloudflare-блока
  - [x] `utils/csv.js` — мини RFC4180-парсер
  - [x] `utils/tmdb.js` — поиск фильма в TMDB по title+year, кеш в localStorage с TTL 30 дней
  - [x] `hooks/useLetterboxd.js` — парс CSV + последовательное обогащение жанрами/постерами через TMDB
  - [x] `components/Settings.jsx` — file upload, сохраняет CSV-текст в localStorage
  - [x] `App.jsx` интегрирует `useLetterboxd`, показывает прогресс «N/M»
  - [x] Проверено end-to-end с реальным CSV + TMDB-ключом

- **Этап 6. Steam wishlist**
  - [x] `dev-api/steam.js` — два action'а: `wishlist` (IWishlistService) и `appdetails` (имена/жанры/обложки)
  - [x] `hooks/useSteam.js` — fetch wishlist → батчем appdetails → кеш 7 дней
  - [x] Валидация 17-значного SteamID64
  - [x] Проверено end-to-end на реальном профиле

- **Этап 7. YouTube playlist**
  - [x] `hooks/useYoutube.js` — Data API v3, пагинация до 200 треков
  - [x] `extractPlaylistId` — принимает либо URL с `?list=`, либо чистый id
  - [x] `moodFilter.js` — для `type === 'music'` всегда true (у YouTube нет жанров)
  - [x] Проверено end-to-end на реальном плейлисте

- **Этап 8. Объединение источников** ✅ де-факто готово в App.jsx
  - [x] Все три хука собираются в единый список
  - [x] Раздельные индикаторы загрузки и ошибок по каждому источнику
  - [x] Сообщение «подходит N элементов» если фильтр оставил <2

- **Этап 9. Полировка функциональности**
  - [x] `components/CategoryFilter.jsx` — чипы 🎬/🎮/🎵 со счётчиками
  - [x] `components/History.jsx` — последние 10 спинов в localStorage
  - [x] Shuffle/Reset с seeded Fisher-Yates + автосброс при смене состава колеса
    (UI-кнопки переехали в `CurrentlyInWheel` при редизайне; `ShuffleControls.jsx` удалён)

- **Этап 10. Cinematic редизайн** (мокап в тёмной версии)
  - [x] Editorial typography: Instrument Serif (через Google Fonts) + Inter
  - [x] Aurora-градиент на фоне (`bg-aurora` в index.css) + лёгкий диагональный hatch
  - [x] Двухколоночный лейаут: колесо слева, mood + список + история справа
  - [x] Тонкая шапка `HeaderStrip` (No. 047, дата, item counts, шестерёнка)
  - [x] Футер `FooterStrip` (FILMS · N / GAMES · N / MUSIC · N + Connected sources)
  - [x] Mood-карточки 4:5 (после правок — emoji + только русский label, центрировано)
  - [x] Колесо: тёмные сегменты, цветные дуги по типу (оранжевый/зелёный/фиолетовый),
        кастомный CSS-override на 600px, центральный hub-кнопка с SPIN
  - [x] Settings → шестерёнка → tinted modal с custom-стиль file-input,
        autofill-фикс через `-webkit-box-shadow inset`
  - [x] Result modal: горизонтальный, постер слева, бейдж + 3 кнопки (Открыть/Крутить ещё/Не сегодня)
  - [x] `CurrentlyInWheel` — чипы с цветной точкой по типу + иконки 🔀/↺
  - [x] Tailwind palette: `ink-*` (тёмные тона), `ember-*` (оранжевый), `font-serif`/`font-sans`/`font-mono`
  - [x] `<html lang="ru" translate="no">` + meta `notranslate` чтобы убрать
        wavy-underline от браузерного спел-чекера

### 🟡 Известные проблемы / TODO

- **Шафл-иконки в `CurrentlyInWheel`** — пользователь сообщил что не видит их
  в правой колонке. Возможно перекрываются `flex justify-between`-расчётом или
  спрятаны overflow. Не исправлено.
- **Hairline на ободе колеса** — иногда виден тонкий контур по нижнему краю
  (canvas anti-aliasing). Прибил `outerBorderWidth=0` + `innerBorderWidth=0`,
  но эффект может остаться у некоторых пользователей.
- **UI/UX в целом** — пользователь хочет дальше итерировать, но эта сессия
  закончена. Возобновим со следующего захода.

- **Этап 8. Объединение и фильтрация**
  - В `App.jsx` собрать единый список из всех трёх источников ✅ частично готово
  - Сообщение если <2 элементов после фильтра ✅
  - Лоадеры по каждому источнику отдельно

- **Этап 9. Полировка**
  - Кнопки «только фильмы / только игры / только музыка» (временное исключение категории)
  - История последних 10 спинов в localStorage + UI-список
  - Унифицированные лоадеры/ошибки
  - Mobile-адаптив, доработка UI/UX (по словам пользователя — «потом»)

- **Этап 10. README**
  - Инструкция по получению TMDB и YouTube API-ключей
  - Команды установки/запуска
  - Деплой на Vercel — отдельной задачей

---

## ⚠️ Открытые проблемы и решения

- **Letterboxd RSS заблокирован Cloudflare** — на текущем IP (и через corsproxy.io / api.codetabs / api.allorigins) возвращается challenge-страница с любым UA, в том числе из Node-сервера. Решено перейти на **CSV-импорт** (`Letterboxd → Settings → Import & Export`). Может, на Vercel с другим IP RSS-fetch заработает — но это не проверено и не обязательно нужно.

- **Steam wishlist API + CORS** — нужен dev-прокси (Vite middleware) и аналогичная Vercel-функция. Сейчас только стаб.

- **Vanity Steam URL** — для MVP принимаем только числовой 64-bit Steam ID. Resolve vanity → ID требует Steam WebAPI ключа, отложено.

- **TMDB rate limits** — 50 req/sec, мы делаем последовательно. Для watchlist >100 фильмов может быть медленно. Кеш в localStorage с TTL 30 дней снимает повторные запросы.

---

## Структура

```
.
├── api/                       # (будет) Vercel-функции
├── dev-api/                   # Vite dev middleware, имитирует api/* локально
│   ├── plugin.js
│   └── steam.js               # пока стаб 501
├── src/
│   ├── components/
│   │   ├── MoodSelector.jsx
│   │   ├── ResultModal.jsx
│   │   ├── Settings.jsx
│   │   └── Wheel.jsx
│   ├── hooks/
│   │   └── useLetterboxd.js   # WIP
│   ├── utils/
│   │   ├── csv.js
│   │   ├── moodFilter.js
│   │   ├── storage.js
│   │   └── tmdb.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Команды

```bash
npm install
cp .env.example .env   # вписать TMDB и YouTube ключи
npm run dev            # http://localhost:5173
```
