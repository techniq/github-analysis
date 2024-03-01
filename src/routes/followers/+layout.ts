import { Github, type UserApi } from '$lib/github.js';
import { range } from 'd3-array';
import { gql, sort } from 'svelte-ux';

export async function load({ parent, url }) {
  const { accessToken } = await parent();

  const login = url.searchParams.get('login') ?? 'techniq';

  const variables = { login };

  return {
    followers: await fetchFollowers(accessToken, variables),
    variables
  };
}

async function fetchFollowers(accessToken: string, variables: { login: string }) {
  const github = new Github(accessToken);

  let followers: UserApi[] = [];

  const user = await github.api<UserApi>(`users/${variables.login}`, {});

  const perPage = 100;

  async function fetchPage(page) {
    // https://docs.github.com/en/rest/users/followers
    const result = await github.api<UserApi[]>(`users/${variables.login}/followers`, {
      data: {
        per_page: perPage,
        page
      },
      headers: {
        accept: 'application/vnd.github+json'
      }
    });

    followers = followers.concat(result);
  }

  await Promise.allSettled(
    range(Math.ceil(user.followers / perPage)).map((page) => {
      return fetchPage(page + 1);
    })
  );

  // return sort(followers, 'starred_at');
  // TODO: Sort by page?
  return followers;
}
