"use strict";
/* ========== Nihongo Quest — app logic ========== */

/* ---------- tiny helpers ---------- */
const $ = (sel, root) => (root || document).querySelector(sel);
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function sampleN(a, n) { return shuffle(a).slice(0, n); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function todayKey(offset = 0) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function fmtMin(sec) {
  const m = Math.floor(sec / 60);
  if (m < 60) return m + "m";
  return Math.floor(m / 60) + "h " + (m % 60) + "m";
}
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

const ICONS = {
  flame: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1 4-3 5.5-3 9a3 3 0 0 0 6 0c0-1.5-.7-2.5-.7-2.5S17 10 17 13a5 5 0 0 1-10 0c0-5 4-6.5 5-11zm0 20a7 7 0 0 0 7-7c0-2-1-3.8-1-3.8A9 9 0 0 1 12 22z" opacity=".001"/><path d="M13.5 2.5c.6 3.6-2.9 5.6-2.9 8.8a1.9 1.9 0 1 0 3.8 0c0-1 -.4-1.8-.4-1.8s2.6 1.4 2.6 4.1a4.6 4.6 0 1 1-9.2 0c0-4.6 4.8-6.4 6.1-11.1z"/></svg>',
  gem: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2" stroke-linecap="round"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2V5z"/><path d="M20 17H6a2 2 0 0 0-2 2"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 21l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L7 20l-4 1z" stroke-linejoin="round"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H4l2.5-2.5A8 8 0 1 1 21 12z" stroke-linejoin="round"/></svg>',
  person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6" stroke-linecap="round"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  turtle: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 12h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
};
function svgNode(name) { const d = el("span"); d.innerHTML = ICONS[name]; return d.firstChild; }

/* ---------- state & persistence ---------- */
function goalMin() { return (state.settings && state.settings.goalMin) || 15; }
let state = {
  v: 1, xp: 0, lessons: {}, badges: [], days: {}, streak: 0, lastDay: null,
  counters: { write: 0, speak: 0, tutor: 0, traceXpDay: "", traceXpCount: 0 },
  traced: {}, skin: "indigo", settings: { goalMin: 15, rate: 1 },
};
function applySkin() {
  const s = state.skin || "indigo";
  try {
    if (s === "indigo") delete document.documentElement.dataset.skin;
    else document.documentElement.dataset.skin = s;
  } catch (e) { }
}
let dbRef = null, dirty = false, saving = false, saveTimer = null;

function serialize() { return JSON.parse(JSON.stringify(state)); }
function mergeProgress(remote) {
  if (!remote || typeof remote !== "object") return;
  try {
    state.xp = Math.max(state.xp, remote.xp || 0);
    for (const [k, v] of Object.entries(remote.lessons || {})) {
      const cur = state.lessons[k];
      if (!cur || (v.stars || 0) > (cur.stars || 0)) state.lessons[k] = v;
    }
    state.badges = Array.from(new Set([...(state.badges || []), ...(remote.badges || [])]));
    for (const [d, v] of Object.entries(remote.days || {})) {
      const cur = state.days[d] || { sec: 0, xp: 0 };
      state.days[d] = { sec: Math.max(cur.sec, v.sec || 0), xp: Math.max(cur.xp, v.xp || 0) };
    }
    if ((remote.streak || 0) > state.streak) { state.streak = remote.streak; state.lastDay = remote.lastDay; }
    for (const k of ["write", "speak", "tutor"]) state.counters[k] = Math.max(state.counters[k], (remote.counters || {})[k] || 0);
    Object.assign(state.traced, remote.traced || {});
    if (remote.skin && SKINS.some(s => s.id === remote.skin)) state.skin = remote.skin;
    if (remote.settings) state.settings = Object.assign({ goalMin: 15, rate: 1 }, state.settings, remote.settings);
  } catch (e) { /* keep local */ }
}
function loadLocal() {
  try {
    const raw = localStorage.getItem("nq-progress");
    if (raw) mergeProgress(JSON.parse(raw));
  } catch (e) { }
}
function markDirty() {
  dirty = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 5000);
}
async function flushSave() {
  if (!dirty) return;
  dirty = false;
  try { localStorage.setItem("nq-progress", JSON.stringify(serialize())); } catch (e) { }
  if (dbRef && !saving) {
    saving = true;
    try { await dbRef.set(serialize()); } catch (e) { }
    saving = false;
    if (dirty) { clearTimeout(saveTimer); saveTimer = setTimeout(flushSave, 3000); }
  }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushSave(); });
window.addEventListener("pagehide", flushSave);

/* ---------- capabilities ---------- */
let sampleFn = null, dict = null, userCap = null;
let dictJaFailed = false;

function useCap(name) {
  try {
    if (window.claude && typeof window.claude.use === "function")
      return window.claude.use(name).catch(() => null);
  } catch (e) { }
  return Promise.resolve(null);
}

async function initCaps() {
  useCap("sample").then(s => { sampleFn = s; if (currentView === "sensei") renderSensei(); });
  useCap("dictation").then(d => { dict = d; });
  AudioMod.init();
  try {
    const [db, user] = await Promise.all([useCap("db"), useCap("user")]);
    userCap = user;
    if (db && user) {
      const id = await user.id();
      if (id) {
        dbRef = db.doc("data/users/" + id + "/progress");
        try {
          const snap = await dbRef.get();
          if (snap.exists) { mergeProgress(snap.data()); applySkin(); renderHeader(); renderView(); }
        } catch (e) { }
      }
    }
  } catch (e) { }
}

/* ---------- audio ----------
   Preference order, so pronunciation is always actually Japanese:
   1. Claude AI voice with CONFIRMED Japanese support (tts.languages() lists "ja")
   2. The device's real Japanese voice (ja-JP) via the Web Speech API
   3. Claude AI voice without confirmed "ja" — short sounds are padded with
      Japanese punctuation and doubled so the language detector locks onto Japanese
*/
const AudioMod = {
  mode: null, tts: null, webVoice: null, ttsJaConfirmed: false,
  async init() {
    try { this.tts = await useCap("tts"); } catch (e) { }
    if (this.tts) {
      try {
        const langs = this.tts.languages ? await this.tts.languages().catch(() => null) : null;
        this.ttsJaConfirmed = Array.isArray(langs) && langs.some(l => String(l).toLowerCase().startsWith("ja"));
      } catch (e) { this.ttsJaConfirmed = false; }
    }
    if ("speechSynthesis" in window) {
      const find = () => {
        try {
          const vs = speechSynthesis.getVoices().filter(v => (v.lang || "").toLowerCase().startsWith("ja"));
          if (vs.length) {
            this.webVoice = vs.find(v => /google|nanami|keita|kyoko|haruka|ichiro|sayaka|o-?ren/i.test(v.name || "")) || vs[0];
          }
          this.decideMode();
        } catch (e) { }
      };
      find();
      try { speechSynthesis.addEventListener("voiceschanged", find); } catch (e) { }
    }
    this.decideMode();
  },
  decideMode() {
    if (this.tts && this.ttsJaConfirmed) this.mode = "tts";
    else if (this.webVoice) this.mode = "web";
    else if (this.tts) this.mode = "tts";
    else this.mode = null;
  },
  get ready() { return !!this.mode; },
  jaText(text) {
    const clean = String(text);
    if (this.ttsJaConfirmed) return clean;
    // Single sounds give the language detector nothing to go on — say them
    // twice with Japanese punctuation so it settles on Japanese (and the
    // learner hears the sound twice, which helps anyway).
    if ([...clean].length <= 2) return clean + "。" + clean + "。";
    return /[。！？]$/.test(clean) ? clean : clean + "。";
  },
  speak(text, rate = 1) {
    rate = rate * ((state.settings && state.settings.rate) || 1);
    if (this.mode === "tts") {
      this.tts.speak(this.jaText(text), { language: "ja", rate }).catch(e => {
        if (e && (e.code === "not_granted" || e.code === "unavailable")) { this.tts = null; this.decideMode(); }
      });
    } else if (this.mode === "web") {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.voice = this.webVoice; u.lang = "ja-JP"; u.rate = 0.9 * rate;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      } catch (e) { }
    }
  },
};

/* ---------- active-time tracking ---------- */
let lastInteraction = Date.now();
["pointerdown", "keydown", "scroll", "touchstart"].forEach(evt =>
  window.addEventListener(evt, () => { lastInteraction = Date.now(); }, { passive: true }));
setInterval(() => {
  if (document.visibilityState !== "visible") return;
  if (Date.now() - lastInteraction > 120000) return; // idle after 2 min without input
  const k = todayKey();
  const d = state.days[k] || (state.days[k] = { sec: 0, xp: 0 });
  d.sec++;
  if (d.sec % 30 === 0) { markDirty(); renderHeader(); }
  if (d.sec === 3600) checkBadges("time");
  if (totalSec() === 3600 || totalSec() === 18000) checkBadges("time");
}, 1000);
function totalSec() { return Object.values(state.days).reduce((s, d) => s + (d.sec || 0), 0); }
function todaySec() { return (state.days[todayKey()] || {}).sec || 0; }
function todayXp() { return (state.days[todayKey()] || {}).xp || 0; }

/* ---------- gamification ---------- */
const modalQueue = [];
let modalOpen = false;
function queueModal(renderFn) { modalQueue.push(renderFn); pumpModals(); }
function pumpModals() {
  if (modalOpen || !modalQueue.length) return;
  modalOpen = true;
  const fn = modalQueue.shift();
  fn(() => { modalOpen = false; $("#modal-root").innerHTML = ""; pumpModals(); });
}
function showModal(buildBody, closeCb) {
  const root = $("#modal-root");
  root.innerHTML = "";
  const veil = el("div", "modal-veil");
  const box = el("div", "modal");
  veil.appendChild(box);
  root.appendChild(veil);
  const close = () => { root.innerHTML = ""; if (closeCb) closeCb(); };
  buildBody(box, close);
  return close;
}

function addXp(n, opts = {}) {
  if (n <= 0) return;
  const before = levelFromXp(state.xp);
  state.xp += n;
  const k = todayKey();
  const d = state.days[k] || (state.days[k] = { sec: 0, xp: 0 });
  d.xp += n;
  const after = levelFromXp(state.xp);
  markDirty(); renderHeader();
  if (d.xp >= 100) checkBadges("xp");
  if (after > before && !opts.silent) {
    queueModal(done => showModal((box, close) => {
      box.append(el("h2", null, "Level up!"));
      const b = el("div", "lvlup-badge", String(after));
      box.append(b);
      box.append(el("p", "sub", "You're now level " + after + " — " + titleForLevel(after)));
      const btn = el("button", "btn btn-primary", "Keep going!");
      btn.style.display = "block"; btn.style.margin = "0 auto";
      btn.onclick = () => { close(); };
      box.append(btn);
    }, done));
    checkBadges("level");
  }
}

function markStudiedToday() {
  const t = todayKey();
  if (state.lastDay === t) return;
  state.streak = (state.lastDay === todayKey(-1)) ? state.streak + 1 : 1;
  state.lastDay = t;
  markDirty(); renderHeader();
  checkBadges("streak");
}

