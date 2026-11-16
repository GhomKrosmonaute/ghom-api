# ghom-api

API de [ghom.fr](https://ghom.fr), en NestJS, déployée sur Vercel (`api.ghom.fr`) et servie sous
**`ghom.fr/api/*`** : le hub réécrit `/api/:path*` vers ce projet, sauf ses propres routes
(`/api/revalidate`).

## Endpoints

| Route | Rôle |
|---|---|
| `GET /` | santé |
| `GET /profile-cards/<carte>.svg` | carte SVG du README GitHub de GhomKrosmonaute : `stats`, `languages` |

Les cartes remplacent l'ancienne action quotidienne du dépôt `GhomKrosmonaute/GhomKrosmonaute`
(`scripts/stats.mjs`). Le rendu est repris tel quel : `profile-cards.spec.ts` vérifie, à partir
d'une réponse GitHub enregistrée, que le SVG est identique à l'octet près à celui du script
d'origine. Les données GitHub sont gardées 1 h en mémoire et en CDN (`s-maxage=3600`,
`stale-while-revalidate`).

Ajouter une carte : une fonction dans `src/profile-cards/cards/` et une entrée dans `CARDS`.
Ajouter une fonctionnalité : un module Nest dans `src/<fonctionnalité>/`, importé par `AppModule`.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `GITHUB_TOKEN` | token GitHub en lecture seule (données publiques suffisent) |
| `PROFILE_LOGIN` | compte affiché par les cartes (défaut `GhomKrosmonaute`) |

## Développement

```bash
bun install
GITHUB_TOKEN=… bun run start:dev   # http://localhost:3000/profile-cards/stats.svg
bun run check                       # lint, typage, tests
```
