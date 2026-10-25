import { renderAvatar, HAIR, OUTFIT, ACCESSORY, ROLE, COLOR, COLOR_NAME } from './avatar.js';
import { GENRES, TEMPOS, INTENSITIES, LAYERS, setParams, setApplyListener, getParams, play, stop, isPlaying, blip } from './music.js';
import { createTour } from './tour.js';

// Placeholders only. A player can name a band or a member anything.
const PLACEHOLDER_NAMES = ['Karl', 'Miranda', 'Cate', 'Billy'];
const BAND_PLACEHOLDER = 'rockrs';
const BUDGET = 150;
const STAT_MAX = 100;
const STAT_STEP = 5;
const STATS = ['skill', 'presence', 'energy'];
const STAT_LABEL = { skill: 'Skill', presence: 'Presence', energy: 'Energy' };
const ROWS = [
  { key: 'role', label: 'Role', list: ROLE },
  { key: 'hair', label: 'Hair', list: HAIR },
  { key: 'outfit', label: 'Outfits', list: OUTFIT },
  { key: 'accessory', label: 'Accessories', list: ACCESSORY },
  { key: 'color', label: 'Colors', list: COLOR_NAME },
];

const STORE_KEY = 'battle-test-v1';
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function newMember(i) {
  return {
    name: '',
    role: i % ROLE.length,
    hair: 0,
    outfit: 0,
    accessory: 0,
    color: i % COLOR.length,
    stats: { skill: 30, presence: 30, energy: 30 },
  };
}

// Rename, cosmetics and band size never touch stats, chemistry, fans or unlocks.
let state = null;
function freshState() {
  return {
    bandName: '',
    slots: 4,
    members: [0, 1, 2, 3].map(newMember),
    fans: 0,
    chemistry: 0,
    unlocks: [],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // Storage can be blocked (private window). Start fresh.
  }
  return freshState();
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    // Not persisted; the prototype still works for the session.
  }
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const activeMembers = () => state.members.slice(0, state.slots);
const pointsUsed = (m) => STATS.reduce((sum, k) => sum + m.stats[k], 0);

// ---------- Studio ----------

function renderBand() {
  const el = $('#band');
  el.className = `band layout-${state.slots}`;
  el.innerHTML = activeMembers().map((m, i) => memberCard(m, i)).join('');
  $('#bandName').value = state.bandName;
}

function memberCard(m, i) {
  const rows = ROWS.map(({ key, label, list }) => {
    const swatch = key === 'color' ? `<i class="sw" style="background:${COLOR[m.color]}"></i>` : '';
    return `<div class="row">
      <span class="label">${label}</span>
      <button class="step" data-act="prev" data-key="${key}" data-i="${i}" aria-label="Previous ${label}">‹</button>
      <b>${swatch}${list[m[key]]}</b>
      <button class="step" data-act="next" data-key="${key}" data-i="${i}" aria-label="Next ${label}">›</button>
    </div>`;
  }).join('');
  return `<article class="card">
    <div class="avatar">${renderAvatar(m)}</div>
    <input class="name" data-i="${i}" placeholder="${PLACEHOLDER_NAMES[i]}" value="${esc(m.name)}" maxlength="24" aria-label="Member ${i + 1} name" autocomplete="off">
    ${rows}
  </article>`;
}

function renderStats() {
  $('#stats').innerHTML = activeMembers().map((m, i) => {
    const left = BUDGET - pointsUsed(m);
    const lines = STATS.map((k) => `<div class="stat-line">
      <span class="label">${STAT_LABEL[k]}</span>
      <button class="step" data-stat="${k}" data-d="-1" data-i="${i}" aria-label="Lower ${STAT_LABEL[k]}">−</button>
      <b>${m.stats[k]}</b>
      <button class="step" data-stat="${k}" data-d="1" data-i="${i}" aria-label="Raise ${STAT_LABEL[k]}">+</button>
    </div>`).join('');
    return `<div class="stat-card">
      <strong>${esc(m.name || PLACEHOLDER_NAMES[i])}</strong> · points left ${left}
      ${lines}
    </div>`;
  }).join('');
}

function renderStatus() {
  $('#fans').textContent = state.fans;
  $('#chem').textContent = state.chemistry;
  $('#unlocks').textContent = state.unlocks.length ? state.unlocks.join(', ') : 'none';
}

function renderStudio() {
  renderBand();
  renderStats();
  renderStatus();
  $$('[data-count]').forEach((b) => b.classList.toggle('is-on', Number(b.dataset.count) === state.slots));
}

function wireStudio() {
  $('#bandName').placeholder = BAND_PLACEHOLDER;
  $('#bandName').addEventListener('input', (e) => {
    state.bandName = e.target.value;
    save();
  });

  $('#studio').addEventListener('click', (e) => {
    const cnt = e.target.closest('[data-count]');
    if (cnt) {
      blip();
      state.slots = Number(cnt.dataset.count);
      save();
      renderStudio();
      return;
    }
    const act = e.target.closest('[data-act]');
    if (act) {
      blip();
      const m = state.members[Number(act.dataset.i)];
      const key = act.dataset.key;
      const len = ROWS.find((r) => r.key === key).list.length;
      m[key] = (m[key] + (act.dataset.act === 'next' ? 1 : len - 1)) % len;
      save();
      renderBand();
      return;
    }
    const stat = e.target.closest('[data-stat]');
    if (stat) {
      blip();
      const m = state.members[Number(stat.dataset.i)];
      const k = stat.dataset.stat;
      const d = Number(stat.dataset.d) * STAT_STEP;
      const next = m.stats[k] + d;
      if (next < 0 || next > STAT_MAX) return;
      if (d > 0 && pointsUsed(m) + d > BUDGET) return;
      m.stats[k] = next;
      save();
      renderStats();
    }
  });

  // Renaming only writes the name. It never re-renders stats, fans or unlocks.
  $('#band').addEventListener('input', (e) => {
    if (!e.target.matches('.name')) return;
    state.members[Number(e.target.dataset.i)].name = e.target.value;
    save();
    renderStats();
  });
}

