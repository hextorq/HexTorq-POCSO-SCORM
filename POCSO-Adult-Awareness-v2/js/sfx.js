/* POCSO Adult Awareness — restrained synthesized sound cues (Web Audio API).
   Deliberately understated: this module is a serious legal-education tool for
   adults, not a gamified module — no celebratory chimes, no fanfare. */

const SFX = (function () {
  let ctx;
  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, start, duration, type, peak) {
    try {
      const c = ensureCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, c.currentTime + start);
      gain.gain.setValueAtTime(0, c.currentTime + start);
      gain.gain.linearRampToValueAtTime(peak || 0.12, c.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + duration);
      osc.connect(gain).connect(c.destination);
      osc.start(c.currentTime + start);
      osc.stop(c.currentTime + start + duration + 0.05);
    } catch (e) { /* audio unavailable — fail silently */ }
  }

  return {
    click() { tone(600, 0, 0.045, "sine", 0.05); },
    correct() { tone(440, 0, 0.16, "sine", 0.11); tone(554, 0.07, 0.18, "sine", 0.1); },
    incorrect() { tone(220, 0, 0.2, "sine", 0.09); },
    open() { tone(500, 0, 0.08, "sine", 0.06); },
    ensureCtx
  };
})();
