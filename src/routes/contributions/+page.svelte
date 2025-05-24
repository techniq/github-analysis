<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { endOfYear, startOfYear } from 'date-fns';
  import { flatGroup, sum } from 'd3-array';
  import { scaleThreshold } from 'd3-scale';

  import { mdiAccount, mdiCalendarRange, mdiOpenInNew, mdiPlay } from '@mdi/js';

  import { Button, Card, Header, Icon, ListItem, TextField, DateRangeField } from 'svelte-ux';
  import { Calendar, Chart, Svg, Tooltip, Group, Text } from 'layerchart';
  import { format, sortFunc, PeriodType } from '@layerstack/utils';

  import { goto } from '$app/navigation';

  let { data } = $props();

  let login = $derived(data.variables.login);

  let dateRange = $state<ComponentProps<DateRangeField>['value']>({
    periodType: PeriodType.CalendarYear,
    from: data.variables.from,
    to: data.variables.to
  });

  let selectedDate = $state<Date | null>(null);

  function run() {
    const params = new URLSearchParams();
    params.set('login', login);
    params.set('from', dateRange.from.toISOString());
    params.set('to', dateRange.to.toISOString());
    goto(`?${params}`);
  }

  let calendarDataByYear = $derived(
    flatGroup(data.calendar ?? [], (d) => d.date.getFullYear()).sort(sortFunc((d) => d[0], 'desc'))
  );
</script>

<main>
  <form
    class="grid grid-cols-[1fr_1fr_auto] gap-2 bg-surface-100 border-b p-4"
    onsubmit={(e) => {
      e.preventDefault();
      run();
    }}
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
          class="p-4 border rounded-sm overflow-hidden"
          style:height="{140 * calendarDataByYear.length + 16}px"
        >
          <Chart
            data={data.calendar}
            x="date"
            c="contributionCount"
            cScale={scaleThreshold().unknown('transparent')}
            cDomain={[1, 10, 20, 30]}
            cRange={[
              'var(--color-surface-100)',
              'var(--color-primary-300)',
              'var(--color-primary-500)',
              'var(--color-primary-700)',
              'var(--color-primary-900)'
            ]}
            padding={{ top: 8, left: 20 }}
          >
            {#snippet children({ context })}
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
                    <Calendar
                      {start}
                      {end}
                      tooltipContext={context.tooltip}
                      cellSize={16}
                      monthPath
                    />
                  </Group>
                {/each}
              </Svg>

              <Tooltip.Root>
                {#snippet children({ data })}
                  <Tooltip.Header>{format(data.date, PeriodType.Day)}</Tooltip.Header>
                  {#if data?.contributionCount != null}
                    <Tooltip.List>
                      <Tooltip.Item
                        label="Contributions"
                        value={data.contributionCount}
                        format="integer"
                        valueAlign="right"
                      />
                    </Tooltip.List>
                  {/if}
                {/snippet}
              </Tooltip.Root>
            {/snippet}
          </Chart>
        </div>
      </Card>

      <div>
        <div class="text-xs text-surface-content/50 mb-1 tracking-widest">Commits</div>

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