function hasBadge(id) { return state.badges.includes(id); }
function awardBadge(id) {
  if (hasBadge(id)) return;
  const def = BADGES.find(b => b.id === id);
  if (!def) return;
  state.badges.push(id);
  markDirty();
  queueModal(done => showModal((box, close) => {
    box.append(el("h2", null, "Badge earned!"));
    box.append(el("div", "badge-big", def.icon));
    const p = el("p", "sub"); p.innerHTML = "<b>" + def.name + "</b><br>" + def.desc;
    box.append(p);
    const btn = el("button", "btn btn-primary", "Nice!");
    btn.style.display = "block"; btn.style.margin = "0 auto";
    btn.onclick = close;
    box.append(btn);
  }, done));
}
function lessonsDone(ids) { return ids.every(id => state.lessons[id]); }
function unitDone(u) { return u.lessons.every(l => state.lessons[l.id]); }
function learnedCharCount() {
  const set = new Set();
  for (const u of UNITS) for (const l of u.lessons)
    if (state.lessons[l.id] && l.chars) l.chars.forEach(c => set.add(c));
  return set.size;
}
function checkBadges(trigger) {
  if (Object.keys(state.lessons).length >= 1) awardBadge("first");
  if (learnedCharCount() >= 10) awardBadge("kana10");
  if (unitDone(UNITS[0]) && unitDone(UNITS[1])) awardBadge("hira");
  if (unitDone(UNITS[2])) awardBadge("kata");
  if (unitDone(UNITS[3])) awardBadge("words");
  if (unitDone(UNITS[4])) awardBadge("grammar");
  const uById = id => UNITS.find(u => u.id === id);
  const u6 = uById("u6"), u7 = uById("u7"), u8 = uById("u8"), u9 = uById("u9");
  if (u6 && unitDone(u6)) awardBadge("kanji");
  if (u7 && unitDone(u7)) awardBadge("describe");
  if (u8 && unitDone(u8)) awardBadge("convo");
  if (u9 && unitDone(u9)) awardBadge("kanji2");
  if (UNITS.every(unitDone)) awardBadge("grad");
  if (Object.values(state.lessons).some(l => l.stars >= 3)) awardBadge("perfect");
  if (state.streak >= 3) awardBadge("streak3");
  if (state.streak >= 7) awardBadge("streak7");
  if (totalSec() >= 3600) awardBadge("hour1");
  if (totalSec() >= 18000) awardBadge("hour5");
  if (todayXp() >= 100) awardBadge("day100");
  if (state.counters.write >= 10) awardBadge("scribe");
  if (state.counters.speak >= 10) awardBadge("speaker");
  if (state.counters.tutor >= 1) awardBadge("curious");
  const lv = levelFromXp(state.xp);
  if (lv >= 5) awardBadge("lv5");
  if (lv >= 10) awardBadge("lv10");
}

/* ---------- header ---------- */
function renderHeader() {
  const wrap = $("#statchips");
  wrap.innerHTML = "";
  const mk = (cls, icon, text, label) => {
    const c = el("span", "chip " + cls);
    c.innerHTML = ICONS[icon];
    c.append(" " + text);
    c.title = label;
    wrap.append(c);
  };
  mk("streak", "flame", String(state.streak), "Day streak");
  mk("xp", "gem", String(state.xp), "Total XP");
  mk("time", "clock", fmtMin(todaySec()), "Active study time today");
  const lv = el("span", "chip lvl", "Lv " + levelFromXp(state.xp));
  lv.title = titleForLevel(levelFromXp(state.xp));
  wrap.append(lv);
}

/* ---------- tabs & views ---------- */
let currentView = "learn";
let prevView = "learn";
const TABS = [
  { id: "learn", label: "Learn", icon: "book" },
  { id: "practice", label: "Practice", icon: "pencil" },
  { id: "sensei", label: "Sensei", icon: "chat" },
  { id: "me", label: "Me", icon: "person" },
];
function renderTabs() {
  const bar = $("#tabbar");
  bar.innerHTML = "";
  for (const t of TABS) {
    const b = el("button", "tab");
    b.setAttribute("aria-current", String(t.id === currentView));
    b.innerHTML = ICONS[t.icon];
    b.append(el("span", null, t.label));
    b.onclick = () => { currentView = t.id; renderTabs(); renderView(); };
    bar.append(b);
  }
}
function renderView() {
  for (const t of TABS) $("#view-" + t.id).hidden = t.id !== currentView;
  const sv = $("#view-settings");
  if (sv) sv.hidden = currentView !== "settings";
  if (currentView === "learn") renderLearn();
  if (currentView === "practice") renderPractice();
  if (currentView === "sensei") renderSensei();
  if (currentView === "me") renderMe();
  if (currentView === "settings") renderSettings();
}

/* ---------- Learn view ---------- */
function nextLesson() {
  for (const u of UNITS) for (const l of u.lessons) if (!state.lessons[l.id]) return l;
  return null;
}
function lessonUnlocked(lesson) {
  let prev = null;
  for (const u of UNITS) for (const l of u.lessons) {
    if (l.id === lesson.id) return !prev || !!state.lessons[prev.id];
    prev = l;
  }
  return false;
}
function nodeSymbol(l) {
  if (l.kind === "review") return "★";
  if (l.kind === "phrases") return "話";
  if (l.kind === "grammar") return "文";
  if (l.combos) return "小";
  return l.chars && l.chars.length ? l.chars[0] : "あ";
}
function renderLearn() {
  const v = $("#view-learn");
  v.innerHTML = "";
  const hero = el("div", "hero-card");
  const started = Object.keys(state.lessons).length > 0;
  hero.append(el("h1", null, started ? "おかえりなさい — welcome back!" : "ようこそ — welcome!"));
  const gm = Math.floor(todaySec() / 60);
  hero.append(el("p", null, started
    ? `Daily goal: ${gm}/${goalMin()} min · ${todayXp()} XP today. Small steps, every day — that's the whole secret.`
    : "Zero Japanese needed. Tap the first lesson and you'll read your first word in about 3 minutes."));
  const next = nextLesson();
  if (next) {
    const btn = el("button", "btn btn-primary", (started ? "Continue: " : "Start: ") + next.title);
    btn.onclick = () => startLesson(next);
    hero.append(btn);
  } else {
    hero.append(el("p", null, "You finished every lesson! Keep your streak alive in Practice."));
  }
  v.append(hero);

  for (const u of UNITS) {
    const card = el("div", "unit");
    const head = el("div", "unit-head");
    head.append(el("h2", null, u.title));
    head.append(el("span", "jp-tag jp", u.jp));
    const done = u.lessons.filter(l => state.lessons[l.id]).length;
    head.append(el("span", "unit-prog", done + "/" + u.lessons.length));
    card.append(head);
    card.append(el("p", "blurb", u.blurb));
    const nodes = el("div", "nodes");
    for (const l of u.lessons) {
      const nw = el("div", "node");
      const b = el("button", "node-btn jp");
      const rec = state.lessons[l.id];
      const unlocked = lessonUnlocked(l);
      b.textContent = unlocked ? nodeSymbol(l) : "🔒";
      if (rec) b.classList.add("done");
      else if (unlocked) b.classList.add("avail");
      else { b.classList.add("locked"); b.disabled = true; }
      b.setAttribute("aria-label", l.title + (rec ? " (completed)" : unlocked ? "" : " (locked)"));
      b.onclick = () => startLesson(l);
      nw.append(b);
      nw.append(el("div", "stars", rec ? "★".repeat(rec.stars) : ""));
      nw.append(el("label", null, l.title));
      nodes.append(nw);
    }
    card.append(nodes);
    v.append(card);
  }
}

/* ---------- romaji / kana utils ---------- */
function kataToHira(s) {
  return s.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}
