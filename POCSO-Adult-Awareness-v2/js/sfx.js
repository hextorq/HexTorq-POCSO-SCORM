/* POCSO Adult Awareness — synthesized sound cues (Web Audio API).
   Tone stays measured (no confetti-style fanfare, this is a legal-education
   tool for adults) but every interaction gets an audible cue: selecting,
   revealing, judging right/wrong, finishing a whole exercise, confirming a
   commitment, and moving between chapters. */

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

  // Haptic feedback, matched in strength/length to how big the sound cue
  // is (a light tap for a nav click, a heavy, longer buzz for a whole
  // chapter finishing) — every cue below fires one so the user *feels*
  // the interaction, not just hears it.
  function haptic(pattern) {
    if (!navigator.vibrate) return;
    try { navigator.vibrate(pattern); } catch (e) { /* best-effort only */ }
  }

  return {
    // Footer nav buttons (Back / Continue) — short, firm tap.
    click() { tone(600, 0, 0.045, "sine", 0.05); haptic(35); },
    // Selecting a sort item, ticking a checkbox — a light tactile tick.
    select() { tone(760, 0, 0.05, "sine", 0.05); haptic(25); },
    // Flipping a card open, revealing the slider answer — two-part buzz.
    open() { tone(500, 0, 0.08, "sine", 0.06); tone(680, 0.05, 0.07, "sine", 0.045); haptic([30, 25, 25]); },
    // A single right/wrong judgement (sort placement, quiz option, judgment card).
    correct() { tone(440, 0, 0.16, "sine", 0.11); tone(554, 0.07, 0.18, "sine", 0.1); haptic([40, 40, 40]); },
    incorrect() { tone(220, 0, 0.2, "sine", 0.09); haptic(90); },
    // A whole exercise finished (every deck card revealed, sort fully correct,
    // case study submitted) — a fuller three-note cue, still restrained.
    complete() { tone(440, 0, 0.14, "sine", 0.1); tone(554, 0.08, 0.14, "sine", 0.1); tone(660, 0.16, 0.22, "sine", 0.11); haptic([45, 35, 45, 35, 60]); },
    // The one-tap commitment screen — deeper and more deliberate than a
    // normal "correct," since it isn't a right/wrong judgement.
    confirm() { tone(330, 0, 0.22, "sine", 0.1); tone(440, 0.1, 0.26, "sine", 0.11); haptic([60, 40, 80]); },
    // Moving into a new chapter.
    transition() { tone(392, 0, 0.24, "sine", 0.08); tone(494, 0.09, 0.28, "sine", 0.07); haptic([50, 30, 50]); },
    // Footer navigation: Next rises, Back falls — distinguishable by ear
    // even without looking at the button, and by feel too (Next hits
    // harder/longer, Back is a shorter double-tap).
    navNext() { tone(520, 0, 0.06, "sine", 0.07); tone(680, 0.04, 0.08, "sine", 0.06); haptic(45); },
    navBack() { tone(560, 0, 0.06, "sine", 0.06); tone(420, 0.04, 0.08, "sine", 0.05); haptic([25, 20, 25]); },
    // A whole chapter finished (quiz answered in full) — bigger and more
    // celebratory than a single exercise's "complete", and the heaviest,
    // longest buzz in the module.
    chapterComplete() {
      [440, 554, 659, 880, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.3, "triangle", 0.16));
      haptic([60, 50, 60, 50, 60, 50, 120]);
    },
    ensureCtx
  };
})();
