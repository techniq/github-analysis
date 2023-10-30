import { Github } from '$lib/github.js';
import { gql } from 'svelte-ux';
// import type { User } from '@octokit/graphql-schema';

export async function load({ parent, url }) {
  const { accessToken } = await parent();

  const owner = url.searchParams.get('owner') ?? 'techniq';
  const repo = url.searchParams.get('repo') ?? 'svelte-ux';

  const variables = { owner, repo };

  return {
    stargazers: fetchStargazers(accessToken, variables),
    variables
  };
}

async function fetchStargazers(accessToken: string, variables: { owner: string; repo: string }) {
  let stargazers = [];

  // TODO: Consider using API instead of GraphQL to fan out requests (like https://star-history.com and  https://seladb.github.io/) - `curl 'https://api.github.com/repos/techniq/svelte-ux/stargazers?per_page=100&page=1' -H 'accept: application/vnd.github.v3.star+json'`
  // TODO: Also consider only grabbing a few data points (like https://star-history.com).  Especially for very big repos
  // Both of these would break showing all users and follower details.  Could maybe paginate details (showing most recent)
  async function fetchPage(after: string | null = null) {
    const github = new Github(accessToken);
    const { repository } = await github.graphql<{ repository: any }>(
      gql`
        query ($owner: String!, $repo: String!, $after: String) {
          repository(owner: $owner, name: $repo) {
            stargazers(first: 100, after: $after) {
              edges {
                node {
                  name
                  login
                  avatarUrl
                  following {
                    totalCount
                  }
                  followers {
                    totalCount
                  }
                }
                starredAt
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `,
      { ...variables, after }
    );

    stargazers = stargazers.concat(
      repository.stargazers.edges.map((e: any) => {
        return {
          ...e.node,
          starredAt: e.starredAt
        };
      })
    );

    if (repository.stargazers.pageInfo.hasNextPage) {
      await fetchPage(repository.stargazers.pageInfo.endCursor);
    }
  }

  await fetchPage();

  return stargazers;
}
