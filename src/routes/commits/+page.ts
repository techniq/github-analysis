import { Github } from '$lib/github.js';
import { gql } from 'svelte-ux';
// import type { User } from '@octokit/graphql-schema';

export async function load({ parent, url }) {
  const { accessToken } = await parent();

  const owner = url.searchParams.get('owner') ?? 'techniq';
  const repo = url.searchParams.get('repo') ?? 'svelte-ux';
  const branch = url.searchParams.get('branch') ?? 'main';

  const variables = { owner, repo, branch };

  return {
    commits: fetchCommits(accessToken, variables),
    variables
  };
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
  return repository.ref.target.history.edges;
}
