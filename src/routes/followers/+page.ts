import { Github } from '$lib/github.js';
import { gql } from 'svelte-ux';
// import type { User } from '@octokit/graphql-schema';

export async function load({ parent, url }) {
  const { accessToken } = await parent();

  const login = url.searchParams.get('login') ?? 'techniq';

  const before = url.searchParams.get('before') ?? undefined;
  const after = url.searchParams.get('after') ?? undefined;

  const variables = { login, before, after };

  return {
    followers: await fetchFollowers(accessToken, variables),
    variables
  };
}

async function fetchFollowers(
  accessToken: string,
  variables: { login: string; before: string; after: string }
) {
  const github = new Github(accessToken);
  const { user } = await github.graphql<{ user: any }>(
    gql`
      query ($login: String!, $before: String, $after: String) {
        user(login: $login) {
          followers(first: 10, before: $before, after: $after) {
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
              cursor
              # starredAt
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

  const users = user.followers.edges.map((e: any) => {
    return {
      ...e.node,
      cursor: e.cursor
      // starredAt: e.starredAt
    };
  });

  return { users, pageInfo: user.followers.pageInfo };
}
