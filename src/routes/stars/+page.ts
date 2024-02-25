import { Github } from '$lib/github.js';
import { gql } from 'svelte-ux';
// import type { User } from '@octokit/graphql-schema';

export async function load({ parent, url }) {
  const { accessToken } = await parent();

  const owner = url.searchParams.get('owner') ?? 'techniq';
  const repo = url.searchParams.get('repo') ?? 'svelte-ux';

  const before = url.searchParams.get('before');
  const after = url.searchParams.get('after');

  const variables = { owner, repo, before, after };

  return {
    stargazers: await fetchStargazers(accessToken, variables),
    variables
  };
}

async function fetchStargazers(
  accessToken: string,
  variables: { owner: string; repo: string; before: string; after: string }
) {
  const github = new Github(accessToken);
  const { repository } = await github.graphql<{ repository: any }>(
    gql`
      query ($owner: String!, $repo: String!, $before: String, $after: String) {
        repository(owner: $owner, name: $repo) {
          stargazers(first: 10, before: $before, after: $after) {
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
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
          }
        }
      }
    `,
    variables
  );

  const users = repository.stargazers.edges.map((e: any) => {
    return {
      ...e.node,
      starredAt: e.starredAt
    };
  });

  return { users, pageInfo: repository.stargazers.pageInfo };
}
