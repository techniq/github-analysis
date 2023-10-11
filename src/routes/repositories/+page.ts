import { Github } from '$lib/github.js';
import { gql } from 'svelte-ux';
// import type { User } from '@octokit/graphql-schema';

export async function load({ parent }) {
  const { accessToken } = await parent();
  return {
    repositories: fetchRepositories(accessToken)
  };
}

async function fetchRepositories(accessToken: string) {
  const github = new Github(accessToken);
  const { viewer } = await github.graphql<{ viewer: any }>(
    gql`
      query ($last: Int!) {
        viewer {
          name
          repositories(last: $last) {
            nodes {
              nameWithOwner
              description
            }
          }
        }
      }
    `,
    {
      last: 100
    }
  );
  return viewer.repositories;
}
