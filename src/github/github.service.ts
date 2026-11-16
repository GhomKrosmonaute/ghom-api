import {
  Injectable,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GithubProfile {
  since: number;
  repos: number;
  stars: number;
  followers: number;
  orgs: number;
  commits: number;
  pulls: number;
  contributions: number;
  languages: { name: string; size: number; color: string }[];
}

const MUTED = '#7d8aa3';
/** Durée de vie du cache en mémoire (par instance) ; le CDN cache aussi, cf. contrôleur. */
const TTL_MS = 60 * 60 * 1000;

interface RepoNode {
  stargazerCount: number;
  languages: {
    edges: { size: number; node: { name: string; color: string | null } }[];
  };
}

/** Client GraphQL GitHub, avec un cache par compte et dédoublonnage des requêtes en cours. */
@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private readonly cache = new Map<
    string,
    { at: number; value: Promise<GithubProfile> }
  >();

  constructor(private readonly config: ConfigService) {}

  profile(login: string): Promise<GithubProfile> {
    const hit = this.cache.get(login);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
    const value = this.collect(login).catch((error: unknown) => {
      this.cache.delete(login);
      this.logger.error(error);
      throw new ServiceUnavailableException('GitHub API unavailable');
    });
    this.cache.set(login, { at: Date.now(), value });
    return value;
  }

  private async graphql<T>(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<T> {
    const token = this.config.get<string>('GITHUB_TOKEN');
    if (!token) throw new Error('GITHUB_TOKEN is required');
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        authorization: `bearer ${token}`,
        'content-type': 'application/json',
        'user-agent': 'ghom-api',
      },
      body: JSON.stringify({ query, variables }),
    });
    const body = (await res.json()) as { data: T; errors?: unknown };
    if (!res.ok || body.errors)
      throw new Error(JSON.stringify(body.errors ?? body));
    return body.data;
  }

  // Requête et agrégation reprises de scripts/stats.mjs (profil GhomKrosmonaute@16b5312).
  private async collect(login: string): Promise<GithubProfile> {
    const repos: RepoNode[] = [];
    let after: string | null = null;
    let user: any;
    do {
      const data: { user: any } = await this.graphql(
        `query($login: String!, $after: String) {
        user(login: $login) {
          createdAt
          followers { totalCount }
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            contributionCalendar { totalContributions }
          }
          organizations(first: 50) { totalCount }
          repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100, after: $after) {
            totalCount
            pageInfo { hasNextPage endCursor }
            nodes {
              stargazerCount
              languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
                edges { size node { name color } }
              }
            }
          }
        }
      }`,
        { login, after },
      );
      user = data.user;
      if (!user) throw new Error(`Unknown GitHub user ${login}`);
      repos.push(...(user.repositories.nodes as RepoNode[]));
      after = user.repositories.pageInfo.hasNextPage
        ? user.repositories.pageInfo.endCursor
        : null;
    } while (after);

    const languages = new Map<string, { size: number; color: string }>();
    for (const repo of repos) {
      for (const { size, node } of repo.languages.edges) {
        const current = languages.get(node.name) ?? {
          size: 0,
          color: node.color ?? MUTED,
        };
        current.size += size;
        languages.set(node.name, current);
      }
    }

    return {
      since: new Date(user.createdAt).getFullYear(),
      repos: user.repositories.totalCount,
      stars: repos.reduce((sum, r) => sum + r.stargazerCount, 0),
      followers: user.followers.totalCount,
      orgs: user.organizations.totalCount,
      commits: user.contributionsCollection.totalCommitContributions,
      pulls: user.contributionsCollection.totalPullRequestContributions,
      contributions:
        user.contributionsCollection.contributionCalendar.totalContributions,
      languages: [...languages.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.size - a.size),
    };
  }
}
