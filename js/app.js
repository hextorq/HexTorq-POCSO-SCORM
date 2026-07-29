/* Suraksha Kavasam — app engine (GSAP-driven, no framework) */

gsap.registerPlugin(Draggable, ScrollTrigger);

const STORAGE_KEY = "suraksha_progress_v1";

const state = loadState() || {
  learnerName: "",
  currentIndex: 0,
  completedScreens: {},     // screenId -> true
  quizAnswers: {},          // screenId -> [selectedOptionIndex...]
  sortPlacements: {},       // screenId -> { itemIndex: binId }
  revealedCards: {},        // screenId -> { cardIndex: true }
  scenarioProgress: {},     // screenId -> { stepIndex, answered: [choiceIndex|null] }
  finalPassed: false,
  finalScorePct: null
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

const stage = document.getElementById("stage");
const btnBack = document.getElementById("btnBack");
const btnNext = document.getElementById("btnNext");
const footerMsg = document.getElementById("footerMsg");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const chapterListEl = document.getElementById("chapterList");

document.getElementById("brandIcon").innerHTML = svgIcon("shield", 26);

function currentScreen() { return SCREENS[state.currentIndex]; }
function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str; return d.innerHTML; }

/* ---------------- Per-chapter theme + floating ambient shapes ---------------- */
let ambientTweens = [];
const ambientLayer = document.getElementById("ambientLayer");
let lastThemeKey = null;

function themeKeyFor(screen) {
  if (screen.chapter) return String(screen.chapter);
  if (screen.id === "final-intro" || screen.id === "final-quiz") return "final";
  if (screen.id === "certificate") return "certificate";
  return "welcome";
}

function applyChapterTheme(screen) {
  const key = themeKeyFor(screen);
  document.body.dataset.chapter = key;
  if (key === lastThemeKey) return;
  const isFirstLoad = lastThemeKey === null;
  lastThemeKey = key;
  spawnAmbientShapes();
  if (!isFirstLoad) SFX.transition();
}

function spawnAmbientShapes() {
  ambientTweens.forEach(t => t.kill());
  ambientTweens = [];
  ambientLayer.innerHTML = "";
  const count = window.innerWidth < 700 ? 4 : 7;
  for (let i = 0; i < count; i++) {
    const shape = document.createElement("div");
    shape.className = "ambient-shape";
    const size = 60 + Math.random() * 160;
    shape.style.width = size + "px";
    shape.style.height = size + "px";
    shape.style.left = Math.random() * 100 + "%";
    shape.style.top = Math.random() * 100 + "%";
    ambientLayer.appendChild(shape);
    const tween = gsap.to(shape, {
      x: (Math.random() - 0.5) * 120,
      y: (Math.random() - 0.5) * 120,
      duration: 8 + Math.random() * 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: Math.random() * 2
    });
    ambientTweens.push(tween);
  }
}

/* ---------------- Fullscreen toggle ---------------- */
const fullscreenBtn = document.getElementById("fullscreenBtn");
function updateFullscreenIcon() {
  const isFs = !!document.fullscreenElement;
  fullscreenBtn.innerHTML = svgIcon(isFs ? "collapse" : "expand", 18);
  fullscreenBtn.title = isFs ? "Exit full-screen" : "Enter full-screen mode";
  document.body.classList.toggle("fullscreen-mode", isFs);
}
if (document.fullscreenEnabled) {
  fullscreenBtn.addEventListener("click", () => {
    SFX.click();
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  document.addEventListener("fullscreenchange", updateFullscreenIcon);
  updateFullscreenIcon();
} else {
  fullscreenBtn.style.display = "none";
}

/* ---------------- Confetti + feedback helpers ---------------- */
function confettiAt(el, big) {
  if (typeof confetti !== "function" || !el) return;
  try {
    const rect = el.getBoundingClientRect();
    confetti({
      particleCount: big ? 130 : 55,
      spread: big ? 100 : 65,
      startVelocity: big ? 45 : 30,
      scalar: big ? 1 : 0.85,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      }
    });
  } catch (e) { /* confetti best-effort only */ }
}
function vibrate(pattern) {
  if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) { /* best-effort only */ } }
}
function flashBox(el, kind) {
  if (!el) return;
  el.classList.remove("flash-correct", "flash-wrong");
  void el.offsetWidth; // restart animation if triggered again quickly
  el.classList.add(kind === "correct" ? "flash-correct" : "flash-wrong");
  setTimeout(() => el.classList.remove("flash-correct", "flash-wrong"), 700);
}
function feedbackCorrect(el, big) {
  SFX.correct();
  vibrate(40);
  gsap.fromTo(el, { scale: 1 }, { scale: 1.045, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut" });
  confettiAt(el, big);
}
function feedbackIncorrect(el) {
  SFX.incorrect();
  vibrate([25, 40, 25]);
  gsap.fromTo(el, { x: 0 }, { x: -8, duration: 0.06, repeat: 5, yoyo: true, ease: "power1.inOut", onComplete: () => gsap.set(el, { x: 0 }) });
}

/* Dropped on a valid-but-wrong box: park the item there (don't snap it away) and
   flash the box red, so the learner sees exactly which pairing is wrong and can
   drag it straight to the correct box. */
function handleWrongDrop(el, container, boxEl) {
  SFX.incorrect();
  vibrate([25, 40, 25]);
  container.appendChild(el);
  gsap.set(el, { x: 0, y: 0, zIndex: "auto" });
  gsap.fromTo(el, { scale: 1.06 }, { scale: 1, duration: 0.25, ease: "power1.out" });
  flashBox(boxEl, "wrong");
}

/* ---------------- Auto read-aloud (starts 5s after a screen loads) ---------------- */
let autoReadTimer = null;
function clearAutoRead() {
  if (autoReadTimer) { clearTimeout(autoReadTimer); autoReadTimer = null; }
}
function scheduleAutoRead(getElements, btn) {
  clearAutoRead();
  autoReadTimer = setTimeout(() => {
    if (Speech.speaking) return;
    SFX.ensureCtx();
    const els = typeof getElements === "function" ? getElements() : getElements;
    if (btn) { btn.innerHTML = svgIcon("volumeOff", 18); btn.classList.add("speaking"); }
    Speech.speak(els, () => { if (btn) { btn.innerHTML = svgIcon("volume", 18); btn.classList.remove("speaking"); } });
  }, 5000);
}

/* ---------------- Read-aloud button ---------------- */
function makeSpeakerBtn(getElements, extraClass) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "speaker-btn" + (extraClass ? " " + extraClass : "");
  btn.innerHTML = svgIcon("volume", 18);
  btn.title = "Read aloud";
  btn.setAttribute("aria-label", "Read this section aloud");
  if (!Speech.supported) { btn.style.display = "none"; return btn; }
  btn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (Speech.speaking) {
      Speech.stop();
      btn.innerHTML = svgIcon("volume", 18);
      btn.classList.remove("speaking");
      return;
    }
    SFX.ensureCtx();
    btn.innerHTML = svgIcon("volumeOff", 18);
    btn.classList.add("speaking");
    const els = typeof getElements === "function" ? getElements() : getElements;
    Speech.speak(els, () => {
      btn.innerHTML = svgIcon("volume", 18);
      btn.classList.remove("speaking");
    });
  });
  return btn;
}

