import type { GithubProfile } from '../../github/github.service.js';
import { C, esc, frame } from './frame.js';

export function languagesCard(s: GithubProfile): string {
  const top = s.languages.slice(0, 6);
  const total = top.reduce((sum, l) => sum + l.size, 0) || 1;
  const width = 420;
  const barWidth = width - 40;
  let offset = 0;
  const stacked = top
    .map((l) => {
      const w = (l.size / total) * barWidth;
      const rect = `<rect x="${(20 + offset).toFixed(2)}" y="58" width="${Math.max(w - 2, 1).toFixed(2)}" height="8" fill="${l.color}"/>`;
      offset += w;
      return rect;
    })
    .join('');
  const rows = top
    .map((l, i) => {
      const x = 20 + (i % 2) * 196;
      const y = 92 + Math.floor(i / 2) * 44;
      const pct = (l.size / total) * 100;
      return `  <rect x="${x}" y="${y - 9}" width="8" height="8" fill="${l.color}"/>
  <text x="${x + 16}" y="${y}" class="label" style="fill:${C.text}">${esc(l.name)}</text>
  <text x="${x + 176}" y="${y}" class="label" text-anchor="end">${pct.toFixed(1)}%</text>
  <rect x="${x}" y="${y + 9}" width="176" height="3" fill="${C.line}"/>
  <rect x="${x}" y="${y + 9}" width="${((176 * pct) / 100).toFixed(2)}" height="3" fill="${l.color}" class="grow"/>`;
    })
    .join('\n');
  const footer = `  <text x="20" y="226" class="label">By code size · public repos</text>`;
  return frame(
    width,
    240,
    'LOADOUT',
    'SYS.LANGS',
    `  <g class="grow">${stacked}</g>\n${rows}\n${footer}`,
  );
}
