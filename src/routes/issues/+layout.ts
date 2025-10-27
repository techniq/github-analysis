import { Github } from '$lib/github.js';
import { sort } from '@layerstack/utils';
import { gql } from '@layerstack/svelte-stores';
import { average } from '@layerstack/utils/array';

export async function load({ parent, url }) {
  const { accessToken } = await parent();

  const owner = url.searchParams.get('owner') ?? 'techniq';
  const repo = url.searchParams.get('repo') ?? 'svelte-ux';

  const variables = { owner, repo };

  return {
    issues: await fetchIssues(accessToken, variables),
    variables
  };
}

async function fetchIssues(accessToken: string, variables: { owner: string; repo: string }) {
  const github = new Github(accessToken);

  const { repository: stats } = await github.graphql<{ repository: any }>(
    gql`
      query ($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          open: issues(filterBy: { states: [OPEN] }) {
            totalCount
          }
          total: issues {
            totalCount
          }
        }
      }
    `,
    variables
  );
  const issuesOpen = stats.open.totalCount;
  const issuesTotal = stats.total.totalCount;

  // max 1 year back
  const since = new Date(new Date().valueOf() - 2 * 365 * 24 * 60 * 60 * 1000);

  const getIssues = async (after: string | undefined) => {
    const { repository } = await github.graphql<{ repository: any }>(
      gql`
        query ($owner: String!, $repo: String!, $since: DateTime, $after: String) {
          repository(owner: $owner, name: $repo) {
            issues(
              first: 100
              filterBy: { since: $since }
              orderBy: { field: CREATED_AT, direction: DESC }
              after: $after
            ) {
              nodes {
                title
                state
                stateReason
                closedAt
                closed
                createdAt
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }
      `,
      { ...variables, since: since.toISOString(), after }
    );
    return repository.issues;
  };

  let issues = [];
  let hasNextPage = true;
  let endCursor = undefined;
  while (hasNextPage) {
    const newIssues = await getIssues(endCursor);
    hasNextPage = newIssues.pageInfo.hasNextPage;
    endCursor = newIssues.pageInfo.endCursor;
    issues = issues.concat(newIssues.nodes);
  }

  const data: {
    dt: Date;
    title: string;
    stateAtdt: 'OPEN' | 'CLOSED';
    count?: number;
    duration?: number;
  }[] = [];
  let durations = [];
  for (let issue of issues) {
    const duration = issue.closed
      ? new Date(issue.closedAt).getTime() - new Date(issue.createdAt).getTime()
      : undefined;
    if (issue.closed) {
      durations.push(duration);
      data.push({
        dt: new Date(issue.closedAt),
        title: issue.title,
        stateAtdt: 'CLOSED',
        duration
      });
    }
    data.push({ dt: new Date(issue.createdAt), title: issue.title, stateAtdt: 'OPEN', duration });
  }
  let sortedData = sort(data, 'dt', 'desc');
  let count = issuesOpen;
  for (let issue of sortedData) {
    issue.count = count;
    count += issue.stateAtdt === 'CLOSED' ? 1 : -1;
  }

  // Let's filter again data because with some transferts we can have issues before the since date..
  sortedData = sortedData.filter((c) => c.dt >= since);

  // Let's remove the 5% of each extrema durations
  durations = sort(durations);
  const percent = Math.floor(durations.length * 0.05);
  durations = durations.slice(percent, durations.length - percent);
  const averageDuration = average(durations);

  return { sortedData, issuesOpen, issuesTotal, averageDuration };
}
