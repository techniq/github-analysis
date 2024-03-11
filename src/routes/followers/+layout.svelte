<script lang="ts">
  import { mdiAccount, mdiDatabase, mdiPlay } from '@mdi/js';

  import { Button, Card, PeriodType, TextField, format } from 'svelte-ux';

  import { goto } from '$app/navigation';
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
  import { scaleTime } from 'd3-scale';

  export let data;

  let login = data.variables.login;

  function run() {
    const params = new URLSearchParams();
    params.set('login', login);
    goto(`?${params}`);
  }

  // Add running count for easier chart value
  $: chartData = data.followers.map((d, i) => {
    return {
      ...d,
      count: i + 1
    };
  });
</script>

<main>
  <form class="flex gap-2 bg-surface-100 border-b p-4" on:submit|preventDefault={run}>
    <TextField
      label="User"
      bind:value={login}
      icon={mdiAccount}
      dense
      placeholder="User or organization"
      class="flex-1"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="primary">Run</Button>
  </form>

  <div class="p-4 grid gap-4">
    <Card
      title={data.variables.login}
      subheading="{data.followers.length} followers"
      class="h-[300px]"
    >
      <div
        class="h-full grid place-items-center m-3 bg-surface-200/50 text-surface-content/30 rounded-lg border"
      >
        TODO: Determine way to find follow date to allow visualization
      </div>
      <!-- <Chart
        data={chartData}
        x="id"
        xScale={scaleTime()}
        y="count"
        yDomain={[0, null]}
        yNice
        padding={{ left: 36, bottom: 32, right: 24 }}
        tooltip
      >
        <Svg>
          <Axis placement="left" grid rule format="metric" />
          <Axis placement="bottom" format={(d) => format(d, PeriodType.Month)} rule />
          <LinearGradient class="from-secondary/50 to-secondary/0" vertical let:url>
            <Area line={{ class: 'stroke-2 stroke-secondary' }} fill={url} tweened />
          </LinearGradient>
          <Highlight points={{ class: 'fill-secondary' }} lines />
        </Svg>

        <Tooltip header={(data) => formatDate(data.starred_at, 'M/d/yyyy @ h:mm aa')} let:data>
          <TooltipItem label="User" value={data.login} />
          <TooltipItem label="Count" value={data.count} />
        </Tooltip>
      </Chart> -->
    </Card>

    <slot />
  </div>
</main>
