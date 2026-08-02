/* POCSO Adult Awareness — read-aloud (Web Speech API)

   Two modes:
   - speak(elements, onEnd): plain narration with word-level highlighting.
     Falls back to a timed estimate on mobile engines that never fire the
     `boundary` event (iOS Safari and several Android TTS engines).
   - speakDialogue(turns, lineElements, onEnd): for the tea-shop / bus-stop
     conversations. Every character in the script is mapped to a fixed
     gender (Murugan/Sekar male, Selvi/Amudha female) so the same character
     always sounds the same across every scene, not just alternating by
     whoever happens to speak first in a given conversation. Where the
     browser exposes more than one voice, a male- and female-sounding voice
     are picked by name (falls back to pitch/rate differentiation on
     browsers with only one voice installed). Stage directions like
     "(pause)" or "(shrugging)" are stripped from what's spoken — they stay
     visible in the text — since they aren't lines of dialogue. The active
     line is highlighted as it's spoken. */

const GENDER_BY_NAME = { murugan: "male", sekar: "male", selvi: "female", amudha: "female" };
function guessGender(name) {
  return GENDER_BY_NAME[(name || "").toLowerCase().trim()] || "male";
}

let cachedVoices = [];
function refreshVoices() {
  if ("speechSynthesis" in window) cachedVoices = window.speechSynthesis.getVoices() || [];
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}
function pickVoiceForGender(gender) {
  if (!cachedVoices.length) return null;
  const english = cachedVoices.filter((v) => /^en/i.test(v.lang));
  const pool = english.length ? english : cachedVoices;
  const maleHints = /male|david|mark|guy|daniel|rishi|ravi|arjun|ajit/i;
  const femaleHints = /female|zira|susan|samantha|victoria|heera|aditi|priya|karen/i;
  const hints = gender === "male" ? maleHints : femaleHints;
  return pool.find((v) => hints.test(v.name)) || null;
}

const Speech = (function () {
  let wordSpans = [];
  let activeIndex = -1;
  let speakingFlag = false;
  let fallbackTimer = null;
  let usedRealBoundary = false;
  let cancelToken = 0;

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function wrapWords(el) {
    if (el.dataset.wrapped === "1") return Array.from(el.querySelectorAll(".w"));
    const text = el.textContent;
    const tokens = text.split(/(\s+)/);
    el.innerHTML = tokens.map((t) => (/\S/.test(t) ? `<span class="w">${escapeHtml(t)}</span>` : t)).join("");
    el.dataset.wrapped = "1";
    return Array.from(el.querySelectorAll(".w"));
  }

  function clearHighlight() {
    wordSpans.forEach((s) => s.classList.remove("w-active"));
    activeIndex = -1;
  }
  function stopFallback() {
    if (fallbackTimer) { clearInterval(fallbackTimer); fallbackTimer = null; }
  }
  function highlightIndex(spans, idx) {
    if (idx === activeIndex || !spans[idx]) return;
    wordSpans.forEach((s) => s.classList.remove("w-active"));
    activeIndex = idx;
    spans[idx].classList.add("w-active");
    spans[idx].scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function findWordIndex(offsets, charIndex) {
    let lo = 0, hi = offsets.length - 1, ans = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (offsets[mid] <= charIndex) { ans = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return ans;
  }

  function stop() {
    cancelToken++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    stopFallback();
    clearHighlight();
    wordSpans = [];
    speakingFlag = false;
    document.querySelectorAll(".line-active").forEach((el) => el.classList.remove("line-active"));
  }

  function speak(elements, onEnd) {
    stop();
    const myToken = cancelToken;
    if (!("speechSynthesis" in window) || !elements || !elements.length) {
      if (onEnd) onEnd();
      return;
    }
    let fullText = "";
    let spans = [];
    let offsets = [];
    elements.forEach((el) => {
      const els = wrapWords(el);
      spans = spans.concat(els);
      const text = el.textContent;
      const tokens = text.split(/(\s+)/);
      let localPos = 0;
      tokens.forEach((t) => {
        if (/\S/.test(t)) offsets.push(fullText.length + localPos);
        localPos += t.length;
      });
      fullText += text + ". ";
    });
    wordSpans = spans;
    usedRealBoundary = false;

    const utter = new SpeechSynthesisUtterance(fullText);
    utter.rate = 0.95;
    utter.pitch = 1;

    utter.onboundary = (e) => {
      if (myToken !== cancelToken || e.charIndex === undefined) return;
      usedRealBoundary = true;
      stopFallback();
      highlightIndex(spans, findWordIndex(offsets, e.charIndex));
    };
    utter.onstart = () => {
      setTimeout(() => {
        if (myToken !== cancelToken || usedRealBoundary || fallbackTimer) return;
        const wordsPerMinute = 165 * utter.rate;
        const msPerWord = Math.max(140, Math.min(480, 60000 / wordsPerMinute));
        let i = -1;
        fallbackTimer = setInterval(() => {
          if (myToken !== cancelToken) { stopFallback(); return; }
          i++;
          if (i >= spans.length) { stopFallback(); return; }
          highlightIndex(spans, i);
        }, msPerWord);
      }, 350);
    };
    utter.onend = () => { if (myToken !== cancelToken) return; stopFallback(); clearHighlight(); speakingFlag = false; if (onEnd) onEnd(); };
    utter.onerror = () => { if (myToken !== cancelToken) return; stopFallback(); clearHighlight(); speakingFlag = false; if (onEnd) onEnd(); };

    speakingFlag = true;
    window.speechSynthesis.speak(utter);
  }

  function speakDialogue(turns, lineElements, onEnd) {
    stop();
    const myToken = cancelToken;
    if (!("speechSynthesis" in window) || !turns || !turns.length) {
      if (onEnd) onEnd();
      return;
    }
    refreshVoices();
    speakingFlag = true;
    let i = 0;
    function speakNext() {
      if (myToken !== cancelToken) return;
      lineElements.forEach((el) => el && el.classList.remove("line-active"));
      if (i >= turns.length) { speakingFlag = false; if (onEnd) onEnd(); return; }
      const turn = turns[i];
      const spokenText = turn.text.replace(/\([^)]*\)/g, "").trim();
      if (lineElements[i]) {
        lineElements[i].classList.add("line-active");
        lineElements[i].scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
      if (!spokenText) { i++; setTimeout(speakNext, 260); return; }
      const gender = guessGender(turn.who);
      const voice = pickVoiceForGender(gender);
      const utter = new SpeechSynthesisUtterance(spokenText);
      if (voice) utter.voice = voice;
      utter.pitch = gender === "male" ? 0.85 : 1.25;
      utter.rate = gender === "male" ? 0.94 : 1.0;
      utter.onend = () => { if (myToken !== cancelToken) return; i++; speakNext(); };
      utter.onerror = () => { if (myToken !== cancelToken) return; i++; speakNext(); };
      window.speechSynthesis.speak(utter);
    }
    speakNext();
  }

  return {
    speak,
    speakDialogue,
    stop,
    get speaking() { return speakingFlag; },
    get supported() { return "speechSynthesis" in window; }
  };
})();
