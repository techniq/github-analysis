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
  const github = new Github(accessToken);
  const { repository } = await github.graphql<{ repository: any }>(
    gql`
      query ($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          stargazers(last: 100) {
            edges {
              node {
                name
                login
                avatarUrl
              }
              starredAt
            }
            pageInfo {
              hasNextPage
            }
            totalCount
          }
        }
      }
    `,
    variables
  );

  const stargazers = repository.stargazers.edges.map((e: any) => {
    return {
      ...e.node,
      starredAt: e.starredAt
    };
  });

  // TODO: Fetch remaining stargazers (100 per page based on `totalCount`)

  return stargazers;
}
