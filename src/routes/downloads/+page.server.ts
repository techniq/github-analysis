import { Npm } from '$lib/npm';
import { timeYear } from 'd3-time';
import { endOfYear, format, startOfYear, subYears } from 'date-fns';

export async function load({ url }) {
  const pkg = url.searchParams.get('pkg') ?? 'svelte-ux';
  const from = url.searchParams.has('from')
    ? new Date(url.searchParams.get('from'))
    : subYears(new Date(), 1);
  const to = url.searchParams.has('to') ? new Date(url.searchParams.get('to')) : new Date();

  const variables = { pkg, from, to };

  return {
    downloads: await fetchDownloads(variables),
    variables
  };
}

async function fetchDownloads(variables: { pkg: string; from: Date; to: Date }) {
  const npm = new Npm();

  let data = [];

  async function fetchPage(from: Date, to: Date) {
    const resource = `/downloads/range/${format(from, 'yyyy-MM-dd')}:${format(to, 'yyyy-MM-dd')}/${
      variables.pkg
    }`;
    const { downloads } = await npm.api<{ downloads: { downloads: number; day: Date }[] }>(
      resource
    );

    if (downloads) {
      data = data.concat(downloads);
    }
  }

  // TODO: Pass period and use getDateFuncsByPeriodType(...).start() / .end() instead of startOfYear() / endOfYear()
  await Promise.allSettled(
    timeYear.range(startOfYear(variables.from), variables.to).map((from) => {
      return fetchPage(from, endOfYear(from));
    })
  );

  return data;
}
