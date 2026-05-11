import { useEffect, useRef, useState } from 'react';

export default function Settings({ open, onClose, initial, onSave }) {
  const [csvName, setCsvName] = useState(initial?.letterboxdFileName || '');
  const [csv, setCsv] = useState(initial?.letterboxdCsv || '');
  const [steamId, setSteamId] = useState(initial?.steamId || '');
  const [saved, setSaved] = useState(false);
  const [csvError, setCsvError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setCsv(initial?.letterboxdCsv || '');
      setCsvName(initial?.letterboxdFileName || '');
      setSteamId(initial?.steamId || '');
      setCsvError(null);
      setSaved(false);
    }
  }, [open, initial]);

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
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-paper-50 border border-paper-200 rounded-2xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-3 flex items-center justify-between">
          <div>
            <div className="label-caps">Connect your sources</div>
            <h2 className="font-serif text-2xl text-ink-900 mt-1">
              Настройки <em className="italic">источников</em>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-ink-500 hover:text-ink-900 hover:bg-paper-100 transition-colors flex items-center justify-center"
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
                className="px-3 py-1.5 rounded-md bg-ink-900 hover:bg-ink-700 text-paper-50 text-[12px] tracking-wide font-medium transition-colors"
              >
                {csvName ? 'Заменить файл' : 'Выбрать файл'}
              </button>
              {csvName && (
                <span className="text-[11px] text-ink-700 truncate max-w-[260px]">
                  📎 {csvName}
                </span>
              )}
              {csvName && (
                <button
                  type="button"
                  onClick={handleClearCsv}
                  className="text-[11px] text-ink-500 hover:text-ember-500 ml-auto"
                >
                  ✕ убрать
                </button>
              )}
            </div>
            {csvError && (
              <span className="block text-[11px] text-ember-600 mt-1.5">{csvError}</span>
            )}
            <span className="block text-[11px] text-ink-500 mt-2 leading-relaxed">
              Letterboxd → Settings → Import & Export → Export your data → <code className="text-ink-700 font-mono">watchlist.csv</code> из архива
            </span>
          </div>

          <Field
            label="🎮 Steam ID · 64-bit"
            placeholder="76561198012345678"
            value={steamId}
            onChange={setSteamId}
            hint="Только числовой ID. Найти на steamid.io. Профиль должен быть публичным."
          />

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-ink-900 hover:bg-ink-700 text-paper-50 transition-colors text-sm font-medium tracking-wide"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-paper-200 text-ink-700 hover:bg-paper-100 transition-colors text-sm tracking-wide"
            >
              Закрыть
            </button>
            {saved && <span className="text-ember-500 text-xs">✓ Сохранено</span>}
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
        className="w-full px-3 py-2 rounded-lg bg-paper-100 border border-paper-200 focus:border-ink-900 focus:outline-none transition-colors text-sm font-mono text-ink-900 placeholder:text-ink-400"
      />
      {hint && <span className="block text-[11px] text-ink-500 mt-1.5">{hint}</span>}
    </label>
  );
}
