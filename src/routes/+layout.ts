import { Github } from '$lib/github';

export const ssr = false;

export async function load({ data }) {
  return {
    ...data,
    user: data.accessToken ? fetchUser(data.accessToken) : null
  };
}

async function fetchUser(accessToken: string) {
  const github = new Github(accessToken);
  const { viewer } = await github.graphql<{ viewer: any }>(
    `
      query {
        viewer {
          login
          name
        }
      }
    `
  );
  return viewer;
}
