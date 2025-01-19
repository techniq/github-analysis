import { Github } from '$lib/github.js';
import { gql } from '@layerstack/svelte-stores';
// import type { User } from '@octokit/graphql-schema';

export async function load({ parent }) {
  const { accessToken } = await parent();
  return {
    repositories: await fetchRepositories(accessToken)
  };
}

async function fetchRepositories(accessToken: string) {
  const github = new Github(accessToken);
  const { viewer } = await github.graphql<{ viewer: any }>(
    gql`
      query ($first: Int!, $isFork: Boolean) {
        viewer {
          name
          repositories(
            first: $first
            orderBy: { field: UPDATED_AT, direction: DESC }
            isFork: $isFork
          ) {
            nodes {
              nameWithOwner
              description
              stargazerCount
              isFork
              updatedAt
            }
          }
        }
      }
    `,
    {
      first: 100,
      isFork: false
    }
  );
  return viewer.repositories;
}