// ---------- Music Maker ----------

const musicUi = {
  genre: 'Rock',
  tempo: 'Medium',
  intensity: 'Medium',
  layers: { Drums: true, Bass: true, Chords: true, Lead: true },
};

function chipRow(id, list, selected, onPick) {
  const el = $(id);
  el.innerHTML = list.map((v) => `<button class="chip${v === selected ? ' is-on' : ''}" data-v="${v}">${v}</button>`).join('');
  el.onclick = (e) => {
    const b = e.target.closest('[data-v]');
    if (!b) return;
    blip();
    onPick(b.dataset.v);
  };
}

function renderMusicChips() {
  chipRow('#genres', GENRES, musicUi.genre, (v) => { musicUi.genre = v; renderMusicChips(); applyMusic(); });
  chipRow('#tempos', TEMPOS, musicUi.tempo, (v) => { musicUi.tempo = v; renderMusicChips(); applyMusic(); });
  chipRow('#intensities', INTENSITIES, musicUi.intensity, (v) => { musicUi.intensity = v; renderMusicChips(); applyMusic(); });
  const el = $('#layers');
  el.innerHTML = LAYERS.map((l) => `<button class="chip${musicUi.layers[l] ? ' is-on' : ''}" data-layer="${l}" aria-pressed="${musicUi.layers[l]}">${l}</button>`).join('');
  el.onclick = (e) => {
    const b = e.target.closest('[data-layer]');
    if (!b) return;
    blip();
    const l = b.dataset.layer;
    musicUi.layers[l] = !musicUi.layers[l];
    renderMusicChips();
    applyMusic();
  };
}

function applyMusic() {
  setParams({ genre: musicUi.genre, tempo: musicUi.tempo, intensity: musicUi.intensity, layers: { ...musicUi.layers } });
  if (!isPlaying()) {
    $('#musicStatus').textContent = 'Set. Press Play, changes apply on the next step.';
  }
}

function wireMusic() {
  setApplyListener((t) => {
    $('#musicStatus').textContent = `Change applied: scheduled in ${t.schedMs.toFixed(0)} ms, audible within ${t.audibleMs.toFixed(0)} ms (total ${t.totalMs.toFixed(0)} ms). Step ${t.stepSeconds.toFixed(3)} s, loop ${t.loopSeconds} s.`;
    window.__battleLastApply = t;
  });
  $('#playBtn').addEventListener('click', () => {
    blip();
    if (isPlaying()) {
      stop();
      $('#playBtn').textContent = 'Play 10 second loop';
      $('#playBtn').classList.remove('is-on');
    } else {
      play();
      $('#playBtn').textContent = 'Stop loop';
      $('#playBtn').classList.add('is-on');
    }
  });
  renderMusicChips();
  applyMusic();
}

// ---------- Tour ----------

let tour = null;
let drawnOnce = false;
const tourLabel = { home: 'Home', studio: 'Studio', tour: 'Tour Venue' };

function wireTour() {
  tour = createTour($('#scene'), {
    onArrive: (target, ms) => {
      $('#tourStatus').textContent = `At ${tourLabel[target]}. Transition ${(ms / 1000).toFixed(2)} s.`;
      $('#tourTiming').textContent = `Last transition: ${ms} ms (limit 3000 to 5000 ms, 4000 ms target).`;
      if (target === 'tour') {
        state.fans += 10;
        if (!state.unlocks.includes('Tour Venue')) state.unlocks.push('Tour Venue');
        save();
        renderStatus();
      }
    },
  });
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => {
    blip();
    tour.go(b.dataset.go);
  }));
}

function drawSceneOnce() {
  if (drawnOnce) return;
  drawnOnce = true;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !window.gsap || !window.DrawSVGPlugin) return;
  window.gsap.registerPlugin(window.DrawSVGPlugin);
  window.gsap.from('#scene .draw', { drawSVG: '0%', duration: 0.8, stagger: 0.05, ease: 'power1.out' });
}

// ---------- Tabs ----------

function showScreen(name) {
  $$('.tab').forEach((b) => b.classList.toggle('is-on', b.dataset.screen === name));
  $$('.screen').forEach((s) => s.classList.toggle('is-on', s.id === name));
  if (name === 'tour') drawSceneOnce();
}

function wireTabs() {
  $$('.tab').forEach((b) => b.addEventListener('click', () => {
    blip();
    showScreen(b.dataset.screen);
  }));
}

// ---------- Boot ----------

state = load();
state.members = [...state.members];
while (state.members.length < 4) state.members.push(newMember(state.members.length));
wireTabs();
wireStudio();
wireTour();
wireMusic();
renderStudio();

// Read-only handle for test proof in the browser console.
window.battleTest = { getState: () => state, getParams, showScreen };
