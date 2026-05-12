// Synthesised wheel sounds via Web Audio API — no sample files, no bundle
// cost. Single shared AudioContext, lazy-init on first user interaction
// (browsers gate audio behind a gesture).

let ctx = null;

function ensureCtx() {
  if (ctx) return ctx;
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

// Woody "tock" — short low-mid pitched click. Modelled as a damped sine
// with a sharp attack and a quick decay through a low-pass filter, so it
// sounds like a wooden peg, not a laser blast.
export function playTick(volume = 0.16) {
  const c = ensureCtx();
  if (!c) return;

  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const lp = c.createBiquadFilter();

  osc.type = 'sine';
  // Gentle pitch drop 220 → 160 Hz: gives it body without ringing.
  osc.frequency.setValueAtTime(220, t0);
  osc.frequency.exponentialRampToValueAtTime(160, t0 + 0.04);

  lp.type = 'lowpass';
  lp.frequency.value = 900;
  lp.Q.value = 0.7;

  // Sharp 3 ms attack, 40 ms exponential decay.
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);

  osc.connect(lp).connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + 0.07);
}

// Two-tone "ding" — bright bell-ish chord (fundamental + fifth) with a
// long decay. Used when the wheel comes to rest on the winner.
export function playDing(volume = 0.22) {
  const c = ensureCtx();
  if (!c) return;

  const t0 = c.currentTime;
  const tones = [880, 1320]; // A5, ~E6 — major fifth
  tones.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0);

    const v = i === 0 ? volume : volume * 0.6;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(v, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);

    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 1.5);
  });
}
