import { Github } from '$lib/github';
import { redirect } from '@sveltejs/kit';
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
  const result = await github.graphql<{ viewer: any }>(gql`
    query {
      viewer {
        login
        name
      }
    }
  `);

  if (result == null) {
    // Unauthorized (401)
    throw redirect(302, '/auth/login');
  }
  return result.viewer;
}
