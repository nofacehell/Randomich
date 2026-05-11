# 🎡 Wheel of Fate

Web-приложение «колесо фортуны»: выбираешь настроение, колесо случайно выдаёт что посмотреть или во что поиграть **из твоих собственных списков**. Без ручного выбора — только рандом по твоим источникам.

Два источника:

- 🎬 **Фильмы** — Letterboxd watchlist (через CSV-экспорт)
- 🎮 **Игры** — Steam wishlist и/или Steam library (на выбор, можно оба)

Жанры и постеры для фильмов подтягиваются с TMDB. Настроение фильтрует контент по жанрам/тегам через словарь mood → genres.

---

## Установка и запуск

```bash
git clone https://github.com/nofacehell/Randomich.git
cd Randomich
npm install
cp .env.example .env   # затем впиши TMDB-ключ (см. ниже)
npm run dev            # http://localhost:5173
```

---

## API-ключи

Нужен один бесплатный ключ — **TMDB** для жанров и постеров фильмов. Steam работает без ключа через локальный proxy (а на Vercel — через serverless-функцию `api/steam.js`).

### TMDB (для фильмов)

1. Регистрация: https://www.themoviedb.org/signup
2. После логина: https://www.themoviedb.org/settings/api
3. Запросить **Developer**-ключ — заполнить простую форму (Application name «Personal», URL `http://localhost:5173`)
4. Скопировать поле **API Key (v3 auth)** — это короткая строка, ~32 символа
5. Положить в `.env`:
   ```
   VITE_TMDB_API_KEY=your_v3_key_here
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

Дальше в Settings есть два чекбокса:

- **Wishlist** — игры из списка желаемого. Работает без ключа, нужен только публичный профиль и публичный wishlist.
- **Library (owned games)** — игры в твоей библиотеке. Нужен Steam Web API key — получи бесплатно за 30 секунд на https://steamcommunity.com/dev/apikey и вставь в поле «🔑 Steam Web API key» в Settings. Профиль должен быть публичным + в Privacy Settings: «Game details» = Public.

Можно включить **оба** — игра попадёт в колесо один раз даже если она в обоих списках.

⚠️ Если профиль приватный — Steam просто отдаст пустой ответ. В UI появится сообщение «Wishlist пуст или профиль приватный» / «Библиотека пуста или скрыта в настройках приватности».

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
│   ├── _steam-core.js
│   └── steam.js
├── dev-api/                   # Vite dev middleware, имитирует /api/* локально
│   ├── plugin.js
│   └── steam.js
├── src/
│   ├── components/            # TopNav, Wheel, MoodSelector, ResultModal, …
│   ├── hooks/                 # useLetterboxd, useSteam
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
# затем добавить env-переменную:
npx vercel env add VITE_TMDB_API_KEY
npx vercel --prod
```

Или через дашборд Vercel: импорт репозитория → добавить env-переменную → deploy.
