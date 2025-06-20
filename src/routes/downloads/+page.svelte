<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { flatRollup, max, min, sum } from 'd3-array';
  import { timeDay, timeMonth, timeYear } from 'd3-time';

  import { mdiCalendarRange, mdiPackage, mdiPlay } from '@mdi/js';

  import {
    Button,
    Card,
    DateRangeDisplay,
    DateRangeField,
    Header,
    TextField,
    ToggleGroup,
    ToggleOption,
    getSettings
  } from 'svelte-ux';
  import { sort } from '@layerstack/utils';
  import { getDateFuncsByPeriodType, PeriodType } from '@layerstack/utils/date';

  import { Area, LinearGradient, LineChart, Tooltip } from 'layerchart';

  import { goto } from '$app/navigation';

  let { data } = $props();

  const { format, localeSettings } = getSettings();

  let pkg = $derived(data.variables.pkg);

  let dateRange = $state<ComponentProps<DateRangeField>['value']>({
    periodType: PeriodType.Day,
    from: data.variables.from,
    to: data.variables.to
  });

  function run() {
    const params = new URLSearchParams();
    params.set('pkg', pkg);
    params.set('from', dateRange.from.toISOString());
    params.set('to', dateRange.to.toISOString());
    goto(`?${params}`);
  }

  let dateFuncs = $derived(getDateFuncsByPeriodType($localeSettings, dateRange.periodType));

  let chartData = $derived(
    sort(
      flatRollup(
        data.downloads,
        (values) => {
          return {
            start: min(values, (d) => d.day),
            end: max(values, (d) => d.day),
            downloads: sum(values, (d) => d.downloads)
          };
        },
        (d) => dateFuncs.start(d.day)
      ).map((d) => d[1]),
      (d) => d.start
    )
  );

  // Use yesterday as current data is not available yet
  const yesterday = timeDay.offset(new Date(), -1);
</script>

<main>
  <form
    class="flex gap-2 bg-surface-100 border-b p-4"
    onsubmit={(e) => {
      e.preventDefault();
      run();
    }}
  >
    <TextField
      label="Package"
      bind:value={pkg}
      icon={mdiPackage}
      dense
      placeholder="Package"
      class="grow"
    />
    <DateRangeField
      label="Date Range"
      bind:value={dateRange}
      icon={mdiCalendarRange}
      dense
      periodTypes={[PeriodType.Day, PeriodType.WeekSun, PeriodType.Month, PeriodType.CalendarYear]}
      quickPresets={[
        {
          label: 'Last 90 days',
          value: { periodType: PeriodType.Day, from: timeDay.offset(yesterday, -90), to: yesterday }
        },
        {
          label: 'Year to date',
          value: { periodType: PeriodType.Week, from: timeYear.floor(yesterday), to: yesterday }
        },
        {
          label: 'Last 6 months',
          value: {
            periodType: PeriodType.Day,
            from: timeMonth.offset(yesterday, -6),
            to: yesterday
          }
        },
        {
          label: 'Last 12 months',
          value: {
            periodType: PeriodType.Week,
            from: timeMonth.offset(yesterday, -12),
            to: yesterday
          }
        },
        {
          label: 'Last 36 months',
          value: {
            periodType: PeriodType.Month,
            from: timeMonth.offset(yesterday, -36),
            to: yesterday
          }
        },
        {
          label: 'Last 5 years',
          value: {
            periodType: PeriodType.CalendarYear,
            from: timeYear.offset(yesterday, -5),
            to: yesterday
          }
        },
        {
          label: 'Last 10 years',
          value: {
            periodType: PeriodType.CalendarYear,
            from: timeYear.offset(yesterday, -10),
            to: yesterday
          }
        }
      ]}
      on:change={run}
      class="grow"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="primary">Run</Button>
  </form>

  <div class="p-4 grid gap-4">
    <Card>
      <Header
        title={data.variables.pkg}
        subheading="{$format(
          sum(data?.downloads ?? [], (d) => d.downloads),
          'integer'
        )} total downloads"
        slot="header"
      >
        <div slot="actions">
          <ToggleGroup bind:value={dateRange.periodType} variant="outline" rounded="full" inset>
            <ToggleOption value={PeriodType.Day}>Day</ToggleOption>
            <ToggleOption value={PeriodType.Week}>Week</ToggleOption>
            <ToggleOption value={PeriodType.Month}>Month</ToggleOption>
            <ToggleOption value={PeriodType.CalendarYear}>Year</ToggleOption>
          </ToggleGroup>
        </div>
      </Header>

      <div class="h-[300px]">
        <LineChart
          data={chartData}
          x="start"
          y="downloads"
          padding={{ left: 36, bottom: 40, right: 24 }}
          props={{
            xAxis: { tickMultiline: true },
            yAxis: { format: 'metric' }
          }}
          series={[{ key: 'downloads', color: 'var(--color-secondary)' }]}
        >
          {#snippet marks()}
            <LinearGradient class="from-secondary/50 to-secondary/1" vertical>
              {#snippet children({ gradient })}
                <Area
                  line={{ class: 'stroke-2 stroke-secondary' }}
                  fill={gradient}
                  motion="tween"
                />
              {/snippet}
            </LinearGradient>
          {/snippet}

          {#snippet tooltip({ context })}
            {@const data = context.tooltip.data}
            <Tooltip.Root>
              <Tooltip.Header>
                <DateRangeDisplay
                  value={{ from: data.start, to: data.end, periodType: dateRange.periodType }}
                />
              </Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="Downloads" value={data.downloads} format="integer" />
              </Tooltip.List>
            </Tooltip.Root>
          {/snippet}
        </LineChart>
      </div>
    </Card>
  </div>
</main>
