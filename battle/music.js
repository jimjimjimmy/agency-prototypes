// Music Maker: Web Audio only. No real songs, no samples, no Spotify.
// Loop is always 10 seconds. Tempo sets how many passes of a 16-slot genre pattern
// fit into the loop: Slow 1 pass, Medium 2, Fast 4. Intensity is song intensity,
// not member Energy.
export const GENRES = ['Rock', 'Indie Pop', 'Grunge', 'Metal', 'Country', 'Folk'];
export const TEMPOS = ['Slow', 'Medium', 'Fast'];
export const INTENSITIES = ['Low', 'Medium', 'High'];
export const LAYERS = ['Drums', 'Bass', 'Chords', 'Lead'];

const LOOP_SECONDS = 10;
const PASSES = { Slow: 1, Medium: 2, Fast: 4 };
const INTENSITY = {
  Low: { gain: 0.45, cutoff: 900, hats: false },
  Medium: { gain: 0.7, cutoff: 1800, hats: true },
  High: { gain: 1, cutoff: 3200, hats: true },
};

// Starter patterns, one per genre. Semitone offsets from the genre root.
const PATTERN = {
  Rock: { root: 110, minor: false, kick: [0, 8, 10, 14], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14],
    bass: [[0, 0], [6, 7], [8, 0], [12, 5], [14, 7]], chords: [0, 7, 9, 5], wave: 'sawtooth', lead: true, strum: false },
  'Indie Pop': { root: 87.31, minor: false, kick: [0, 8], snare: [4, 12], hat: [2, 6, 10, 14],
    bass: [[0, 0], [8, 3]], chords: [0, 9, 5, 7], wave: 'triangle', lead: true, strum: false },
  Grunge: { root: 82.41, minor: true, kick: [0, 3, 8, 11], snare: [4, 12], hat: [0, 4, 8, 12],
    bass: [[0, 0], [3, 0], [8, 0], [11, -2]], chords: [0, 8, 5, 7], wave: 'sawtooth', lead: false, strum: false },
  Metal: { root: 73.42, minor: true, kick: [0, 2, 4, 6, 8, 10, 12, 14], snare: [4, 12],
    hat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    bass: [[0, 0], [2, 0], [4, 0], [6, 1], [8, 0], [10, 0], [12, -1], [14, 0]], chords: [0, 8, 5, 7], wave: 'sawtooth', lead: false, strum: false },
  Country: { root: 98, minor: false, kick: [0, 8], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14],
    bass: [[0, 0], [4, 0], [8, 0], [12, 0]], chords: [0, 5, 7, 0], wave: 'triangle', lead: false, strum: true },
  Folk: { root: 130.81, minor: false, kick: [0], snare: [8], hat: [],
    bass: [[0, 0], [8, -5]], chords: [0, 5, 9, 7], wave: 'triangle', lead: true, strum: true },
};

const CHORD_MAJOR = [0, 4, 7];
const CHORD_MINOR = [0, 3, 7];

let ctx = null;
let master = null;
let noise = null;
let params = { genre: 'Rock', tempo: 'Medium', intensity: 'Medium', layers: { Drums: true, Bass: true, Chords: true, Lead: true } };
let timer = null;
let nextIdx = 0;
let nextTime = 0;
let pending = null;
let onApplied = null;

function ensure() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.4;
    master.connect(ctx.destination);
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noise = buf;
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function env(t, v, dur) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(v, 0.0002), t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  return g;
}

function freq(root, semi) {
  return root * Math.pow(2, semi / 12);
}

function kick(t, v) {
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  const g = env(t, v * 0.9, 0.25);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.3);
}

function noiseHit(t, dur, type, f, v) {
  const s = ctx.createBufferSource();
  s.buffer = noise;
  const flt = ctx.createBiquadFilter();
  flt.type = type;
  flt.frequency.value = f;
  const g = env(t, v, dur);
  s.connect(flt).connect(g).connect(master);
  s.start(t);
  s.stop(t + dur + 0.02);
}

function tone(t, f, type, dur, v, cutoff) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = f;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = cutoff;
  const g = env(t, v, dur);
  o.connect(lp).connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function playSlot(g, slot, t, dur, p) {
  const I = INTENSITY[p.intensity];
  const v = I.gain;
  if (p.layers.Drums) {
    if (g.kick.includes(slot)) kick(t, v);
    if (g.snare.includes(slot)) noiseHit(t, 0.18, 'bandpass', 1800, v * 0.5);
    if (I.hats && g.hat.includes(slot)) noiseHit(t, 0.05, 'highpass', 7000, v * 0.3);
  }
  const bar = Math.floor(slot / 4);
  const base = g.chords[bar];
  const ivs = g.minor ? CHORD_MINOR : CHORD_MAJOR;
  if (p.layers.Bass) {
    const b = g.bass.find(([s]) => s === slot);
    if (b) tone(t, freq(g.root, b[1]), g.wave, dur * 1.5, v * 0.8, I.cutoff);
  }
  if (p.layers.Chords && slot % 4 === 0) {
    ivs.forEach((iv, i) => {
      const at = g.strum ? t + i * 0.03 : t;
      tone(at, freq(g.root, base + iv + 12), 'triangle', dur * 4, v * 0.25, I.cutoff);
    });
  }
  if (p.layers.Lead && g.lead && slot % 4 === 2) {
    tone(t, freq(g.root, base + ivs[slot % 3] + 24), 'triangle', dur * 2, v * 0.35, I.cutoff);
  }
}

function tick() {
  const steps = 16 * PASSES[params.tempo];
  const dur = LOOP_SECONDS / steps;
  while (nextTime < ctx.currentTime + 0.12) {
    playSlot(PATTERN[params.genre], nextIdx % 16, nextTime, dur, params);
    if (pending) {
      const schedMs = performance.now() - pending.at;
      const audibleMs = (nextTime - ctx.currentTime) * 1000;
      if (onApplied) onApplied({ schedMs, audibleMs, totalMs: schedMs + audibleMs, loopSeconds: LOOP_SECONDS, stepSeconds: dur });
      pending = null;
    }
    nextTime += dur;
    nextIdx++;
  }
}

export function setParams(next) {
  params = { ...params, ...next, layers: { ...params.layers, ...(next.layers || {}) } };
  // Change is picked up at the next scheduled step, so the swap is audible within one step.
  pending = { at: performance.now() };
}

export function setApplyListener(fn) {
  onApplied = fn;
}

export function getParams() {
  return params;
}

export function play() {
  ensure();
  if (timer) return;
  nextIdx = 0;
  nextTime = ctx.currentTime + 0.05;
  timer = setInterval(tick, 25);
  tick();
}

export function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function isPlaying() {
  return timer !== null;
}

// Short tap sound, under 1 second, plays with the tap.
export function blip() {
  try {
    ensure();
    const t = ctx.currentTime;
    tone(t, 880, 'square', 0.06, 0.25, 2400);
  } catch (e) {
    // Audio can be unavailable; the tap still works without it.
  }
}
