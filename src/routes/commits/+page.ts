import { Github } from '$lib/github.js';
import { gql } from 'svelte-ux';
// import type { User } from '@octokit/graphql-schema';

export async function load({ parent, url }) {
  const { accessToken } = await parent();

  const owner = url.searchParams.get('owner') ?? 'techniq';
  const repo = url.searchParams.get('repo') ?? 'svelte-ux';
  const branch = url.searchParams.get('branch') ?? 'main';

  const variables = { owner, repo, branch };

  try {
    const commits = await fetchCommits(accessToken, variables);
    return { commits, variables };
  } catch (error) {
    console.error('Error fetching commits:', error);
    // Handle the error gracefully, e.g., show an error message to the user
    return {
      commits: [],
      variables,
      error: 'Failed to fetch commits. Please check the repository and branch details.'
    };
  }
}

async function fetchCommits(
  accessToken: string,
  variables: { owner: string; repo: string; branch: string }
) {
  const github = new Github(accessToken);
  const { repository } = await github.graphql<{ repository: any }>(
    gql`
      query ($owner: String!, $repo: String!, $branch: String!) {
        repository(owner: $owner, name: $repo) {
          diskUsage
          ref(qualifiedName: $branch) {
            target {
              ... on Commit {
                id
                history(first: 10) {
                  totalCount
                  pageInfo {
                    hasNextPage
                  }
                  edges {
                    node {
                      id
                      oid
                      message
                      author {
                        name
                        email
                        date
                        avatarUrl
                      }
                      committedDate
                      authoredDate
                      pushedDate
                      changedFiles
                      additions
                      deletions
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables
  );
  // Add error handling here
  if (!repository || !repository.ref || !repository.ref.target) {
    throw new Error('Invalid repository or branch.');
  }
  return repository.ref.target.history.edges;
}