/* ---------------- Sidebar ---------------- */
function buildSidebar() {
  const chapters = [];
  SCREENS.forEach(s => {
    if (s.chapter && !chapters.find(c => c.num === s.chapter)) {
      chapters.push({ num: s.chapter, title: s.chapterTitle || ("Chapter " + s.chapter) });
    }
  });
  chapterListEl.innerHTML = "";
  chapters.forEach(c => {
    const li = document.createElement("li");
    li.className = "chapter-item";
    li.dataset.chapter = c.num;
    li.innerHTML = `<span class="dot"></span><span>${c.num}. ${c.title}</span>`;
    chapterListEl.appendChild(li);
  });
  const finalLi = document.createElement("li");
  finalLi.className = "chapter-item";
  finalLi.dataset.chapter = "final";
  finalLi.innerHTML = `<span class="dot"></span><span>Final Assessment</span>`;
  chapterListEl.appendChild(finalLi);
}

function updateSidebar() {
  const cur = currentScreen();
  const items = chapterListEl.querySelectorAll(".chapter-item");
  items.forEach(item => {
    const chNum = item.dataset.chapter;
    const isFinal = chNum === "final";
    const isActive = isFinal
      ? (cur.id === "final-intro" || cur.id === "final-quiz" || cur.id === "certificate")
      : String(cur.chapter) === chNum;
    item.classList.toggle("active", isActive);

    const chapterScreens = isFinal
      ? SCREENS.filter(s => s.id === "final-quiz")
      : SCREENS.filter(s => s.chapter == chNum);
    const done = chapterScreens.length > 0 && chapterScreens.every(s => state.completedScreens[s.id]);
    item.classList.toggle("done", done);
  });
}

/* ---------------- Progress bar ---------------- */
function updateProgress() {
  const total = SCREENS.length;
  const done = Object.keys(state.completedScreens).length;
  const pct = Math.round((done / total) * 100);
  gsap.to(progressFill, { width: pct + "%", duration: 0.5, ease: "power2.out" });
  progressLabel.textContent = pct + "%";
}

/* ---------------- Navigation ---------------- */
btnBack.addEventListener("click", () => {
  SFX.click();
  Speech.stop();
  clearAutoRead();
  if (state.currentIndex > 0) {
    state.currentIndex--;
    saveState();
    render();
  }
});

btnNext.addEventListener("click", () => {
  SFX.click();
  Speech.stop();
  clearAutoRead();
  markComplete(currentScreen().id);
  if (state.currentIndex < SCREENS.length - 1) {
    state.currentIndex++;
    saveState();
    render();
  }
});

function markComplete(id) {
  state.completedScreens[id] = true;
  saveState();
}

