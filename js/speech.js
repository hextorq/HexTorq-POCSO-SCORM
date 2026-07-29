/* Suraksha Kavasam — read-aloud with synced word highlighting (Web Speech API) */

const Speech = (function () {
  let wordSpans = [];
  let activeIndex = -1;
  let speakingFlag = false;

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

    const utter = new SpeechSynthesisUtterance(fullText);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onboundary = (e) => {
      if (e.charIndex === undefined) return;
      const idx = findWordIndex(offsets, e.charIndex);
      if (idx !== activeIndex) {
        wordSpans.forEach((s) => s.classList.remove("w-active"));
        activeIndex = idx;
        if (spans[idx]) {
          spans[idx].classList.add("w-active");
          spans[idx].scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    };
    utter.onend = () => { clearHighlight(); speakingFlag = false; if (onEnd) onEnd(); };
    utter.onerror = () => { clearHighlight(); speakingFlag = false; if (onEnd) onEnd(); };

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
