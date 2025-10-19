import { Github } from '$lib/github.js';
import { gql } from '@layerstack/svelte-stores';
import { REPO_KIND } from './kind.js';
// import type { User } from '@octokit/graphql-schema';

type KindValue = (typeof REPO_KIND)[keyof typeof REPO_KIND]['value'];

export async function load({ parent, url }) {
  let kind: KindValue = url.searchParams.get('kind') as any;
  // if it's not a valid kind, default to myRepos.value
  if (!Object.values(REPO_KIND).some((k) => k.value === kind)) {
    kind = REPO_KIND.myTop.value;
  }
  const { accessToken } = await parent();
  return {
    kind: Object.values(REPO_KIND).find((k) => k.value === kind),
    repositories: await fetchRepositories(accessToken, kind)
  };
}

async function fetchRepositories(accessToken: string, kind: KindValue) {
  const github = new Github(accessToken);

  const first = 100;

  if (kind === REPO_KIND.myTop.value) {
    const { viewer } = await github.graphql<{ viewer: any }>(
      gql`
        query ($first: Int!) {
          viewer {
            name
            topRepositories(first: $first, orderBy: { field: UPDATED_AT, direction: DESC }) {
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
      { first }
    );
    return viewer.topRepositories;
  }

  if (kind === REPO_KIND.myContributions.value) {
    const { viewer } = await github.graphql<{ viewer: any }>(
      gql`
        query ($first: Int!) {
          viewer {
            name
            repositoriesContributedTo(
              first: $first
              orderBy: { field: UPDATED_AT, direction: DESC }
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
      { first }
    );
    return viewer.repositoriesContributedTo;
  }

  let isFork = kind === REPO_KIND.myForks.value ? true : false;
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
    { first, isFork }
  );
  return viewer.repositories;
}
