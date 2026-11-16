import type { GithubProfile } from '../../github/github.service.js';
import { languagesCard } from './languages.card.js';
import { statsCard } from './stats.card.js';

/** Registre des cartes : `/profile-cards/<nom>.svg`. Ajouter une carte = ajouter une entrée. */
export const CARDS: Record<string, (profile: GithubProfile) => string> = {
  stats: (p) => statsCard(p),
  languages: languagesCard,
};
