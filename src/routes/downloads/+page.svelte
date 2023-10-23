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
    format,
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

  $: dateFuncs = getDateFuncsByPeriodType(dateRange.periodType);

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
  <form class="flex gap-2 bg-white border-b p-4" on:submit|preventDefault={run}>
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
    <Button type="submit" icon={mdiPlay} variant="fill" color="blue">Run</Button>
  </form>

  <div class="p-4 grid gap-4">
    <Card
      title={data.variables.pkg}
      subheading="{format(
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
        padding={{ left: 48, bottom: 32, right: 24 }}
        tooltip
      >
        <Svg>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" format={(d) => format(d, PeriodType.Month, 'short')} rule />
          <LinearGradient class="from-accent-500/50 to-accent-500/0" vertical let:url>
            <Area line={{ class: 'stroke-2 stroke-accent-500' }} fill={url} tweened />
          </LinearGradient>
          <Highlight points lines />
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
