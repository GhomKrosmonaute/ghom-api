// Repris tel quel de GhomKrosmonaute/GhomKrosmonaute@16b5312 (scripts/stats.mjs) :
// le SVG produit doit rester identique à l'octet près (cf. cards.spec.ts).

export const C = {
  bg: '#050508',
  panel: '#0a0b12',
  line: '#1b1d2b',
  text: '#e6f6ff',
  muted: '#7d8aa3',
  cyan: '#00f0ff',
  magenta: '#ff2bd6',
  yellow: '#e8ff3a',
};

export const FONT =
  "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',monospace";

export const esc = (s: unknown) =>
  String(s).replace(
    /[&<>"]/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  );

/** Cadre commun : panneau sombre, grille, coin coupé, bord néon et barre de titre. */
export function frame(
  width: number,
  height: number,
  title: string,
  code: string,
  body: string,
): string {
  const cut = 14;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}">
  <defs>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0H0V24" fill="none" stroke="${C.line}" stroke-width="1" opacity=".55"/>
    </pattern>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.cyan}"/>
      <stop offset="1" stop-color="${C.magenta}"/>
    </linearGradient>
    <clipPath id="shape"><path d="M0 0H${width - cut}L${width} ${cut}V${height}H${cut}L0 ${height - cut}Z"/></clipPath>
  </defs>
  <style>
    text { font-family: ${FONT}; }
    .label { fill: ${C.muted}; font-size: 11px; letter-spacing: 1.6px; text-transform: uppercase; }
    .value { fill: ${C.text}; font-size: 22px; font-weight: 700; }
    .title { fill: ${C.cyan}; font-size: 12px; letter-spacing: 3px; font-weight: 700; }
    .code { fill: ${C.magenta}; font-size: 11px; letter-spacing: 2px; }
    .grow { animation: grow 1.1s cubic-bezier(.2,.8,.2,1) both; transform-box: fill-box; transform-origin: left; }
    @keyframes grow { from { transform: scaleX(0); } }
    .blink { animation: blink 1.4s steps(1) infinite; }
    @keyframes blink { 50% { opacity: 0; } }
  </style>
  <g clip-path="url(#shape)">
    <rect width="${width}" height="${height}" fill="${C.bg}"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
  </g>
  <path d="M0.5 0.5H${width - cut}L${width - 0.5} ${cut}V${height - 0.5}H${cut}L0.5 ${height - cut}Z" fill="none" stroke="url(#edge)" stroke-opacity=".7"/>
  <text x="20" y="30" class="title">${esc(title)}</text>
  <text x="${width - 22}" y="30" class="code" text-anchor="end">${esc(code)}</text>
  <rect x="20" y="40" width="${width - 40}" height="1" fill="${C.line}"/>
${body}
</svg>
`;
}