/* ---------------- GSAP screen-in animation ---------------- */
const scrollProgressEl = document.getElementById("scrollProgress");
const scrollCueEl = document.getElementById("scrollCue");
scrollCueEl.innerHTML = svgIcon("chevronDown", 18);
scrollCueEl.addEventListener("click", () => {
  SFX.click();
  window.scrollBy({ top: window.innerHeight * 0.7, behavior: "smooth" });
});
window.addEventListener("scroll", () => {
  if (window.scrollY > 140) scrollCueEl.classList.remove("visible");
}, { passive: true });

function animateScreenIn(wrap) {
  ScrollTrigger.getAll().forEach(t => t.kill());
  gsap.killTweensOf(wrap);
  gsap.fromTo(wrap, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" });

  const targets = wrap.querySelectorAll(".gsap-stagger");
  if (targets.length) {
    gsap.set(targets, { autoAlpha: 0, y: 18 });
    ScrollTrigger.batch(targets, {
      start: "top 94%",
      once: true,
      onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09, ease: "power2.out", overwrite: true })
    });
  }

  // Page scroll progress bar, tied to how far the learner has scrolled this screen.
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: self => { scrollProgressEl.style.width = (self.progress * 100) + "%"; }
  });

  // Ambient background shapes drift opposite to scroll for a soft parallax-depth effect.
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    onUpdate: self => gsap.set(ambientLayer, { y: self.progress * -70 })
  });

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    const scrollable = document.body.scrollHeight > window.innerHeight + 120;
    scrollCueEl.classList.toggle("visible", scrollable);
  });
}

