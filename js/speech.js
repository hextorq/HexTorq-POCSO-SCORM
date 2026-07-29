/* Suraksha Kavasam — read-aloud with synced word highlighting (Web Speech API)

   Desktop Chrome/Edge fire SpeechSynthesisUtterance's `boundary` event per word,
   which drives exact highlighting. Many mobile engines (iOS Safari in particular,
   and several Android TTS engines) never fire it, or only fire it per sentence —
   so on those devices we fall back to a timer that estimates word timing from
   the utterance's word-per-minute rate, giving approximate but visible highlighting. */

const Speech = (function () {
  let wordSpans = [];
  let activeIndex = -1;
  let speakingFlag = false;
  let fallbackTimer = null;
  let usedRealBoundary = false;

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
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    stopFallback();
    clearHighlight();
    wordSpans = [];
    speakingFlag = false;
  }

  function speak(elements, onEnd) {
    stop();
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
      if (e.charIndex === undefined) return;
      usedRealBoundary = true;
      stopFallback();
      highlightIndex(spans, findWordIndex(offsets, e.charIndex));
    };

    // Give the engine a brief window to prove it sends real boundary events;
    // if it doesn't, drive the highlight with an estimated per-word timer instead.
    utter.onstart = () => {
      setTimeout(() => {
        if (usedRealBoundary || fallbackTimer) return;
        const wordsPerMinute = 165 * utter.rate;
        const msPerWord = Math.max(140, Math.min(480, 60000 / wordsPerMinute));
        let i = -1;
        fallbackTimer = setInterval(() => {
          i++;
          if (i >= spans.length) { stopFallback(); return; }
          highlightIndex(spans, i);
        }, msPerWord);
      }, 350);
    };

    utter.onend = () => { stopFallback(); clearHighlight(); speakingFlag = false; if (onEnd) onEnd(); };
    utter.onerror = () => { stopFallback(); clearHighlight(); speakingFlag = false; if (onEnd) onEnd(); };

    speakingFlag = true;
    window.speechSynthesis.speak(utter);
  }

  return {
    speak,
    stop,
    get speaking() { return speakingFlag; },
    get supported() { return "speechSynthesis" in window; }
  };
})();