function normJa(s) {
  return kataToHira(String(s)).replace(/[\s。、．，.!?！？・「」ー〜~]/g, "").toLowerCase();
}
function normRomaji(s) {
  return String(s).toLowerCase().replace(/[\s\-'.]/g, "")
    .replace(/ō/g, "ou").replace(/ū/g, "uu").replace(/ā/g, "aa").replace(/ē/g, "ee").replace(/ī/g, "ii");
}
function levDist(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++)
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

/* chars learned so far (for distractors) — kana only by default */
function learnedKanaEntries(set) {
  const out = [];
  for (const u of UNITS) for (const l of u.lessons) {
    if (!l.chars) continue;
    if (state.lessons[l.id]) for (const c of l.chars) {
      const e = KANA[c];
      if (e && (set ? e.set === set : e.set !== "j")) out.push(e);
    }
  }
  return out;
}
function learnedKanjiEntries() { return learnedKanaEntries("j"); }

/* ---------- exercise generation ---------- */
function romajiDistractors(entry, pool, n) {
  const sameRow = pool.filter(e => e !== entry && e.r !== entry.r);
  const opts = new Set();
  for (const e of shuffle(sameRow)) { if (opts.size >= n) break; opts.add(e.r); }
  const fallback = ["a", "i", "u", "e", "o", "ka", "ki", "su", "to", "na", "mi", "ru", "ha"];
  for (const f of shuffle(fallback)) { if (opts.size >= n) break; if (f !== entry.r) opts.add(f); }
  return [...opts].slice(0, n);
}
function kanaDistractors(entry, pool, n) {
  const others = pool.filter(e => e !== entry && e.k !== entry.k && e.r !== entry.r);
  return sampleN(others, n).map(e => e.k);
}

function mcqKR(entry, pool) {
  const wrong = romajiDistractors(entry, pool, 3);
  const options = shuffle([entry.r, ...wrong]);
  return {
    type: "mcq", big: entry.k, prompt: "What sound is this?", options, answer: options.indexOf(entry.r),
    hint: entry.m ? "Memory hook: " + entry.m : "Say it out loud — trust your gut.",
    explain: `「${entry.k}」 is “${entry.r}”. ${entry.m || ""}`,
    improve: "Picture the memory hook every time you see it — after a few reps the sound pops up by itself.",
    entry,
  };
}
function mcqRK(entry, pool) {
  const wrong = kanaDistractors(entry, pool, 3);
  const options = shuffle([entry.k, ...wrong]);
  return {
    type: "mcq", prompt: `Which one is “${entry.r}”?`, options, answer: options.indexOf(entry.k), kanaOpts: true,
    hint: entry.m ? "Memory hook: " + entry.m : "Eliminate the ones you're sure about first.",
    explain: `“${entry.r}” is written 「${entry.k}」. ${entry.m || ""}`,
    improve: "Reading kana→sound is easier than sound→kana. Tracing the character once in the writing studio locks it in.",
    entry,
  };
}
function typeEx(entry) {
  return {
    type: "type", big: entry.k, prompt: "Type this sound in romaji", target: entry.k,
    answer: [entry.r, ...(entry.alt || []), entry.k, ...(entry.read ? [entry.read] : [])],
    hint: "It starts with “" + entry.r[0] + "”.",
    explain: `「${entry.k}」 is typed “${entry.r}”.` + (entry.alt ? ` (“${entry.alt.join("”/“")}” works too.)` : ""),
    improve: entry.m ? "Memory hook: " + entry.m : "Typing the sound builds recall faster than recognizing it.",
    entry,
  };
}
function matchEx(entries, promptText) {
  return {
    type: "match", prompt: promptText || "Match the pairs",
    pairs: entries.map(e => [e.k, e.r]),
    hint: "Start with the ones you know cold — the rest solve themselves.",
    explain: "Matching both directions builds the two-way link between shape and sound.",
  };
}
function listenEx(entry, pool) {
  const wrong = kanaDistractors(entry, pool, 3);
  const options = shuffle([entry.k, ...wrong]);
  return {
    type: "listen", prompt: "Tap what you hear", audioText: entry.read || entry.k, options, answer: options.indexOf(entry.k), kanaOpts: true,
    hint: "Replay it slowly with the turtle button.",
    explain: `You heard “${entry.r}” — written 「${entry.k}」.`,
    improve: "Train your ears early: replay every audio once even after you get it right.",
    entry,
    fallback: () => mcqKR(entry, pool),
  };
}
function wordReadEx(word) {
  const syls = word.r.match(/.{1,2}/g) || [word.r];
  const scrambled = syls.length > 1 ? shuffle(syls).join("") : word.r.split("").reverse().join("");
  const wrongs = new Set([scrambled !== word.r ? scrambled : word.r + "u"]);
  const otherWords = UNITS.flatMap(u => u.lessons).flatMap(l => l.words || []).filter(w => w.r !== word.r);
  for (const w of shuffle(otherWords)) { if (wrongs.size >= 3) break; if (w.r !== word.r) wrongs.add(w.r); }
  const options = shuffle([word.r, ...wrongs]);
  return {
    type: "mcq", big: word.w, bigWord: true, prompt: "Read this real word!", options, answer: options.indexOf(word.r),
    hint: "Sound it out one character at a time, left to right.",
    explain: `「${word.w}」 reads “${word.r}” — it means “${word.en}”. You just read real Japanese!`,
    improve: "Break every word into single kana first; speed comes on its own.",
  };
}
function listenWordEx(word, lessonWords) {
  const others = lessonWords.filter(w => w.w !== word.w).map(w => w.w);
  const options = shuffle([word.w, ...sampleN(others, Math.min(3, others.length))]);
  return {
    type: "listen", prompt: "Which word did you hear?", audioText: word.w, options, answer: options.indexOf(word.w), kanaOpts: true,
    hint: "It means “" + word.en + "”.",
    explain: `You heard 「${word.w}」 (${word.r}) — “${word.en}”.`,
    fallback: () => wordReadEx(word),
  };
}
function writeEx(entry) {
  return {
    type: "write", prompt: "Write it: trace " + entry.k, entry,
    hint: "Rule of thumb: strokes go top→bottom, left→right.",
    explain: `「${entry.k}」 (${entry.r}) has ${entry.s} stroke${entry.s > 1 ? "s" : ""}.`,
  };
}

function genKanaLesson(lesson) {
  const items = [];
  const entries = (lesson.combos ? COMBOS : lesson.chars.map(c => KANA[c])).filter(Boolean);
  const pool = entries.concat(learnedKanaEntries());
  (lesson.teachConcepts || []).forEach(tc => items.push({ type: "teach-concept", title: tc.title, body: tc.body }));
  const teachN = lesson.teachLimit != null ? lesson.teachLimit : entries.length;
  entries.slice(0, teachN).forEach(e => items.push({ type: "teach-kana", entry: e }));

  const practice = [];
  sampleN(entries, Math.min(5, entries.length)).forEach(e => practice.push(mcqKR(e, pool)));
  sampleN(entries, Math.min(2, entries.length)).forEach(e => practice.push(mcqRK(e, pool)));
  if (entries.length >= 3) practice.push(matchEx(sampleN(entries, Math.min(5, entries.length))));
  sampleN(entries, Math.min(2, entries.length)).forEach(e => practice.push(typeEx(e)));
  sampleN(entries, Math.min(2, entries.length)).forEach(e => practice.push(listenEx(e, pool)));
  if (!lesson.combos) {
    const w = pick(entries);
    if (w && w.s) practice.push(writeEx(w));
  }
  const words = lesson.words || [];
  sampleN(words, Math.min(3, words.length)).forEach(w => practice.push(wordReadEx(w)));
  return items.concat(shuffle(practice));
}

/* ----- kanji exercises ----- */
function allKanji() { return Object.values(KANA).filter(e => e.set === "j"); }
function kanjiMeaningOpts(e, pool, n) {
  const opts = [];
  for (const o of shuffle(pool.concat(allKanji()))) {
    if (opts.length >= n) break;
    if (o.en !== e.en && !opts.some(x => x.en === o.en)) opts.push(o);
  }
  return opts;
}
function mcqKanjiMeaning(e, pool) {
  const wrong = kanjiMeaningOpts(e, pool, 3);
  const entries = shuffle([e, ...wrong]);
  const options = entries.map(x => x.en);
  return {
    type: "mcq", big: e.k, prompt: "What does this kanji mean?", options, answer: entries.indexOf(e),
    hint: "Memory hook: " + e.m,
    explain: `「${e.k}」 means “${e.en}” — read ${e.read} (${e.r}). ${e.m}.`,
    improve: "Kanji are pictures with stories. Replay the memory hook in your head each time — the meaning will start arriving before the story does.",
    whyWrong: entries.map(x => x === e ? "" : `“${x.en}” is 「${x.k}」 (${x.r}).`),
  };
}
function mcqMeaningKanji(e, pool) {
  const wrong = kanjiMeaningOpts(e, pool, 3);
  const entries = shuffle([e, ...wrong]);
  const options = entries.map(x => x.k);
  return {
    type: "mcq", prompt: `Which kanji means “${e.en}”?`, options, answer: entries.indexOf(e), kanaOpts: true,
    hint: "Memory hook: " + e.m,
    explain: `“${e.en}” is 「${e.k}」, read ${e.read} (${e.r}). ${e.m}.`,
    improve: "Tracing a kanji once in the writing studio makes its shape much easier to pick out of a line-up.",
    whyWrong: entries.map(x => x === e ? "" : `「${x.k}」 means “${x.en}”.`),
  };
}
function mcqKanjiReading(e, pool) {
  const wrong = [];
  for (const o of shuffle(pool.concat(allKanji()))) {
    if (wrong.length >= 3) break;
    if (o.read !== e.read && o.r !== e.r && !wrong.some(x => x.read === o.read)) wrong.push(o);
  }
  const entries = shuffle([e, ...wrong]);
  const options = entries.map(x => x.read);
  return {
    type: "mcq", big: e.k, prompt: "How do you read this?", options, answer: entries.indexOf(e), kanaOpts: true,
    hint: `It means “${e.en}” — the reading starts with “${e.r[0]}”.`,
    explain: `「${e.k}」 (${e.en}) is read ${e.read} (${e.r}).`,
    improve: "Say the reading out loud when you answer — sound + shape + meaning together is the kanji triple-lock.",
    whyWrong: entries.map(x => x === e ? "" : `${x.read} (${x.r}) is the reading of 「${x.k}」, “${x.en}”.`),
  };
}
function typeKanjiReading(e) {
  return {
    type: "type", big: e.k, prompt: `Type the reading in romaji (it means “${e.en}”)`, target: e.k,
    answer: [e.r, e.read, e.k],
    hint: "It starts with “" + e.r[0] + "”.",
    explain: `「${e.k}」 (${e.en}) is read ${e.read} — typed “${e.r}”.`,
    improve: "Memory hook: " + e.m,
    entry: e,
  };
}
function matchKanjiMeaning(entries) {
  return {
    type: "match", prompt: "Match kanji to meaning",
    pairs: entries.map(e => [e.k, e.en]),
    hint: "Lock in the ones you're sure of first.",
    explain: "Meaning first, readings second — that's the natural order for learning kanji.",
  };
}
function listenKanji(e, pool) {
  const wrong = [];
  for (const o of shuffle(pool.concat(allKanji()))) {
    if (wrong.length >= 3) break;
    if (o.read !== e.read && o.r !== e.r && o.k !== e.k && !wrong.some(x => x.k === o.k)) wrong.push(o);
  }
  const entries = shuffle([e, ...wrong]);
  const options = entries.map(x => x.k);
  return {
    type: "listen", prompt: "Tap the kanji you hear", audioText: e.read, options, answer: entries.indexOf(e), kanaOpts: true,
    hint: `You're listening for the word that means “${e.en}”.`,
    explain: `You heard ${e.read} (${e.r}) — that's 「${e.k}」, “${e.en}”.`,
    fallback: () => mcqKanjiReading(e, pool),
  };
}
function genKanjiLesson(lesson) {
  const items = [];
  const entries = lesson.chars.map(c => KANA[c]).filter(Boolean);
  const pool = entries.concat(learnedKanjiEntries());
  (lesson.teachConcepts || []).forEach(tc => items.push({ type: "teach-concept", title: tc.title, body: tc.body }));
  entries.forEach(e => items.push({ type: "teach-kanji", entry: e }));
  const practice = [];
  sampleN(entries, Math.min(5, entries.length)).forEach(e => practice.push(mcqKanjiMeaning(e, pool)));
  sampleN(entries, 2).forEach(e => practice.push(mcqMeaningKanji(e, pool)));
  sampleN(entries, 2).forEach(e => practice.push(mcqKanjiReading(e, pool)));
  sampleN(entries, 2).forEach(e => practice.push(typeKanjiReading(e)));
  if (entries.length >= 4) practice.push(matchKanjiMeaning(sampleN(entries, Math.min(5, entries.length))));
  sampleN(entries, 2).forEach(e => practice.push(listenKanji(e, pool)));
  practice.push(writeEx(pick(entries)));
  const words = lesson.words || [];
  sampleN(words, Math.min(3, words.length)).forEach(w => practice.push(wordReadEx(w)));
  return items.concat(shuffle(practice));
}

function genReviewLesson(lesson) {
  const covered = [];
  const words = [];
  for (const u of UNITS) for (const l of u.lessons) {
    if (lesson.covers.includes(l.id)) {
      if (l.combos) covered.push(...COMBOS);
      else if (l.chars) covered.push(...l.chars.map(c => KANA[c]).filter(Boolean));
      if (l.words) words.push(...l.words);
    }
  }
  const pool = covered;
  const practice = [];
  sampleN(covered, 5).forEach(e => practice.push(mcqKR(e, pool)));
  sampleN(covered, 3).forEach(e => practice.push(mcqRK(e, pool)));
  practice.push(matchEx(sampleN(covered, 5)));
  sampleN(covered, 3).forEach(e => practice.push(typeEx(e)));
  sampleN(covered, 2).forEach(e => practice.push(listenEx(e, pool)));
  sampleN(words, Math.min(3, words.length)).forEach(w => practice.push(wordReadEx(w)));
  const writable = covered.filter(e => e.s);
  if (writable.length) practice.push(writeEx(pick(writable)));
  const kj = covered.filter(e => e.en);
  if (kj.length) {
    sampleN(kj, 3).forEach(e => practice.push(mcqKanjiMeaning(e, kj)));
    if (kj.length >= 4) practice.push(matchKanjiMeaning(sampleN(kj, 4)));
  }
  return shuffle(practice).map(x => Object.assign(x, { reviewXp: true }));
}

function genPhraseLesson(lesson) {
  const items = [];
  for (const p of lesson.phrases) items.push({ type: "teach-phrase", phrase: p });
  const ph = lesson.phrases;
  const practice = [];
  // phrase -> meaning
  sampleN(ph, Math.min(3, ph.length)).forEach(p => {
    const others = ph.filter(x => x !== p).map(x => x.en);
    const options = shuffle([p.en, ...sampleN(others, 3)]);
    practice.push({
      type: "mcq", big: p.w, bigWord: true, prompt: "What does this mean?", options, answer: options.indexOf(p.en),
      hint: "Romaji: " + p.r,
      explain: `「${p.w}」 (${p.r}) = “${p.en}”.` + (p.note ? " " + p.note : ""),
    });
  });
  // meaning -> phrase
  sampleN(ph, Math.min(3, ph.length)).forEach(p => {
    const others = ph.filter(x => x !== p).map(x => x.w);
    const options = shuffle([p.w, ...sampleN(others, 3)]);
    practice.push({
      type: "mcq", prompt: `How do you say “${p.en}”?`, options, answer: options.indexOf(p.w), kanaOpts: true,
      hint: "It starts with 「" + p.w[0] + "」 (" + p.r.split(" ")[0][0] + "…).",
      explain: `“${p.en}” = 「${p.w}」 (${p.r}).` + (p.note ? " " + p.note : ""),
    });
  });
  if (ph.length >= 4) {
    const sel = sampleN(ph, 4);
    practice.push({
      type: "match", prompt: "Match phrase to meaning",
      pairs: sel.map(p => [p.w, p.en]),
      hint: "Say each one out loud as you match it.",
      explain: "Pairing sound, writing and meaning together is how phrases stick.",
    });
  }
  sampleN(ph, Math.min(2, ph.length)).forEach(p => {
    const others = ph.filter(x => x !== p).map(x => x.en);
    const options = shuffle([p.en, ...sampleN(others, 3)]);
    practice.push({
      type: "listen", prompt: "What did they say?", audioText: p.w, options, answer: options.indexOf(p.en),
      hint: "Romaji: " + p.r,
      explain: `You heard 「${p.w}」 (${p.r}) — “${p.en}”.`,
      fallback: () => ({
        type: "mcq", big: p.w, bigWord: true, prompt: "What does this mean?", options, answer: options.indexOf(p.en),
        hint: "Romaji: " + p.r, explain: `「${p.w}」 (${p.r}) = “${p.en}”.`,
      }),
    });
  });
  sampleN(ph, Math.min(2, ph.length)).forEach(p => {
    practice.push({ type: "speak", phrase: p, prompt: "Your turn — say it!", hint: "Break it into syllables: " + p.r });
  });
  return items.concat(shuffle(practice));
}

function genGrammarLesson(lesson) {
  const items = [];
  (lesson.teach || []).forEach(t => items.push({ type: "teach-concept", title: t.title, body: t.body, jp: t.jp, jpr: t.jpr, jpen: t.jpen }));
  if (lesson.vocab && lesson.vocab.length) items.push({ type: "teach-vocab", vocab: lesson.vocab });
  return items.concat(lesson.ex.map(e => Object.assign({}, e)));
}

function buildQueue(lesson) {
  if (lesson.kind === "kana") return genKanaLesson(lesson);
  if (lesson.kind === "kanji") return genKanjiLesson(lesson);
  if (lesson.kind === "review") return genReviewLesson(lesson);
  if (lesson.kind === "phrases") return genPhraseLesson(lesson);
  if (lesson.kind === "grammar") return genGrammarLesson(lesson);
  return [];
}

/* ---------- lesson session ---------- */
let S = null; // current session
let renderer = null; // current exercise renderer

function startLesson(lesson, opts = {}) {
  const queue = opts.queue || buildQueue(lesson);
  S = {
    lesson, queue, i: opts.i || 0,
    xp: 0, firstTry: 0, firstTryRight: 0, combo: 0,
    usedHint: false, usedHelp: false,
    quick: !!opts.quick,
    t0: Date.now(),
  };
  $("#lesson").hidden = false;
  document.body.style.overflow = "hidden";
  renderLessonShell();
  showItem();
}
function closeLesson() {
  S = null; renderer = null;
  $("#lesson").hidden = true;
  $("#lesson").innerHTML = "";
  document.body.style.overflow = "";
  renderHeader(); renderView();
}
function renderLessonShell() {
  const box = $("#lesson");
  box.innerHTML = "";
  const top = el("div", "lesson-top");
  const close = el("button", "close", "×");
  close.setAttribute("aria-label", "Quit lesson");
  close.onclick = () => {
    showModal((m, closeModal) => {
      m.append(el("h2", null, "Leave the lesson?"));
      m.append(el("p", "sub", "Progress in this lesson won't be saved — your XP so far stays with you."));
      const row = el("div", "end-stats");
      const stay = el("button", "btn btn-primary", "Keep learning");
      stay.onclick = closeModal;
      const leave = el("button", "btn btn-ghost", "Leave");
      leave.onclick = () => { closeModal(); closeLesson(); };
      row.append(stay, leave); row.style.gap = "10px";
      m.append(row);
    });
  };
  const pbar = el("div", "pbar"); pbar.appendChild(el("div"));
  const combo = el("div", "combo", "");
  top.append(close, pbar, combo);
  const body = el("div", "lesson-body");
  const scroll = el("div", "lesson-scroll");
  body.append(scroll);
  const foot = el("div", "lesson-foot");
  foot.append(el("div", "foot-inner"));
  box.append(top, body, foot);
}
function setProgress() {
  const done = S.i, total = S.queue.length;
  $("#lesson .pbar > div").style.width = Math.round(100 * done / total) + "%";
  $("#lesson .combo").textContent = S.combo >= 2 ? S.combo + "🔥" : "";
}
function footButtons(list) {
  const f = $("#lesson .foot-inner");
  f.innerHTML = "";
  for (const b of list) {
    if (b === "spacer") { f.append(el("div", "spacer")); continue; }
    f.append(b);
  }
}
function showToast(text, ms = 4000) {
  const root = $("#toast-root");
  root.innerHTML = "";
  const t = el("div", "hint-toast", text);
  root.append(t);
  setTimeout(() => { if (t.parentNode) t.remove(); }, ms);
}

function showItem() {
  setProgress();
  if (S.i >= S.queue.length) { finishLesson(); return; }
  const item = S.queue[S.i];
  const scroll = $("#lesson .lesson-scroll");
  scroll.innerHTML = "";
  renderer = null;

  if (item.type.startsWith("teach")) {
    renderTeach(item, scroll);
    const cont = el("button", "btn btn-primary", "Continue");
    cont.onclick = () => { S.i++; showItem(); };
    footButtons(["spacer", cont]);
    return;
  }

  // resolve audio fallback
  let ex = item;
  if (ex.type === "listen" && !AudioMod.ready && ex.fallback) {
    ex = ex.fallback();
    ex.requeued = item.requeued;
    S.queue[S.i] = ex;
  }

  const r = EX_RENDERERS[ex.type];
  renderer = r(ex, scroll);

  const hintBtn = el("button", "btn btn-ghost btn-sm", "Hint");
  hintBtn.onclick = () => {
    S.usedHintNow = true;
    showToast("💡 " + (ex.hint || "Trust your first instinct!"));
  };
  const helpBtn = el("button", "btn btn-ghost btn-sm", "Help");
  helpBtn.onclick = () => openHelp(ex);
  const checkBtn = el("button", "btn btn-good", "Check");
  checkBtn.id = "check-btn";
  checkBtn.onclick = () => runCheck(ex);
  if (renderer.noCheck) checkBtn.style.display = "none";
  footButtons([hintBtn, helpBtn, "spacer", checkBtn]);
  S.usedHintNow = false; S.usedHelpNow = false;
  updateCheckState();
}
function updateCheckState() {
  const b = $("#check-btn");
  if (b && renderer && renderer.canCheck) b.disabled = !renderer.canCheck();
}

function xpForItem(ex, firstTry) {
  let base = ex.reviewXp ? 12 : (S.quick ? 6 : 10);
  if (ex.type === "speak" || ex.type === "write") base = 8;
  if (S.usedHelpNow) base = Math.max(2, Math.round(base * 0.4));
  else if (S.usedHintNow) base = Math.max(3, Math.round(base * 0.7));
  if (!firstTry) base = Math.max(2, Math.round(base * 0.5));
  if (S.combo >= 6) base += 4; else if (S.combo >= 3) base += 2;
  return base;
}

function runCheck(ex) {
  if (!renderer || !renderer.check) return;
  const res = renderer.check(); // {correct, detail?}
  if (!res) return;
  const firstTry = !ex.requeued;
  if (firstTry && ["mcq", "build", "type", "listen"].includes(ex.type)) {
    S.firstTry++;
    if (res.correct) S.firstTryRight++;
  }
  if (res.correct) {
    S.combo++;
    const gained = xpForItem(ex, firstTry);
    S.xp += gained;
    addXp(gained, { silent: false });
    markStudiedToday();
    showFeedback(true, ex, res, gained);
  } else {
    S.combo = 0;
    // re-queue a fresh copy once
    if (!ex.requeued && ["mcq", "build", "type", "listen"].includes(ex.type)) {
      const clone = Object.assign({}, ex, { requeued: true });
      S.queue.push(clone);
    }
    showFeedback(false, ex, res, 0);
  }
  renderer.lock && renderer.lock();
  setProgress();
}
function finishExerciseSoft(ex, correct, gained, detail) {
  // for match / speak / write that complete on their own
  if (!S) return;
  if (correct) { S.combo++; addXp(gained, { silent: false }); S.xp += gained; markStudiedToday(); }
  showFeedback(correct, ex, { detail }, gained);
}

function showFeedback(ok, ex, res, gained) {
  if (!S) return;
  const scroll = $("#lesson .lesson-scroll");
  if (!scroll) return;
  const fb = el("div", "feedback " + (ok ? "ok" : "no") + " show");
  const praise = ["すごい! (Amazing!)", "Correct!", "やった! (You did it!)", "Nice!", "Perfect!", "いいね! (Looking good!)"];
  fb.append(el("h3", null, ok ? pick(praise) + (gained ? "  +" + gained + " XP" : "") : "Not quite"));
  if (!ok) {
    const corr = correctAnswerText(ex);
    if (corr) { const p = el("p"); p.innerHTML = "<b>Answer:</b> " + corr; fb.append(p); }
    if (res && res.whyWrong) fb.append(el("p", null, res.whyWrong));
  }
  if (ex.explain) fb.append(el("p", null, ex.explain));
  if (!ok && ex.improve) fb.append(el("p", "improve", "📈 How to improve: " + ex.improve));
  if (res && res.detail) fb.append(el("p", "improve", res.detail));
  if (!ok && sampleFn) {
    const aiBtn = el("button", "btn btn-ghost btn-sm", "Ask AI to explain more");
    const out = el("div", "ai-out");
    aiBtn.onclick = async () => {
      aiBtn.disabled = true;
      out.textContent = "Sensei is thinking…";
      try {
        const prompt = `You are a friendly Japanese tutor for a complete beginner. In under 80 words, explain this quiz mistake kindly and give one concrete memory tip. Show Japanese with romaji in parentheses. Plain text only.\n\nQuestion: ${ex.prompt}${ex.big ? " [" + ex.big + "]" : ""}\nCorrect answer: ${correctAnswerText(ex) || ""}\nLearner's answer: ${res && res.chosen != null ? res.chosen : "(wrong attempt)"}`;
        const { text } = await sampleFn(prompt, { modelTier: "quick", onText: ({ text }) => { out.textContent = text; } });
        out.textContent = text;
      } catch (e) {
        out.textContent = e && e.code === "not_granted" ? "AI explanations aren't enabled here — the tip above still has you covered!" : "Couldn't reach the AI just now — try again in a moment.";
      }
    };
    fb.append(aiBtn, out);
  }
  scroll.append(fb);
  fb.scrollIntoView({ block: "nearest", behavior: "smooth" });
  const cont = el("button", "btn " + (ok ? "btn-good" : "btn-primary"), "Continue");
  cont.onclick = () => { S.i++; showItem(); };
  footButtons(["spacer", cont]);
  cont.focus();
}
function correctAnswerText(ex) {
  if (ex.type === "mcq" || ex.type === "listen") return ex.options[ex.answer];
  if (ex.type === "build") return ex.answer.join(" ");
  if (ex.type === "type") return ex.answer[0];
  return "";
}

function finishLesson() {
  const acc = S.firstTry ? S.firstTryRight / S.firstTry : 1;
  const mins = Math.max(1, Math.round((Date.now() - S.t0) / 60000));
  const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
  const isReal = !S.quick;
  let firstClear = false;
  if (isReal) {
    const rec = state.lessons[S.lesson.id];
    firstClear = !rec;
    if (!rec || stars > rec.stars) state.lessons[S.lesson.id] = { stars, best: Math.round(acc * 100) };
    if (firstClear) { state.xp += 20; const d = state.days[todayKey()] || (state.days[todayKey()] = { sec: 0, xp: 0 }); d.xp += 20; S.xp += 20; }
    markDirty();
  }
  const sxp = S.xp, squick = S.quick, slesson = S.lesson;
  closeLesson();
  queueModal(done => showModal((box, close) => {
    box.append(el("h2", null, squick ? "Review complete!" : "Lesson complete!"));
    if (isReal) box.append(el("div", "end-stars", "★".repeat(stars) + "☆".repeat(3 - stars)));
    const stats = el("div", "end-stats");
    const mk = (v, l) => { const s = el("div", "end-stat"); s.append(el("b", null, String(v)), el("span", null, l)); stats.append(s); };
    mk("+" + sxp, "XP"); mk(Math.round(acc * 100) + "%", "accuracy"); mk(mins + "m", "time");
    box.append(stats);
    if (firstClear) box.append(el("p", "sub", "+20 XP first-clear bonus included. " + slesson.title + " ✓"));
    const btn = el("button", "btn btn-primary", "Continue");
    btn.style.display = "block"; btn.style.margin = "0 auto";
    btn.onclick = close;
    box.append(btn);
  }, () => { done(); checkBadges("lesson"); }));
}

/* ---------- teach renderers ---------- */
function audioButton(text, label, slow) {
  const b = el("button", "audio-btn");
  b.innerHTML = ICONS[slow ? "turtle" : "speaker"];
  b.append(" " + (label || (slow ? "Slow" : "Listen")));
  b.onclick = () => AudioMod.speak(text, slow ? 0.7 : 1);
  if (!AudioMod.ready) b.style.display = "none";
  return b;
}
function renderTeach(item, scroll) {
  if (item.type === "teach-kana") {
    const e = item.entry;
    const c = el("div", "teach-card");
    c.append(el("div", "big jp", e.k));
    c.append(el("div", "romaji", e.r));
    if (e.m) c.append(el("p", "mnemonic", e.m));
    if (e.s) c.append(el("div", "strokes", e.s + " stroke" + (e.s > 1 ? "s" : "")));
    const row = el("div", "audio-row");
    row.append(audioButton(e.k));
    c.append(row);
    scroll.append(c);
  } else if (item.type === "teach-kanji") {
    const e = item.entry;
    const c = el("div", "teach-card");
    c.append(el("div", "big jp", e.k));
    c.append(el("div", "romaji", e.en));
    c.append(el("p", "reading jp", "reading: " + e.read + " (" + e.r + ")"));
    if (e.m) c.append(el("p", "mnemonic", e.m));
    if (e.s) c.append(el("div", "strokes", e.s + " stroke" + (e.s > 1 ? "s" : "")));
    const row = el("div", "audio-row");
    row.append(audioButton(e.read));
    c.append(row);
    scroll.append(c);
  } else if (item.type === "teach-concept") {
    const c = el("div", "teach-card concept");
    c.append(el("h3", null, item.title));
    c.append(el("p", null, item.body));
    if (item.jp) {
      c.append(el("div", "jp-line jp", item.jp));
      c.append(el("div", "jp-sub", item.jpr + " — " + item.jpen));
      const row = el("div", "audio-row");
      row.append(audioButton(item.jp));
      c.append(row);
    }
    scroll.append(c);
  } else if (item.type === "teach-phrase") {
    const p = item.phrase;
    const c = el("div", "teach-card");
    c.append(el("div", "big jp", p.w));
    c.firstChild.style.fontSize = p.w.length > 7 ? "2.2rem" : "3rem";
    c.append(el("div", "romaji", p.r));
    c.append(el("p", "mnemonic", "“" + p.en + "”"));
    if (p.note) c.append(el("p", "mnemonic", p.note));
    const row = el("div", "audio-row");
    row.append(audioButton(p.w), audioButton(p.w, "Slow", true));
    c.append(row);
    scroll.append(c);
  } else if (item.type === "teach-vocab") {
    const c = el("div", "teach-card concept");
    c.append(el("h3", null, "New words for this lesson"));
    const ul = el("ul", "vocab-list");
    for (const [jp, r, en] of item.vocab) {
      const li = el("li");
      li.append(el("span", "jp", jp), el("span", "r", r), el("span", "en", en));
      li.onclick = () => AudioMod.speak(jp);
      ul.append(li);
    }
    c.append(ul);
    if (AudioMod.ready) c.append(el("p", "mnemonic", "Tap a word to hear it."));
    scroll.append(c);
  }
}

/* ---------- exercise renderers ---------- */
const EX_RENDERERS = {
  mcq(ex, scroll) {
    scroll.append(el("h2", "ex-prompt", ex.prompt));
    if (ex.big) scroll.append(el("div", "ex-big jp" + (ex.bigWord ? " word" : ""), ex.big));
    const grid = el("div", "opts" + (ex.options.some(o => o.length > 14) ? " stack" : ""));
    let sel = -1;
    const btns = ex.options.map((o, idx) => {
      const b = el("button", "opt" + (ex.kanaOpts ? " kana jp" : ""), o);
      b.onclick = () => {
        sel = idx;
        btns.forEach((x, i) => x.classList.toggle("sel", i === idx));
        updateCheckState();
      };
      grid.append(b);
      return b;
    });
    scroll.append(grid);
    return {
      canCheck: () => sel >= 0,
      check: () => {
        const ok = sel === ex.answer;
        btns[ex.answer].classList.add("right");
        if (!ok) btns[sel].classList.add("wrong");
        const why = !ok && ex.whyWrong && ex.whyWrong[sel] ? ex.whyWrong[sel] : null;
        return { correct: ok, chosen: ex.options[sel], whyWrong: why };
      },
      lock: () => btns.forEach(b => b.disabled = true),
      eliminate: () => {
        const wrongIdxs = btns.map((b, i) => i).filter(i => i !== ex.answer && !btns[i].classList.contains("dim") && !btns[i].disabled);
        if (!wrongIdxs.length) return false;
        const i = pick(wrongIdxs);
        btns[i].classList.add("dim");
        btns[i].disabled = true;
        return ex.whyWrong && ex.whyWrong[i] ? ex.whyWrong[i] : `“${ex.options[i]}” isn't it — cross it off.`;
      },
    };
  },

  listen(ex, scroll) {
    scroll.append(el("h2", "ex-prompt", ex.prompt));
    const row = el("div", "audio-row");
    const play = el("button", "audio-btn");
    play.innerHTML = ICONS.speaker; play.append(" Play");
    play.onclick = () => AudioMod.speak(ex.audioText);
    const slow = el("button", "audio-btn");
    slow.innerHTML = ICONS.turtle; slow.append(" Slow");
    slow.onclick = () => AudioMod.speak(ex.audioText, 0.65);
    row.append(play, slow);
    scroll.append(row);
    const sub = EX_RENDERERS.mcq(Object.assign({}, ex, { big: null }), scroll);
    return sub;
  },

  build(ex, scroll) {
    scroll.append(el("h2", "ex-prompt", ex.prompt));
    scroll.append(el("p", "ex-sub", "Tap the tiles in order. Tap a placed tile to send it back."));
    const ansRow = el("div", "answer-row");
    const bank = el("div", "bank");
    const placed = []; // {text, bankBtn}
    const bankBtns = shuffle(ex.tiles.map((t, i) => ({ t, i }))).map(({ t }) => {
      const b = el("button", "tile", t);
      b.onclick = () => {
        if (b.classList.contains("used")) return;
        b.classList.add("used");
        const a = el("button", "tile in-answer", t);
        a.onclick = () => { a.remove(); b.classList.remove("used"); placed.splice(placed.findIndex(p => p.el === a), 1); updateCheckState(); };
        ansRow.append(a);
        placed.push({ text: t, el: a, bankBtn: b });
        updateCheckState();
      };
      bank.append(b);
      return b;
    });
    scroll.append(ansRow, bank);
    return {
      canCheck: () => placed.length > 0,
      check: () => {
        const got = placed.map(p => p.text);
        const ok = got.length === ex.answer.length && got.every((t, i) => t === ex.answer[i]);
        ansRow.style.borderColor = ok ? "var(--good)" : "var(--bad)";
        return { correct: ok, chosen: got.join(" ") };
      },
      lock: () => { bankBtns.forEach(b => b.disabled = true); placed.forEach(p => p.el.disabled = true); },
      reveal: () => {
        // place the next correct tile
        const idx = placed.length;
        if (idx >= ex.answer.length) return false;
        const want = ex.answer[idx];
        const b = bankBtns.find(x => !x.classList.contains("used") && x.textContent === want);
        if (!b) return false;
        b.click();
        return "Next piece: 「" + want + "」 — placed it for you.";
      },
    };
  },

  type(ex, scroll) {
    scroll.append(el("h2", "ex-prompt", ex.prompt));
    if (ex.big) scroll.append(el("div", "ex-big jp", ex.big));
    const input = el("input", "type-input");
    input.type = "text"; input.autocapitalize = "off"; input.autocomplete = "off"; input.spellcheck = false;
    input.placeholder = "type here…";
    input.id = "type-answer";
    input.addEventListener("input", updateCheckState);
    input.addEventListener("keydown", e => { if (e.key === "Enter" && input.value.trim()) runCheck(ex); });
    scroll.append(input);
    setTimeout(() => input.focus(), 50);
    return {
      canCheck: () => input.value.trim().length > 0,
      check: () => {
        const got = normRomaji(input.value);
        const ok = ex.answer.some(a => normRomaji(a) === got || normJa(a) === normJa(input.value));
        input.style.borderColor = ok ? "var(--good)" : "var(--bad)";
        return { correct: ok, chosen: input.value.trim() };
      },
      lock: () => { input.disabled = true; },
      reveal: () => {
        const target = ex.answer[0];
        const cur = input.value.trim();
        const next = target.slice(0, Math.min(cur.length + 1, target.length - (target.length > 2 ? 1 : 0)) || 1);
        input.value = next;
        updateCheckState();
        return "It starts: “" + next + "…” — you finish it.";
      },
    };
  },

  match(ex, scroll) {
    scroll.append(el("h2", "ex-prompt", ex.prompt));
    scroll.append(el("p", "ex-sub", "Tap one from each side to pair them up."));
    const grid = el("div", "match-grid");
    const left = el("div", "match-col"), right = el("div", "match-col");
    grid.append(left, right);
    let mistakes = 0, matched = 0, selL = null, selR = null;
    const total = ex.pairs.length;
    const mkBtn = (text, side, pairIdx, isKana) => {
      const b = el("button", "opt" + (isKana ? " kana jp" : ""), text);
      b.dataset.pair = pairIdx;
      b.onclick = () => {
        if (b.disabled) return;
        if (side === "L") { if (selL) selL.classList.remove("sel"); selL = b; }
        else { if (selR) selR.classList.remove("sel"); selR = b; }
        b.classList.add("sel");
        if (selL && selR) {
          const okPair = selL.dataset.pair === selR.dataset.pair;
          const a = selL, c = selR;
          selL = selR = null;
          if (okPair) {
            [a, c].forEach(x => { x.classList.remove("sel"); x.classList.add("right"); x.disabled = true; });
            matched++;
            if (matched === total) {
              const full = mistakes === 0;
              const base = ex.reviewXp ? 12 : (S.quick ? 6 : 10);
              const gained = full ? base : Math.max(3, Math.round(base / 2));
              setTimeout(() => finishExerciseSoft(ex, true, gained, full ? "Flawless match!" : mistakes + " slip" + (mistakes > 1 ? "s" : "") + " — the pairs you missed are worth a second look."), 250);
            }
          } else {
            mistakes++;
            [a, c].forEach(x => { x.classList.remove("sel"); x.classList.add("wrong"); });
            setTimeout(() => [a, c].forEach(x => x.classList.remove("wrong")), 400);
          }
        }
      };
      return b;
    };
    const kanaSide = ex.pairs.every(p => /[぀-ヿ]/.test(p[0]));
    shuffle(ex.pairs.map((p, i) => ({ t: p[0], i }))).forEach(({ t, i }) => left.append(mkBtn(t, "L", i, kanaSide)));
    shuffle(ex.pairs.map((p, i) => ({ t: p[1], i }))).forEach(({ t, i }) => right.append(mkBtn(t, "R", i, false)));
    scroll.append(grid);
    return {
      noCheck: true,
      canCheck: () => false,
      check: () => null,
      reveal: () => {
        const un = ex.pairs.map((p, i) => i).filter(i => {
          return [...left.children].some(b => b.dataset.pair == i && !b.disabled);
        });
        if (!un.length) return false;
        const i = un[0];
        return "「" + ex.pairs[i][0] + "」 goes with “" + ex.pairs[i][1] + "”.";
      },
    };
  },

  speak(ex, scroll) {
    const p = ex.phrase;
    const card = el("div", "speak-card");
    card.append(el("h2", "ex-prompt", ex.prompt));
    card.append(el("div", "ex-big jp word", p.w));
    card.append(el("p", "ex-sub", p.r + " — “" + p.en + "”"));
    const row = el("div", "audio-row");
    row.append(audioButton(p.w), audioButton(p.w, "Slow", true));
    card.append(row);
    const heard = el("div", "speak-heard", "");
    let attempted = false, finished = false;
    const complete = (msg, quality) => {
      if (finished) return; finished = true;
      state.counters.speak++; markDirty(); checkBadges("speak");
      finishExerciseSoft(ex, true, quality === "great" ? 8 : 6, msg);
    };
    if (dict && !dictJaFailed) {
      const mic = el("button", "mic-btn");
      mic.innerHTML = ICONS.mic;
      mic.setAttribute("aria-label", "Record yourself");
      let listening = false, collected = "";
      const offP = dict.onPartial(e => { heard.textContent = e.text || collected; });
      const offF = dict.onFinal(e => { collected += e.text; heard.textContent = collected; });
      const offS = dict.onState(e => {
        listening = e.state === "listening" || e.state === "starting";
        mic.classList.toggle("listening", listening);
        if (e.state === "idle" && attempted) {
          offP(); offF(); offS();
          const got = normJa(collected);
          const want = normJa(p.w);
          const close = got && (got.includes(want) || want.includes(got) || levDist(got, want) <= Math.ceil(want.length * 0.5));
          if (close) complete("I heard 「" + collected.trim() + "」 — sounded great! 🎉", "great");
          else if (got) complete("I heard 「" + collected.trim() + "」. Close — listen once more and copy the rhythm.", "ok");
          else complete("Didn't catch that — but speaking out loud is what counts. Try the slow playback and repeat once more.", "ok");
        }
      });
      mic.onclick = () => {
        if (listening) { dict.stop().catch(() => { }); return; }
        attempted = true; collected = "";
        heard.textContent = "";
        dict.start({ language: "ja" }).catch(err => {
          offP(); offF(); offS();
          if (err && (err.code === "unavailable")) dictJaFailed = true;
          if (!finished) {
            heard.textContent = "Mic not available — use the honor system below!";
            addSelfCheck();
          }
        });
      };
      card.append(mic);
      card.append(el("p", "ex-sub", "Tap the mic, say it, tap again to stop."));
      const skip = el("button", "btn btn-ghost btn-sm", "No mic? I said it out loud!");
      skip.onclick = () => { try { dict.stop().catch(() => { }); } catch (e) { } offP(); offF(); offS(); complete("Speaking out loud is what counts — nicely done!", "ok"); };
      card.append(skip);
    } else {
      addSelfCheck();
    }
    function addSelfCheck() {
      const r2 = el("div", "audio-row");
      const didBtn = el("button", "btn btn-good", "I said it out loud!");
      didBtn.onclick = () => complete("Speaking out loud — even to your wall — is how pronunciation sticks. +XP earned honestly!", "great");
      r2.append(didBtn);
      card.append(r2);
    }
    card.append(heard);
    scroll.append(card);
    return { noCheck: true, canCheck: () => false, check: () => null };
  },

  write(ex, scroll) {
    const e = ex.entry;
    scroll.append(el("h2", "ex-prompt", ex.prompt));
    scroll.append(el("p", "ex-sub", `Trace over the gray character. ${e.s} stroke${e.s > 1 ? "s" : ""} — top to bottom, left to right.`));
    const widget = makeWriteWidget(e, (score) => {
      state.counters.write++; markDirty(); checkBadges("write");
      finishExerciseSoft(ex, true, score.pass ? 8 : 4, score.msg);
    });
    scroll.append(widget.root);
    return {
      noCheck: true, canCheck: () => false, check: () => null,
      reveal: () => { widget.peek(); return "Darkened the guide — trace right over it, stroke by stroke."; },
    };
  },
};

/* ---------- writing canvas widget ---------- */
function makeWriteWidget(entry, onDone) {
  const SIZE = 300;
  const root = el("div", "write-wrap");
  const box = el("div", "write-canvas-box");
  const glyph = document.createElement("canvas");
  const draw = document.createElement("canvas");
  glyph.width = glyph.height = draw.width = draw.height = SIZE;
  box.append(glyph, draw);
  root.append(box);
  const meta = el("div", "write-meta", "Strokes: 0 / " + (entry.s || "?"));
  root.append(meta);
  const tools = el("div", "write-tools");
  root.append(tools);

  const gctx = glyph.getContext("2d");
  const dctx = draw.getContext("2d");
  let peeking = false;
  function drawGlyph() {
    gctx.clearRect(0, 0, SIZE, SIZE);
    gctx.save();
    gctx.fillStyle = peeking ? "rgba(128,128,160,0.55)" : "rgba(128,128,160,0.28)";
    gctx.font = "500 " + Math.floor(SIZE * 0.72) + 'px "Noto Sans JP", sans-serif';
    gctx.textAlign = "center"; gctx.textBaseline = "middle";
    gctx.fillText(entry.k, SIZE / 2, SIZE / 2 + SIZE * 0.03);
    gctx.restore();
  }
  try { document.fonts.load('500 80px "Noto Sans JP"').then(drawGlyph).catch(drawGlyph); } catch (e) { drawGlyph(); }
  drawGlyph();

  const strokes = [];
  let cur = null;
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#4556c9";
  function pos(ev) {
    const r = draw.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * SIZE / r.width, y: (ev.clientY - r.top) * SIZE / r.height };
  }
  draw.addEventListener("pointerdown", ev => {
    ev.preventDefault();
    draw.setPointerCapture(ev.pointerId);
    cur = [pos(ev)];
    strokes.push(cur);
    meta.textContent = "Strokes: " + strokes.length + " / " + (entry.s || "?");
  });
  draw.addEventListener("pointermove", ev => {
    if (!cur) return;
    cur.push(pos(ev));
    render();
  });
  const up = () => { cur = null; };
  draw.addEventListener("pointerup", up);
  draw.addEventListener("pointercancel", up);
  function render() {
    dctx.clearRect(0, 0, SIZE, SIZE);
    dctx.lineWidth = 10; dctx.lineCap = "round"; dctx.lineJoin = "round";
    dctx.strokeStyle = accent;
    for (const s of strokes) {
      dctx.beginPath();
      s.forEach((p, i) => i ? dctx.lineTo(p.x, p.y) : dctx.moveTo(p.x, p.y));
      dctx.stroke();
    }
  }

  function score() {
    // build glyph mask
    const mask = document.createElement("canvas");
    mask.width = mask.height = SIZE;
    const mctx = mask.getContext("2d", { willReadFrequently: true });
    mctx.fillStyle = "#000";
    mctx.font = "500 " + Math.floor(SIZE * 0.72) + 'px "Noto Sans JP", sans-serif';
    mctx.textAlign = "center"; mctx.textBaseline = "middle";
    mctx.fillText(entry.k, SIZE / 2, SIZE / 2 + SIZE * 0.03);
    const img = mctx.getImageData(0, 0, SIZE, SIZE).data;
    const inGlyph = (x, y) => {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return false;
      return img[(y * SIZE + x) * 4 + 3] > 50;
    };
    const pts = strokes.flat();
    if (pts.length < 5) return null;
    // accuracy: user points near glyph
    let hit = 0;
    const R = 16;
    for (const p of pts) {
      let ok = false;
      for (let dx = -R; dx <= R && !ok; dx += 8)
        for (let dy = -R; dy <= R && !ok; dy += 8)
          if (inGlyph(p.x + dx, p.y + dy)) ok = true;
      if (ok) hit++;
    }
    const acc = hit / pts.length;
    // coverage: glyph samples near user ink
    let gTotal = 0, gHit = 0;
    for (let y = 0; y < SIZE; y += 10) for (let x = 0; x < SIZE; x += 10) {
      if (!inGlyph(x, y)) continue;
      gTotal++;
      for (const p of pts) {
        if (Math.abs(p.x - x) < 18 && Math.abs(p.y - y) < 18) { gHit++; break; }
      }
    }
    const cov = gTotal ? gHit / gTotal : 0;
    return { acc, cov };
  }

  const clearBtn = el("button", "btn btn-ghost btn-sm", "Clear");
  clearBtn.onclick = () => { strokes.length = 0; cur = null; render(); meta.textContent = "Strokes: 0 / " + (entry.s || "?"); };
  const peekBtn = el("button", "btn btn-ghost btn-sm", "Peek");
  peekBtn.onclick = () => { peeking = !peeking; drawGlyph(); peekBtn.textContent = peeking ? "Fade" : "Peek"; };
  const doneBtn = el("button", "btn btn-good btn-sm", "Check my writing");
  doneBtn.onclick = () => {
    const sc = score();
    if (!sc) { showToast("Draw the character first — trace right over the gray guide."); return; }
    const sOk = !entry.s || Math.abs(strokes.length - entry.s) <= 1;
    const pass = sc.acc >= 0.55 && sc.cov >= 0.45;
    let msg;
    if (pass && sOk) msg = `Beautiful! ${Math.round(sc.acc * 100)}% on-target, ${strokes.length} strokes${entry.s ? " (expected " + entry.s + ")" : ""}.`;
    else if (pass) msg = `Good shape (${Math.round(sc.acc * 100)}% on-target) — but 「${entry.k}」 wants ${entry.s} strokes, you used ${strokes.length}. Stroke count matters in Japanese!`;
    else msg = `Keep at it — ${Math.round(sc.acc * 100)}% of your ink landed on the character. Slow down and follow the gray shape closely.`;
    doneBtn.disabled = true; clearBtn.disabled = true;
    onDone({ pass: pass && sOk, msg });
  };
  tools.append(clearBtn, peekBtn, doneBtn);

  return { root, peek: () => { peeking = true; drawGlyph(); peekBtn.textContent = "Fade"; } };
}

/* ---------- hint & help ---------- */
function openHelp(ex) {
  S.usedHelpNow = true;
  const steps = helpStepsFor(ex);
  let revealed = 0;
  showModal((box, close) => {
    box.append(el("h2", null, "Let's solve it together"));
    const list = el("ul", "help-steps");
    box.append(list);
    const next = el("button", "btn btn-primary", "Guide me");
    next.style.display = "block"; next.style.margin = "0 auto 8px";
    const doneBtn = el("button", "btn btn-ghost btn-sm", "I've got it from here");
    doneBtn.style.display = "block"; doneBtn.style.margin = "0 auto";
    next.onclick = () => {
      if (revealed >= steps.length) return;
      const st = steps[revealed++];
      let text = st.text;
      if (st.act && renderer) {
        const extra = st.act();
        if (typeof extra === "string") text = text ? text + " " + extra : extra;
      }
      const li = el("li");
      li.innerHTML = "<b>Step " + revealed + ".</b> " + text;
      list.append(li);
      if (revealed >= steps.length) { next.textContent = "That's every clue I have!"; next.disabled = true; }
    };
    box.append(next, doneBtn);
    doneBtn.onclick = close;
    next.click();
  });
}
function helpStepsFor(ex) {
  const steps = [];
  if (ex.type === "mcq" || ex.type === "listen") {
    steps.push({ text: ex.type === "listen" ? "Play the audio again — slowly. Then look at each option and imagine its sound." : "Read the question once more: " + ex.prompt });
    steps.push({ text: "Let's cross one off.", act: () => renderer.eliminate && renderer.eliminate() });
    if (ex.options.length > 2) steps.push({ text: "And another.", act: () => renderer.eliminate && renderer.eliminate() });
    steps.push({ text: "Final nudge: " + (ex.hint || "go with your gut — it's one of the two left.") });
  } else if (ex.type === "build") {
    steps.push({ text: "Japanese order: topic (＋は) → object (＋を) → verb/です LAST. Questions end with か." });
    steps.push({ text: "Watch for decoy tiles — not every tile is used." });
    steps.push({ text: "Here's the opener.", act: () => renderer.reveal && renderer.reveal() });
    steps.push({ text: "And the next piece.", act: () => renderer.reveal && renderer.reveal() });
  } else if (ex.type === "type") {
    steps.push({ text: "Sound it out: consonant + vowel. " + (ex.hint || "") });
    steps.push({ text: "Let me start it for you.", act: () => renderer.reveal && renderer.reveal() });
    steps.push({ text: "One more letter.", act: () => renderer.reveal && renderer.reveal() });
  } else if (ex.type === "match") {
    steps.push({ text: "Strategy: match what you're SURE of first. Each match removes a distractor from the rest." });
    steps.push({ text: "Freebie:", act: () => renderer.reveal && renderer.reveal() });
  } else if (ex.type === "write") {
    steps.push({ text: "Golden rules: strokes go top→bottom and left→right. Horizontal before vertical when they cross." });
    steps.push({ text: "Let's make the guide easier to follow.", act: () => renderer.reveal && renderer.reveal() });
    steps.push({ text: "Draw slowly — accuracy first, speed later. Expected strokes: " + (ex.entry.s || "a few") + "." });
  } else if (ex.type === "speak") {
    steps.push({ text: "Listen to the slow version 2–3 times. Hum the rhythm before saying the sounds." });
    steps.push({ text: "Japanese syllables are short and even — no stress like English. Ta-ta-ta, like a metronome." });
    steps.push({ text: "Romaji roadmap: " + ex.phrase.r });
  }
  return steps;
}

/* ---------- Practice view ---------- */
let practiceScreen = "menu";
function renderPractice() {
  const v = $("#view-practice");
  v.innerHTML = "";
  if (practiceScreen === "write") return renderWriteStudio(v);
  if (practiceScreen === "speak") return renderSpeakStudio(v);
  if (practiceScreen === "words") return renderWordBook(v);
  practiceScreen = "menu";
  v.append(el("h1", "ex-prompt", "Practice studio"));
  v.append(el("p", "ex-sub", "Sharpen each skill on its own — all of it earns XP."));
  const grid = el("div", "practice-grid");
  const cards = [
    { ico: "復", title: "Quick review", desc: "10 rapid questions from everything you've learned", fn: startQuickReview },
    { ico: "書", title: "Writing studio", desc: "Trace any character with your finger or mouse", fn: () => { practiceScreen = "write"; renderPractice(); } },
    { ico: "話", title: "Speaking studio", desc: "Listen & repeat real phrases", fn: () => { practiceScreen = "speak"; renderPractice(); } },
    { ico: "辞", title: "Word book", desc: "Every word you've collected, with audio", fn: () => { practiceScreen = "words"; renderPractice(); } },
  ];
  for (const c of cards) {
    const b = el("button", "practice-card");
    b.append(el("div", "ico jp", c.ico));
    b.append(el("h3", null, c.title));
    b.append(el("p", null, c.desc));
    b.onclick = c.fn;
    grid.append(b);
  }
  v.append(grid);
}
function startQuickReview() {
  const learned = learnedKanaEntries();
  const kj = learnedKanjiEntries();
  if (learned.length + kj.length < 5) { showToast("Finish a lesson or two first — then I'll have something to quiz you on!"); return; }
  const pool = learned.length ? learned : kj;
  const items = [];
  sampleN(learned, 4).forEach(e => items.push(mcqKR(e, pool)));
  sampleN(learned, 2).forEach(e => items.push(mcqRK(e, pool)));
  sampleN(learned, 2).forEach(e => items.push(typeEx(e)));
  if (learned.length >= 5) items.push(matchEx(sampleN(learned, 5)));
  sampleN(learned, 1).forEach(e => items.push(listenEx(e, pool)));
  sampleN(kj, 2).forEach(e => items.push(mcqKanjiMeaning(e, kj)));
  sampleN(kj, 1).forEach(e => items.push(mcqKanjiReading(e, kj)));
  startLesson({ id: "quick", kind: "quick", title: "Quick review" }, { queue: shuffle(items), quick: true });
}
function renderWriteStudio(v) {
  const back = el("div", "back-row");
  const bb = el("button", "btn btn-ghost btn-sm", "← Practice");
  bb.onclick = () => { practiceScreen = "menu"; renderPractice(); };
  back.append(bb);
  v.append(back);
  v.append(el("h1", "ex-prompt", "Writing studio"));
  v.append(el("p", "ex-sub", "Tap any character to trace it. Gold = traced before. +5 XP per character (first 10 each day)."));
  const wrap = el("div", "kana-grid-wrap");
  for (const g of STUDIO_GROUPS) {
    wrap.append(el("h3", null, g.title));
    for (const rowStr of g.rows) {
      const row = el("div", "kana-row");
      for (const ch of rowStr) {
        const e = KANA[ch];
        if (!e) continue;
        const cell = el("button", "kana-cell jp" + (state.traced[ch] ? " traced" : ""));
        cell.append(document.createTextNode(ch));
        cell.append(el("span", "r", e.r));
        cell.onclick = () => openTraceModal(e);
        row.append(cell);
      }
      wrap.append(row);
    }
  }
  v.append(wrap);
}
function openTraceModal(entry) {
  showModal((box, close) => {
    box.append(el("h2", null, "「" + entry.k + "」 — " + entry.r));
    if (entry.m) box.append(el("p", "sub", entry.m));
    const w = makeWriteWidget(entry, (sc) => {
      state.traced[entry.k] = true;
      state.counters.write++;
      const t = todayKey();
      if (state.counters.traceXpDay !== t) { state.counters.traceXpDay = t; state.counters.traceXpCount = 0; }
      let gained = 0;
      if (sc.pass && state.counters.traceXpCount < 10) { state.counters.traceXpCount++; gained = 5; addXp(5); markStudiedToday(); }
      markDirty(); checkBadges("write");
      showToast(sc.msg + (gained ? "  +5 XP" : ""), 5000);
      close();
      renderPractice();
    });
    box.append(w.root);
    const row = el("div", "audio-row");
    row.append(audioButton(entry.k));
    box.append(row);
    const c = el("button", "btn btn-ghost btn-sm", "Close");
    c.style.display = "block"; c.style.margin = "10px auto 0";
    c.onclick = close;
    box.append(c);
  });
}
function collectWordBook() {
  const sections = [];
  for (const u of UNITS) {
    const seen = new Set();
    const words = [];
    for (const l of u.lessons) {
      if (!state.lessons[l.id]) continue;
      const add = (jp, r, en) => { if (jp && !seen.has(jp)) { seen.add(jp); words.push({ jp, r, en }); } };
      (l.words || []).forEach(w => add(w.w, w.r, w.en));
      (l.phrases || []).forEach(p => add(p.w, p.r, p.en));
      (l.vocab || []).forEach(v2 => add(v2[0], v2[1], v2[2]));
    }
    if (words.length) sections.push({ title: u.title, words });
  }
  return sections;
}
function renderWordBook(v) {
  const back = el("div", "back-row");
  const bb = el("button", "btn btn-ghost btn-sm", "← Practice");
  bb.onclick = () => { practiceScreen = "menu"; renderPractice(); };
  back.append(bb);
  v.append(back);
  v.append(el("h1", "ex-prompt", "Word book — 単語帳"));
  const sections = collectWordBook();
  if (!sections.length) {
    v.append(el("p", "ex-sub", "Empty for now! Every word, phrase and vocabulary item from a completed lesson lands in this book automatically."));
    return;
  }
  const total = sections.reduce((s, x) => s + x.words.length, 0);
  v.append(el("p", "ex-sub", total + " words collected so far." + (AudioMod.ready ? " Tap the speaker to hear any of them." : "")));
  for (const sec of sections) {
    const wrap = el("div", "kana-grid-wrap");
    wrap.append(el("h3", null, sec.title));
    const ul = el("ul", "speak-list");
    for (const w of sec.words) {
      const li = el("li", "speak-item");
      li.append(el("span", "jp", w.jp));
      li.append(el("span", "meta", w.r + " — " + w.en));
      if (AudioMod.ready) {
        const b = el("button", "btn btn-ghost btn-sm");
        b.innerHTML = ICONS.speaker;
        b.setAttribute("aria-label", "Play " + w.r);
        b.onclick = () => AudioMod.speak(w.jp);
        li.append(b);
      }
      ul.append(li);
    }
    wrap.append(ul);
    v.append(wrap);
  }
}
function renderSpeakStudio(v) {
  const back = el("div", "back-row");
  const bb = el("button", "btn btn-ghost btn-sm", "← Practice");
  bb.onclick = () => { practiceScreen = "menu"; renderPractice(); };
  back.append(bb);
  v.append(back);
  v.append(el("h1", "ex-prompt", "Speaking studio"));
  v.append(el("p", "ex-sub", AudioMod.ready
    ? "Listen, then say it out loud. Each phrase you practice counts toward your Speaker badge."
    : "Audio isn't available in this view — read the romaji out loud instead; it still counts!"));
  const ul = el("ul", "speak-list");
  for (const p of SPEAK_STUDIO) {
    const li = el("li", "speak-item");
    li.append(el("span", "jp", p.w));
    const meta = el("span", "meta", p.r + " — " + p.en);
    li.append(meta);
    if (AudioMod.ready) {
      const b1 = el("button", "btn btn-ghost btn-sm");
      b1.innerHTML = ICONS.speaker;
      b1.setAttribute("aria-label", "Play " + p.r);
      b1.onclick = () => AudioMod.speak(p.w);
      const b2 = el("button", "btn btn-ghost btn-sm");
      b2.innerHTML = ICONS.turtle;
      b2.setAttribute("aria-label", "Play slowly");
      b2.onclick = () => AudioMod.speak(p.w, 0.65);
      li.append(b1, b2);
    }
    const did = el("button", "btn btn-good btn-sm", "Said it!");
    did.onclick = () => {
      state.counters.speak++;
      markDirty(); checkBadges("speak");
      did.textContent = "✓";
      did.disabled = true;
      addXp(2); markStudiedToday();
      showToast("+2 XP — " + p.r + " 🎤");
    };
    li.append(did);
    ul.append(li);
  }
  v.append(ul);
}

/* ---------- Sensei (AI tutor) view ---------- */
const chatTurns = [];
let chatBusy = false, chatCtl = null;
const SENSEI_RULES = `You are "Sensei", the warm, encouraging AI tutor inside Nihongo Quest, a game that teaches Japanese to complete beginners. Answer anything about the Japanese language: grammar, kana, kanji, pronunciation, vocabulary, culture connected to language, and study tips. Rules: keep replies under 120 words; always show Japanese in kana (plus kanji if natural) with romaji in parentheses and an English gloss; explain like the learner knows NOTHING yet; be playful but never condescending; plain text only, no markdown symbols. If asked something unrelated to Japanese or learning, answer in one friendly sentence and steer back to Japanese.`;
function renderSensei() {
  const v = $("#view-sensei");
  v.innerHTML = "";
  const wrap = el("div", "chat-wrap");
  const intro = el("div", "chat-intro");
  intro.append(el("h2", null, "先生 Sensei — ask me anything"));
  intro.append(el("p", null, "Grammar mysteries, pronunciation, culture, study tips — if it's about Japanese, I'm in. Powered by Claude, using your own account."));
  wrap.append(intro);
  if (!chatTurns.length) {
    const chips = el("div", "chips-row");
    for (const c of SENSEI_CHIPS) {
      const b = el("button", "chip-sugg", c);
      b.onclick = () => sendChat(c);
      chips.append(b);
    }
    wrap.append(chips);
  }
  const log = el("div", "chat-log");
  log.id = "chat-log";
  for (const t of chatTurns) {
    const m = el("div", "msg " + (t.role === "user" ? "user" : "bot"), t.content);
    log.append(m);
  }
  wrap.append(log);
  if (sampleFn === null && window.claude?.use) {
    // may still be resolving; show input anyway and fail gracefully
  }
  const row = el("div", "chat-input-row");
  const input = el("input");
  input.type = "text"; input.placeholder = "Ask about Japanese…";
  input.id = "chat-input";
  input.onkeydown = e => { if (e.key === "Enter" && input.value.trim() && !chatBusy) { sendChat(input.value.trim()); input.value = ""; } };
  const send = el("button", "btn btn-primary btn-sm", "Send");
  send.onclick = () => { if (input.value.trim() && !chatBusy) { sendChat(input.value.trim()); input.value = ""; } };
  row.append(input, send);
  wrap.append(row);
  v.append(wrap);
  log.scrollTop = log.scrollHeight;
}
async function sendChat(text) {
  if (chatBusy) return;
  if (!sampleFn) sampleFn = await useCap("sample");
  if (!sampleFn) {
    chatTurns.push({ role: "user", content: text });
    chatTurns.push({ role: "assistant", content: "Sensei needs the AI connection, which isn't available in this view. Everything else in the app still works — and your hint & help buttons in lessons never need it!" });
    renderSensei();
    return;
  }
  chatBusy = true;
  chatTurns.push({ role: "user", content: text });
  renderSensei();
  const log = $("#chat-log");
  const bubble = el("div", "msg bot thinking", "Sensei is thinking…");
  log.append(bubble);
  bubble.scrollIntoView({ block: "end" });
  state.counters.tutor++; markDirty(); checkBadges("tutor");
  chatCtl = new AbortController();
  const context = `(Learner context: level ${levelFromXp(state.xp)}, ${Object.keys(state.lessons).length} lessons completed, ${learnedCharCount()} kana learned.)`;
  try {
    const turns = chatTurns.slice(-12).map(t => ({ role: t.role, content: t.content }));
    const { text: reply } = await sampleFn(
      [{ role: "user", content: SENSEI_RULES + "\n" + context }, ...turns],
      {
        cache: false, modelTier: "quick", signal: chatCtl.signal,
        onText: ({ text }) => { bubble.classList.remove("thinking"); bubble.textContent = text; bubble.scrollIntoView({ block: "end" }); },
      });
    chatTurns.push({ role: "assistant", content: reply });
  } catch (e) {
    const msg =
      e && e.code === "not_granted" ? "You haven't allowed this app to use Claude — that's okay! The rest of the app works without it." :
      e && e.code === "rate_limited" ? "Sensei needs a short tea break (rate limit) — try again in a minute. ☕" :
      e && e.code === "cancelled" ? "(stopped)" :
      "Hmm, I couldn't reach the AI just now. Try again in a moment!";
    chatTurns.push({ role: "assistant", content: (e && e.text ? e.text + "\n\n" : "") + msg });
  }
  chatBusy = false;
  renderSensei();
}

/* ---------- Me view ---------- */
function renderMe(v2) {
  const v = $("#view-me");
  v.innerHTML = "";
  const lv = levelFromXp(state.xp);
  const cur = xpForLevel(lv), next = xpForLevel(lv + 1);
  const frac = clamp((state.xp - cur) / (next - cur), 0, 1);
  const head = el("div", "me-head");
  const ring = el("div", "lvl-ring");
  const Rr = 42, C = 2 * Math.PI * Rr;
  ring.innerHTML = `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="${Rr}" fill="none" stroke="var(--bg3)" stroke-width="9"/>
    <circle cx="50" cy="50" r="${Rr}" fill="none" stroke="var(--gold)" stroke-width="9" stroke-linecap="round"
      stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}"/>
  </svg>`;
  const num = el("div", "num", String(lv));
  num.append(el("span", null, "LEVEL"));
  ring.append(num);
  head.append(ring);
  const info = el("div");
  info.append(el("h2", null, titleForLevel(lv)));
  info.append(el("div", "sub", state.xp + " XP · " + (next - state.xp) + " XP to level " + (lv + 1)));
  info.append(el("div", "sub", state.streak + "-day streak · " + Object.keys(state.lessons).length + " lessons done"));
  head.append(info);
  v.append(head);

  const timeSec = el("div", "me-section");
  timeSec.append(el("h3", null, "⏱ Active learning time"));
  const rows = el("div", "time-rows");
  const mkRow = (a, b) => { const r = el("div", "row"); r.append(el("span", null, a), el("span", null, b)); rows.append(r); };
  let week = 0;
  for (let i = 0; i < 7; i++) week += (state.days[todayKey(-i)] || {}).sec || 0;
  mkRow("Today", fmtMin(todaySec()) + " · goal " + goalMin() + "m");
  mkRow("This week", fmtMin(week));
  mkRow("All time", fmtMin(totalSec()));
  timeSec.append(rows);
  const chips = el("div", "day-chips");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const k = todayKey(-i);
    const sec = (state.days[k] || {}).sec || 0;
    const d = new Date(); d.setDate(d.getDate() - i);
    const c = el("div", "day-chip" + (sec >= goalMin() * 60 ? " goal" : ""));
    c.append(el("b", null, i === 0 ? "Today" : dayNames[d.getDay()]));
    c.append(document.createTextNode(Math.floor(sec / 60) + "m"));
    chips.append(c);
  }
  timeSec.append(chips);
  timeSec.append(el("p", "ex-sub", "Time counts while you're actively using the app (pauses after 2 idle minutes)."));
  v.append(timeSec);

  const badgeSec = el("div", "me-section");
  badgeSec.append(el("h3", null, "🏅 Badges — " + state.badges.length + "/" + BADGES.length));
  const grid = el("div", "badges-grid");
  for (const b of BADGES) {
    const got = hasBadge(b.id);
    const cell = el("div", "badge-cell" + (got ? "" : " locked"));
    cell.append(el("div", "ico jp", got ? b.icon : "？"));
    cell.append(el("b", null, b.name));
    cell.append(el("span", null, b.desc));
    grid.append(cell);
  }
  badgeSec.append(grid);
  v.append(badgeSec);

  const more = el("div", "me-section");
  more.append(el("h3", null, "⚙ More"));
  const ob = el("button", "btn btn-ghost btn-sm", "Open settings — themes, goals & voice speed");
  ob.onclick = () => { prevView = "me"; currentView = "settings"; renderTabs(); renderView(); };
  more.append(ob);
  v.append(more);
}

