import { Github } from '$lib/github';
import { gql } from 'svelte-ux';

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
    gql`
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
