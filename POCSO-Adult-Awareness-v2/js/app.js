/* POCSO Adult Awareness Module — app engine */

if (typeof gsap !== "undefined" && typeof Draggable !== "undefined") gsap.registerPlugin(Draggable, ScrollTrigger);

const STORAGE_KEY = "pocso_adult_progress_v1";

const state = loadState() || {
  currentIndex: 0,
  completedPages: {},
  deckRevealed: {},
  sortPlacements: {},
  sliderValue: {},
  sliderRevealed: {},
  caseAnswers: {},
  caseSubmitted: {},
  commitDone: {},
  learnerName: "",
  certGenerated: false
};

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadState() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
  catch (e) { return null; }
}
function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str; return d.innerHTML; }

/* ---------------- Flatten chapters into a linear page sequence ---------------- */
const PAGES = [];
CHAPTERS.forEach((ch) => {
  ch.screens.forEach((screen, i) => {
    PAGES.push({ id: screen.id, type: "screen", chapter: ch, screen, isFirstInChapter: i === 0 });
  });
  PAGES.push({ id: "quiz-" + ch.num, type: "quiz", chapter: ch, quiz: ch.quiz });
});
PAGES.push({ id: "final", type: "final" });

function currentPage() { return PAGES[state.currentIndex]; }

const stage = document.getElementById("stage");
const btnBack = document.getElementById("btnBack");
const btnNext = document.getElementById("btnNext");
const footerMsg = document.getElementById("footerMsg");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const chapterListEl = document.getElementById("chapterList");

document.getElementById("brandIcon").innerHTML = svgIcon("shield", 26);

/* ---------------- Confetti ---------------- */
function confettiAt(el, big) {
  if (typeof confetti !== "function" || !el) return;
  try {
    const rect = el.getBoundingClientRect();
    confetti({
      particleCount: big ? 110 : 45,
      spread: big ? 90 : 60,
      startVelocity: big ? 42 : 28,
      scalar: big ? 0.95 : 0.8,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      }
    });
  } catch (e) { /* best-effort only */ }
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
    li.innerHTML = `<span class="ch-title"><span class="dot"></span><span>${ch.num} · ${ch.title}</span></span><span class="ch-sub">${ch.duration}</span>`;
    chapterListEl.appendChild(li);
  });
  const finalLi = document.createElement("li");
  finalLi.className = "chapter-item";
  finalLi.dataset.chapter = "final";
  finalLi.innerHTML = `<span class="ch-title"><span class="dot"></span><span>One Card to Keep</span></span>`;
  chapterListEl.appendChild(finalLi);
}
function updateSidebar() {
  const page = currentPage();
  const items = chapterListEl.querySelectorAll(".chapter-item");
  items.forEach((item) => {
    const key = item.dataset.chapter;
    const isFinal = key === "final";
    const isActive = isFinal ? page.type === "final" : (page.chapter && String(page.chapter.num) === key);
    item.classList.toggle("active", isActive);
    const chapterPages = isFinal
      ? PAGES.filter((p) => p.type === "final")
      : PAGES.filter((p) => p.chapter && String(p.chapter.num) === key);
    const done = chapterPages.length > 0 && chapterPages.every((p) => state.completedPages[p.id]);
    item.classList.toggle("done", done);
  });
}

/* ---------------- Progress ---------------- */
const progressChapterLabel = document.getElementById("progressChapterLabel");
function updateProgress() {
  const page = currentPage();
  let scopePages, caption;
  if (page.type === "final") {
    scopePages = PAGES;
    caption = "Overview";
  } else {
    const chNum = page.chapter.num;
    scopePages = PAGES.filter((p) => p.chapter && p.chapter.num === chNum);
    caption = "Chapter " + chNum;
  }
  const done = scopePages.filter((p) => state.completedPages[p.id]).length;
  const pct = Math.round((done / scopePages.length) * 100);
  progressFill.style.width = pct + "%";
  progressLabel.textContent = pct + "%";
  if (progressChapterLabel) progressChapterLabel.textContent = caption;
}