/* ---------- Settings view ---------- */
function renderSkinPicker() {
  const pickGrid = el("div", "skin-grid");
  for (const s of SKINS) {
    const c = el("button", "skin-card" + ((state.skin || "indigo") === s.id ? " active" : ""));
    const sw = el("div", "sw-row");
    for (const col of s.sw) { const d = el("span", "sw"); d.style.background = col; sw.append(d); }
    c.append(sw);
    c.append(el("b", null, s.name));
    c.append(el("span", "jp", s.jp + " · " + s.desc));
    c.setAttribute("aria-pressed", String((state.skin || "indigo") === s.id));
    c.onclick = () => { state.skin = s.id; applySkin(); markDirty(); renderHeader(); renderView(); };
    pickGrid.append(c);
  }
  return pickGrid;
}
function renderSettings() {
  const v = $("#view-settings");
  if (!v) return;
  v.innerHTML = "";
  const back = el("div", "back-row");
  const bb = el("button", "btn btn-ghost btn-sm", "← Back");
  bb.onclick = () => { currentView = prevView || "learn"; renderTabs(); renderView(); };
  back.append(bb);
  v.append(back);
  v.append(el("h1", "ex-prompt", "Settings — 設定"));

  const theme = el("div", "me-section wide");
  theme.append(el("h3", null, "🎨 Theme"));
  theme.append(renderSkinPicker());
  v.append(theme);

  const prefs = el("div", "me-section");
  prefs.append(el("h3", null, "⏱ Daily goal"));
  prefs.append(el("p", "ex-sub", "Minutes of active study that count as a full day — your streak flame and day chips follow this."));
  const segRow = el("div", "seg-row");
  for (const m of [5, 10, 15, 20, 30]) {
    const b = el("button", "seg" + (goalMin() === m ? " active" : ""), m + " min");
    b.onclick = () => { state.settings.goalMin = m; markDirty(); renderSettings(); };
    segRow.append(b);
  }
  prefs.append(segRow);
  v.append(prefs);

  const audio = el("div", "me-section");
  audio.append(el("h3", null, "🔊 Voice speed"));
  audio.append(el("p", "ex-sub", "How fast Japanese audio plays everywhere in the app."));
  const aRow = el("div", "seg-row");
  for (const [val, label] of [[1, "Normal"], [0.85, "Relaxed"], [0.7, "Slow"]]) {
    const b = el("button", "seg" + (((state.settings.rate || 1) === val) ? " active" : ""), label);
    b.onclick = () => { state.settings.rate = val; markDirty(); renderSettings(); AudioMod.speak("こんにちは"); };
    aRow.append(b);
  }
  audio.append(aRow);
  if (!AudioMod.ready) audio.append(el("p", "ex-sub", "Audio isn't available in this view — the choice is saved for when it is."));
  v.append(audio);

  const data = el("div", "me-section");
  data.append(el("h3", null, "💾 Data"));
  data.append(el("p", "ex-sub", "Progress saves automatically — to your Claude account on claude.ai, or to this browser on the public site."));
  const resetBtn = el("button", "btn btn-ghost btn-sm", "Reset all progress");
  let armed = false;
  resetBtn.onclick = () => {
    if (!armed) { armed = true; resetBtn.textContent = "Tap again to really erase everything"; resetBtn.style.color = "var(--bad)"; return; }
    state = { v: 1, xp: 0, lessons: {}, badges: [], days: {}, streak: 0, lastDay: null, counters: { write: 0, speak: 0, tutor: 0, traceXpDay: "", traceXpCount: 0 }, traced: {}, skin: state.skin, settings: state.settings };
    markDirty(); flushSave();
    renderHeader(); renderView();
  };
  data.append(resetBtn);
  v.append(data);

  const about = el("div", "me-section");
  about.append(el("h3", null, "About"));
  about.append(el("p", "ex-sub", "Nihongo Quest — 9 units · 42 lessons · hiragana, katakana, 54 kanji, grammar and real conversation. Built with Claude."));
  v.append(about);
}