/* ---------------- Main render dispatch ---------------- */
function render() {
  clearAutoRead();
  const screen = currentScreen();
  stage.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "screen";
  stage.appendChild(wrap);

  btnBack.disabled = state.currentIndex === 0;
  btnBack.style.display = "";
  btnNext.style.display = "";
  btnNext.disabled = false;
  footerMsg.textContent = "";

  applyChapterTheme(screen);
  document.body.classList.toggle("wide-screen", screen.type === "sort" || screen.type === "match");

  switch (screen.type) {
    case "welcome": renderWelcome(screen, wrap); break;
    case "info": renderInfo(screen, wrap); break;
    case "reveal": renderReveal(screen, wrap); break;
    case "sort": renderSort(screen, wrap); break;
    case "match": renderMatch(screen, wrap); break;
    case "scenario": renderScenario(screen, wrap); break;
    case "quiz": renderQuiz(screen, wrap); break;
    case "final": renderFinal(screen, wrap); break;
    case "certificate": renderCertificate(screen, wrap); break;
  }

  updateProgress();
  updateSidebar();
  animateScreenIn(wrap);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------- Screen: Welcome ---------------- */
function renderWelcome(screen, wrap) {
  wrap.innerHTML = `
    <div class="welcome-box">
      <div class="icon-hero gsap-stagger">${svgIcon("shield", 56)}</div>
      <h1 class="gsap-stagger" id="welcomeTitle">${screen.title}</h1>
      <div id="welcomeBody">${screen.body.map((p, i) => `<p class="gsap-stagger" id="wp${i}">${p}</p>`).join("")}</div>
      <input id="nameInput" class="name-input gsap-stagger" placeholder="Type your name to begin" value="${escapeHtml(state.learnerName || "")}" />
      <div class="meta-row gsap-stagger">
        <span class="meta-pill">${svgIcon("clock", 14)} ~${MODULE_META.estimatedMinutes} minutes</span>
        <span class="meta-pill">${svgIcon("book", 14)} 5 chapters</span>
        <span class="meta-pill">${svgIcon("cert", 14)} Certificate on completion</span>
      </div>
    </div>
  `;
  const paras = Array.from(wrap.querySelectorAll("#welcomeBody p"));
  const titleEl = wrap.querySelector("#welcomeTitle");
  const welcomeSpeaker = makeSpeakerBtn([titleEl, ...paras], "speaker-btn-inline");
  wrap.querySelector(".welcome-box").insertBefore(welcomeSpeaker, wrap.querySelector("#nameInput"));
  scheduleAutoRead([titleEl, ...paras], welcomeSpeaker);

  const input = wrap.querySelector("#nameInput");
  input.addEventListener("input", () => { state.learnerName = input.value; saveState(); updateNextButton(); });
  btnNext.textContent = "Start →";
  updateNextButton();

  function updateNextButton() {
    btnNext.disabled = state.learnerName.trim().length === 0;
    footerMsg.textContent = btnNext.disabled ? "Enter your name to begin" : "";
  }
}

/* ---------------- Screen: Info ---------------- */
function renderInfo(screen, wrap) {
  wrap.innerHTML = `
    ${screen.chapter ? `<div class="chapter-tag gsap-stagger">Chapter ${screen.chapter}</div>` : ""}
    ${screen.icon ? `<div class="icon-hero gsap-stagger">${svgIcon(screen.icon, 44)}</div>` : ""}
    <div class="title-row gsap-stagger"><h1 id="infoTitle">${screen.title}</h1></div>
    <div id="infoBody">${screen.body.map((p, i) => `<p class="gsap-stagger" id="ip${i}">${p}</p>`).join("")}</div>
  `;
  const titleEl = wrap.querySelector("#infoTitle");
  const paras = Array.from(wrap.querySelectorAll("#infoBody p"));
  const infoSpeaker = makeSpeakerBtn([titleEl, ...paras]);
  wrap.querySelector(".title-row").appendChild(infoSpeaker);
  scheduleAutoRead([titleEl, ...paras], infoSpeaker);

  btnNext.disabled = false;
  btnNext.textContent = "Continue →";
}

/* ---------------- Screen: Reveal (GSAP 3D flip cards) ---------------- */
function renderReveal(screen, wrap) {
  if (!state.revealedCards[screen.id]) state.revealedCards[screen.id] = {};
  const revealed = state.revealedCards[screen.id];

  wrap.innerHTML = `
    ${screen.chapter ? `<div class="chapter-tag gsap-stagger">Chapter ${screen.chapter}</div>` : ""}
    <div class="title-row gsap-stagger"><h2 id="revealTitle">${screen.title}</h2></div>
    <p class="instruction gsap-stagger">${screen.instruction}</p>
    <div class="card-grid" id="cardGrid"></div>
  `;
  wrap.querySelector(".title-row").appendChild(makeSpeakerBtn(() => [wrap.querySelector("#revealTitle")]));

  const grid = wrap.querySelector("#cardGrid");
  const variants = ["flip", "pop", "slide"];

  screen.cards.forEach((card, i) => {
    const variant = variants[i % variants.length];
    const el = document.createElement("div");
    el.className = `flip-card gsap-stagger variant-${variant}`;
    el.innerHTML = `
      <div class="flip-inner">
        <div class="flip-face flip-front">
          <div class="front-text">${card.front}</div>
          <div class="tap-hint">Tap to reveal</div>
        </div>
        <div class="flip-face flip-back">
          <div class="back-text">${card.back}</div>
        </div>
      </div>`;
    const inner = el.querySelector(".flip-inner");
    const front = el.querySelector(".flip-front");
    const back = el.querySelector(".flip-back");
    const backText = el.querySelector(".back-text");

    // Set each variant's resting (unrevealed) state.
    if (variant === "flip") gsap.set(back, { rotationY: 180 });
    else if (variant === "pop") gsap.set(back, { scale: 0.55, autoAlpha: 0 });
    else if (variant === "slide") gsap.set(back, { xPercent: 115, autoAlpha: 0 });

    if (revealed[i]) {
      if (variant === "flip") gsap.set(inner, { rotationY: 180 });
      else if (variant === "pop") { gsap.set(front, { scale: 0.7, autoAlpha: 0 }); gsap.set(back, { scale: 1, autoAlpha: 1 }); }
      else if (variant === "slide") { gsap.set(front, { xPercent: -115, autoAlpha: 0 }); gsap.set(back, { xPercent: 0, autoAlpha: 1 }); }
    }

    el.addEventListener("click", () => {
      if (revealed[i]) return;
      revealed[i] = true;
      saveState();
      SFX.click();
      if (variant === "flip") {
        gsap.to(inner, { rotationY: 180, duration: 0.65, ease: "back.out(1.4)" });
      } else if (variant === "pop") {
        gsap.to(front, { scale: 0.6, autoAlpha: 0, duration: 0.28, ease: "power1.in" });
        gsap.to(back, { scale: 1, autoAlpha: 1, duration: 0.5, delay: 0.14, ease: "back.out(2.2)" });
      } else if (variant === "slide") {
        gsap.to(front, { xPercent: -115, autoAlpha: 0, duration: 0.45, ease: "power2.inOut" });
        gsap.to(back, { xPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power2.inOut" });
      }
      checkRevealComplete();
    });

    const miniSpeaker = makeSpeakerBtn(() => [backText], "speaker-btn-inline");
    miniSpeaker.style.marginTop = "6px";
    back.appendChild(miniSpeaker);

    grid.appendChild(el);
  });
  checkRevealComplete();

  function checkRevealComplete() {
    const allRevealed = screen.cards.every((_, i) => revealed[i]);
    btnNext.disabled = !allRevealed;
    footerMsg.textContent = allRevealed ? "" : `Reveal all ${screen.cards.length} cards to continue`;
    btnNext.textContent = "Continue →";
  }
}

/* ---------------- Screen: Sort (real GSAP Draggable drag-and-drop) ---------------- */
function renderSort(screen, wrap) {
  if (!state.sortPlacements[screen.id]) state.sortPlacements[screen.id] = {};
  const placements = state.sortPlacements[screen.id];
  wrap.classList.add("wide");

  wrap.innerHTML = `
    ${screen.chapter ? `<div class="chapter-tag gsap-stagger">Chapter ${screen.chapter}</div>` : ""}
    <h2 class="gsap-stagger">${screen.title}</h2>
    <p class="instruction gsap-stagger">${screen.instruction}<span class="drag-hint">Drag each card into the box where it belongs — works with touch too.</span></p>
    <div class="sort-pool" id="sortPool"></div>
    <div class="sort-bins" id="sortBins"></div>
  `;
  const pool = wrap.querySelector("#sortPool");
  const binsEl = wrap.querySelector("#sortBins");

  screen.bins.forEach(bin => {
    const binEl = document.createElement("div");
    binEl.className = "sort-bin gsap-stagger";
    binEl.dataset.binId = bin.id;
    binEl.innerHTML = `<h3>${bin.label}</h3><div class="bin-drop-area"></div>`;
    binsEl.appendChild(binEl);
  });

  function renderPlacedChip(item) {
    const dropArea = binsEl.querySelector(`[data-bin-id="${item.bin}"] .bin-drop-area`);
    const chip = document.createElement("div");
    chip.className = "bin-item";
    chip.textContent = item.text;
    dropArea.appendChild(chip);
    gsap.from(chip, { autoAlpha: 0, scale: 0.85, duration: 0.3, ease: "back.out(1.5)" });
  }

  function checkComplete() {
    const allCorrect = screen.items.every((item, i) => placements[i] === item.bin);
    btnNext.disabled = !allCorrect;
    footerMsg.textContent = allCorrect ? "" : "Drag every card into the correct box to continue";
    btnNext.textContent = "Continue →";
    if (allCorrect) {
      SFX.complete();
      confettiAt(binsEl, true);
    }
  }

  screen.items.forEach((item, i) => {
    if (placements[i] !== undefined) {
      renderPlacedChip(item);
      return;
    }
    const el = document.createElement("div");
    el.className = "sort-item gsap-stagger";
    el.textContent = item.text;
    pool.appendChild(el);

    Draggable.create(el, {
      type: "x,y",
      // No bounds: the card can be dragged anywhere on the page, not just inside this panel.
      onDragStart: function () {
        el.classList.add("dragging");
        gsap.set(el, { zIndex: 999 });
      },
      onDragEnd: function () {
        el.classList.remove("dragging");
        const dropArea = screen.bins
          .map(b => binsEl.querySelector(`[data-bin-id="${b.id}"] .bin-drop-area`))
          .find(area => Draggable.hitTest(el, area, "40%"));

        if (!dropArea) {
          gsap.to(el, { x: 0, y: 0, duration: 0.35, ease: "power2.out" });
          return;
        }

        const binEl = dropArea.closest(".sort-bin");
        const binId = binEl.dataset.binId;
        const dragInstance = this;

        if (binId === item.bin) {
          placements[i] = binId;
          saveState();
          SFX.correct();
          vibrate(40);
          flashBox(binEl, "correct");
          const targetRect = dropArea.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          gsap.to(el, {
            x: "+=" + (targetRect.left + targetRect.width / 2 - (elRect.left + elRect.width / 2)),
            y: "+=" + (targetRect.top + targetRect.height / 2 - (elRect.top + elRect.height / 2)),
            scale: 0.85,
            autoAlpha: 0,
            duration: 0.35,
            ease: "power1.in",
            onComplete: () => {
              dragInstance.kill();
              el.remove();
              renderPlacedChip(item);
              checkComplete();
            }
          });
        } else {
          handleWrongDrop(el, dropArea, binEl);
          checkComplete();
        }
      }
    });
  });

  checkComplete();
}

/* ---------------- Screen: Match the following (GSAP Draggable, unique targets) ---------------- */
function renderMatch(screen, wrap) {
  if (!state.sortPlacements[screen.id]) state.sortPlacements[screen.id] = {};
  const placements = state.sortPlacements[screen.id]; // itemIndex -> pairIndex it was dropped on
  wrap.classList.add("wide");

  wrap.innerHTML = `
    ${screen.chapter ? `<div class="chapter-tag gsap-stagger">Chapter ${screen.chapter}</div>` : ""}
    <h2 class="gsap-stagger">${screen.title}</h2>
    <p class="instruction gsap-stagger">${screen.instruction}</p>
    <div class="match-columns">
      <div class="match-left" id="matchLeft"></div>
      <div class="match-right" id="matchRight"></div>
    </div>
  `;
  const leftCol = wrap.querySelector("#matchLeft");
  const rightCol = wrap.querySelector("#matchRight");

  // Right-side targets keep a fixed, shuffled order so the match isn't positionally obvious.
  const order = screen.pairs.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const seed = (screen.id.length + i * 7) % (i + 1);
    [order[i], order[seed]] = [order[seed], order[i]];
  }
  order.forEach(pairIdx => {
    const target = document.createElement("div");
    target.className = "match-target gsap-stagger";
    target.dataset.pairIndex = pairIdx;
    target.textContent = screen.pairs[pairIdx].right;
    rightCol.appendChild(target);
  });

  function checkComplete() {
    const allCorrect = screen.pairs.every((_, i) => placements[i] === i);
    btnNext.disabled = !allCorrect;
    footerMsg.textContent = allCorrect ? "" : "Match every item on the left to its meaning on the right";
    btnNext.textContent = "Continue →";
    if (allCorrect) {
      SFX.complete();
      confettiAt(rightCol, true);
    }
  }

  function lockTarget(pairIdx, text) {
    const target = rightCol.querySelector(`[data-pair-index="${pairIdx}"]`);
    target.classList.add("filled");
    target.textContent = `${text} → ${screen.pairs[pairIdx].right}`;
    gsap.from(target, { scale: 0.96, duration: 0.3, ease: "back.out(1.5)" });
  }

  screen.pairs.forEach((pair, i) => {
    if (placements[i] === i) { lockTarget(i, pair.left); return; }

    const el = document.createElement("div");
    el.className = "match-item gsap-stagger";
    el.textContent = pair.left;
    leftCol.appendChild(el);

    Draggable.create(el, {
      type: "x,y",
      // No bounds: the card can be dragged anywhere on the page, not just inside this panel.
      onDragStart: function () { el.classList.add("dragging"); gsap.set(el, { zIndex: 999 }); },
      onDragEnd: function () {
        el.classList.remove("dragging");
        const targets = Array.from(rightCol.querySelectorAll(".match-target"));
        const target = targets.find(t => Draggable.hitTest(el, t, "40%"));
        const dragInstance = this;

        if (!target) {
          gsap.to(el, { x: 0, y: 0, duration: 0.35, ease: "power2.out" });
          return;
        }
        const targetPairIdx = Number(target.dataset.pairIndex);

        if (targetPairIdx === i) {
          placements[i] = i;
          saveState();
          SFX.correct();
          vibrate(40);
          flashBox(target, "correct");
          const targetRect = target.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          gsap.to(el, {
            x: "+=" + (targetRect.left + targetRect.width / 2 - (elRect.left + elRect.width / 2)),
            y: "+=" + (targetRect.top + targetRect.height / 2 - (elRect.top + elRect.height / 2)),
            scale: 0.85, autoAlpha: 0, duration: 0.35, ease: "power1.in",
            onComplete: () => {
              dragInstance.kill();
              el.remove();
              lockTarget(i, pair.left);
              checkComplete();
            }
          });
        } else {
          handleWrongDrop(el, target, target);
          checkComplete();
        }
      }
    });
  });

  checkComplete();
}

/* ---------------- Screen: Scenario (branching) ---------------- */
function renderScenario(screen, wrap) {
  if (!state.scenarioProgress[screen.id]) {
    state.scenarioProgress[screen.id] = { stepIndex: 0, answered: screen.steps.map(() => null) };
  }
  const prog = state.scenarioProgress[screen.id];
  const moodIcon = { tense: "alert", safe: "shield", resolved: "check" };
  draw();

  function draw() {
    const step = screen.steps[prog.stepIndex];
    const chosen = prog.answered[prog.stepIndex];
    const mood = step.mood || "safe";

    wrap.innerHTML = `
      ${screen.chapter ? `<div class="chapter-tag">Chapter ${screen.chapter}</div>` : ""}
      <div class="title-row"><h2 id="scenarioTitle">${screen.title}</h2></div>
      <div class="scenario-box mood-${mood}">
        <div class="scenario-mood-icon">${svgIcon(moodIcon[mood] || "shield", 64)}</div>
        <div class="scenario-narration" id="scenarioNarration"></div>
        <div class="scenario-question" id="scenarioQuestion">${step.question}</div>
        <div id="choices"></div>
        <div id="feedback"></div>
      </div>
      <p class="instruction" style="margin-top:10px">Step ${prog.stepIndex + 1} of ${screen.steps.length}</p>
    `;
    const scenarioSpeaker = makeSpeakerBtn(() => [
      wrap.querySelector("#scenarioNarration"), wrap.querySelector("#scenarioQuestion")
    ]);
    wrap.querySelector(".title-row").appendChild(scenarioSpeaker);
    scheduleAutoRead(() => [wrap.querySelector("#scenarioNarration"), wrap.querySelector("#scenarioQuestion")], scenarioSpeaker);

    const scenarioBox = wrap.querySelector(".scenario-box");
    gsap.fromTo(scenarioBox, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" });
    if (mood === "tense") SFX.tension(); else SFX.transition();

    // Typewriter-style narration reveal: words fade/rise in one after another.
    const narrationEl = wrap.querySelector("#scenarioNarration");
    const words = step.narration.split(" ");
    narrationEl.innerHTML = words.map(w => `<span class="sw">${escapeHtml(w)}</span>`).join(" ");
    gsap.to(narrationEl.querySelectorAll(".sw"), { autoAlpha: 1, duration: 0.25, stagger: 0.035, ease: "none" });

    const choicesEl = wrap.querySelector("#choices");
    const feedbackEl = wrap.querySelector("#feedback");

    step.choices.forEach((choice, i) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = choice.text;
      if (chosen !== null) {
        btn.disabled = true;
        if (i === chosen) btn.classList.add(choice.correct ? "correct" : "incorrect");
        if (choice.correct && i !== chosen) btn.classList.add("correct");
      }
      btn.addEventListener("click", () => {
        if (prog.answered[prog.stepIndex] !== null) return;
        prog.answered[prog.stepIndex] = i;
        saveState();
        choicesEl.querySelectorAll(".choice-btn").forEach(b => b.disabled = true);
        if (choice.correct) feedbackCorrect(btn); else feedbackIncorrect(btn);
        setTimeout(draw, 550);
      });
      choicesEl.appendChild(btn);
    });

    if (chosen !== null) {
      const choice = step.choices[chosen];
      feedbackEl.innerHTML = `<div class="feedback-box ${choice.correct ? "correct" : "incorrect"}">${choice.feedback}</div>`;
      gsap.from(feedbackEl.firstElementChild, { autoAlpha: 0, y: 8, duration: 0.35 });
    }

    const isLastStep = prog.stepIndex === screen.steps.length - 1;
    if (chosen !== null && !isLastStep) {
      const contBtn = document.createElement("button");
      contBtn.className = "btn btn-outline";
      contBtn.style.marginTop = "14px";
      contBtn.textContent = "Continue the story →";
      contBtn.addEventListener("click", () => { SFX.click(); prog.stepIndex++; saveState(); draw(); });
      wrap.querySelector(".scenario-box").appendChild(contBtn);
    }

    const scenarioComplete = prog.answered.every(a => a !== null);
    btnNext.disabled = !scenarioComplete;
    footerMsg.textContent = scenarioComplete ? "" : "Complete the story to continue";
    btnNext.textContent = "Continue →";
  }
}

/* ---------------- Screen: Chapter Quiz ---------------- */
function renderQuiz(screen, wrap) {
  if (!state.quizAnswers[screen.id]) state.quizAnswers[screen.id] = screen.questions.map(() => null);
  const answers = state.quizAnswers[screen.id];

  wrap.innerHTML = `
    ${screen.chapter ? `<div class="chapter-tag gsap-stagger">Chapter ${screen.chapter}</div>` : ""}
    <h2 class="gsap-stagger">${screen.title}</h2>
    <div id="qList"></div>
  `;
  const qList = wrap.querySelector("#qList");

  screen.questions.forEach((q, qi) => {
    const box = document.createElement("div");
    box.className = "scenario-box gsap-stagger";
    box.style.marginBottom = "14px";
    box.innerHTML = `
      <div class="title-row"><div class="scenario-question" id="qq${qi}">${qi + 1}. ${q.q}</div></div>
      <div class="choices-${qi}"></div><div class="fb-${qi}"></div>`;
    qList.appendChild(box);
    box.querySelector(".title-row").appendChild(makeSpeakerBtn(() => [box.querySelector(`#qq${qi}`)], "speaker-btn-inline"));

    const choicesEl = box.querySelector(`.choices-${qi}`);
    const fbEl = box.querySelector(`.fb-${qi}`);

    q.options.forEach((opt, oi) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = opt;
      const chosen = answers[qi];
      if (chosen !== null) {
        btn.disabled = true;
        if (oi === chosen) btn.classList.add(oi === q.correct ? "correct" : "incorrect");
        if (oi === q.correct && oi !== chosen) btn.classList.add("correct");
      }
      btn.addEventListener("click", () => {
        if (answers[qi] !== null) return;
        answers[qi] = oi;
        saveState();
        choicesEl.querySelectorAll(".choice-btn").forEach(b => b.disabled = true);
        if (oi === q.correct) feedbackCorrect(btn); else feedbackIncorrect(btn);
        setTimeout(() => renderQuiz(screen, wrap), 550);
      });
      choicesEl.appendChild(btn);
    });
    if (answers[qi] !== null) {
      const isCorrect = answers[qi] === q.correct;
      fbEl.innerHTML = `<div class="feedback-box ${isCorrect ? "correct" : "incorrect"}">${q.explain}</div>`;
    }
  });

  const allAnswered = answers.every(a => a !== null);
  btnNext.disabled = !allAnswered;
  footerMsg.textContent = allAnswered ? "" : "Answer all questions to continue";
  btnNext.textContent = "Continue →";
}

/* ---------------- Screen: Final Assessment ---------------- */
function renderFinal(screen, wrap) {
  if (!state.quizAnswers[screen.id]) state.quizAnswers[screen.id] = screen.questions.map(() => null);
  const answers = state.quizAnswers[screen.id];
  const allAnswered = answers.every(a => a !== null);

  if (!allAnswered) renderFinalQuestions(); else renderFinalResult();

  function renderFinalQuestions() {
    wrap.innerHTML = `<h2 class="gsap-stagger">${screen.title}</h2><p class="instruction gsap-stagger">Answer all ${screen.questions.length} questions, then submit.</p><div id="qList"></div>`;
    const qList = wrap.querySelector("#qList");
    screen.questions.forEach((q, qi) => {
      const box = document.createElement("div");
      box.className = "scenario-box gsap-stagger";
      box.style.marginBottom = "14px";
      box.innerHTML = `<div class="scenario-question">${qi + 1}. ${q.q}</div><div class="choices-${qi}"></div>`;
      qList.appendChild(box);
      const choicesEl = box.querySelector(`.choices-${qi}`);
      q.options.forEach((opt, oi) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn" + (answers[qi] === oi ? " selected" : "");
        if (answers[qi] === oi) btn.style.borderColor = "var(--accent)";
        btn.textContent = opt;
        btn.addEventListener("click", () => {
          SFX.click();
          answers[qi] = oi;
          saveState();
          renderFinal(screen, wrap);
        });
        choicesEl.appendChild(btn);
      });
    });
    btnNext.disabled = true;
    footerMsg.textContent = `Answer all questions (${answers.filter(a => a !== null).length}/${screen.questions.length})`;
    btnNext.textContent = "Continue →";

    const submitBtn = document.createElement("button");
    submitBtn.className = "btn btn-primary gsap-stagger";
    submitBtn.textContent = "Submit Assessment";
    submitBtn.style.marginTop = "10px";
    submitBtn.disabled = !answers.every(a => a !== null);
    submitBtn.addEventListener("click", () => renderFinal(screen, wrap));
    wrap.appendChild(submitBtn);
  }

  function renderFinalResult() {
    const correctCount = screen.questions.filter((q, i) => answers[i] === q.correct).length;
    const pct = Math.round((correctCount / screen.questions.length) * 100);
    const passed = pct >= screen.passMark;
    state.finalScorePct = pct;
    state.finalPassed = passed;
    saveState();

    wrap.innerHTML = `
      <h2>${screen.title} — Results</h2>
      <div class="quiz-score-summary" id="resultBox">
        <div>You scored</div>
        <div class="score-big ${passed ? "score-pass" : "score-fail"}">${pct}%</div>
        <div>${correctCount} of ${screen.questions.length} correct &middot; Pass mark: ${screen.passMark}%</div>
        <p style="margin-top:14px">${passed
          ? "Well done! You've passed the assessment and can now generate your certificate."
          : "You're close — review the chapters and try again. There's no penalty for retaking."}</p>
        ${!passed ? `<button id="retryBtn" class="btn btn-outline">Retry Assessment</button>` : ""}
      </div>
    `;
    const resultBox = wrap.querySelector("#resultBox");
    gsap.fromTo(resultBox, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" });

    if (passed) {
      SFX.complete();
      confettiAt(resultBox, true);
    } else {
      SFX.incorrect();
      wrap.querySelector("#retryBtn").addEventListener("click", () => {
        SFX.click();
        state.quizAnswers[screen.id] = screen.questions.map(() => null);
        saveState();
        renderFinal(screen, wrap);
      });
    }
    btnNext.disabled = !passed;
    footerMsg.textContent = passed ? "" : "Retry the assessment to continue";
    btnNext.textContent = "Get Certificate →";
  }
}

/* ---------------- Screen: Certificate ---------------- */
function renderCertificate(screen, wrap) {
  const dateStr = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  // Auto-generated certificate reference number — deterministic-looking but unique per issue.
  const certId = "SK-" + new Date().getFullYear() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  wrap.innerHTML = `
    <div class="certificate" id="certificateNode">
      <div class="cert-corner cert-corner-tl"></div>
      <div class="cert-corner cert-corner-tr"></div>
      <div class="cert-corner cert-corner-bl"></div>
      <div class="cert-corner cert-corner-br"></div>
      <div class="cert-id">Certificate No. ${certId}</div>
      <div class="cert-badge">${svgIcon("cert", 42)}</div>
      <div class="cert-title">Certificate of Completion</div>
      <div class="cert-sub">Suraksha Kavasam &middot; POCSO Awareness Programme</div>
      <div class="cert-body">This is to certify that</div>
      <div class="cert-name">${escapeHtml(state.learnerName || "Learner")}</div>
      <div class="cert-body">has successfully completed the POCSO Awareness module and passed the final assessment with a score of <strong>${state.finalScorePct}%</strong>, demonstrating a clear understanding of child safety rights, warning signs, and reporting procedures under the POCSO Act.</div>
      <div class="cert-sign-row">
        <div class="cert-sign">
          <div class="cert-sign-line"></div>
          <div class="cert-sign-label">Date: ${dateStr}</div>
        </div>
        <div class="cert-seal">
          <div class="cert-seal-ring">${svgIcon("shield", 30)}</div>
          <div class="cert-seal-text">OFFICIAL SEAL</div>
        </div>
        <div class="cert-sign">
          <div class="cert-sign-line"></div>
          <div class="cert-sign-label">${MODULE_META.issuingAuthority}</div>
        </div>
      </div>
    </div>
    <div class="cert-actions">
      <button id="printBtn" class="btn btn-primary">Print / Save as PDF</button>
      <button id="restartBtn" class="btn btn-ghost">Restart Module</button>
    </div>
  `;
  const certNode = wrap.querySelector("#certificateNode");
  gsap.fromTo(certNode, { autoAlpha: 0, scale: 0.9, rotationX: -8 }, { autoAlpha: 1, scale: 1, rotationX: 0, duration: 0.7, ease: "back.out(1.3)" });
  SFX.complete();
  setTimeout(() => confettiAt(certNode, true), 200);

  wrap.querySelector("#printBtn").addEventListener("click", () => { SFX.click(); window.print(); });
  wrap.querySelector("#restartBtn").addEventListener("click", () => {
    SFX.click();
    if (confirm("This will erase your progress and start over. Continue?")) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  });
  btnNext.style.display = "none";
  btnBack.style.display = "none";
  footerMsg.textContent = "Module complete. Congratulations!";
}

/* ---------------- Boot ---------------- */
buildSidebar();
render();
