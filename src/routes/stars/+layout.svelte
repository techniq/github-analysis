<script lang="ts">
  import { format as formatDate } from 'date-fns';

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
      class="h-[300px]"
    >
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
          <Axis placement="bottom" format={(d) => format(d, PeriodType.Month)} rule />
          <LinearGradient class="from-secondary/50 to-secondary/0" vertical let:url>
            <Area line={{ class: 'stroke-2 stroke-secondary' }} fill={url} tweened />
          </LinearGradient>
          <Highlight points={{ class: 'fill-secondary' }} lines />
        </Svg>

        <Tooltip header={(data) => formatDate(data.starred_at, 'M/d/yyyy @ h:mm aa')} let:data>
          <TooltipItem label="User" value={data.user.login} />
          <TooltipItem label="Count" value={data.count} />
        </Tooltip>
      </Chart>
    </Card>

    <slot />
  </div>
</main>
