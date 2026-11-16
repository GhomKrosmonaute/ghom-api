import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { GithubService } from '../github/github.service.js';
import { CARDS } from './cards/index.js';

/** Cartes SVG du profil GitHub (README de GhomKrosmonaute), générées à la volée. */
@Controller('profile-cards')
export class ProfileCardsController {
  constructor(
    private readonly github: GithubService,
    private readonly config: ConfigService,
  ) {}

  @Get(':name.svg')
  async card(
    @Param('name') name: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const render = Object.hasOwn(CARDS, name) ? CARDS[name] : undefined;
    if (!render) throw new NotFoundException(`Unknown card "${name}"`);
    const login = this.config.get<string>('PROFILE_LOGIN') ?? 'GhomKrosmonaute';
    const svg = render(await this.github.profile(login));
    // En-têtes posés seulement en cas de succès : les erreurs restent en JSON.
    // GitHub (camo) et le CDN Vercel gardent l'image 1 h, puis la resservent pendant le rafraîchissement.
    res.set({
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control':
        'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    });
    return svg;
  }
}
