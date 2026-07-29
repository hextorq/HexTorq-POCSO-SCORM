/* Suraksha Kavasam — lightweight synthesized sound effects (Web Audio API, no asset files) */

const SFX = (function () {
  let ctx;
  function ensureCtx() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }

  function tone(freq, start, duration, type, peak) {
    try {
      const c = ensureCtx();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, c.currentTime + start);
      gain.gain.setValueAtTime(0, c.currentTime + start);
      gain.gain.linearRampToValueAtTime(peak || 0.2, c.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + duration);
      osc.connect(gain).connect(c.destination);
      osc.start(c.currentTime + start);
      osc.stop(c.currentTime + start + duration + 0.05);
    } catch (e) { /* audio unavailable — fail silently */ }
  }

  return {
    correct() {
      tone(523.25, 0, 0.14, "triangle", 0.2);
      tone(659.25, 0.1, 0.16, "triangle", 0.2);
      tone(783.99, 0.2, 0.24, "triangle", 0.22);
    },
    incorrect() {
      tone(196, 0, 0.18, "sawtooth", 0.15);
      tone(146.83, 0.12, 0.26, "sawtooth", 0.15);
    },
    click() {
      tone(880, 0, 0.05, "square", 0.05);
    },
    complete() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.28, "triangle", 0.22));
    },
    // Soft ambient chime used when entering a new chapter — not tied to any narrative event.
    transition() {
      tone(392, 0, 0.32, "sine", 0.1);
      tone(494, 0.1, 0.36, "sine", 0.09);
    },
    // Low suspenseful drone used only to underscore an "unresolved / stay alert" story
    // moment (content mood: "tense"). Deliberately abstract/musical — never a literal
    // depiction of harassment, violence, or an attack.
    tension() {
      tone(110, 0, 0.5, "sawtooth", 0.07);
      tone(116.5, 0.06, 0.55, "sawtooth", 0.06);
    },
    ensureCtx
  };
})();
