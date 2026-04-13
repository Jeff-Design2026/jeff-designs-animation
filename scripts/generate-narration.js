/**
 * generate-narration.js
 *
 * 1. Uses macOS `say` to synthesise each narration line as AIFF
 * 2. Converts each AIFF → WAV (44100 Hz mono) with ffmpeg
 * 3. Positions every clip at the correct timestamp with `adelay`
 * 4. Mixes all narration clips into one 20-second narration track
 * 5. Applies sidechain-style ducking: music drops to 18% under speech,
 *    recovers smoothly between lines
 * 6. Merges narration + ducked music → final mixed audio WAV
 * 7. Final combined step is done in the render script
 */

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const FFMPEG = '/tmp/ffmpeg_bin/ffmpeg';
const OUT    = path.join(__dirname, '../out');
const TMP    = path.join(OUT, '_narration_tmp');

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

// ── Narration script ─────────────────────────────────────────
// startSec = when narration begins (matched to animation timing)
const LINES = [
  { id: 'intro',  text: "Here are the numbers that matter.",            startSec: 0.2  },
  { id: 'stat1',  text: "47 percent increase in conversion rate.",      startSec: 1.8  },
  { id: 'stat2',  text: "2.3 times return on ad spend.",                startSec: 6.5  },
  { id: 'stat3',  text: "Over 150 clients served worldwide.",           startSec: 11.2 },
  { id: 'stat4',  text: "1.2 million dollars in revenue generated.",    startSec: 15.8 },
  { id: 'outro',  text: "Results that speak for themselves. Jeff Designs.", startSec: 19.0 },
];

const VOICE = 'Samantha';
const RATE  = 162;   // words per minute — natural broadcast pace
const TOTAL = 20;    // seconds

// ── Step 1: synthesise each line ─────────────────────────────
console.log('\n🎙  Synthesising narration lines…');
for (const line of LINES) {
  const aiff = path.join(TMP, `${line.id}.aiff`);
  const wav  = path.join(TMP, `${line.id}.wav`);

  // macOS say → AIFF
  execSync(`say -v ${VOICE} --rate=${RATE} "${line.text}" -o "${aiff}"`, { stdio: 'inherit' });

  // Convert to 44100 mono WAV (ffmpeg static build)
  execSync(
    `${FFMPEG} -y -i "${aiff}" -ar 44100 -ac 1 "${wav}" 2>/dev/null`,
    { stdio: 'pipe' }
  );

  // Measure duration
  const raw = execSync(
    `${FFMPEG} -i "${wav}" 2>&1 | grep Duration`,
    { encoding: 'utf8' }
  );
  const match = raw.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (match) {
    const dur = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
    line.durationSec = dur;
  }
  console.log(`  ✓ ${line.id}: "${line.text.slice(0, 40)}…" → ${line.durationSec?.toFixed(2)}s`);
}

// ── Step 2: build narration mix (silence + each clip at offset) ──
console.log('\n🔀  Building narration track…');

// We'll use a complex filter: generate 20s silence, then mix each line at its offset
const silenceInput = `-f lavfi -i "anullsrc=r=44100:cl=mono" -t ${TOTAL}`;

let filterParts   = [];
let inputArgs     = [silenceInput];
let inputCount    = 1; // 0 = silence

for (const line of LINES) {
  const wav = path.join(TMP, `${line.id}.wav`);
  inputArgs.push(`-i "${wav}"`);
  const idx   = inputCount++;
  const delayMs = Math.round(line.startSec * 1000);
  filterParts.push(`[${idx}]adelay=${delayMs}|${delayMs}[d${idx}]`);
}

// amix all delayed clips + silence
const mixInputs = ['[0]', ...LINES.map((_, i) => `[d${i + 1}]`)].join('');
const mixCount  = LINES.length + 1;
filterParts.push(`${mixInputs}amix=inputs=${mixCount}:duration=first:normalize=0[narr]`);

const narrationWav = path.join(OUT, 'narration.wav');
const narrationCmd = [
  FFMPEG, '-y',
  ...inputArgs,
  `-filter_complex "${filterParts.join('; ')}"`,
  `-map "[narr]"`,
  `-t ${TOTAL}`,
  `"${narrationWav}"`
].join(' ');

execSync(narrationCmd, { stdio: 'pipe' });
console.log(`  ✓ Narration track: ${narrationWav}`);

// ── Step 3: duck music under narration ───────────────────────
console.log('\n🎚  Applying music ducking under narration…');

const musicWav   = path.join(OUT, 'background-music.wav');
const duckedWav  = path.join(OUT, 'ducked-music.wav');

// Build duck filter:
//   - detect narration loudness with a slow-attack compressor-style approach
//   - use `sidechaincompress` to reduce music when narration is present
// Since sidechaincompress needs both streams, we re-input narration as sidechain.
//
// Duck: when narration RMS > -40dB → music drops to ~18%
//        attack=80ms, release=600ms for smooth transitions

const duckCmd = [
  FFMPEG, '-y',
  `-i "${musicWav}"`,
  `-i "${narrationWav}"`,
  `-filter_complex "`,
  `  [1:a]apad,volume=1[sc];`,
  `  [0:a][sc]sidechaincompress=`,
  `    threshold=0.015:ratio=6:attack=80:release=600:`,
  `    makeup=1.0:knee=6[ducked]`,
  `"`,
  `-map "[ducked]"`,
  `-t ${TOTAL}`,
  `"${duckedWav}"`
].join(' ');

execSync(duckCmd, { stdio: 'pipe' });
console.log(`  ✓ Ducked music: ${duckedWav}`);

// ── Step 4: mix narration + ducked music ─────────────────────
console.log('\n🎛  Mixing narration + music into final audio…');

const finalAudio = path.join(OUT, 'final-audio.wav');
const mixCmd = [
  FFMPEG, '-y',
  `-i "${duckedWav}"`,
  `-i "${narrationWav}"`,
  `-filter_complex "`,
  `  [0:a]volume=1.0[music];`,
  `  [1:a]volume=2.2[voice];`,
  `  [music][voice]amix=inputs=2:duration=first:normalize=0[out]`,
  `"`,
  `-map "[out]"`,
  `-t ${TOTAL}`,
  `"${finalAudio}"`
].join(' ');

execSync(mixCmd, { stdio: 'pipe' });
console.log(`  ✓ Final audio mix: ${finalAudio}`);
console.log('\n✅  Narration pipeline complete.\n');
