/**
 * generate-narration.js
 *
 * AI-quality female narration pipeline using Microsoft Edge Neural TTS
 * (en-US-AriaNeural — confident, broadcast-quality, no API key required)
 *
 * Steps:
 *   1. edge-tts → .mp3 per line
 *   2. ffmpeg: mp3 → 44100 Hz stereo WAV + normalise each clip
 *   3. Position every clip at its timestamp with adelay
 *   4. amix all clips into one 20-second narration track
 *   5. Sidechain-compress music under voice (80ms/600ms duck)
 *   6. Mix narration (2.4×) + ducked music → final-audio.wav
 */

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const FFMPEG    = '/tmp/ffmpeg_bin/ffmpeg';
const EDGE_TTS  = `python3 -m edge_tts`;
const OUT       = path.join(__dirname, '../out');
const TMP       = path.join(OUT, '_narration_tmp');
const TOTAL     = 20; // seconds

fs.mkdirSync(TMP, { recursive: true });

// ── Voice config ─────────────────────────────────────────────
const VOICE = 'en-US-AriaNeural';
const RATE  = '-8%';   // slightly slower than default → clear, deliberate
const PITCH = '+0Hz';  // natural pitch

// ── Narration script (timed to animation keyframes) ──────────
const LINES = [
  {
    id:       'intro',
    text:     "Here are the numbers that define our impact.",
    startSec: 0.15,
  },
  {
    id:       'stat1',
    text:     "A 47 percent increase in conversion rate.",
    startSec: 2.0,
  },
  {
    id:       'stat2',
    text:     "2.3 times return on ad spend.",
    startSec: 6.8,
  },
  {
    id:       'stat3',
    text:     "More than 150 clients served worldwide.",
    startSec: 11.5,
  },
  {
    id:       'stat4',
    text:     "1.2 million dollars in revenue generated.",
    startSec: 16.0,
  },
  {
    id:       'outro',
    text:     "Results. That speak for themselves.",
    startSec: 19.1,
  },
];

// ── Helper: run shell command silently ───────────────────────
function run(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
}

function getAudioDuration(file) {
  const out = run(`${FFMPEG} -i "${file}" 2>&1 || true`);
  const m   = out.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (!m) return null;
  return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
}

// ── Step 1: synthesise each line via Edge Neural TTS ─────────
console.log('\n🎙  Synthesising with Microsoft Aria Neural…\n');

for (const line of LINES) {
  const mp3 = path.join(TMP, `${line.id}.mp3`);
  const wav = path.join(TMP, `${line.id}.wav`);

  // Generate MP3 via edge-tts
  run(
    `${EDGE_TTS} ` +
    `--voice "${VOICE}" ` +
    `--rate="${RATE}" ` +
    `--pitch="${PITCH}" ` +
    `--text "${line.text}" ` +
    `--write-media "${mp3}"`
  );

  // Convert MP3 → 44100 stereo WAV + loudnorm pass for consistent volume
  run(
    `${FFMPEG} -y -i "${mp3}" ` +
    `-ar 44100 -ac 2 ` +
    `-af "loudnorm=I=-16:LRA=6:TP=-1.5" ` +
    `"${wav}" 2>/dev/null`
  );

  line.durationSec = getAudioDuration(wav) ?? 3.0;
  console.log(
    `  ✓ ${line.id.padEnd(6)}  ${line.durationSec.toFixed(2).padStart(5)}s` +
    `  starts @ ${line.startSec.toFixed(2)}s  — "${line.text.slice(0, 48)}"`
  );
}

// ── Step 2: build narration track ────────────────────────────
console.log('\n🔀  Positioning clips on timeline…');

const silenceArg = `-f lavfi -i "anullsrc=r=44100:cl=stereo" -t ${TOTAL}`;
const inputArgs  = [silenceArg];
const filterParts = [];
let   idx = 1;

for (const line of LINES) {
  const wav     = path.join(TMP, `${line.id}.wav`);
  const delayMs = Math.round(line.startSec * 1000);
  inputArgs.push(`-i "${wav}"`);
  filterParts.push(`[${idx}]adelay=${delayMs}|${delayMs}[d${idx}]`);
  idx++;
}

const mixSrcs  = ['[0]', ...LINES.map((_, i) => `[d${i + 1}]`)].join('');
filterParts.push(
  `${mixSrcs}amix=inputs=${LINES.length + 1}:duration=first:normalize=0[narr]`
);

const narrWav = path.join(OUT, 'narration.wav');
run([
  FFMPEG, '-y',
  ...inputArgs,
  `-filter_complex "${filterParts.join('; ')}"`,
  `-map "[narr]"`,
  `-t ${TOTAL}`,
  `"${narrWav}"`,
].join(' '));
console.log(`  ✓ Narration track → ${narrWav}`);

// ── Step 3: sidechain-duck the background music ───────────────
console.log('\n🎚  Sidechain ducking music under voice…');

const musicWav  = path.join(OUT, 'background-music.wav');
const duckedWav = path.join(OUT, 'ducked-music.wav');

// sidechaincompress: when narration exceeds threshold, drop music to ~20%
// attack=60ms / release=700ms → smooth natural-feeling duck
run([
  FFMPEG, '-y',
  `-i "${musicWav}"`,
  `-i "${narrWav}"`,
  `-filter_complex "`,
  `  [1:a]apad,volume=1[sc];`,
  `  [0:a][sc]sidechaincompress=`,
  `    threshold=0.012:ratio=7:attack=60:release=700:makeup=1.0:knee=8[ducked]`,
  `"`,
  `-map "[ducked]"`,
  `-t ${TOTAL}`,
  `"${duckedWav}"`,
].join(' '));
console.log(`  ✓ Ducked music → ${duckedWav}`);

// ── Step 4: final mix — voice (2.4×) + ducked music ──────────
console.log('\n🎛  Final mix: voice + music…');

const finalAudio = path.join(OUT, 'final-audio.wav');
run([
  FFMPEG, '-y',
  `-i "${duckedWav}"`,
  `-i "${narrWav}"`,
  `-filter_complex "`,
  `  [0:a]volume=1.0[music];`,
  `  [1:a]volume=2.4[voice];`,
  `  [music][voice]amix=inputs=2:duration=first:normalize=0,`,
  `  loudnorm=I=-14:LRA=7:TP=-1.0[out]`,
  `"`,
  `-map "[out]"`,
  `-t ${TOTAL}`,
  `"${finalAudio}"`,
].join(' '));

console.log(`  ✓ Final audio → ${finalAudio}`);
console.log('\n✅  Audio pipeline complete.\n');
