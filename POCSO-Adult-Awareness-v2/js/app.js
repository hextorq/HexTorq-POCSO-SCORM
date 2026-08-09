/* POCSO Adult Awareness Module — app engine */

if (typeof gsap !== "undefined" && typeof Draggable !== "undefined") gsap.registerPlugin(Draggable, ScrollTrigger);

/* Shown in the footer while an interaction is still incomplete — rotates
   randomly so it doesn't read as a static scold every time the learner
   glances down. */
const ENCOURAGE_MESSAGES = [
  "Keep going — you're almost there.",
  "Good work so far — finish this up to continue.",
  "Nice progress. Just this one left.",
  "You're doing fine — complete this to move on.",
  "Almost done with this part.",
  "Keep at it — one more step.",
  "Fantastic — just wrap this up.",
  "You've got this.",
  "Stay with it — nearly there.",
  "Great pace — finish this to continue.",
  "One more tap and you're through.",
  "Doing well — complete this above to continue.",
  "Nearly there — don't stop now.",
  "Solid work — just this left.",
  "Keep it up.",
  "You're close — finish above to continue.",
  "Good — a little more to go.",
  "Almost through this section.",
  "Well done so far — one step left.",
  "Steady progress — keep going.",
  "This is the last bit — you've got it.",
  "Nicely done — complete this to move ahead.",
  "Just a little further.",
  "You're on track — finish this up.",
  "Great job — one more thing above.",
  "Hang in there — nearly done.",
  "Making good progress — keep going.",
  "Almost — finish the interaction above.",
  "You're nearly through this screen.",
  "Keep pushing — this is the last step here."
];
function randomEncourageMessage() {
  return ENCOURAGE_MESSAGES[Math.floor(Math.random() * ENCOURAGE_MESSAGES.length)];
}

const STORAGE_KEY = "pocso_adult_progress_v1";
const MEDIA_CONSENT_KEY = "pocso_media_sound_consent_v1";
const INTERACTIVE_VIDEOS = {
  tapReveal: "video/interactive-tap-reveal.mp4",
  dragSort: "video/interactive-drag-sort.mp4",
  feedbackCorrect: "video/interactive-feedback-correct.mp4",
  feedbackCaution: "video/interactive-feedback-caution.mp4",
  moduleComplete: "video/interactive-module-complete.mp4"
};

const state = loadState() || {
  currentIndex: 0,
  completedPages: {},
  deckRevealed: {},
  sortPlacements: {},
  sliderValue: {},
  sliderRevealed: {},
  caseAnswers: {},
  caseSubmitted: {},
  branching: {},
  emergencyChoice: {},
  commitDone: {},
  learnerName: "",
  certGenerated: false
};

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { /* Safari private-browsing throws on quota — progress just won't persist */ }
}
function loadState() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
  catch (e) { return null; }
}
function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str; return d.innerHTML; }

/* ---------------- Flatten chapters into a linear page sequence ---------------- */
const PAGES = [];
PAGES.push({ id: "intro", type: "intro" });
CHAPTERS.forEach((ch) => {
  ch.screens.forEach((screen, i) => {
    PAGES.push({ id: screen.id, type: "screen", chapter: ch, screen, isFirstInChapter: i === 0 });
  });
  PAGES.push({ id: "quiz-" + ch.num, type: "quiz", chapter: ch, quiz: ch.quiz });
});
PAGES.push({ id: "certificate", type: "certificate" });
PAGES.push({ id: "onecard", type: "onecard" });

/* One-time stable numbering pass over every video/visual placeholder, for
   production identification. Runs once at load so the number a block gets
   never changes on revisit (a live per-render counter would, since only
   the current page's blocks render each time). */
(function numberVisualBlocks() {
  let n = 0;
  CHAPTERS.forEach((ch) => {
    ch.screens.forEach((screen) => {
      (screen.blocks || []).forEach((block) => {
        if (block.video) {
          n += 1;
          block._videoNum = n;
          block._videoLoc = `Ch ${ch.num} · ${screen.id}`;
        }
      });
    });
  });
})();

function collectVideoUrls() {
  const urls = [];
  CHAPTERS.forEach((ch) => {
    ch.screens.forEach((screen) => {
      (screen.blocks || []).forEach((block) => {
        if (block.video) urls.push(block.video);
      });
    });
  });
  Object.keys(INTERACTIVE_VIDEOS).forEach((key) => urls.push(INTERACTIVE_VIDEOS[key]));
  return Array.from(new Set(urls));
}

const ALL_VIDEO_URLS = collectVideoUrls();
const ALL_VIDEO_CACHE_URLS = ALL_VIDEO_URLS.map((url) => new URL(url, window.location.href).href);

async function runLimited(items, limit, worker) {
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index];
      index += 1;
      try { await worker(item); } catch (e) { /* preload is a best-effort speedup */ }
    }
  });
  await Promise.all(runners);
}

function warmVideoHttpCache(urls) {
  if (typeof fetch !== "function" || !urls.length) return;
  runLimited(urls, 3, async (url) => {
    const res = await fetch(url, { cache: "force-cache" });
    if (res && res.ok) await res.blob();
  });
}

function startVideoPreload() {
  if (!ALL_VIDEO_CACHE_URLS.length) return;

  ALL_VIDEO_CACHE_URLS.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = url;
    document.head.appendChild(link);
  });

  warmVideoHttpCache(ALL_VIDEO_CACHE_URLS);

  if (!("serviceWorker" in navigator)) return;
  if (!/^https?:$/.test(window.location.protocol)) return;

  navigator.serviceWorker.register("sw.js")
    .then(() => navigator.serviceWorker.ready)
    .then((registration) => {
      const worker = registration.active || registration.waiting || registration.installing;
      if (worker) worker.postMessage({ type: "CACHE_VIDEOS", urls: ALL_VIDEO_CACHE_URLS });
    })
    .catch(() => {});
}

function currentPage() { return PAGES[state.currentIndex]; }

const stage = document.getElementById("stage");
const btnBack = document.getElementById("btnBack");
const btnNext = document.getElementById("btnNext");
const footerMsg = document.getElementById("footerMsg");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const chapterListEl = document.getElementById("chapterList");

function hasSoundConsent() {
  try { return localStorage.getItem(MEDIA_CONSENT_KEY) === "granted"; }
  catch (e) { return false; }
}
function hasMediaConsentChoice() {
  try { return !!localStorage.getItem(MEDIA_CONSENT_KEY); }
  catch (e) { return false; }
}
function setSoundConsent(value) {
  try { localStorage.setItem(MEDIA_CONSENT_KEY, value ? "granted" : "declined"); }
  catch (e) { /* progress still works without localStorage */ }
}


/* ---------------- Confetti ----------------
   Accepts either the actual click/tap event (preferred — bursts exactly
   under the finger/cursor) or an Element (falls back to that element's
   centre, for the few places with no originating event, like the
   certificate appearing after a delay). Passing a big container element
   here was the bug: confetti would center on the whole card/box instead
   of wherever the learner actually pressed. */
function confettiAt(target, big) {
  if (typeof confetti !== "function" || !target) return;
  try {
    let x, y;
    if (typeof target.clientX === "number" && typeof target.clientY === "number") {
      x = target.clientX;
      y = target.clientY;
    } else if (typeof target.getBoundingClientRect === "function") {
      const rect = target.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else {
      return;
    }
    confetti({
      particleCount: big ? 110 : 45,
      spread: big ? 90 : 60,
      startVelocity: big ? 42 : 28,
      scalar: big ? 0.95 : 0.8,
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight
      }
    });
  } catch (e) { /* best-effort only */ }
}

/* A bigger, distinct celebration for finishing a whole chapter: three
   staggered bursts (left/centre/right) instead of one, plus its own
   fanfare rather than reusing the single-exercise "complete" sound. */
function chapterCompleteCelebration() {
  SFX.chapterComplete();
  if (typeof confetti !== "function") return;
  try {
    const y = 0.35;
    confetti({ particleCount: 90, spread: 70, startVelocity: 40, origin: { x: 0.2, y } });
    setTimeout(() => confetti({ particleCount: 130, spread: 100, startVelocity: 48, origin: { x: 0.5, y } }), 120);
    setTimeout(() => confetti({ particleCount: 90, spread: 70, startVelocity: 40, origin: { x: 0.8, y } }), 240);
  } catch (e) { /* best-effort only */ }
}

function makeVideoPlayerHtml(src, extraClass) {
  return `<video class="video-slot-player ${extraClass || ""}" src="${escapeHtml(src)}" controls playsinline webkit-playsinline preload="auto"></video>`;
}

function makeInteractiveVideoHtml(src, label) {
  return `
    <div class="interactive-video" aria-label="${escapeHtml(label || "Interactive animation")}">
      <video class="interactive-video-player" src="${escapeHtml(src)}" autoplay muted loop playsinline webkit-playsinline preload="auto"></video>
    </div>`;
}
function makeFeedbackVideoHtml(correct) {
  return makeInteractiveVideoHtml(
    correct ? INTERACTIVE_VIDEOS.feedbackCorrect : INTERACTIVE_VIDEOS.feedbackCaution,
    correct ? "Correct answer feedback animation" : "Try again feedback animation"
  );
}

