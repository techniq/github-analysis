<script lang="ts">
  import { flatRollup, max, min, sum } from 'd3-array';

  import { mdiCalendarRange, mdiPackage, mdiPlay } from '@mdi/js';

  import {
    Button,
    Card,
    DateRange,
    DateRangeDisplay,
    DateRangeField,
    TextField,
    getSettings
  } from 'svelte-ux';
  import { sort } from '@layerstack/utils';
  import { getDateFuncsByPeriodType, PeriodType } from '@layerstack/utils/date';

  import { Area, LinearGradient, LineChart, Tooltip } from 'layerchart';

  import { goto } from '$app/navigation';

  export let data;

  const { format, localeSettings } = getSettings();

  let pkg = data.variables.pkg;

  let dateRange: DateRange = {
    periodType: PeriodType.Day, // TODO: DateRange needs to improve WeekMon support
    from: data.variables.from,
    to: data.variables.to
  };

  function run() {
    const params = new URLSearchParams();
    params.set('pkg', pkg);
    params.set('from', dateRange.from);
    params.set('to', dateRange.to);
    goto(`?${params}`);
  }

  $: dateFuncs = getDateFuncsByPeriodType($localeSettings, dateRange.periodType);

  $: chartData = sort(
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
  );
</script>

<main>
  <form class="flex gap-2 bg-surface-100 border-b p-4" on:submit|preventDefault={run}>
    <TextField
      label="Package"
      bind:value={pkg}
      icon={mdiPackage}
      dense
      placeholder="Package"
      class="flex-1"
    />
    <DateRangeField
      label="Date Range"
      bind:value={dateRange}
      icon={mdiCalendarRange}
      dense
      periodTypes={[PeriodType.Day, PeriodType.WeekSun, PeriodType.Month, PeriodType.CalendarYear]}
      on:change={run}
      class="flex-1"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="primary">Run</Button>
  </form>

  <div class="p-4 grid gap-4">
    <Card
      title={data.variables.pkg}
      subheading="{$format(
        sum(data?.downloads ?? [], (d) => d.downloads),
        'integer'
      )} total downloads"
    >
      <div class="h-[300px]">
        <LineChart
          data={chartData}
          x="start"
          y="downloads"
          padding={{ left: 36, bottom: 32, right: 24 }}
          props={{
            xAxis: { format: PeriodType.Day },
            yAxis: { format: 'metric' }
          }}
          series={[{ key: 'downloads', color: 'hsl(var(--color-secondary))' }]}
        >
          <svelte:fragment slot="marks">
            <LinearGradient class="from-secondary/50 to-secondary/0" vertical let:gradient>
              <Area line={{ class: 'stroke-2 stroke-secondary' }} fill={gradient} tweened />
            </LinearGradient>
          </svelte:fragment>

          <svelte:fragment slot="tooltip">
            <Tooltip.Root let:data>
              <Tooltip.Header>
                <DateRangeDisplay
                  value={{ from: data.start, to: data.end, periodType: dateRange.periodType }}
                />
              </Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="Downloads" value={data.downloads} format="integer" />
              </Tooltip.List>
            </Tooltip.Root>
          </svelte:fragment>
        </LineChart>
      </div>
    </Card>
  </div>
</main>
