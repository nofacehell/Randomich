import { useEffect, useRef, useState } from 'react';

export default function Settings({ open, onClose, initial, onSave }) {
  const [csvName, setCsvName] = useState(initial?.letterboxdFileName || '');
  const [csv, setCsv] = useState(initial?.letterboxdCsv || '');
  const [steamId, setSteamId] = useState(initial?.steamId || '');
  const [youtube, setYoutube] = useState(initial?.youtube || '');
  const [saved, setSaved] = useState(false);
  const [csvError, setCsvError] = useState(null);
  const fileRef = useRef(null);

  // Re-sync local state when modal reopens after settings changed elsewhere.
  useEffect(() => {
    if (open) {
      setCsv(initial?.letterboxdCsv || '');
      setCsvName(initial?.letterboxdFileName || '');
      setSteamId(initial?.steamId || '');
      setYoutube(initial?.youtube || '');
      setCsvError(null);
      setSaved(false);
    }
  }, [open, initial]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleFile = async (file) => {
    if (!file) return;
    setCsvError(null);
    try {
      const text = await file.text();
      if (
        !text.toLowerCase().includes('name') &&
        !text.toLowerCase().includes('letterboxd uri')
      ) {
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
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-ink-900 border border-ink-500/20 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-3 flex items-center justify-between">
          <div>
            <div className="label-caps">Connect your sources</div>
            <h2 className="font-serif text-2xl text-ink-50 mt-1">Настройки</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-ink-400 hover:text-ink-50 hover:bg-ink-950 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 pb-6 space-y-5">
          <div>
            <span className="label-caps block mb-2">🎬 Letterboxd watchlist · CSV</span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 rounded-md bg-ember-500 hover:bg-ember-400 text-white text-[12px] tracking-wide font-medium transition-colors"
              >
                {csvName ? 'Заменить файл' : 'Выбрать файл'}
              </button>
              {csvName && (
                <span className="text-[11px] text-ink-100 truncate max-w-[260px]">
                  📎 {csvName}
                </span>
              )}
              {csvName && (
                <button
                  type="button"
                  onClick={handleClearCsv}
                  className="text-[11px] text-ink-400 hover:text-ember-400 ml-auto"
                >
                  ✕ убрать
                </button>
              )}
            </div>
            {csvError && (
              <span className="block text-[11px] text-ember-400 mt-1.5">{csvError}</span>
            )}
            <span className="block text-[11px] text-ink-500 mt-2 leading-relaxed">
              Letterboxd → Settings → Import & Export → Export your data → <code className="text-ink-400 font-mono">watchlist.csv</code> из архива
            </span>
          </div>

          <Field
            label="🎮 Steam ID · 64-bit"
            placeholder="76561198012345678"
            value={steamId}
            onChange={setSteamId}
            hint="Только числовой ID. Найти на steamid.io. Профиль должен быть публичным."
          />
          <Field
            label="🎵 YouTube playlist · URL"
            placeholder="https://youtube.com/playlist?list=..."
            value={youtube}
            onChange={setYoutube}
            hint="Публичная или unlisted ссылка с параметром ?list="
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-ember-500 hover:bg-ember-400 text-white transition-colors text-sm font-medium tracking-wide"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-ink-500/30 text-ink-400 hover:text-ink-50 hover:border-ink-400 transition-colors text-sm tracking-wide"
            >
              Закрыть
            </button>
            {saved && <span className="text-ember-400 text-xs">✓ Сохранено</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, hint }) {
  return (
    <label className="block">
      <span className="label-caps block mb-2">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-ink-950 border border-ink-500/20 focus:border-ember-400 focus:outline-none transition-colors text-sm font-mono text-ink-50 placeholder:text-ink-500"
      />
      {hint && <span className="block text-[11px] text-ink-500 mt-1.5">{hint}</span>}
    </label>
  );
}
