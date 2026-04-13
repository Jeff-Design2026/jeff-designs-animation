/**
 * Ambient music generator — produces a soothing 25-second WAV
 * No dependencies; pure Node.js Buffer / math synthesis.
 *
 * Chord progression (6.25s each):
 *   0–6.25s    Fmaj7   (F A C E)
 *   6.25–12.5s Am7     (A C E G)
 *   12.5–18.75s Dm9    (D F A C E)
 *   18.75–25s  Cmaj9   (C E G B D)
 *
 * Each chord layer:
 *   • 3 slightly detuned oscillators per note (chorus effect)
 *   • Soft harmonics (2nd + 3rd partial)
 *   • Per-note tremolo LFO
 *   • Low sub-bass drone
 *   • tanh soft-clip → no harsh clipping
 */

const fs   = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION    = 25;
const N           = SAMPLE_RATE * DURATION;

// ── Musical helpers ──────────────────────────────────────────
const note = (name) => {
  const notes = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  const acc   = name.includes('#') ? 1 : name.includes('b') ? -1 : 0;
  const letter = name[0];
  const octave = parseInt(name.slice(-1));
  const semitone = (octave + 1) * 12 + notes[letter] + acc;
  return 440 * Math.pow(2, (semitone - 69) / 12);
};

// Chord definitions [freq, base amplitude]
const CHORDS = [
  // 0–5s  Fmaj7
  [
    [note('F2'), 0.22], [note('C3'), 0.18], [note('F3'), 0.20],
    [note('A3'), 0.16], [note('C4'), 0.14], [note('E4'), 0.10],
  ],
  // 5–10s Am7
  [
    [note('A2'), 0.20], [note('E3'), 0.17], [note('A3'), 0.20],
    [note('C4'), 0.15], [note('E4'), 0.12], [note('G4'), 0.09],
  ],
  // 10–15s Dm9
  [
    [note('D2'), 0.22], [note('A2'), 0.18], [note('D3'), 0.20],
    [note('F3'), 0.16], [note('A3'), 0.13], [note('C4'), 0.10],
    [note('E4'), 0.07],
  ],
  // 15–20s Cmaj9
  [
    [note('C2'), 0.22], [note('G2'), 0.18], [note('C3'), 0.20],
    [note('E3'), 0.16], [note('G3'), 0.13], [note('B3'), 0.10],
    [note('D4'), 0.07],
  ],
];

// ── Oscillator with chorus ────────────────────────────────────
// Returns sum of 3 detuned sines (−4 cents, 0, +4 cents)
function osc(freq, t) {
  const detune = 0.0023; // ≈ 4 cents
  return (
    Math.sin(2 * Math.PI * freq * (1 - detune) * t) +
    Math.sin(2 * Math.PI * freq * t) +
    Math.sin(2 * Math.PI * freq * (1 + detune) * t)
  ) / 3;
}

// ── Envelope helpers ─────────────────────────────────────────
function smoothStep(a, b, t) {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

// ── Synthesise ───────────────────────────────────────────────
console.log('Synthesising ambient music…');
const buf = new Float32Array(N);

const CHORD_DUR = 6.25; // seconds per chord (25s ÷ 4 chords)
const XFADE    = 0.8; // cross-fade overlap (seconds)

for (let i = 0; i < N; i++) {
  const t   = i / SAMPLE_RATE;
  let samp  = 0;

  // Identify which chords are active (with cross-fade)
  const chordIdx  = Math.min(Math.floor(t / CHORD_DUR), CHORDS.length - 1);
  const chordFrac = (t % CHORD_DUR) / CHORD_DUR;

  const gain0 = chordFrac < (1 - XFADE / CHORD_DUR)
    ? 1
    : smoothStep(1, 1 - XFADE / CHORD_DUR, chordFrac);

  const prevIdx = Math.max(0, chordIdx - 1);
  const prevFrac = chordFrac < XFADE / CHORD_DUR
    ? smoothStep(0, XFADE / CHORD_DUR, chordFrac)
    : 0;

  // Render current chord
  for (const [freq, amp] of CHORDS[chordIdx]) {
    const tremolo = 1 + 0.08 * Math.sin(2 * Math.PI * 0.18 * t + freq);
    const voice   =
      osc(freq, t) * 0.70 +
      osc(freq * 2, t) * 0.20 +
      osc(freq * 3, t) * 0.06 +
      osc(freq * 0.5, t) * 0.04; // sub-octave warmth
    samp += amp * tremolo * voice * gain0;
  }

  // Render outgoing chord (cross-fade)
  if (prevFrac > 0) {
    for (const [freq, amp] of CHORDS[prevIdx]) {
      const tremolo = 1 + 0.08 * Math.sin(2 * Math.PI * 0.18 * t + freq);
      const voice   =
        osc(freq, t) * 0.70 +
        osc(freq * 2, t) * 0.20 +
        osc(freq * 3, t) * 0.06 +
        osc(freq * 0.5, t) * 0.04;
      samp += amp * tremolo * voice * (1 - prevFrac);
    }
  }

  // Subtle high shimmer (very quiet triangle-ish at 2kHz range)
  samp += 0.012 * Math.sin(2 * Math.PI * 2093 * t) * (1 + 0.5 * Math.sin(2 * Math.PI * 0.07 * t));

  // Master breathing LFO
  const breath = 0.88 + 0.12 * Math.sin(2 * Math.PI * 0.08 * t);

  // Global fade in / fade out
  const fadeIn  = smoothStep(0,  3,  t);
  const fadeOut = smoothStep(25, 22, t);

  // Soft clip + store
  buf[i] = Math.tanh(samp * breath * fadeIn * fadeOut * 1.4);
}

// ── Normalise ────────────────────────────────────────────────
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const norm = 0.82 / peak;
for (let i = 0; i < N; i++) buf[i] *= norm;

console.log(`Peak before norm: ${peak.toFixed(4)}  →  after: ${(peak * norm).toFixed(4)}`);

// ── Write WAV ────────────────────────────────────────────────
function writeWav(filename, samples, sr) {
  const ns = samples.length;
  const out = Buffer.alloc(44 + ns * 2);

  out.write('RIFF', 0);
  out.writeUInt32LE(36 + ns * 2, 4);
  out.write('WAVE', 8);
  out.write('fmt ', 12);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);  // PCM
  out.writeUInt16LE(1, 22);  // Mono
  out.writeUInt32LE(sr, 24);
  out.writeUInt32LE(sr * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36);
  out.writeUInt32LE(ns * 2, 40);

  for (let i = 0; i < ns; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }

  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, out);
  console.log(`✅  Written: ${filename}  (${(out.length / 1024).toFixed(0)} KB)`);
}

writeWav(
  path.join(__dirname, '../out/background-music.wav'),
  buf,
  SAMPLE_RATE
);
