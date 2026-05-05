import { useRef, useState } from 'react';

export default function Settings({ initial, onSave }) {
  const hasAny = initial?.letterboxdCsv || initial?.steamId || initial?.youtube;
  const [open, setOpen] = useState(!hasAny);
  const [csvName, setCsvName] = useState(initial?.letterboxdFileName || '');
  const [csv, setCsv] = useState(initial?.letterboxdCsv || '');
  const [steamId, setSteamId] = useState(initial?.steamId || '');
  const [youtube, setYoutube] = useState(initial?.youtube || '');
  const [saved, setSaved] = useState(false);
  const [csvError, setCsvError] = useState(null);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setCsvError(null);
    try {
      const text = await file.text();
      if (!text.toLowerCase().includes('name') && !text.toLowerCase().includes('letterboxd uri')) {
        setCsvError('Не похоже на watchlist.csv от Letterboxd');
        return;
      }
      setCsv(text);
      setCsvName(file.name);
    } catch (err) {
      setCsvError('Не удалось прочитать файл: ' + err.message);
    }
  };

  const handleClearCsv = () => {
    setCsv('');
    setCsvName('');
    setCsvError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      letterboxdCsv: csv,
      letterboxdFileName: csvName,
      steamId: steamId.trim(),
      youtube: youtube.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 bg-gray-900/60 rounded-2xl border border-gray-800">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/40 transition-colors rounded-2xl"
      >
        <span className="font-semibold">⚙️ Настройки источников</span>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <form onSubmit={handleSave} className="px-6 pb-6 space-y-4">
          <div className="block">
            <span className="block text-sm font-medium mb-1">🎬 Letterboxd watchlist (CSV)</span>
            <div className="flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-500"
              />
              {csvName && (
                <button
                  type="button"
                  onClick={handleClearCsv}
                  className="text-xs text-gray-400 hover:text-red-400"
                >
                  ✕ убрать
                </button>
              )}
            </div>
            {csvName && (
              <span className="block text-xs text-green-400 mt-1">📎 {csvName}</span>
            )}
            {csvError && (
              <span className="block text-xs text-red-400 mt-1">{csvError}</span>
            )}
            <span className="block text-xs text-gray-500 mt-1">
              Letterboxd → Settings → Import & Export → Export your data → возьми <code className="text-gray-400">watchlist.csv</code> из архива
            </span>
          </div>

          <Field
            label="🎮 Steam ID (64-bit)"
            placeholder="например: 76561198012345678"
            value={steamId}
            onChange={setSteamId}
            hint="Только числовой ID. Найти можно на steamid.io. Профиль должен быть публичным."
          />
          <Field
            label="🎵 YouTube playlist URL"
            placeholder="https://www.youtube.com/playlist?list=..."
            value={youtube}
            onChange={setYoutube}
            hint="Публичная или unlisted ссылка с параметром ?list="
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors font-medium"
            >
              Сохранить
            </button>
            {saved && (
              <span className="text-green-400 text-sm">✓ Сохранено</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, hint }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 focus:border-purple-500 focus:outline-none transition-colors"
      />
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}
