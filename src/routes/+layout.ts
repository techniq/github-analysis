import { gql } from 'svelte-ux';
import posthog from 'posthog-js';
import { redirect } from '@sveltejs/kit';

import { browser, dev } from '$app/environment';
import { Github } from '$lib/github';

export const ssr = false;

export async function load({ data }) {
  // Setup Posthog
  if (browser && !dev) {
    posthog.init('phc_b25U7RtbMNPIhQUg0y2Ndo0kpmcoPHS5N4EaCYfw5YU', {
      api_host: 'https://app.posthog.com',
      capture_pageview: false,
      capture_pageleave: false
    });
  }

  return {
    ...data,
    user: data.accessToken ? await fetchUser(data.accessToken) : null
  };
}

async function fetchUser(accessToken: string) {
  const github = new Github(accessToken);
  const result = await github.graphql<{ viewer: any }>(gql`
    query {
      viewer {
        login
        name
        avatarUrl
      }
    }
  `);

  if (result == null) {
    // Unauthorized (401)
    redirect(302, '/auth/login');
  }
  return result.viewer;
}
