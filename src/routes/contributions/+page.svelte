<script lang="ts">
  import { endOfYear, startOfWeek, startOfYear, subDays } from 'date-fns';
  import { flatGroup, sum } from 'd3-array';
  import { scaleThreshold } from 'd3-scale';
  import { schemeGreens } from 'd3-scale-chromatic';

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

  let dateRange: DateRange = {
    periodType: PeriodType.Day,
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

<main>
  <form
    class="grid grid-cols-[1fr,1fr,auto] gap-2 bg-white border-b p-4"
    on:submit|preventDefault={run}
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
          class="p-4 border rounded overflow-hidden"
          style:height="{140 * calendarDataByYear.length + 16}px"
        >
          <Chart
            data={data.calendar}
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
      </Card>

      <div>
        <div class="text-xs text-black/50 mb-1">Commits</div>

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
