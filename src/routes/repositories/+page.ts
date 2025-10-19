import { Github } from '$lib/github.js';
import { gql } from '@layerstack/svelte-stores';
import { REPO_KIND } from './kind.js';

type KindValue = (typeof REPO_KIND)[keyof typeof REPO_KIND]['value'];
type SortField = 'UPDATED_AT' | 'CREATED_AT' | 'PUSHED_AT' | 'NAME' | 'STARGAZERS';

export async function load({ parent, url }) {
  let kind: KindValue = url.searchParams.get('kind') as any;
  // if it's not a valid kind, default to myRepos.value
  if (!Object.values(REPO_KIND).some((k) => k.value === kind)) {
    kind = REPO_KIND.myTop.value;
  }

  // Get sort parameter from URL, default to UPDATED_AT
  const sortParam = url.searchParams.get('sort')?.toUpperCase() as SortField;
  const sort: SortField = sortParam ?? 'UPDATED_AT';

  const { accessToken } = await parent();
  return {
    kind: Object.values(REPO_KIND).find((k) => k.value === kind),
    sort,
    repositories: await fetchRepositories(accessToken, kind, sort)
  };
}

async function fetchRepositories(
  accessToken: string,
  kind: KindValue,
  sort: SortField = 'UPDATED_AT'
) {
  const github = new Github(accessToken);

  const first = 100;
  const direction = sort === 'NAME' ? 'ASC' : 'DESC';

  if (kind === REPO_KIND.myTop.value) {
    const { viewer } = await github.graphql<{ viewer: any }>(
      gql`
        query ($first: Int!, $orderByField: RepositoryOrderField!, $direction: OrderDirection!) {
          viewer {
            name
            topRepositories(
              first: $first
              orderBy: { field: $orderByField, direction: $direction }
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
      { first, orderByField: sort, direction }
    );
    return viewer.topRepositories;
  }

  if (kind === REPO_KIND.myContributions.value) {
    const { viewer } = await github.graphql<{ viewer: any }>(
      gql`
        query ($first: Int!, $orderByField: RepositoryOrderField!, $direction: OrderDirection!) {
          viewer {
            name
            repositoriesContributedTo(
              first: $first
              orderBy: { field: $orderByField, direction: $direction }
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
      { first, orderByField: sort, direction }
    );
    return viewer.repositoriesContributedTo;
  }

  let isFork = kind === REPO_KIND.myForks.value ? true : false;
  let affiliations = kind === REPO_KIND.myOwned.value ? ['OWNER'] : null;

  const { viewer } = await github.graphql<{ viewer: any }>(
    gql`
      query (
        $first: Int!
        $isFork: Boolean
        $affiliations: [RepositoryAffiliation]
        $orderByField: RepositoryOrderField!
        $direction: OrderDirection!
      ) {
        viewer {
          name
          login
          repositories(
            first: $first
            orderBy: { field: $orderByField, direction: $direction }
            isFork: $isFork
            affiliations: $affiliations
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
    { first, isFork, affiliations, orderByField: sort, direction }
  );

  return viewer.repositories;
}
