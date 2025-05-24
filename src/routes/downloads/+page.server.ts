import { Npm } from '$lib/npm';
import { timeDay, timeMonth, timeYear } from 'd3-time';
import { endOfYear, format, startOfYear } from 'date-fns';

export async function load({ url }) {
  // Use yesterday as current data is not available yet
  const yesterday = timeDay.offset(new Date(), -1);

  const pkg = url.searchParams.get('pkg') ?? 'layerchart';
  const from = url.searchParams.has('from')
    ? new Date(url.searchParams.get('from'))
    : timeMonth.offset(yesterday, -6);
  const to = url.searchParams.has('to') ? new Date(url.searchParams.get('to')) : yesterday;

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

  await Promise.allSettled(
    timeYear.range(startOfYear(variables.from), endOfYear(variables.to)).map((from) => {
      const start = from < variables.from ? variables.from : from;
      const end = endOfYear(from) > variables.to ? variables.to : endOfYear(from);
      return fetchPage(start, end);
    })
  );

  return data;
}
