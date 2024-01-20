import { Github } from '$lib/github.js';
import { endOfYear, startOfWeek, startOfYear, subDays } from 'date-fns';
import { timeYear } from 'd3-time';
import { gql } from 'svelte-ux';
import { localToUtcDate } from 'svelte-ux/utils/date';
// import type { User } from '@octokit/graphql-schema';

export async function load({ parent, url }) {
  const { accessToken, user } = await parent();

  // TODO: use zod/etc to parse/validate
  const login = url.searchParams.get('login') ?? user.login;
  const from = url.searchParams.has('from')
    ? new Date(url.searchParams.get('from'))
    : startOfYear(new Date());
  const to = url.searchParams.has('to') ? new Date(url.searchParams.get('to')) : new Date();

  const variables = { login, from, to };

  return {
    commits: await fetchCommits(accessToken, variables),
    calendar: await fetchCalendar(accessToken, variables),
    variables
  };
}

async function fetchCommits(
  accessToken: string,
  variables: { login: string; from: Date; to: Date }
) {
  let data = [];

  async function fetchPage(from: Date, to: Date) {
    const github = new Github(accessToken);
    const { user } = await github.graphql<{ user: any }>(
      gql`
        query ($login: String!, $from: DateTime, $to: DateTime) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              startedAt
              endedAt
              hasAnyContributions
              hasActivityInThePast
              commitContributionsByRepository {
                repository {
                  nameWithOwner
                  description
                }
                contributions(first: 10) {
                  totalCount
                  nodes {
                    commitCount
                    occurredAt
                  }
                }
                url
              }
            }
          }
        }
      `,
      { ...variables, from, to }
    );

    data = data.concat(user.contributionsCollection.commitContributionsByRepository);
  }

  await Promise.allSettled(
    timeYear.range(startOfYear(variables.from), variables.to).map((from) => {
      return fetchPage(localToUtcDate(from), localToUtcDate(endOfYear(from)));
    })
  );

  return data;
}

async function fetchCalendar(
  accessToken: string,
  variables: { login: string; from: Date; to: Date }
) {
  let data = [];

  async function fetchPage(from: Date, to: Date) {
    const github = new Github(accessToken);
    const { user } = await github.graphql<{ user: any }>(
      gql`
        query ($login: String!, $from: DateTime, $to: DateTime) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  firstDay
                  contributionDays {
                    weekday
                    date
                    contributionCount
                    contributionLevel
                    color
                  }
                }
                months {
                  name
                  year
                  firstDay
                  totalWeeks
                }
              }
            }
          }
        }
      `,
      { ...variables, from, to }
    );

    data = data.concat(user.contributionsCollection.contributionCalendar);
  }

  await Promise.allSettled(
    timeYear.range(startOfYear(variables.from), variables.to).map((from) => {
      return fetchPage(localToUtcDate(from), localToUtcDate(endOfYear(from)));
    })
  );

  data = data.flatMap((d) => d.weeks.flatMap((w) => w.contributionDays));

  return data;
}
