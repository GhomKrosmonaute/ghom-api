import type { GithubProfile } from '../../github/github.service.js';
import { C, esc, frame } from './frame.js';

export function statsCard(s: GithubProfile, now = new Date()): string {
  const year = now.getFullYear();
  const cells: [string, number, string][] = [
    ['Public repos', s.repos, C.cyan],
    ['Stars earned', s.stars, C.yellow],
    ['Followers', s.followers, C.magenta],
    [`Contribs ${year}`, s.contributions, C.cyan],
    [`Commits ${year}`, s.commits, C.yellow],
    ['Organizations', s.orgs, C.magenta],
  ];
  const width = 420;
  const body = cells
    .map(([label, value, color], i) => {
      const x = 20 + (i % 2) * 196;
      const y = 62 + Math.floor(i / 2) * 50;
      return `  <rect x="${x}" y="${y}" width="3" height="34" fill="${color}"/>
  <text x="${x + 14}" y="${y + 12}" class="label">${esc(label)}</text>
  <text x="${x + 14}" y="${y + 34}" class="value">${value.toLocaleString('en-US')}</text>`;
    })
    .join('\n');
  const footer = `  <text x="20" y="226" class="label">Online since ${s.since}<tspan class="blink" fill="${C.cyan}"> _</tspan></text>`;
  return frame(width, 240, 'SYSTEM STATUS', 'SYS.STATS', `${body}\n${footer}`);
}