function setupInteractiveVideos(root) {
  const scope = root || stage;
  scope.querySelectorAll(".interactive-video-player").forEach((videoEl) => {
    videoEl.muted = true;
    videoEl.volume = 0;
    videoEl.loop = true;
    videoEl.onended = null;
    try { videoEl.currentTime = 0; } catch (e) { /* best effort for cached media */ }
    const playMuted = () => {
      videoEl.muted = true;
      videoEl.volume = 0;
      videoEl.loop = true;
      videoEl.onended = null;
      const p = videoEl.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    const box = videoEl.closest(".interactive-video");
    if (box) box.addEventListener("click", playMuted);
    playMuted();
  });
}

function playPageVideos(withSound) {
  const videos = Array.from(stage.querySelectorAll(".video-slot-player"));
  if (!videos.length) return;

  videos.forEach((videoEl) => {
    videoEl.pause();
    videoEl.loop = false;
    videoEl.onended = null;
    videoEl.muted = true;
    videoEl.volume = 0;
    try { videoEl.currentTime = 0; } catch (e) { /* some streams may not seek immediately */ }
  });

  function playOne(videoEl, sound, onEnded) {
    videoEl.pause();
    videoEl.loop = false;
    videoEl.onended = typeof onEnded === "function" ? onEnded : null;
    videoEl.muted = !sound;
    videoEl.volume = sound ? 1 : 0;
    try { videoEl.currentTime = 0; } catch (e) { /* some streams may not seek immediately */ }
    const p = videoEl.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        if (sound) footerMsg.textContent = "Tap the video if your browser blocks sound autoplay.";
      });
    }
  }

  function playAt(index) {
    const videoEl = videos[index];
    if (!videoEl) return;
    playOne(videoEl, withSound, index < videos.length - 1 ? () => playAt(index + 1) : null);
  }

  videos.forEach((videoEl) => {
    const slot = videoEl.closest(".video-slot-has-video");
    if (slot) slot.addEventListener("click", () => playOne(videoEl, hasSoundConsent()));
  });

  playAt(0);
}

function ensureMediaConsentPrompt() {
  if (hasSoundConsent()) return;
  if (hasMediaConsentChoice()) return;
  const videos = stage.querySelectorAll(".video-slot-player");
  if (!videos.length || document.querySelector(".media-consent")) return;

  const prompt = document.createElement("div");
  prompt.className = "media-consent";
  prompt.innerHTML = `
    <div class="media-consent-panel">
      <div class="media-consent-title">Play videos with sound?</div>
      <div class="media-consent-copy">Allow once, and each lesson video will start with audio when you enter a screen.</div>
      <div class="media-consent-actions">
        <button type="button" class="btn btn-ghost" id="mediaConsentLater">Not now</button>
        <button type="button" class="btn btn-primary" id="mediaConsentAllow">Play with sound</button>
      </div>
    </div>
  `;
  document.body.appendChild(prompt);

  prompt.querySelector("#mediaConsentLater").addEventListener("click", () => {
    setSoundConsent(false);
    prompt.remove();
    playPageVideos(false);
  });
  prompt.querySelector("#mediaConsentAllow").addEventListener("click", () => {
    setSoundConsent(true);
    SFX.ensureCtx();
    prompt.remove();
    playPageVideos(true);
  });
}

function setupCurrentPageVideos() {
  const videos = stage.querySelectorAll(".video-slot-player");
  if (!videos.length) return;
  const withSound = hasSoundConsent();
  playPageVideos(withSound);
  ensureMediaConsentPrompt();
}

/* ---------------- Read-aloud button ---------------- */
function makeSpeakerBtn(getElements, title) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "speaker-btn";
  btn.innerHTML = svgIcon("volume", 16);
  btn.title = title || "Read aloud";
  btn.setAttribute("aria-label", title || "Read this section aloud");
  if (!Speech.supported) { btn.style.display = "none"; return btn; }
  btn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (Speech.speaking) { Speech.stop(); btn.innerHTML = svgIcon("volume", 16); btn.classList.remove("speaking"); return; }
    SFX.ensureCtx();
    btn.innerHTML = svgIcon("volumeOff", 16);
    btn.classList.add("speaking");
    const els = typeof getElements === "function" ? getElements() : getElements;
    Speech.speak(els, () => { btn.innerHTML = svgIcon("volume", 16); btn.classList.remove("speaking"); });
  });
  return btn;
}
function makeDialogueSpeakerBtn(turns, getLineEls) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "speaker-btn";
  btn.innerHTML = svgIcon("volume", 16);
  btn.title = "Listen to this conversation";
  btn.setAttribute("aria-label", "Listen to this conversation");
  if (!Speech.supported) { btn.style.display = "none"; return btn; }
  btn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (Speech.speaking) { Speech.stop(); btn.innerHTML = svgIcon("volume", 16); btn.classList.remove("speaking"); return; }
    SFX.ensureCtx();
    btn.innerHTML = svgIcon("volumeOff", 16);
    btn.classList.add("speaking");
    Speech.speakDialogue(turns, getLineEls(), () => { btn.innerHTML = svgIcon("volume", 16); btn.classList.remove("speaking"); });
  });
  return btn;
}

/* ---------------- Sidebar ---------------- */
function buildSidebar() {
  chapterListEl.innerHTML = "";
  CHAPTERS.forEach((ch) => {
    const li = document.createElement("li");
    li.className = "chapter-item";
    li.dataset.chapter = ch.num;
    li.innerHTML = `<span class="ch-title"><span class="dot"></span><span>${ch.title}</span></span><span class="ch-sub">${ch.duration}</span>`;
    chapterListEl.appendChild(li);
  });
  const finalLi = document.createElement("li");
  finalLi.className = "chapter-item";
  finalLi.dataset.chapter = "final";
  finalLi.innerHTML = `<span class="ch-title"><span class="dot"></span><span>One Card to Keep</span></span>`;
  chapterListEl.appendChild(finalLi);
}
const FINAL_PAGE_TYPES = ["certificate", "onecard"];
function updateSidebar() {
  const page = currentPage();
  const items = chapterListEl.querySelectorAll(".chapter-item");
  items.forEach((item) => {
    const key = item.dataset.chapter;
    const isFinal = key === "final";
    const isActive = isFinal ? FINAL_PAGE_TYPES.includes(page.type) : (page.chapter && String(page.chapter.num) === key);
    item.classList.toggle("active", isActive);
    const chapterPages = isFinal
      ? PAGES.filter((p) => FINAL_PAGE_TYPES.includes(p.type))
      : PAGES.filter((p) => p.chapter && String(p.chapter.num) === key);
    const done = chapterPages.length > 0 && chapterPages.every((p) => state.completedPages[p.id]);
    item.classList.toggle("done", done);
  });
}

/* ---------------- Progress ---------------- */
const progressChapterLabel = document.getElementById("progressChapterLabel");
function updateProgress() {
  const page = currentPage();
  let pct, caption;
  if (page.type === "intro") {
    pct = 0;
    caption = "Overview";
  } else if (FINAL_PAGE_TYPES.includes(page.type)) {
    // Reaching the certificate/one-card pages is only possible after every
    // chapter and quiz is done, so this is always 100% — no off-by-one from
    // these pages themselves not yet being marked "completed".
    pct = 100;
    caption = "Complete";
  } else {
    const chNum = page.chapter.num;
    const scopePages = PAGES.filter((p) => p.chapter && p.chapter.num === chNum);
    const done = scopePages.filter((p) => state.completedPages[p.id]).length;
    pct = Math.round((done / scopePages.length) * 100);
    caption = "Chapter " + chNum;
  }
  progressFill.style.width = pct + "%";
  progressLabel.textContent = pct + "%";
  if (progressChapterLabel) progressChapterLabel.textContent = caption;
}

/* ---------------- Navigation ---------------- */
btnBack.addEventListener("click", () => {
  SFX.navBack(); Speech.stop();
  if (state.currentIndex > 0) { state.currentIndex--; saveState(); render(); }
});
btnNext.addEventListener("click", () => {
  SFX.navNext(); Speech.stop();
  state.completedPages[currentPage().id] = true;
  saveState();
  if (state.currentIndex < PAGES.length - 1) { state.currentIndex++; saveState(); render(); }
});

