# 🎡 Wheel of Fate

Web-приложение «колесо фортуны»: выбираешь настроение, колесо случайно выдаёт что посмотреть / во что поиграть / что послушать **из твоих собственных списков**. Без ручного выбора — только рандом по твоим источникам.

Три источника:

- 🎬 **Фильмы** — Letterboxd watchlist (через CSV-экспорт)
- 🎮 **Игры** — Steam wishlist (через публичный API)
- 🎵 **Музыка** — YouTube playlist (через Data API v3)

Жанры и постеры для фильмов подтягиваются с TMDB. Настроение фильтрует контент по жанрам/тегам через словарь mood → genres.

---

## Установка и запуск

```bash
git clone https://github.com/nofacehell/Randomich.git
cd Randomich
npm install
cp .env.example .env   # затем впиши ключи (см. ниже)
npm run dev            # http://localhost:5173
```

---

## API-ключи

Нужны два бесплатных ключа: **TMDB** для жанров/постеров фильмов, **YouTube** для плейлистов. Steam работает без ключа (но через локальный proxy, см. ниже).

### TMDB (для фильмов)

1. Регистрация: https://www.themoviedb.org/signup
2. После логина: https://www.themoviedb.org/settings/api
3. Запросить **Developer**-ключ — заполнить простую форму (Application name «Personal», URL `http://localhost:5173`)
4. Скопировать поле **API Key (v3 auth)** — это короткая строка, ~32 символа
5. Положить в `.env`:
   ```
   VITE_TMDB_API_KEY=your_v3_key_here
   ```

### YouTube Data API v3 (для музыки)

1. Зайти в Google Cloud Console: https://console.cloud.google.com/
2. Создать проект (или выбрать существующий)
3. **APIs & Services → Library** → найти **«YouTube Data API v3»** → **Enable**
4. **APIs & Services → Credentials** → **Create credentials → API Key**
5. Скопировать ключ в `.env`:
   ```
   VITE_YOUTUBE_API_KEY=your_youtube_key_here
   ```

---

## Где взять данные источников

### 🎬 Letterboxd watchlist.csv

Letterboxd отдаёт RSS, но он за Cloudflare-challenge — поэтому используем CSV-экспорт.

1. Зайти в свой профиль на letterboxd.com
2. **Settings → Import & Export → Export your data**
3. Скачается ZIP с архивом всего профиля — нужен только файл `watchlist.csv`
4. В приложении: **⚙ Settings → 🎬 Letterboxd watchlist · CSV → Выбрать файл**

CSV содержит только название и год — жанры и постеры подтягиваются из TMDB по title+year. Запросы кешируются на 30 дней в `localStorage`.

### 🎮 Steam ID (64-bit)

1. Открыть https://steamid.io/
2. Вставить ссылку на свой профиль (`https://steamcommunity.com/id/your_username/` или `/profiles/...`)
3. Скопировать значение `steamID64` — это 17-значное число
4. В приложении: **⚙ Settings → 🎮 Steam ID · 64-bit**

⚠️ Профиль и wishlist должны быть **публичными** в настройках Steam Privacy.

### 🎵 YouTube playlist URL

Просто URL вида `https://www.youtube.com/playlist?list=...`. Подходит публичный или unlisted (с прямой ссылкой). Достаём до 200 треков (4 страницы по 50), пропускаются Private/Deleted видео.

---

## Стек

- **Vite + React 18** (даунгрейд с 19 — `react-custom-roulette` поддерживает только 18)
- **Tailwind CSS v3** + кастомная палитра `paper-*` / `ink-*` / `ember-*`
- **react-custom-roulette** для анимации колеса
- **localStorage** для настроек, истории спинов, кешей TMDB и Steam appdetails
- **Vite middleware-плагин** в `dev-api/` для прокси Steam (CORS) — на Vercel мигрирует в `api/steam.js`
- **Google Fonts**: Instrument Serif + Inter

## Структура

```
.
├── api/                       # Vercel serverless functions
│   └── steam.js
├── dev-api/                   # Vite dev middleware, имитирует /api/* локально
│   ├── plugin.js
│   └── steam.js
├── src/
│   ├── components/            # TopNav, Wheel, MoodSelector, ResultModal, …
│   ├── hooks/                 # useLetterboxd, useSteam, useYoutube
│   ├── utils/                 # csv, moodFilter, storage, tmdb
│   ├── App.jsx                # оркестрация
│   ├── index.css              # Tailwind + кастом-классы (label-caps, wheel-stage)
│   └── main.jsx
├── .env.example
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

## Команды

```bash
npm run dev      # dev сервер на :5173
npm run build    # прод-сборка в dist/
npm run preview  # просмотр прод-сборки локально
```

## Деплой на Vercel

В репе есть `api/steam.js` (serverless) и `vercel.json`. Деплой:

```bash
npx vercel
# при первом запуске — выбрать scope, подтвердить
# затем добавить env-переменные:
npx vercel env add VITE_TMDB_API_KEY
npx vercel env add VITE_YOUTUBE_API_KEY
npx vercel --prod
```

Или через дашборд Vercel: импорт репозитория → добавить две env-переменные → deploy.