/* ---------------- Navigation ---------------- */
btnBack.addEventListener("click", () => {
  SFX.click(); Speech.stop();
  if (state.currentIndex > 0) { state.currentIndex--; saveState(); render(); }
});
btnNext.addEventListener("click", () => {
  SFX.click(); Speech.stop();
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

  const severity = page.type === "screen" ? (page.screen.severity || "") : (page.type === "final" ? "safe" : "");
  document.body.dataset.severity = severity;

  if (page.type === "screen") renderScreenPage(page, wrap);
  else if (page.type === "quiz") renderQuizPage(page, wrap);
  else if (page.type === "final") renderFinalPage(page, wrap);

  hasRenderedOnce = true;
  updateProgress();
  updateSidebar();
  animateIn(wrap);
  // Desktop scrolls the .stage pane; mobile scrolls the window (the whole
  // page) instead, since the sidebar-independent-scroll shell only applies
  // at the desktop breakpoint. Both calls are harmless no-ops when that
  // element isn't the actual scroll container.
  if (typeof stage.scrollTo === "function") stage.scrollTo({ top: 0, behavior: "smooth" }); else stage.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: "smooth" });
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

  const SEVERITY_LABEL = { danger: "Danger", warning: "Warning", notice: "Notice", safe: "Safe" };
  const sevBadge = screen.severity ? `<span class="severity-badge sev-${screen.severity}">${SEVERITY_LABEL[screen.severity]}</span>` : "";

  const headRow = document.createElement("div");
  headRow.className = "block head-row-flex";
  headRow.innerHTML = `<div class="page-heading">${escapeHtml(screen.heading)}${sevBadge}</div>`;
  wrap.appendChild(headRow);

  let hasReadableContent = false;
  let interactionCheck = null;

  screen.blocks.forEach((block) => {
    const el = renderBlock(block, page, (fn) => { interactionCheck = fn; });
    if (el) {
      el.classList.add("gsap-stagger");
      wrap.appendChild(el);
      if (["p", "quote", "list", "beliefList", "sayNotSay", "table", "interaction"].includes(block.t)) {
        hasReadableContent = true;
      }
    }
  });

  if (hasReadableContent) {
    // Recomputed at play-time: always includes visible text, plus any flip-deck
    // card backs that have already been revealed (never spoils an unrevealed one).
    const speakerBtn = makeSpeakerBtn(() => {
      const els = Array.from(wrap.querySelectorAll("p,li,.belief,.response"));
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
    footerMsg.textContent = ok ? "" : "Complete the interaction above to continue";
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
    case "quote": return renderQuoteBlock(block);
    case "list": return renderListBlock(block);
    case "table": return renderTableBlock(block);
    case "note": return renderNoteBlock(block);
    case "visual": return renderVisualBlock(block, page);
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
  div.innerHTML = `
    <div class="video-slot" data-video-slot="${slotId}">
      <div class="video-slot-head">${svgIcon("video", 16)}${block.heading ? escapeHtml(block.heading.replace(/^\[|\]$/g, "")) : "Video / visual — placeholder"}</div>
      ${block.lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
    </div>`;
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
  } else if (kind === "sortDrag") {
    renderSortDrag(div, page, block, setInteractionCheck);
  } else if (kind === "numberPick") {
    renderNumberPick(div, page, block, setInteractionCheck);
  } else if (kind === "multiSelectCase") {
    renderMultiSelectCase(div, page, block, setInteractionCheck);
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
        confettiAt(container, false);
      }
      notify(document.querySelector("#stage .page"));
    });
    grid.appendChild(card);
  });

  setInteractionCheck(() => block.data.items.every((_, i) => revealed[i]));
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

  function checkComplete() {
    const allCorrect = block.data.items.every((item, i) => placements[i] === item.bin);
    notify(document.querySelector("#stage .page"));
    if (allCorrect) { SFX.complete(); confettiAt(bins, true); }
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
            onComplete: () => { dragInstance.kill(); el.remove(); renderPlacedChip(item); checkComplete(); }
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

  revealBtn.addEventListener("click", () => {
    if (state.sliderValue[key] === undefined) return;
    state.sliderRevealed[key] = true;
    saveState();
    SFX.complete();
    showReveal();
    confettiAt(box, false);
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
      btn.addEventListener("click", () => {
        state.caseSubmitted[key] = true;
        saveState();
        SFX.complete();
        draw();
        confettiAt(box, false);
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
  box.querySelector("#commitBtn").addEventListener("click", () => {
    if (state.commitDone[key]) return;
    state.commitDone[key] = true;
    saveState();
    SFX.confirm();
    confettiAt(box, false);
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
          wrap.innerHTML = ""; renderQuizPage(page, wrap);
          checkQuizComplete();
        });
        choicesEl.appendChild(btn);
      });
      if (answers[qi] !== null) {
        const opt = q.options[answers[qi]];
        const text = opt.correct ? (q.feedbackCorrect || q.feedback) : (q.feedbackIncorrect || q.feedback);
        if (text) fbEl.innerHTML = `<div class="feedback-box ${opt.correct ? "correct" : "incorrect"}">${escapeHtml(text)}</div>`;
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
          wrap.innerHTML = ""; renderQuizPage(page, wrap);
          checkQuizComplete();
        });
        choicesEl.appendChild(submitBtn);
      } else if (q.feedback) {
        fbEl.innerHTML = `<div class="feedback-box correct">${escapeHtml(q.feedback)}</div>`;
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
    if (allAnswered && !wasComplete) confettiAt(document.querySelector(".quiz-box:last-of-type") || wrap, true);
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
    <div class="cert-id">Certificate No. ${certId}</div>
    <div class="cert-badge">${svgIcon("cert", 38)}</div>
    <div class="cert-title">Certificate of Completion</div>
    <div class="cert-sub">POCSO — Adult Awareness Module</div>
    <div class="cert-body">This is to certify that</div>
    <div class="cert-name">${escapeHtml(state.learnerName || "Learner")}</div>
    <div class="cert-body">has completed the POCSO Adult Awareness Module — covering the definition of a child under the Act, what counts as an offence, the duty to report, and how to respond when a child discloses abuse — with an overall quiz performance of <strong>${score}%</strong>.</div>
    <div class="cert-sign-row">
      <div class="cert-sign"><div class="cert-sign-line"></div><div class="cert-sign-label">Date: ${dateStr}</div></div>
      <div class="cert-seal">
        <div class="cert-seal-ring">${svgIcon("shield", 26)}</div>
        <div class="cert-seal-text">OFFICIAL SEAL</div>
      </div>
      <div class="cert-sign"><div class="cert-sign-line"></div><div class="cert-sign-label">${escapeHtml(MODULE_META.issuingAuthority)}</div></div>
    </div>
  `;
  wrap.appendChild(certNode);

  const actions = document.createElement("div");
  actions.className = "cert-actions";
  actions.innerHTML = `
    <button class="btn btn-primary" id="printCertBtn">${svgIcon("printer", 14)} Print / Save as PDF</button>
  `;
  wrap.appendChild(actions);
  actions.querySelector("#printCertBtn").addEventListener("click", () => { SFX.click(); window.print(); });
}

function renderFinalPage(page, wrap) {
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
  } else {
    renderCertificateBlock(wrap);
  }

  const card = document.createElement("div");
  card.className = "final-card";
  card.innerHTML = `
    <h1>${escapeHtml(FINAL_CARD.heading)}</h1>
    <div class="intro">${escapeHtml(FINAL_CARD.intro)}</div>
    <ol>${FINAL_CARD.lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ol>
    <div class="contacts">${escapeHtml(FINAL_CARD.contacts)}</div>
    <div class="disclaimer">${escapeHtml(FINAL_CARD.disclaimer)}</div>
  `;
  wrap.appendChild(card);

  const visual = document.createElement("div");
  visual.className = "block";
  visual.style.marginTop = "16px";
  visual.innerHTML = `
    <div class="video-slot">
      <div class="video-slot-head">${svgIcon("video", 16)} Video / visual — placeholder</div>
      <p>${escapeHtml(FINAL_CARD.visual)}</p>
    </div>`;
  wrap.appendChild(visual);

  btnNext.style.display = "none";
  footerMsg.textContent = "Module complete.";
}

/* ---------------- Boot ---------------- */
buildSidebar();
render();