/* ---------------- Screen-in animation ---------------- */
function animateIn(wrap) {
  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger !== "undefined") ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.killTweensOf(wrap);
  gsap.fromTo(wrap, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" });

  const targets = wrap.querySelectorAll(".gsap-stagger");
  if (targets.length && typeof ScrollTrigger !== "undefined") {
    gsap.set(targets, { autoAlpha: 0, y: 16 });
    // .stage is only the actual scroll container at the desktop breakpoint
    // (see the media query in style.css) — below that, the window/document
    // scrolls instead, so ScrollTrigger needs the matching scroller or its
    // batch reveal will never fire on mobile.
    const isDesktopShell = window.innerWidth >= 900;
    ScrollTrigger.batch(targets, {
      scroller: isDesktopShell ? stage : window,
      start: "top 96%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", overwrite: true })
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
}

/* ---------------- Main render dispatch ---------------- */
function render() {
  const page = currentPage();
  stage.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "page";
  stage.appendChild(wrap);

  btnBack.disabled = state.currentIndex === 0;
  btnNext.disabled = false;
  btnNext.style.display = "";
  btnBack.style.display = "";
  footerMsg.textContent = "";
  btnNext.textContent = state.currentIndex === 0 ? "Start →" : "Continue →";

  const severity = page.type === "screen" ? (page.screen.severity || "") : (FINAL_PAGE_TYPES.includes(page.type) ? "safe" : "");
  document.body.dataset.severity = severity;
  document.body.dataset.focusMode = page.type === "screen" && page.screen.focusMode ? "true" : "false";

  if (page.type === "intro") renderIntroPage(page, wrap);
  else if (page.type === "screen") renderScreenPage(page, wrap);
  else if (page.type === "quiz") renderQuizPage(page, wrap);
  else if (page.type === "certificate") renderCertificatePage(page, wrap);
  else if (page.type === "onecard") renderOneCardPage(page, wrap);

  hasRenderedOnce = true;
  updateProgress();
  updateSidebar();
  animateIn(wrap);
  // Desktop scrolls the .stage pane; mobile scrolls the window (the whole
  // page) instead, since the sidebar-independent-scroll shell only applies
  // at the desktop breakpoint. Both calls are harmless no-ops when that
  // element isn't the actual scroll container.
  // Instant, not smooth — the learner should land at the top of the new
  // screen immediately, not watch it scroll there.
  stage.scrollTop = 0;
  window.scrollTo(0, 0);
  setupCurrentPageVideos();
  setupInteractiveVideos(wrap);
}

/* ================================================================
   INTRO / OVERVIEW PAGE — concise chapter-by-chapter summary
   ================================================================ */
function renderIntroPage(page, wrap) {
  const totalScreens = CHAPTERS.reduce((sum, ch) => sum + ch.screens.length, 0);

  const intro = document.createElement("div");
  intro.className = "intro-hero";
  intro.innerHTML = `
    <h1>${escapeHtml(MODULE_META.title)}</h1>
    <p>Five short chapters covering what the law defines as an offence against a child, what your duties are as an adult, and what to do if a child ever discloses abuse to you or you suspect it.</p>
  `;
  wrap.appendChild(intro);

  const list = document.createElement("div");
  list.className = "intro-chapter-list";
  CHAPTERS.forEach((ch) => {
    const row = document.createElement("div");
    row.className = "intro-chapter-row";
    row.innerHTML = `
      <div class="intro-chapter-num">${ch.num}</div>
      <div class="intro-chapter-body">
        <div class="intro-chapter-title">${escapeHtml(ch.title)}</div>
        <div class="intro-chapter-blurb">${escapeHtml(ch.blurb || "")}</div>
        <div class="intro-chapter-duration">${escapeHtml(ch.duration)}</div>
      </div>
    `;
    list.appendChild(row);
  });
  wrap.appendChild(list);

  const note = document.createElement("div");
  note.className = "intro-note";
  note.textContent = `${totalScreens} screens in total, plus a short quiz after each chapter. Your progress is saved automatically — you can leave and pick up where you left off.`;
  wrap.appendChild(note);

  btnNext.textContent = "Start →";
  btnNext.disabled = false;
  footerMsg.textContent = "";
}

/* ================================================================
   SCREEN PAGE — dispatches each content block
   ================================================================ */
let hasRenderedOnce = false;
function renderScreenPage(page, wrap) {
  const { chapter, screen, isFirstInChapter } = page;

  if (isFirstInChapter) {
    if (hasRenderedOnce) SFX.transition();
    const banner = document.createElement("div");
    banner.className = "chapter-banner";
    banner.innerHTML = `
      <div class="ch-num">Chapter ${chapter.num}</div>
      <h1>${escapeHtml(chapter.title)}</h1>
      <div class="ch-duration">${escapeHtml(chapter.duration)}</div>
    `;
    wrap.appendChild(banner);
  }

  // Severity still drives the colour theme (see body[data-severity] in
  // style.css) — only the visible text label ("Warning" / "Danger" / etc.)
  // next to the heading has been removed.
  const headRow = document.createElement("div");
  headRow.className = "block head-row-flex";
  headRow.innerHTML = `<div class="page-heading">${escapeHtml(screen.heading)}</div>`;
  wrap.appendChild(headRow);

  let hasReadableContent = false;
  let interactionCheck = null;

  screen.blocks.forEach((block) => {
    const el = renderBlock(block, page, (fn) => { interactionCheck = fn; });
    if (el) {
      el.classList.add("gsap-stagger");
      wrap.appendChild(el);
      if (["p", "lawTitle", "quote", "list", "beliefList", "sayNotSay", "table", "interaction"].includes(block.t)) {
        hasReadableContent = true;
      }
    }
  });

  if (hasReadableContent) {
    // Recomputed at play-time: always includes visible text, plus any flip-deck
    // card backs that have already been revealed (never spoils an unrevealed one).
    const speakerBtn = makeSpeakerBtn(() => {
      // Video-slot placeholders and production notes are also built from <p>
      // tags, but they're notes for whoever builds the video/module — not
      // lesson content — so they must never be swept into the narration.
      const els = Array.from(wrap.querySelectorAll("p,li,.belief,.response,.law-title-en,.law-title-ta"))
        .filter((el) => !el.closest(".video-slot") && !el.closest(".p-note"));
      wrap.querySelectorAll(".deck-card").forEach((card) => {
        const front = card.querySelector(".deck-front-text");
        if (front) els.push(front);
        if (card.classList.contains("open")) {
          const back = card.querySelector(".deck-back-text");
          if (back) els.push(back);
        }
      });
      return els;
    }, "Read this screen aloud");
    headRow.appendChild(speakerBtn);
  }

  function checkComplete() {
    const ok = interactionCheck ? interactionCheck() : true;
    btnNext.disabled = !ok;
    footerMsg.textContent = ok ? "" : randomEncourageMessage();
  }
  checkComplete();
  wrap._checkComplete = checkComplete;
  wrap.addEventListener("interaction-changed", checkComplete);
}

function notify(wrap) { wrap.dispatchEvent(new Event("interaction-changed")); }

/* ---------------- Block renderer dispatch ---------------- */
function renderBlock(block, page, setInteractionCheck) {
  switch (block.t) {
    case "p": return renderParagraphBlock(block);
    case "lawTitle": return renderLawTitleBlock(block);
    case "quote": return renderQuoteBlock(block);
    case "list": return renderListBlock(block);
    case "table": return renderTableBlock(block);
    case "note": return renderNoteBlock(block);
    case "visual": return renderVisualBlock(block, page);
    case "pathway": return renderPathwayBlock(block);
    case "dialogue": return renderDialogueBlock(block, page);
    case "sayNotSay": return renderSayNotSayBlock(block);
    case "beliefList": return renderBeliefListBlock(block);
    case "interaction": return renderInteractionBlock(block, page, setInteractionCheck);
    default: return null;
  }
}

function renderParagraphBlock(block) {
  const div = document.createElement("div");
  div.className = "block";
  let html = "";
  if (block.heading) html += `<span class="block-heading">${escapeHtml(block.heading)}</span>`;
  (block.lines || []).forEach((line) => { html += `<p>${escapeHtml(line)}</p>`; });
  div.innerHTML = html;
  return div;
}
function renderLawTitleBlock(block) {
  const div = document.createElement("div");
  div.className = "block law-title-card";
  div.innerHTML = `
    <div class="law-title-en">${escapeHtml(block.english)}</div>
    <div class="law-title-ta" lang="ta">${escapeHtml(block.tamil)}</div>
  `;
  return div;
}
function renderQuoteBlock(block) {
  const div = document.createElement("div");
  div.className = "block";
  let html = "";
  if (block.heading) html += `<span class="block-heading">${escapeHtml(block.heading)}</span>`;
  html += `<div class="p-quote">${block.lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}</div>`;
  div.innerHTML = html;
  return div;
}
function renderListBlock(block) {
  const div = document.createElement("div");
  div.className = "block";
  let html = "";
  if (block.heading) html += `<span class="block-heading">${escapeHtml(block.heading)}</span>`;
  html += `<ul class="p-list">${block.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
  div.innerHTML = html;
  return div;
}
function renderTableBlock(block) {
  const div = document.createElement("div");
  div.className = "block";
  const head = `<tr>${block.headerRow.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>`;
  const rows = block.rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("");
  div.innerHTML = `<table class="p-table"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
  return div;
}
function renderNoteBlock(block) {
  const div = document.createElement("div");
  div.className = "block";
  div.innerHTML = `<div class="p-note">${block.lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}</div>`;
  return div;
}
function renderVisualBlock(block, page) {
  const div = document.createElement("div");
  div.className = "block";
  const slotId = `video-${page.id}`;
  const tag = block._videoNum
    ? `<div class="video-slot-tag">Video ${block._videoNum} — ${escapeHtml(block._videoLoc)}</div>`
    : "";
  if (block.video) {
    const player = makeVideoPlayerHtml(block.video);
    div.innerHTML = `
      <div class="video-slot video-slot-has-video" data-video-slot="${slotId}">
        ${tag}
        ${player}
      </div>`;
    return div;
  }
  return null;
}

/* Real interactive HTML component, not a video placeholder: a horizontal
   Stop -> Report -> Delete pathway strip with hover feedback, an
   entrance animation, and a sound cue when it plays in. */
function renderPathwayBlock(block) {
  const div = document.createElement("div");
  div.className = "block";
  if (block.video) {
    const videoWrap = document.createElement("div");
    videoWrap.className = "video-slot video-slot-has-video pathway-video-slot";
    const tag = block._videoNum
      ? `<div class="video-slot-tag">Video ${block._videoNum} — ${escapeHtml(block._videoLoc)}</div>`
      : "";
    videoWrap.innerHTML = `${tag}${makeVideoPlayerHtml(block.video, "pathway-video-player")}`;
    div.appendChild(videoWrap);
  }
  const strip = document.createElement("div");
  strip.className = "pathway-strip";
  block.steps.forEach((step, i) => {
    const box = document.createElement("div");
    box.className = "pathway-box";
    box.innerHTML = `<span class="pathway-num">${i + 1}</span><span class="pathway-label">${escapeHtml(step)}</span>`;
    strip.appendChild(box);
    if (i < block.steps.length - 1) {
      const arrow = document.createElement("div");
      arrow.className = "pathway-arrow";
      arrow.innerHTML = svgIcon("chevronDown", 18);
      strip.appendChild(arrow);
    }
  });
  div.appendChild(strip);

  if (typeof gsap !== "undefined") {
    const boxes = strip.querySelectorAll(".pathway-box");
    const arrows = strip.querySelectorAll(".pathway-arrow");
    gsap.set(boxes, { autoAlpha: 0, y: 14 });
    gsap.set(arrows, { autoAlpha: 0, scale: 0.6 });
    const tl = gsap.timeline({ delay: 0.15 });
    boxes.forEach((b, i) => {
      tl.to(b, { autoAlpha: 1, y: 0, duration: 0.35, ease: "back.out(1.6)", onStart: () => SFX.select() }, i * 0.22);
      if (arrows[i]) tl.to(arrows[i], { autoAlpha: 1, scale: 1, duration: 0.25, ease: "power1.out" }, i * 0.22 + 0.18);
    });
  }
  return div;
}

function renderBeliefListBlock(block) {
  const div = document.createElement("div");
  div.className = "block";
  div.innerHTML = block.items.map((it) => `
    <div class="belief-item">
      <div class="belief">${escapeHtml(it.belief)}</div>
      <div class="response">${escapeHtml(it.response)}</div>
    </div>`).join("");
  return div;
}
function renderSayNotSayBlock(block) {
  const div = document.createElement("div");
  div.className = "block";
  div.innerHTML = `
    <div class="say-not-say">
      <div class="say-col say-yes">
        <div class="say-col-heading">${svgIcon("check", 14)} ${escapeHtml(block.sayHeading)}</div>
        <ul>${block.say.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
      </div>
      <div class="say-col say-no">
        <div class="say-col-heading">${svgIcon("cross", 14)} ${escapeHtml(block.notHeading)}</div>
        <ul>${block.not.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
      </div>
    </div>
    ${block.sayNote ? `<div class="say-note">${escapeHtml(block.sayNote)}</div>` : ""}
  `;
  return div;
}

/* ---------------- Dialogue block ---------------- */
function renderDialogueBlock(block, page) {
  const div = document.createElement("div");
  div.className = "block";
  const box = document.createElement("div");
  box.className = "dialogue-box";
  const locRow = document.createElement("div");
  locRow.className = "dialogue-loc";
  locRow.innerHTML = `<span>${escapeHtml(block.location)}${block.note ? ` <span class="dialogue-note">${escapeHtml(block.note)}</span>` : ""}</span>`;
  box.appendChild(locRow);

  const lineEls = [];
  block.turns.forEach((turn) => {
    const lineEl = document.createElement("div");
    lineEl.className = "dialogue-line";
    lineEl.innerHTML = `<span class="dialogue-who">${escapeHtml(turn.who)}</span><span class="dialogue-text">${escapeHtml(turn.text)}</span>`;
    box.appendChild(lineEl);
    lineEls.push(lineEl);
  });

  const speakerBtn = makeDialogueSpeakerBtn(block.turns, () => lineEls);
  locRow.appendChild(speakerBtn);

  div.appendChild(box);
  return div;
}

/* ================================================================
   INTERACTIONS
   ================================================================ */
function renderInteractionBlock(block, page, setInteractionCheck) {
  const div = document.createElement("div");
  div.className = "block";
  if (block.label) {
    const lbl = document.createElement("div");
    lbl.className = "interaction-label";
    lbl.textContent = block.label;
    div.appendChild(lbl);
  }

  const kind = block.kind;
  if (kind === "beliefFlip" || kind === "tapReveal" || kind === "tapOpen") {
    renderFlipDeck(div, page, block, setInteractionCheck);
  } else if (kind === "judgmentCards") {
    renderJudgmentDeck(div, page, block, setInteractionCheck);
  } else if (kind === "sequentialFlip") {
    renderSequentialFlip(div, page, block, setInteractionCheck);
  } else if (kind === "sortDrag") {
    renderSortDrag(div, page, block, setInteractionCheck);
  } else if (kind === "numberPick") {
    renderNumberPick(div, page, block, setInteractionCheck);
  } else if (kind === "multiSelectCase") {
    renderMultiSelectCase(div, page, block, setInteractionCheck);
  } else if (kind === "linearBranching") {
    renderLinearBranching(div, page, block, setInteractionCheck);
  } else if (kind === "emergencyChoice") {
    renderEmergencyChoice(div, page, block, setInteractionCheck);
  } else if (kind === "commitmentTap") {
    renderCommitment(div, page, block, setInteractionCheck);
  }
  return div;
}

/* --- Flip deck: shared by beliefFlip / tapReveal / tapOpen --- */
/* 10 distinct GSAP-driven reveal styles, cycled per card index so a deck of
   several cards doesn't feel like the same animation repeated. */
const DECK_VARIANTS = [
  { type: "flip", axis: "rotationY" },
  { type: "flip", axis: "rotationX" },
  { type: "pop" },
  { type: "slide", axis: "xPercent", from: 115 },
  { type: "slide", axis: "xPercent", from: -115 },
  { type: "slide", axis: "yPercent", from: 115 },
  { type: "slide", axis: "yPercent", from: -115 },
  { type: "spin" },
  { type: "unfold" },
  { type: "peel" }
];

function setupDeckVariant(v, front, back) {
  if (typeof gsap === "undefined") return;
  switch (v.type) {
    case "flip": gsap.set(back, { [v.axis]: 180 }); break;
    case "pop": gsap.set(back, { scale: 0.55, autoAlpha: 0 }); break;
    case "slide": gsap.set(back, { [v.axis]: v.from, autoAlpha: 0 }); break;
    case "spin": gsap.set(back, { rotation: -22, scale: 0.6, autoAlpha: 0 }); break;
    case "unfold": gsap.set(back, { scaleY: 0, autoAlpha: 0, transformOrigin: "top center" }); break;
    case "peel": gsap.set(back, { xPercent: 40, rotation: 12, autoAlpha: 0 }); break;
  }
}
function playDeckVariant(v, front, back, inner, instant) {
  if (typeof gsap === "undefined") { if (front) front.style.display = "none"; if (back) back.style.display = ""; return; }
  const d = instant ? 0 : undefined;
  switch (v.type) {
    case "flip":
      gsap.to(inner, { [v.axis]: 180, duration: instant ? 0 : 0.6, ease: "back.out(1.4)" });
      break;
    case "pop":
      gsap.to(front, { scale: 0.6, autoAlpha: 0, duration: instant ? 0 : 0.28, ease: "power1.in" });
      gsap.to(back, { scale: 1, autoAlpha: 1, duration: instant ? 0 : 0.5, delay: instant ? 0 : 0.14, ease: "back.out(2.2)" });
      break;
    case "slide":
      gsap.to(front, { [v.axis]: -v.from, autoAlpha: 0, duration: instant ? 0 : 0.45, ease: "power2.inOut" });
      gsap.to(back, { [v.axis]: 0, autoAlpha: 1, duration: instant ? 0 : 0.45, ease: "power2.inOut" });
      break;
    case "spin":
      gsap.to(front, { rotation: 22, scale: 0.6, autoAlpha: 0, duration: instant ? 0 : 0.32, ease: "power1.in" });
      gsap.to(back, { rotation: 0, scale: 1, autoAlpha: 1, duration: instant ? 0 : 0.5, delay: instant ? 0 : 0.1, ease: "back.out(1.8)" });
      break;
    case "unfold":
      gsap.to(front, { autoAlpha: 0, duration: instant ? 0 : 0.2 });
      gsap.to(back, { scaleY: 1, autoAlpha: 1, duration: instant ? 0 : 0.5, ease: "power2.out" });
      break;
    case "peel":
      gsap.to(front, { xPercent: -40, rotation: -12, autoAlpha: 0, duration: instant ? 0 : 0.4, ease: "power2.in" });
      gsap.to(back, { xPercent: 0, rotation: 0, autoAlpha: 1, duration: instant ? 0 : 0.45, delay: instant ? 0 : 0.08, ease: "power2.out" });
      break;
  }
}

/* --- Flip deck: shared by beliefFlip / tapReveal / tapOpen / judgment cards --- */
function renderFlipDeck(container, page, block, setInteractionCheck) {
  const key = page.id;
  if (!state.deckRevealed[key]) state.deckRevealed[key] = {};
  const revealed = state.deckRevealed[key];

  if (block.fixedHeader) {
    const fh = document.createElement("div");
    fh.className = "fixed-number-wrap";
    fh.innerHTML = `<div class="fixed-number">${escapeHtml(block.fixedHeader)}</div>`;
    container.appendChild(fh);
  }

  const guide = document.createElement("div");
  guide.innerHTML = makeInteractiveVideoHtml(INTERACTIVE_VIDEOS.tapReveal, "Tap reveal interaction animation");
  container.appendChild(guide.firstElementChild);

  const grid = document.createElement("div");
  grid.className = "deck-grid";
  container.appendChild(grid);

  block.data.items.forEach((item, i) => {
    const variant = DECK_VARIANTS[i % DECK_VARIANTS.length];
    const isOpen = !!revealed[i];
    const card = document.createElement("div");
    card.className = "deck-card" + (isOpen ? " open" : "");
    card.innerHTML = `
      <div class="deck-inner">
        <div class="deck-face deck-face-front">
          <div class="deck-front-text">${escapeHtml(item.front)}</div>
          <div class="deck-hint">${svgIcon("volume", 12)} Tap to reveal</div>
        </div>
        <div class="deck-face deck-face-back">
          ${item.tag ? `<span class="deck-tag tag-${item.tag.toLowerCase().replace(/\s+/g, "")}">${escapeHtml(item.tag)}</span>` : ""}
          <div class="deck-back-text">${escapeHtml(item.back)}</div>
          <div class="deck-back-foot"></div>
        </div>
      </div>
    `;
    const inner = card.querySelector(".deck-inner");
    const front = card.querySelector(".deck-face-front");
    const back = card.querySelector(".deck-face-back");

    setupDeckVariant(variant, front, back);
    if (isOpen) playDeckVariant(variant, front, back, inner, true);

    const miniSpeaker = makeSpeakerBtn(() => [card.querySelector(".deck-front-text"), card.querySelector(".deck-back-text")], "Read this card aloud");
    miniSpeaker.classList.add("speaker-btn-inline");
    card.querySelector(".deck-back-foot").appendChild(miniSpeaker);

    card.addEventListener("click", (ev) => {
      if (isOpen || ev.target.closest(".speaker-btn")) return;
      revealed[i] = true;
      saveState();
      card.classList.add("open");
      playDeckVariant(variant, front, back, inner, false);

      const negative = item.tag && /false|offence$/i.test(item.tag) && !/not/i.test(item.tag);
      const positive = item.tag && /not/i.test(item.tag);
      if (negative) SFX.incorrect();
      else if (positive) SFX.correct();
      else SFX.open();

      const allOpen = block.data.items.every((_, idx) => revealed[idx]);
      if (allOpen) {
        SFX.complete();
        confettiAt(ev, false);
      }
      notify(document.querySelector("#stage .page"));
    });
    grid.appendChild(card);
  });

  setInteractionCheck(() => block.data.items.every((_, i) => revealed[i]));
}

/* --- Sequential flip: one card at a time, no scoring --- */
function renderSequentialFlip(container, page, block, setInteractionCheck) {
  const key = page.id;
  if (!state.deckRevealed[key]) state.deckRevealed[key] = {};
  const revealed = state.deckRevealed[key];
  const items = block.data.items || [];
  const currentIndex = Math.min(Object.keys(revealed).length, Math.max(0, items.length - 1));
  const item = items[currentIndex];
  const isOpen = !!revealed[currentIndex];
  const complete = items.length > 0 && items.every((_, i) => revealed[i]);
  const variant = DECK_VARIANTS[currentIndex % DECK_VARIANTS.length];

  const shell = document.createElement("div");
  shell.className = "seq-flip";
  shell.innerHTML = `<div class="seq-progress">${Math.min(currentIndex + 1, items.length)} of ${items.length}</div>`;
  container.appendChild(shell);

  const card = document.createElement("div");
  card.className = "deck-card seq-card" + (isOpen ? " open" : "");
  card.innerHTML = `
    <div class="deck-inner">
      <div class="deck-face deck-face-front">
        <div class="deck-front-text">${escapeHtml(item.front)}</div>
        <div class="deck-hint">${svgIcon("volume", 12)} Tap to reveal</div>
      </div>
      <div class="deck-face deck-face-back">
        <div class="deck-back-text">${escapeHtml(item.back)}</div>
        <div class="deck-back-foot"></div>
      </div>
    </div>
  `;
  shell.appendChild(card);

  const inner = card.querySelector(".deck-inner");
  const front = card.querySelector(".deck-face-front");
  const back = card.querySelector(".deck-face-back");
  setupDeckVariant(variant, front, back);
  if (isOpen) playDeckVariant(variant, front, back, inner, true);

  const actions = document.createElement("div");
  actions.className = "seq-actions";
  shell.appendChild(actions);

  function drawActions() {
    actions.innerHTML = "";
    if (isOpen && !complete) {
      const nextCardBtn = document.createElement("button");
      nextCardBtn.type = "button";
      nextCardBtn.className = "btn btn-primary";
      nextCardBtn.textContent = "Next card";
      nextCardBtn.addEventListener("click", () => { SFX.navNext(); render(); });
      actions.appendChild(nextCardBtn);
    } else if (complete) {
      const done = document.createElement("div");
      done.className = "seq-done";
      done.textContent = "All six cards have been opened.";
      actions.appendChild(done);
    }
  }

  card.addEventListener("click", (ev) => {
    if (isOpen) return;
    revealed[currentIndex] = true;
    saveState();
    card.classList.add("open");
    playDeckVariant(variant, front, back, inner, false);
    SFX.open();
    const nowComplete = items.every((_, i) => revealed[i]);
    if (nowComplete) {
      SFX.complete();
      confettiAt(ev, false);
    }
    notify(document.querySelector("#stage .page"));
    actions.innerHTML = "";
    if (nowComplete) {
      const done = document.createElement("div");
      done.className = "seq-done";
      done.textContent = "All six cards have been opened.";
      actions.appendChild(done);
    } else {
      const nextCardBtn = document.createElement("button");
      nextCardBtn.type = "button";
      nextCardBtn.className = "btn btn-primary";
      nextCardBtn.textContent = "Next card";
      nextCardBtn.addEventListener("click", () => { SFX.navNext(); render(); });
      actions.appendChild(nextCardBtn);
    }
  });

  drawActions();
  setInteractionCheck(() => items.length > 0 && items.every((_, i) => revealed[i]));
}

/* --- Judgment cards (Offence / Not an offence), reuses the deck visual --- */
function renderJudgmentDeck(container, page, block, setInteractionCheck) {
  const items = block.data.items.map((it) => ({
    front: it.situation,
    back: it.feedback,
    tag: it.answer
  }));
  renderFlipDeck(container, page, { ...block, data: { items } }, setInteractionCheck);
}

/* --- Sort exercise: real drag-and-drop (GSAP Draggable) --- */
function renderSortDrag(container, page, block, setInteractionCheck) {
  const key = page.id;
  if (!state.sortPlacements[key]) state.sortPlacements[key] = {};
  const placements = state.sortPlacements[key];

  const guide = document.createElement("div");
  guide.innerHTML = makeInteractiveVideoHtml(INTERACTIVE_VIDEOS.dragSort, "Drag sort interaction animation");
  container.appendChild(guide.firstElementChild);

  const hint = document.createElement("div");
  hint.className = "drag-hint";
  hint.textContent = "Drag each card into the box where it belongs — works with touch too.";
  container.appendChild(hint);

  const pool = document.createElement("div");
  pool.className = "sort-pool";
  const bins = document.createElement("div");
  bins.className = "sort-bins";
  container.appendChild(pool);
  container.appendChild(bins);

  block.data.bins.forEach((bin) => {
    const binEl = document.createElement("div");
    binEl.className = "sort-bin";
    binEl.dataset.binId = bin.id;
    binEl.innerHTML = `<h3>${escapeHtml(bin.label)}</h3><div class="sort-bin-drop"></div>`;
    bins.appendChild(binEl);
  });

  function renderPlacedChip(item) {
    const dropArea = bins.querySelector(`[data-bin-id="${item.bin}"] .sort-bin-drop`);
    const chip = document.createElement("div");
    chip.className = "bin-item correct";
    chip.innerHTML = `${escapeHtml(item.text)}<div class="bin-feedback">${escapeHtml(item.feedback)}</div>`;
    dropArea.appendChild(chip);
    if (typeof gsap !== "undefined") gsap.from(chip, { autoAlpha: 0, scale: 0.85, duration: 0.3, ease: "back.out(1.5)" });
  }

  function flashBox(el, kind) {
    if (!el) return;
    el.classList.remove("flash-correct", "flash-wrong");
    void el.offsetWidth;
    el.classList.add(kind === "correct" ? "flash-correct" : "flash-wrong");
    setTimeout(() => el.classList.remove("flash-correct", "flash-wrong"), 700);
  }

  function checkComplete(lastDropTarget) {
    const allCorrect = block.data.items.every((item, i) => placements[i] === item.bin);
    notify(document.querySelector("#stage .page"));
    if (allCorrect) { SFX.complete(); confettiAt(lastDropTarget || bins, true); }
    return allCorrect;
  }

  block.data.items.forEach((item, i) => {
    if (placements[i] !== undefined) { renderPlacedChip(item); return; }

    const el = document.createElement("div");
    el.className = "sort-item";
    el.textContent = item.text;
    pool.appendChild(el);

    if (typeof Draggable === "undefined") {
      // Fallback if the drag library failed to load: tap item, then tap a bin.
      el.addEventListener("click", () => {
        el.classList.toggle("selected");
      });
      return;
    }

    Draggable.create(el, {
      type: "x,y",
      onDragStart: function () { el.classList.add("dragging"); gsap.set(el, { zIndex: 999 }); },
      onDragEnd: function () {
        el.classList.remove("dragging");
        const dropArea = block.data.bins
          .map((b) => bins.querySelector(`[data-bin-id="${b.id}"] .sort-bin-drop`))
          .find((area) => Draggable.hitTest(el, area, "40%"));

        if (!dropArea) { gsap.to(el, { x: 0, y: 0, duration: 0.35, ease: "power2.out" }); return; }

        const binEl = dropArea.closest(".sort-bin");
        const binId = binEl.dataset.binId;
        const dragInstance = this;

        if (binId === item.bin) {
          placements[i] = binId;
          saveState();
          SFX.correct();
          flashBox(binEl, "correct");
          const targetRect = dropArea.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          gsap.to(el, {
            x: "+=" + (targetRect.left + targetRect.width / 2 - (elRect.left + elRect.width / 2)),
            y: "+=" + (targetRect.top + targetRect.height / 2 - (elRect.top + elRect.height / 2)),
            scale: 0.85, autoAlpha: 0, duration: 0.35, ease: "power1.in",
            onComplete: () => { dragInstance.kill(); el.remove(); renderPlacedChip(item); checkComplete(dropArea); }
          });
        } else {
          SFX.incorrect();
          dropArea.appendChild(el);
          gsap.set(el, { x: 0, y: 0, zIndex: "auto" });
          gsap.fromTo(el, { scale: 1.06 }, { scale: 1, duration: 0.25, ease: "power1.out" });
          flashBox(binEl, "wrong");
          checkComplete();
        }
      }
    });
  });

  setInteractionCheck(() => block.data.items.every((item, i) => placements[i] === item.bin));
}

/* --- Number-pick estimate (replaces the old drag-slider — testers found
   dragging a slider handle confusing; tapping one number in a row is
   unambiguous) --- */
function renderNumberPick(container, page, block, setInteractionCheck) {
  const key = page.id;
  const idSafe = key.replace(/\./g, "_");

  const box = document.createElement("div");
  box.className = "slider-box";
  box.innerHTML = `
    <div class="slider-question">${escapeHtml(block.data.question)}</div>
    <div class="number-pick-row" id="numberRow-${idSafe}"></div>
    <button class="btn btn-primary" id="sliderReveal-${idSafe}" style="margin-top:14px" disabled>Reveal the answer</button>
    <div class="slider-reveal" id="sliderRevealBox-${idSafe}" style="display:none"></div>
  `;
  container.appendChild(box);

  const row = box.querySelector(`#numberRow-${idSafe}`);
  const revealBtn = box.querySelector(`#sliderReveal-${idSafe}`);
  const revealBox = box.querySelector(`#sliderRevealBox-${idSafe}`);

  for (let n = block.data.min; n <= block.data.max; n++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "number-pick-btn" + (state.sliderValue[key] === n ? " selected" : "");
    btn.textContent = String(n);
    btn.disabled = !!state.sliderRevealed[key];
    btn.addEventListener("click", () => {
      state.sliderValue[key] = n;
      saveState();
      SFX.select();
      row.querySelectorAll(".number-pick-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      revealBtn.disabled = false;
    });
    row.appendChild(btn);
  }

  function showReveal() {
    revealBox.style.display = "block";
    revealBox.innerHTML = `<div class="slider-reveal-heading">${escapeHtml(block.data.revealHeading)}</div>${block.data.revealLines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}`;
    revealBtn.disabled = true;
    revealBtn.textContent = "Answer revealed";
    row.querySelectorAll(".number-pick-btn").forEach((b) => { b.disabled = true; });
  }
  if (state.sliderRevealed[key]) showReveal();
  else revealBtn.disabled = state.sliderValue[key] === undefined;

  revealBtn.addEventListener("click", (ev) => {
    if (state.sliderValue[key] === undefined) return;
    state.sliderRevealed[key] = true;
    saveState();
    SFX.complete();
    showReveal();
    confettiAt(ev, false);
    notify(document.querySelector("#stage .page"));
  });

  setInteractionCheck(() => !!state.sliderRevealed[key]);
}

/* --- Multi-select case study (Divya) --- */
function renderMultiSelectCase(container, page, block, setInteractionCheck) {
  const key = page.id;
  if (!state.caseAnswers[key]) state.caseAnswers[key] = {};
  const answers = state.caseAnswers[key];
  const submitted = !!state.caseSubmitted[key];

  const box = document.createElement("div");
  box.className = "case-box";
  container.appendChild(box);

  function draw() {
    box.innerHTML = "";
    block.data.options.forEach((opt, i) => {
      const row = document.createElement("label");
      row.className = "case-option" + (submitted ? " answered" : "");
      const checked = !!answers[i];
      row.innerHTML = `
        <input type="checkbox" ${checked ? "checked" : ""} ${submitted ? "disabled" : ""}>
        <span class="case-option-label">${escapeHtml(opt.label)}${submitted && opt.note ? ` <span class="opt-note">— ${escapeHtml(opt.note)}</span>` : ""}</span>
      `;
      if (!submitted) {
        row.querySelector("input").addEventListener("change", (e) => { answers[i] = e.target.checked; SFX.select(); saveState(); });
      }
      box.appendChild(row);
    });

    if (!submitted) {
      const btn = document.createElement("button");
      btn.className = "btn btn-primary";
      btn.style.marginTop = "12px";
      btn.textContent = "Submit";
      btn.addEventListener("click", (ev) => {
        state.caseSubmitted[key] = true;
        saveState();
        SFX.complete();
        confettiAt(ev, false);
        draw();
        notify(document.querySelector("#stage .page"));
      });
      box.appendChild(btn);
    } else {
      const fb = document.createElement("div");
      fb.className = "case-feedback";
      fb.innerHTML = block.data.feedbackLines.map((l) => `<p>${escapeHtml(l)}</p>`).join("");
      box.appendChild(fb);
    }
  }
  draw();
  setInteractionCheck(() => submittedCheck());
  function submittedCheck() { return !!state.caseSubmitted[key]; }
}

/* --- Linear branching: one situation beat at a time with inline feedback --- */
function renderLinearBranching(container, page, block, setInteractionCheck) {
  const key = page.id;
  if (!state.branching) state.branching = {};
  if (!state.branching[key]) state.branching[key] = { beat: 0, complete: false, lastChoice: null, pendingAdvance: false };
  const progress = state.branching[key];
  const beats = block.data.beats || [];
  const currentBeatIndex = Math.min(progress.beat || 0, Math.max(0, beats.length - 1));
  const beat = beats[currentBeatIndex];

  const box = document.createElement("div");
  box.className = "branch-box";
  container.appendChild(box);

  const stepText = document.createElement("div");
  stepText.className = "branch-step";
  stepText.textContent = `Beat ${currentBeatIndex + 1} of ${beats.length}`;
  box.appendChild(stepText);

  const situation = document.createElement("div");
  situation.className = "branch-situation";
  situation.textContent = beat.situation;
  box.appendChild(situation);

  const body = document.createElement("div");
  body.className = "branch-body";
  body.innerHTML = `
    <div class="branch-illustration" aria-hidden="true">
      <div class="branch-wall"></div>
      <div class="branch-child"></div>
      <div class="branch-adult"></div>
      <div class="branch-floor"></div>
    </div>
    <div class="branch-choices"></div>
  `;
  box.appendChild(body);

  const choicesEl = body.querySelector(".branch-choices");
  const feedback = document.createElement("div");
  feedback.className = "branch-feedback";
  feedback.hidden = true;

  (beat.choices || []).forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "branch-choice";
    btn.textContent = choice.label;
    btn.disabled = !!progress.pendingAdvance || !!progress.complete;
    btn.addEventListener("click", () => {
      progress.lastChoice = idx;
      if (choice.correct) {
        SFX.correct();
        if (currentBeatIndex < beats.length - 1) {
          progress.pendingAdvance = true;
          saveState();
          render();
          return;
        }
        progress.complete = true;
      } else {
        SFX.incorrect();
      }
      saveState();
      render();
    });
    choicesEl.appendChild(btn);
  });

  if (progress.lastChoice !== null && beat.choices[progress.lastChoice]) {
    const choice = beat.choices[progress.lastChoice];
    feedback.hidden = false;
    feedback.className = "branch-feedback " + (choice.correct ? "correct" : "incorrect");
    feedback.innerHTML = `<div>${escapeHtml(choice.feedback)}</div>`;
    if (choice.correct && progress.pendingAdvance) {
      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "btn btn-primary branch-next";
      nextBtn.textContent = `Continue to Beat ${currentBeatIndex + 2}`;
      nextBtn.addEventListener("click", () => {
        progress.beat = currentBeatIndex + 1;
        progress.lastChoice = null;
        progress.pendingAdvance = false;
        saveState();
        render();
      });
      feedback.appendChild(nextBtn);
    }
  }
  box.appendChild(feedback);

  if (progress.complete && block.data.completionPanel) {
    const panel = renderWriteRecordPanel(block.data.completionPanel);
    container.appendChild(panel);
    if (typeof gsap !== "undefined") gsap.from(panel, { autoAlpha: 0, y: 14, duration: 0.35, ease: "power2.out" });
  }

  setInteractionCheck(() => !!progress.complete);
}

function renderWriteRecordPanel(panel) {
  const div = document.createElement("div");
  div.className = "write-panel";
  const rows = (panel.rows || []).map((row) => `
    <div class="write-row">
      <div>${escapeHtml(row[0])}</div>
      <div>${escapeHtml(row[1])}</div>
    </div>
  `).join("");
  div.innerHTML = `
    <div class="write-heading">${escapeHtml(panel.heading)}</div>
    <div class="write-grid">
      <div class="write-col write-yes"><div class="write-col-head">✓ ${escapeHtml(panel.writeHeading)}</div></div>
      <div class="write-col write-no"><div class="write-col-head">✕ ${escapeHtml(panel.dontHeading)}</div></div>
      ${rows}
    </div>
    <div class="write-note">${escapeHtml(panel.note)}</div>
  `;
  return div;
}

/* --- Emergency choice: full-screen stop point with inline 1098 action --- */
function renderEmergencyChoice(container, page, block, setInteractionCheck) {
  const key = page.id;
  if (!state.emergencyChoice) state.emergencyChoice = {};
  const selected = state.emergencyChoice[key];

  const box = document.createElement("div");
  box.className = "emergency-choice-box";
  box.innerHTML = `
    <a class="emergency-persistent-call" href="tel:1098" aria-label="Call Child Helpline 1098">1098</a>
    <div class="emergency-question">${escapeHtml(block.data.question)}</div>
    <div class="emergency-choices"></div>
    <div class="emergency-feedback" hidden></div>
  `;
  container.appendChild(box);

  const choicesEl = box.querySelector(".emergency-choices");
  const feedbackEl = box.querySelector(".emergency-feedback");

  function showFeedback(choice) {
    feedbackEl.hidden = false;
    feedbackEl.className = "emergency-feedback " + (choice.urgent ? "urgent" : "steady");
    feedbackEl.innerHTML = `
      <div>${escapeHtml(choice.feedback)}</div>
      ${choice.urgent ? `<a class="emergency-call" href="tel:1098" aria-label="Call Child Helpline 1098">Call 1098</a>` : ""}
      <button type="button" class="btn btn-primary emergency-continue">Continue</button>
    `;
    feedbackEl.querySelector(".emergency-continue").addEventListener("click", () => {
      state.completedPages[currentPage().id] = true;
      if (state.currentIndex < PAGES.length - 1) {
        state.currentIndex++;
        saveState();
        render();
      }
    });
  }

  block.data.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "emergency-choice" + (selected === i ? " selected" : "");
    btn.textContent = choice.label;
    btn.addEventListener("click", () => {
      state.emergencyChoice[key] = i;
      saveState();
      choice.urgent ? SFX.incorrect() : SFX.correct();
      showFeedback(choice);
      notify(document.querySelector("#stage .page"));
    });
    choicesEl.appendChild(btn);
  });

  if (selected !== undefined && block.data.choices[selected]) showFeedback(block.data.choices[selected]);
  setInteractionCheck(() => state.emergencyChoice[key] !== undefined);
}

