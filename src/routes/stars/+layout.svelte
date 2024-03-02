<script lang="ts">
  import { scaleBand, scaleTime } from 'd3-scale';
  import { extent, flatRollup } from 'd3-array';
  import { timeDay } from 'd3-time';

  import { mdiAccount, mdiDatabase, mdiPlay } from '@mdi/js';

  import { Button, Card, PeriodType, TextField, format } from 'svelte-ux';
  import {
    Area,
    Axis,
    Bars,
    Chart,
    Highlight,
    LinearGradient,
    Svg,
    Tooltip,
    TooltipItem,
    Rule
  } from 'layerchart';

  import { goto } from '$app/navigation';

  export let data;

  let owner = data.variables.owner;
  let repo = data.variables.repo;

  function run() {
    const params = new URLSearchParams();
    params.set('owner', owner);
    params.set('repo', repo);
    goto(`?${params}`);
  }

  // Add running count for easier chart value
  $: chartData = data.stargazers.map((d, i) => {
    return {
      ...d,
      count: i + 1
    };
  });
  // .slice(-50);

  $: barChartData = flatRollup(
    chartData,
    (values) => values.length,
    (d) => timeDay.floor(d.starred_at)
  );

  $: extents = extent(barChartData, (d) => d[0]);
  $: xDomain = timeDay.range(extents[0], timeDay.offset(extents[1], 1)); // add offset to make end inclusive
</script>

<main>
  <form class="flex gap-2 bg-surface-100 border-b p-4" on:submit|preventDefault={run}>
    <TextField
      label="Owner"
      bind:value={owner}
      icon={mdiAccount}
      dense
      placeholder="User or organization"
      class="flex-1"
    />
    <TextField
      label="Repository"
      bind:value={repo}
      icon={mdiDatabase}
      dense
      placeholder="Name of repository"
      class="flex-1"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="primary">Run</Button>
  </form>

  <div class="p-4 grid gap-4">
    <Card
      title="{data.variables.owner}/{data.variables.repo}"
      subheading="{data.stargazers.length} stargazers"
    >
      <div class="h-[300px]">
        <Chart
          data={chartData}
          x="starred_at"
          xScale={scaleTime()}
          y="count"
          yDomain={[0, null]}
          yNice
          padding={{ left: 36, bottom: 32, right: 24 }}
          tooltip
        >
          <Svg>
            <Axis placement="left" grid rule format="metric" />
            <Axis placement="bottom" format={(d) => format(d, PeriodType.Day)} rule />
            <LinearGradient class="from-secondary/50 to-secondary/0" vertical let:url>
              <Area line={{ class: 'stroke-2 stroke-secondary' }} fill={url} tweened />
            </LinearGradient>
            <Highlight points={{ class: 'fill-secondary' }} lines />
          </Svg>

          <Tooltip header={(data) => format(data.starred_at, PeriodType.DayTime)} let:data>
            <TooltipItem label="User" value={data.user.login} />
            <TooltipItem label="Count" value={data.count} />
          </Tooltip>
        </Chart>
      </div>

      <div class="h-[100px]">
        <Chart
          data={barChartData}
          x={(d) => d[0]}
          xScale={scaleBand()}
          {xDomain}
          y={(d) => d[1]}
          yDomain={[0, null]}
          yNice
          padding={{ left: 36, bottom: 32, right: 24 }}
          tooltip
        >
          <Svg>
            <Axis placement="left" grid format="metric" ticks={3} />
            <!-- <Axis placement="bottom" grid format={(d) => format(d, PeriodType.Day)} /> -->
            <Rule y class="stroke-surface-content/20" />
            <Bars class="fill-secondary" />
            <Highlight area />
          </Svg>

          <Tooltip header={(data) => format(data[0], PeriodType.Day)} let:data>
            <TooltipItem label="Count" value={data[1]} />
          </Tooltip>
        </Chart>
      </div>
    </Card>

    <slot />
  </div>
</main>
