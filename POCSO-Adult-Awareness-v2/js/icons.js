/* POCSO Adult Awareness — inline SVG icon set (no emoji, single stroke style) */

function svgIcon(name, size) {
  const s = size || 24;
  const paths = {
    shield: `<path d="M12 2.5l7.5 3v6c0 5-3.2 8.6-7.5 10-4.3-1.4-7.5-5-7.5-10v-6l7.5-3z"/><path d="M8.5 12l2.3 2.3L15.5 10"/>`,
    volume: `<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a9 9 0 010 12"/>`,
    volumeOff: `<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/>`,
    check: `<path d="M4 12.5l5 5L20 6.5"/>`,
    cross: `<path d="M6 6l12 12M18 6L6 18"/>`,
    clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>`,
    book: `<path d="M4 5.5A2 2 0 016 4h6v16H6a2 2 0 00-2 1.5v-16z"/><path d="M20 5.5A2 2 0 0018 4h-6v16h6a2 2 0 012 1.5v-16z"/>`,
    expand: `<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>`,
    collapse: `<path d="M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5"/>`,
    chevronDown: `<path d="M5 9l7 7 7-7"/>`,
    video: `<rect x="3" y="5.5" width="13" height="13" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>`,
    quote: `<path d="M7 8.5c-2 1-3 2.6-3 5s1.5 4 3.5 4c1.4 0 2.5-1.1 2.5-2.5S9.4 12.5 8 12.5c-.3 0-.6 0-.8.1C7.4 10.5 8.7 9.2 10 8.5L7 8.5z"/><path d="M15.5 8.5c-2 1-3 2.6-3 5s1.5 4 3.5 4c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.6-2.5-2.6c-.3 0-.6 0-.8.1.2-2.1 1.5-3.4 2.8-4.1l-2.5.1z"/>`
  };
  return `<svg class="icon icon-${name}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
}