/* --- Commitment tap --- */
function renderCommitment(container, page, block, setInteractionCheck) {
  const key = page.id;
  const box = document.createElement("div");
  box.className = "commit-box";
  const done = !!state.commitDone[key];
  box.innerHTML = `
    <button class="commit-btn${done ? " confirmed" : ""}" id="commitBtn">${done ? svgIcon("check", 16) + " Understood" : escapeHtml(block.data.buttonText)}</button>
    ${done ? `<div class="commit-confirmed-note">You've confirmed you understand this law applies to you.</div>` : ""}
  `;
  container.appendChild(box);
  box.querySelector("#commitBtn").addEventListener("click", (ev) => {
    if (state.commitDone[key]) return;
    state.commitDone[key] = true;
    saveState();
    SFX.confirm();
    confettiAt(ev, false);
    notify(document.querySelector("#stage .page"));
    render();
  });
  setInteractionCheck(() => !!state.commitDone[key]);
}

/* ================================================================
   QUIZ PAGE
   ================================================================ */
function renderQuizPage(page, wrap) {
  const quiz = page.quiz;
  const key = page.id;
  if (!state.quizAnswers) state.quizAnswers = {};
  if (!state.quizAnswers[key]) state.quizAnswers[key] = quiz.questions.map((q) => (q.type === "multi" ? [] : null));

  const heading = document.createElement("div");
  heading.className = "block";
  heading.innerHTML = `<div class="page-heading">${escapeHtml(quiz.heading)}</div>`;
  wrap.appendChild(heading);
  if (quiz.note) {
    const n = document.createElement("div");
    n.className = "quiz-note";
    n.textContent = quiz.note;
    wrap.appendChild(n);
  }

  const answers = state.quizAnswers[key];
  const initiallyComplete = quiz.questions.every((q, qi) => {
    const a = answers[qi];
    return q.type === "multi" ? (Array.isArray(a) && a._submitted) : a !== null;
  });
  btnNext.dataset.quizWasComplete = initiallyComplete ? "1" : "0";

  quiz.questions.forEach((q, qi) => {
    if (answers[qi] === undefined) answers[qi] = q.type === "multi" ? [] : null;
    const box = document.createElement("div");
    box.className = "quiz-box";
    box.innerHTML = `<div class="quiz-q-head"><div class="quiz-q">${qi + 1}. ${escapeHtml(q.q)}</div></div><div class="choices"></div><div class="fb"></div>`;
    wrap.appendChild(box);
    const choicesEl = box.querySelector(".choices");
    const fbEl = box.querySelector(".fb");

    if (q.type === "single") {
      q.options.forEach((opt, oi) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = opt.label;
        const chosen = answers[qi];
        if (chosen !== null) {
          btn.disabled = true;
          if (oi === chosen) btn.classList.add(opt.correct ? "correct" : "incorrect");
          if (opt.correct && oi !== chosen) btn.classList.add("correct");
        }
        btn.addEventListener("click", () => {
          if (answers[qi] !== null) return;
          answers[qi] = oi;
          saveState();
          const isCorrect = opt.correct;
          isCorrect ? SFX.correct() : SFX.incorrect();
          if (isCorrect) confettiAt(btn, false);
          wrap.innerHTML = ""; renderQuizPage(page, wrap); setupInteractiveVideos(wrap);
          checkQuizComplete();
        });
        choicesEl.appendChild(btn);
      });
      if (answers[qi] !== null) {
        const opt = q.options[answers[qi]];
        const text = opt.correct ? (q.feedbackCorrect || q.feedback) : (q.feedbackIncorrect || q.feedback);
        if (text) fbEl.innerHTML = `${makeFeedbackVideoHtml(opt.correct)}<div class="feedback-box ${opt.correct ? "correct" : "incorrect"}">${escapeHtml(text)}</div>`;
      }
    } else if (q.type === "multi") {
      const submitted = Array.isArray(answers[qi]) && answers[qi]._submitted;
      const sel = Array.isArray(answers[qi]) ? answers[qi] : [];
      q.options.forEach((opt, oi) => {
        const row = document.createElement("label");
        row.className = "case-option";
        const checked = sel.includes(oi);
        row.innerHTML = `<input type="checkbox" ${checked ? "checked" : ""} ${submitted ? "disabled" : ""}> <span class="case-option-label">${escapeHtml(opt.label)}</span>`;
        if (!submitted) {
          row.querySelector("input").addEventListener("change", (e) => {
            const arr = state.quizAnswers[key][qi];
            const idx = arr.indexOf(oi);
            if (e.target.checked && idx === -1) arr.push(oi);
            if (!e.target.checked && idx !== -1) arr.splice(idx, 1);
            SFX.select();
            saveState();
          });
        } else {
          const isCorrect = opt.correct === checked;
          row.style.color = isCorrect ? "" : "var(--danger)";
        }
        choicesEl.appendChild(row);
      });
      if (!submitted) {
        const submitBtn = document.createElement("button");
        submitBtn.className = "btn btn-primary";
        submitBtn.style.marginTop = "10px";
        submitBtn.textContent = "Submit";
        submitBtn.addEventListener("click", () => {
          const arr = state.quizAnswers[key][qi];
          arr._submitted = true;
          const allCorrect = q.options.every((opt, oi) => opt.correct === arr.includes(oi));
          allCorrect ? SFX.correct() : SFX.incorrect();
          if (allCorrect) confettiAt(submitBtn, false);
          saveState();
          wrap.innerHTML = ""; renderQuizPage(page, wrap); setupInteractiveVideos(wrap);
          checkQuizComplete();
        });
        choicesEl.appendChild(submitBtn);
      } else if (q.feedback) {
        const allCorrect = q.options.every((opt, oi) => opt.correct === sel.includes(oi));
        fbEl.innerHTML = `${makeFeedbackVideoHtml(allCorrect)}<div class="feedback-box ${allCorrect ? "correct" : "incorrect"}">${escapeHtml(q.feedback)}</div>`;
      }
    }
  });

  function checkQuizComplete() {
    const wasComplete = btnNext.dataset.quizWasComplete === "1";
    const allAnswered = quiz.questions.every((q, qi) => {
      const a = state.quizAnswers[key][qi];
      return q.type === "multi" ? (Array.isArray(a) && a._submitted) : a !== null;
    });
    btnNext.disabled = !allAnswered;
    footerMsg.textContent = allAnswered ? "" : "Answer every question to continue";
    if (allAnswered && !wasComplete) chapterCompleteCelebration();
    btnNext.dataset.quizWasComplete = allAnswered ? "1" : "0";
  }
  checkQuizComplete();
}

/* ================================================================
   FINAL PAGE — One Card to Keep
   ================================================================ */
function computeOverallScore() {
  let total = 0, correct = 0;
  PAGES.filter((p) => p.type === "quiz").forEach((p) => {
    const answers = state.quizAnswers && state.quizAnswers[p.id];
    if (!answers) return;
    p.quiz.questions.forEach((q, qi) => {
      total++;
      const a = answers[qi];
      if (q.type === "multi") {
        const arr = Array.isArray(a) ? a : [];
        if (q.options.every((opt, oi) => opt.correct === arr.includes(oi))) correct++;
      } else if (a !== null && a !== undefined && q.options[a] && q.options[a].correct) {
        correct++;
      }
    });
  });
  return total ? Math.round((correct / total) * 100) : 0;
}

const CERT_SIGNATORIES = [
  { name: `C. Joseph Vijay`, title: `Chief Minister`, title2: `Tamil Nadu` },
  { name: `Mahesh Kumar Aggarwal, IPS`, title: `Head of Tamil Nadu Police`, title2: `` },
  { name: `K. Bhavaneeswari, IPS`, title: `Inspector General of Police (IGP)`, title2: `Singapenn Special Force` }
];

function renderCertificateBlock(wrap) {
  const dateStr = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const certId = "TNP-POCSO-" + new Date().getFullYear() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const score = computeOverallScore();

  const certNode = document.createElement("div");
  certNode.className = "certificate";
  certNode.innerHTML = `
    <div class="cert-corner cert-corner-tl"></div>
    <div class="cert-corner cert-corner-tr"></div>
    <div class="cert-corner cert-corner-bl"></div>
    <div class="cert-corner cert-corner-br"></div>
    <div class="cert-emblem-row">
      <div class="cert-emblem">
        <img src="img/singappen-logo.png" alt="Singappen" class="cert-emblem-img">
        <div class="cert-emblem-label">Singapenn Special<br>Task Force</div>
      </div>
      <div class="cert-emblem">
        <img src="img/tamilnadu-police-logo.png" alt="Tamil Nadu Police" class="cert-emblem-img">
        <div class="cert-emblem-label">Tamil Nadu<br>Police</div>
      </div>
    </div>
    <div class="cert-badge">${svgIcon("cert", 34)}</div>
    <div class="cert-title">Certificate of Completion</div>
    <div class="cert-sub">POCSO Awareness (Age: 18+)</div>
    <div class="cert-body">This is to certify that</div>
    <div class="cert-name">${escapeHtml(state.learnerName || "Learner")}</div>
    <div class="cert-body">has completed the POCSO Adult Awareness Module — covering the definition of a child under the Act, what counts as an offence, the duty to report, and how to respond when a child discloses abuse — with an overall quiz performance of <strong>${score}%</strong>.</div>
    <div class="cert-sign-row">
      ${CERT_SIGNATORIES.map((s) => `
        <div class="cert-sign">
          <div class="cert-sign-line"></div>
          <div class="cert-sign-name">${escapeHtml(s.name)}</div>
          <div class="cert-sign-title">${escapeHtml(s.title)}${s.title2 ? `<br>${escapeHtml(s.title2)}` : ""}</div>
        </div>
      `).join("")}
    </div>
    <div class="cert-id cert-id-footer">Certificate No. ${certId} &middot; ${dateStr}</div>
  `;
  wrap.appendChild(certNode);

  const actions = document.createElement("div");
  actions.className = "cert-actions";
  actions.innerHTML = `
    <button class="btn btn-primary" id="printCertBtn"><span class="btn-icon">${svgIcon("printer", 14)}</span>Download Certificate PDF</button>
  `;
  wrap.appendChild(actions);
  actions.querySelector("#printCertBtn").addEventListener("click", () => { SFX.click(); window.print(); });
}

/* ---------------- Certificate page (own page, separate from the summary card) ---------------- */
function renderCertificatePage(page, wrap) {
  const completeAnim = document.createElement("div");
  completeAnim.innerHTML = makeInteractiveVideoHtml(INTERACTIVE_VIDEOS.moduleComplete, "Module complete animation");
  wrap.appendChild(completeAnim.firstElementChild);

  if (!state.certGenerated) {
    const gate = document.createElement("div");
    gate.className = "cert-gate";
    gate.innerHTML = `
      <h2>Get your certificate</h2>
      <p>Enter your name to generate a certificate of completion for this module.</p>
      <input type="text" class="cert-name-input" id="certNameInput" placeholder="Your full name" value="${escapeHtml(state.learnerName || "")}">
      <button class="btn btn-primary" id="genCertBtn" ${state.learnerName.trim() ? "" : "disabled"}>${svgIcon("cert", 14)} Generate Certificate</button>
    `;
    wrap.appendChild(gate);
    const input = gate.querySelector("#certNameInput");
    const genBtn = gate.querySelector("#genCertBtn");
    input.addEventListener("input", () => {
      state.learnerName = input.value;
      saveState();
      genBtn.disabled = !input.value.trim();
    });
    genBtn.addEventListener("click", () => {
      if (!state.learnerName.trim()) return;
      state.certGenerated = true;
      saveState();
      SFX.complete();
      render();
      setTimeout(() => confettiAt(document.querySelector(".certificate"), true), 250);
    });
    btnNext.disabled = true;
    footerMsg.textContent = "Enter your name and generate your certificate to continue";
  } else {
    renderCertificateBlock(wrap);
    btnNext.disabled = false;
    footerMsg.textContent = "";
  }
}

/* ---------------- One Card to Keep — its own page, read after the certificate ---------------- */
function renderOneCardPage(page, wrap) {
  const card = document.createElement("div");
  card.className = "final-card";
  card.innerHTML = `
    <h1>${escapeHtml(FINAL_CARD.heading)}</h1>
    <div class="intro">${escapeHtml(FINAL_CARD.intro)}</div>
    <ol>${FINAL_CARD.lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ol>
    <div class="contacts">${escapeHtml(FINAL_CARD.contacts)}</div>
    <div class="disclaimer">${escapeHtml(FINAL_CARD.disclaimer)}</div>
    <div class="helpline-logos">
      <img src="img/child-line.jpg" alt="Childline 1098">
      <img src="img/singapen-helpline.png" alt="Singapenn Helpline">
    </div>
  `;
  wrap.appendChild(card);

  const actions = document.createElement("div");
  actions.className = "cert-actions";
  actions.innerHTML = `<button class="btn btn-primary" id="downloadShareBtn"><span class="btn-icon">${svgIcon("printer", 14)}</span>Download and Share</button>`;
  wrap.appendChild(actions);
  actions.querySelector("#downloadShareBtn").addEventListener("click", (e) => downloadAndShareOneCard(e.currentTarget));

  const endSpacer = document.createElement("div");
  endSpacer.className = "page-end-spacer";
  wrap.appendChild(endSpacer);

  btnNext.style.display = "none";
  footerMsg.textContent = "Module complete.";
}

/* --- Render "One Card to Keep" onto a canvas, then download or share it
   as an image (WhatsApp etc. via the Web Share API's file-sharing, where
   supported; otherwise a straight download). No image library needed —
   the card is simple enough to draw directly. --- */
function wrapCanvasText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function buildOneCardCanvas() {
  const W = 1080, H = 1620, PAD = 80;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b2038");
  bg.addColorStop(1, "#132c4a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#c9962e";
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  let y = PAD + 20;
  ctx.textAlign = "center";
  ctx.fillStyle = "#c9962e";
  ctx.font = "700 30px Georgia, serif";
  ctx.fillText("SURAKSHA KAVASAM", W / 2, y);
  y += 40;
  ctx.font = "600 20px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ctx.fillText("POCSO Adult Awareness Module", W / 2, y);
  y += 60;

  ctx.font = "800 46px Georgia, serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(FINAL_CARD.heading, W / 2, y);
  y += 50;

  ctx.font = "italic 24px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.85)";
  wrapCanvasText(ctx, FINAL_CARD.intro, W - PAD * 2).forEach((l) => { ctx.fillText(l, W / 2, y); y += 30; });
  y += 20;

  ctx.textAlign = "left";
  FINAL_CARD.lines.forEach((line, i) => {
    ctx.font = "700 26px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#c9962e";
    ctx.fillText(String(i + 1) + ".", PAD, y);
    ctx.font = "26px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    const wrapped = wrapCanvasText(ctx, line, W - PAD * 2 - 46);
    wrapped.forEach((l, li) => { ctx.fillText(l, PAD + 46, y + li * 34); });
    y += wrapped.length * 34 + 22;
  });

  y += 20;
  ctx.strokeStyle = "rgba(255,255,255,.25)";
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
  y += 44;

  ctx.textAlign = "center";
  ctx.font = "700 22px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#c9962e";
  wrapCanvasText(ctx, FINAL_CARD.contacts, W - PAD * 2).forEach((l) => { ctx.fillText(l, W / 2, y); y += 30; });

  // Helpline logos, side by side, above the disclaimer.
  const [childLineImg, singapenImg] = await Promise.all([
    loadImage("img/child-line.jpg"),
    loadImage("img/singapen-helpline.png")
  ]);
  const logoH = 260;
  const logos = [childLineImg, singapenImg].filter(Boolean);
  if (logos.length) {
    y += 30;
    const gap = 30;
    const widths = logos.map((img) => (img.width / img.height) * logoH);
    const totalW = widths.reduce((a, b) => a + b, 0) + gap * (logos.length - 1);
    let x = W / 2 - totalW / 2;
    logos.forEach((img, i) => {
      ctx.fillStyle = "#ffffff";
      const r = 8;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, widths[i], logoH, r) : ctx.rect(x, y, widths[i], logoH);
      ctx.fill();
      ctx.drawImage(img, x, y, widths[i], logoH);
      x += widths[i] + gap;
    });
    y += logoH + 30;
  }

  y = Math.max(y, H - PAD - 20);
  ctx.font = "italic 18px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.55)";
  wrapCanvasText(ctx, FINAL_CARD.disclaimer, W - PAD * 2).forEach((l) => { ctx.fillText(l, W / 2, y); y += 24; });

  return canvas;
}

async function downloadAndShareOneCard(btn) {
  SFX.click();
  const canvas = await buildOneCardCanvas();
  if (!canvas) { footerMsg.textContent = "Image export isn't supported on this browser."; return; }
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const fileName = "suraksha-kavasam-one-card-to-keep.png";
    const file = new File([blob], fileName, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "One Card to Keep — POCSO Awareness", text: "POCSO Adult Awareness — One Card to Keep" });
        return;
      } catch (e) { /* user cancelled the share sheet — fall through to a plain download */ }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

/* ---------------- Boot ---------------- */
startVideoPreload();
buildSidebar();
render();

const loadingScreen = document.getElementById("loadingScreen");
if (loadingScreen) {
  requestAnimationFrame(() => {
    loadingScreen.classList.add("loading-hidden");
    setTimeout(() => loadingScreen.remove(), 500);
  });
}