/* ---------- boot ---------- */
function buildShell() {
  if (!document.getElementById("app")) {
    const shell = el("div");
    shell.id = "app";
    shell.innerHTML = `
      <header class="top"><div class="top-inner">
        <div class="logo">
          <svg class="torii" viewBox="0 0 26 22" aria-hidden="true"><rect x="1" y="2" width="24" height="3" rx="1.5" fill="var(--red)"></rect><rect x="4" y="8" width="18" height="2.4" rx="1.2" fill="var(--red)"></rect><rect x="6" y="4" width="3" height="18" rx="1.2" fill="var(--red)"></rect><rect x="17" y="4" width="3" height="18" rx="1.2" fill="var(--red)"></rect></svg>
          <span>Nihongo Quest</span>
        </div>
        <div class="statchips" id="statchips" aria-live="polite"></div>
        <button class="icon-btn" id="settings-btn" aria-label="Settings">${ICONS.gear}</button>
      </div></header>
      <main>
        <section id="view-learn" hidden></section>
        <section id="view-practice" hidden></section>
        <section id="view-sensei" hidden></section>
        <section id="view-me" hidden></section>
        <section id="view-settings" hidden></section>
      </main>
      <nav class="tabs" aria-label="Main"><div class="tabs-inner" id="tabbar"></div></nav>`;
    document.body.prepend(shell);
    for (const id of ["lesson", "modal-root", "toast-root"]) {
      const d = el("div");
      d.id = id;
      if (id === "lesson") d.hidden = true;
      document.body.append(d);
    }
  } else {
    // older static markup: add the pieces the settings view needs
    if (!document.getElementById("view-settings")) {
      const s = el("section"); s.id = "view-settings"; s.hidden = true;
      const m = document.querySelector("main");
      if (m) m.append(s);
    }
    if (!document.getElementById("settings-btn")) {
      const b = el("button", "icon-btn");
      b.id = "settings-btn";
      b.setAttribute("aria-label", "Settings");
      b.innerHTML = ICONS.gear;
      const t = document.querySelector(".top-inner");
      if (t) t.append(b);
    }
  }
  const sb = document.getElementById("settings-btn");
  if (sb) sb.onclick = () => {
    if (currentView !== "settings") prevView = currentView;
    currentView = "settings";
    renderTabs(); renderView();
  };
}
function boot(hotData) {
  buildShell();
  loadLocal();
  applySkin();
  if (hotData && hotData.view) currentView = hotData.view;
  renderHeader();
  renderTabs();
  renderView();
  initCaps();
  try {
    window.claude?.hot?.snapshot?.(() => ({ view: currentView }));
  } catch (e) { }
}
try {
  if (window.claude?.hot?.ready) window.claude.hot.ready(boot);
  else boot(window.claude?.hot?.data ?? {});
} catch (e) { boot({}); }
