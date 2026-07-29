# HexTorq-POCSO-SCORM

Suraksha Kavasam — an interactive POCSO awareness e-learning module built for Tamil Nadu Police, targeted at adolescents (13-17).

## What it is

A self-contained, dependency-free (aside from vendored libraries) web module covering:

- Understanding the POCSO Act
- Body safety and consent
- Recognizing warning signs / grooming red flags
- What to do in an unsafe situation (branching story)
- Reporting and getting help (helplines, POCSO e-Box)
- A final assessment and an auto-generated certificate of completion

## Features

- Click-to-reveal fact cards (3 distinct animation styles)
- Drag-and-drop sorting and matching activities
- A branching, cinematic story scenario with mood-based theming
- Read-aloud with synced word highlighting (Web Speech API)
- Sound effects and haptic feedback on correct/incorrect answers
- Per-chapter visual theming, floating ambient background, full-screen mode
- Scroll progress bar and parallax background
- Progress is saved locally (`localStorage`) so learners can resume

## Running it

No build step required. Either:

- Open `index.html` directly in a browser, or
- Serve the folder locally, e.g. `python -m http.server 8000`, then visit `http://localhost:8000`

## Structure

- `index.html` — app shell
- `css/style.css` — all styling
- `js/content.js` — course content data
- `js/app.js` — app engine / rendering / interactions
- `js/icons.js`, `js/sfx.js`, `js/speech.js` — icon set, sound effects, read-aloud
- `js/vendor/` — vendored GSAP, Draggable, ScrollTrigger, canvas-confetti
