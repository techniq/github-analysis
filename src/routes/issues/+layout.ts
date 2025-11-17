import { Github } from '$lib/github.js';
import { sort } from '@layerstack/utils';
import { gql } from '@layerstack/svelte-stores';
import { timeMonth, timeYear } from 'd3-time';

export async function load({ parent, url }) {
  const { accessToken } = await parent();

  const owner = url.searchParams.get('owner') ?? 'techniq';
  const repo = url.searchParams.get('repo') ?? 'svelte-ux';

  const today = new Date();

  const from = url.searchParams.has('from')
    ? new Date(url.searchParams.get('from'))
    : timeYear.offset(today, -2);
  const to = url.searchParams.has('to') ? new Date(url.searchParams.get('to')) : today;

  const variables = { owner, repo, from, to };

  return {
    issues: await fetchIssues(accessToken, variables),
    variables
  };
}

async function fetchIssues(
  accessToken: string,
  variables: { owner: string; repo: string; from: Date; to: Date }
) {
  const github = new Github(accessToken);

  const { repository: stats } = await github.graphql<{ repository: any }>(
    gql`
      query ($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          issuesOpen: issues(filterBy: { states: [OPEN] }) {
            totalCount
          }
          issuesClosed: issues(filterBy: { states: [CLOSED] }) {
            totalCount
          }
          issues: issues {
            totalCount
          }
        }
      }
    `,
    variables
  );
  const issuesOpen = stats.issuesOpen.totalCount;
  const issuesClosed = stats.issuesClosed.totalCount;
  const issuesTotal = stats.issues.totalCount;

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
      { ...variables, since: variables.from.toISOString(), after }
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
  sortedData = sortedData.filter((c) => c.dt >= variables.from);

  durations = sort(durations);
  const medianDuration = durations[Math.floor(durations.length / 2)];

  return { sortedData, issuesOpen, issuesClosed, issuesTotal, medianDuration };
}
