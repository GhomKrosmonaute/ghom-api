import { readFileSync } from 'node:fs';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module.js';

// Fixtures : réponse GraphQL enregistrée, et les SVG produits avec elle par le script
// d'origine (scripts/stats.mjs du profil, commit 16b5312). L'API doit les reproduire à l'octet près.
const fixture = (file: string) =>
  readFileSync(`${import.meta.dirname}/../../test/fixtures/${file}`, 'utf8');

describe('GET /profile-cards/:name.svg', () => {
  let app: INestApplication;
  const responses = JSON.parse(fixture('graphql.json')) as unknown[];
  const fetchMock = vi.fn();

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-16T12:00:00Z'));
    process.env.GITHUB_TOKEN = 'test-token';
    let i = 0;
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () =>
      Response.json(responses[i++ % responses.length]),
    );
    vi.stubGlobal('fetch', fetchMock);
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each(['stats', 'languages'])(
    'renders %s.svg exactly like the original script',
    async (name) => {
      const res = await request(app.getHttpServer())
        .get(`/profile-cards/${name}.svg`)
        .expect(200)
        .expect('content-type', /image\/svg\+xml/)
        .expect('cache-control', /s-maxage=3600/)
        .buffer(true)
        .parse((r, done) => {
          let text = '';
          r.on('data', (chunk: Buffer) => (text += chunk.toString()));
          r.on('end', () => done(null, text));
        });
      expect(res.body).toBe(fixture(`${name}.svg`));
    },
  );

  it('queries GitHub once for both cards (cache)', async () => {
    const server = app.getHttpServer();
    await request(server).get('/profile-cards/stats.svg').expect(200);
    await request(server).get('/profile-cards/languages.svg').expect(200);
    expect(fetchMock).toHaveBeenCalledTimes(responses.length);
  });

  it('returns 404 for an unknown card', async () => {
    await request(app.getHttpServer())
      .get('/profile-cards/constructor.svg')
      .expect(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
