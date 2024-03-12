<script lang="ts">
  import { flatRollup, max, min, sum } from 'd3-array';
  import { scaleTime } from 'd3-scale';

  import { mdiCalendarRange, mdiPackage, mdiPlay } from '@mdi/js';

  import {
    Button,
    Card,
    DateRange,
    DateRangeDisplay,
    DateRangeField,
    PeriodType,
    TextField,
    getSettings,
    sort
  } from 'svelte-ux';
  import { getDateFuncsByPeriodType } from 'svelte-ux/utils/date';

  import {
    Area,
    Axis,
    Chart,
    Highlight,
    LinearGradient,
    Svg,
    Tooltip,
    TooltipItem
  } from 'layerchart';

  import { goto } from '$app/navigation';

  export let data;

  const { format, localeSettings } = getSettings();

  let pkg = data.variables.pkg;

  let dateRange: DateRange = {
    periodType: PeriodType.WeekMon,
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
      periodTypeOptions={[
        PeriodType.Day,
        PeriodType.WeekSun,
        PeriodType.Month,
        PeriodType.CalendarYear
      ]}
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
      class="h-[300px]"
    >
      <Chart
        data={chartData}
        x="start"
        xScale={scaleTime()}
        y="downloads"
        yDomain={[0, null]}
        yNice
        padding={{ left: 36, bottom: 32, right: 24 }}
        tooltip
      >
        <Svg>
          <Axis placement="left" grid rule format="metric" />
          <Axis placement="bottom" format={(d) => $format(d, PeriodType.Day)} rule />
          <LinearGradient class="from-secondary/50 to-secondary/0" vertical let:url>
            <Area line={{ class: 'stroke-2 stroke-secondary' }} fill={url} tweened />
          </LinearGradient>
          <Highlight points={{ class: 'fill-secondary' }} lines />
        </Svg>

        <Tooltip let:data>
          <div slot="header" let:data>
            <DateRangeDisplay
              value={{ from: data.start, to: data.end, periodType: dateRange.periodType }}
            />
          </div>
          <TooltipItem label="Downloads" value={data.downloads} format="integer" />
        </Tooltip>
      </Chart>
    </Card>
  </div>
</main>
