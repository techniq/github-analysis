import { Github } from '$lib/github.js';

export async function load({ parent, url }) {
  const { accessToken } = await parent();

  const owner = url.searchParams.get('owner') ?? 'techniq';
  const repo = url.searchParams.get('repo') ?? 'svelte-ux';

  const variables = { owner, repo };

  const github = new Github(accessToken);

  const punchCard = await github
    .api<[number, number, number][]>(`repos/${owner}/${repo}/stats/punch_card`)
    .then((d) => {
      return d.map((d) => {
        return { weekday: d[0], hour: d[1], count: d[2] };
      });
    });

  return {
    punchCard,
    variables
  };
}
