<script lang="ts">
  import { fly } from 'svelte/transition';
  import { endOfYear, startOfWeek, startOfYear, subDays } from 'date-fns';
  import { flatGroup } from 'd3-array';
  import { scaleThreshold } from 'd3-scale';
  import { schemeGreens } from 'd3-scale-chromatic';

  import { mdiAccount, mdiCalendarRange, mdiOpenInNew, mdiPlay } from '@mdi/js';

  import {
    Button,
    Card,
    ProgressCircle,
    Header,
    graphStore,
    gql,
    Icon,
    ListItem,
    Overlay,
    TextField,
    DateRangeField,
    format,
    sortFunc
  } from 'svelte-ux';
  import { formatDate, localToUtcDate, PeriodType } from 'svelte-ux/utils/date';
  import type { DateRange } from 'svelte-ux/utils/dateRange';

  import { Calendar, Chart, Svg, Tooltip, TooltipItem, Group, Text } from 'layerchart';

  import { user } from '$lib/stores';

  let login = $user.login;

  let dateRange: DateRange = {
    periodType: PeriodType.Day,
    from: startOfWeek(subDays(new Date(), 365)),
    to: new Date()
  };

  let selectedDate: Date = null;

  const calendarQuery = graphStore({
    query: gql`
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
    config: {
      onDataChange(data) {
        return data.user.contributionsCollection.contributionCalendar;
      },
      force: true
    }
  });

  const commitsQuery = graphStore({
    query: gql`
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
    config: {
      onDataChange(data) {
        return data.user.contributionsCollection.commitContributionsByRepository;
      },
      force: true
    }
  });

  function fetchCalendar() {
    calendarQuery.fetch({
      variables: {
        login,
        from: dateRange.from,
        to: dateRange.to
      }
    });
  }

  function fetchCommits() {
    commitsQuery.fetch({
      variables: {
        login,
        from: selectedDate ?? localToUtcDate(dateRange.from),
        to: selectedDate ?? localToUtcDate(dateRange.to)
      }
    });
  }

  function fetchAll() {
    fetchCalendar();
    fetchCommits();
  }

  $: {
    selectedDate;
    fetchCommits();
  }

  fetchAll();

  $: console.log($calendarQuery.data);

  $: calendarData = $calendarQuery.data?.weeks.flatMap((w) => w.contributionDays);
  $: calendarDataByYear = flatGroup(calendarData ?? [], (d) => d.date.getFullYear()).sort(
    sortFunc((d) => d[0], 'desc')
  );
  $: console.log({ calendarData, calendarDataByYear });
</script>

<main>
  <form
    class="grid grid-cols-[1fr,1fr,auto] gap-2 bg-white border-b p-4"
    on:submit|preventDefault={fetchAll}
  >
    <TextField
      label="User"
      bind:value={login}
      icon={mdiAccount}
      dense
      placeholder="User to lookup"
    />
    <DateRangeField label="Date Range" bind:value={dateRange} icon={mdiCalendarRange} dense />
    <Button type="submit" icon={mdiPlay} variant="fill" color="blue">Run</Button>
  </form>

  <div class="p-4">
    <div class="grid gap-4">
      <Card loading={$calendarQuery.loading} class="min-h-[232px]">
        <Header
          title={$calendarQuery.data?.totalContributions ?? '...'}
          subheading="Contributions"
          slot="header"
        >
          <div slot="actions">
            {#if selectedDate}
              <Button on:click={() => (selectedDate = null)}>Reset</Button>
            {/if}
          </div>
        </Header>

        <div
          class="p-4 border rounded overflow-hidden"
          style:height="{140 * calendarDataByYear.length + 16}px"
        >
          <Chart
            data={calendarData}
            x="date"
            r="contributionCount"
            rScale={scaleThreshold().unknown('transparent')}
            rDomain={[1, 10, 20, 30]}
            rRange={['white', ...schemeGreens[4]]}
            padding={{ top: 8, left: 20 }}
            tooltip={{ mode: 'manual' }}
            let:tooltip
          >
            <Svg>
              {#each calendarDataByYear as [year, calendarData], i}
                {@const start = startOfYear(calendarData[0].date)}
                {@const end = endOfYear(calendarData[calendarData.length - 1].date)}
                <Group y={140 * i}>
                  <Text
                    value={year}
                    class="text-xs"
                    rotate={270}
                    x={-20}
                    y={(16 * 7) / 2}
                    textAnchor="middle"
                    verticalAnchor="start"
                  />
                  <Calendar {start} {end} {tooltip} cellSize={16} monthPath />
                </Group>
              {/each}
            </Svg>

            <Tooltip header={(d) => format(d.date, PeriodType.Day)} let:data>
              {#if data?.contributionCount != null}
                <TooltipItem
                  label="Contributions"
                  value={data.contributionCount}
                  format="integer"
                  valueAlign="right"
                />
              {/if}
            </Tooltip>
          </Chart>
        </div>

        <!-- <div class="grid grid-flow-col gap-1 justify-start px-4 pb-4">
          {#each $calendarQuery.data?.weeks ?? [] as week, i}
            <div class="week grid grid-rows-[repeat(7,1fr)] gap-1">
              {#each week.contributionDays as day}
                <Tooltip offset={2}>
                  <div
                    slot="title"
                    class="bg-black/90 text-white text-xs p-2 rounded pointer-events-none whitespace-nowrap"
                    transition:fly={{ y: -6, duration: 300 }}
                  >
                    <strong>{day.contributionCount} contributions</strong>
                    <div>on {formatDate(day.date, PeriodType.Day)}</div>
                  </div>
                  <div
                    class="w-4 h-4 rounded border border-black/10 transition-transform hover:scale-125 hover:opacity-100"
                    class:opacity-10={selectedDate && selectedDate !== day.date}
                    style="grid-row: {day.weekday + 1}; background-color: {day.color}"
                    on:click={() => (selectedDate = selectedDate === day.date ? null : day.date)}
                  />
                </Tooltip>
              {/each}
            </div>
          {/each}
        </div> -->
      </Card>

      <div>
        <div class="text-xs text-black/50 mb-1">Commits</div>

        <div class="relative min-h-[56px]">
          {#if $commitsQuery.loading}
            <Overlay center class="rounded">
              <ProgressCircle />
            </Overlay>
          {/if}

          {#each $commitsQuery.data ?? [] as d}
            <ListItem subheading={d.contributions.totalCount} list="type">
              <a
                slot="title"
                href="https://github.com/{d.repository.nameWithOwner}/commits"
                target="_blank"
                class="hover:text-blue-500"
              >
                {d.repository.nameWithOwner}
                <Icon path={mdiOpenInNew} size=".8em" />
              </a>
            </ListItem>
          {/each}
        </div>
      </div>
    </div>
  </div>
</main>
