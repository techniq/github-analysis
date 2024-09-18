<script lang="ts">
  import { endOfYear, startOfYear } from 'date-fns';
  import { flatGroup, sum } from 'd3-array';
  import { scaleThreshold } from 'd3-scale';

  import { mdiAccount, mdiCalendarRange, mdiOpenInNew, mdiPlay } from '@mdi/js';

  import {
    Button,
    Card,
    Header,
    Icon,
    ListItem,
    TextField,
    DateRangeField,
    format,
    sortFunc,
    PeriodType,
    DateRange
  } from 'svelte-ux';
  import { Calendar, Chart, Svg, Tooltip, TooltipItem, Group, Text } from 'layerchart';

  import { goto } from '$app/navigation';

  export let data;

  let login = data.variables.login;

  //@ts-expect-error
  let dateRange: DateRange = {
    periodType: PeriodType.CalendarYear,
    from: data.variables.from,
    to: data.variables.to
  };

  let selectedDate: Date = null;

  function run() {
    const params = new URLSearchParams();
    params.set('login', login);
    params.set('from', dateRange.from);
    params.set('to', dateRange.to);
    goto(`?${params}`);
  }

  $: calendarDataByYear = flatGroup(data.calendar ?? [], (d) => d.date.getFullYear()).sort(
    sortFunc((d) => d[0], 'desc')
  );
</script>

<svelte:head>
  <title>{login} - GitHub Contributions</title> 
  <meta name="description" content="View and analyze the GitHub contributions of {login} over time. Explore their commit history, activity levels, and more." />

  <!-- Open Graph meta tags for social media sharing -->
  <meta property="og:title" content="{login} - GitHub Contributions" />
  <meta property="og:description" content="View and analyze the GitHub contributions of {login} over time. Explore their commit history, activity levels, and more." />
  <meta property="og:type" content="website" /> 
  <meta property="og:url" content="https://github.techniq.dev/contributions/{login}" /> 
  //TODO: #9 Add a relevant image URL
  <meta property="og:image" content="https://github.techniq.dev/opengraph-image.jpg" /> <!-- Replace with a relevant image URL -->

  <!-- Twitter Card meta tags -->
  <meta name="twitter:card" content="summary_large_image" /> <!-- Use "summary_large_image" for better visibility -->
  <meta name="twitter:title" content="{login} - GitHub Contributions" />
  <meta name="twitter:description" content="View and analyze the GitHub contributions of {login} over time. Explore their commit history, activity levels, and more." />
  //TODO: Add a relevant image URL
  <meta name="twitter:image" content="https://github.techniq.dev/twitter-image.jpg" /> <!-- Replace with a relevant image URL -->

  <!-- Consider adding a canonical URL if applicable -->
  <link rel="canonical" href="https://github.techniq.dev/contributions/{login}" />

  <!-- Additional meta tags for better SEO -->
  <meta name="keywords" content="GitHub, contributions, open source, developer, profile, analysis, {login}" />
</svelte:head>




<main>
  <form
    class="grid grid-cols-[1fr,1fr,auto] gap-2 border-b bg-surface-100 p-4"
    on:submit|preventDefault={run}
  >
    <TextField
      label="User"
      bind:value={login}
      icon={mdiAccount}
      dense
      placeholder="User to lookup"
    />
    <DateRangeField
    label="Date Range"
    bind:value={dateRange}
    icon={mdiCalendarRange}
    dense
    on:change={run}
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="primary">Run</Button>
  </form>

  <div class="p-4">
    <div class="grid gap-4">
      <Card class="min-h-[232px]">
        <Header
          title={format(
            sum(data.calendar, (d) => d.contributionCount),
            'integer'
          ) || '...'}
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
          class="overflow-hidden rounded border p-4"
          style:height="{140 * calendarDataByYear.length + 16}px"
        >
          <Chart
            data={data.calendar}
            x="date"
            r="contributionCount"
            rScale={scaleThreshold().unknown('transparent')}
            rDomain={[1, 10, 20, 30]}
            rRange={[
              'hsl(var(--color-surface-100))',
              'hsl(var(--color-primary-300))',
              'hsl(var(--color-primary-500))',
              'hsl(var(--color-primary-700))',
              'hsl(var(--color-primary-900))'
            ]}
            padding={{ top: 8, left: 20 }}
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
      </Card>

      <div>
        <div class="mb-1 text-xs tracking-widest text-surface-content/50">Commits</div>

        <div class="relative min-h-[56px]">
          {#each data.commits ?? [] as d}
            <ListItem
              subheading="{format(d.contributions.totalCount, 'integer')} commits"
              list="type"
            >
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
