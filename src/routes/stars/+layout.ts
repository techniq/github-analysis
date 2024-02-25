import { Github, type RepoApi, type StargazerApi } from '$lib/github.js';
import { range } from 'd3-array';
import { gql, sort } from 'svelte-ux';
// import type { User } from '@octokit/graphql-schema';

export async function load({ parent, url }) {
  const { accessToken } = await parent();

  const owner = url.searchParams.get('owner') ?? 'techniq';
  const repo = url.searchParams.get('repo') ?? 'svelte-ux';

  const variables = { owner, repo };

  return {
    stargazers: await fetchStargazers(accessToken, variables),
    variables
  };
}

async function fetchStargazers(accessToken: string, variables: { owner: string; repo: string }) {
  const github = new Github(accessToken);

  let stargazers: StargazerApi[] = [];

  const repo = await github.api<RepoApi>(`repos/${variables.owner}/${variables.repo}`, {});

  const perPage = 100;

  // TODO: Consider using API instead of GraphQL to fan out requests (like https://star-history.com and  https://seladb.github.io/) - `curl 'https://api.github.com/repos/techniq/svelte-ux/stargazers?per_page=100&page=1' -H 'accept: application/vnd.github.v3.star+json'`
  // TODO: Also consider only grabbing a few data points (like https://star-history.com).  Especially for very big repos
  // Both of these would break showing all users and follower details.  Could maybe paginate details (showing most recent)
  async function fetchPage(page) {
    const result = await github.api<StargazerApi[]>(
      `repos/${variables.owner}/${variables.repo}/stargazers`,
      {
        data: {
          per_page: perPage,
          page
        },
        headers: {
          accept: 'application/vnd.github.v3.star+json'
        }
      }
    );

    stargazers = stargazers.concat(result);
  }

  await Promise.allSettled(
    range(Math.ceil(repo.stargazers_count / perPage)).map((page) => {
      return fetchPage(page + 1);
    })
  );

  return sort(stargazers, 'starred_at');
}
