<script lang="ts">
  import { bin } from 'd3-array';
  import { timeDays } from 'd3-time';

  import { mdiAccount, mdiDatabase, mdiPlay } from '@mdi/js';

  import { Button, Card, TextField } from 'svelte-ux';
  import { Area, BarChart, LinearGradient, LineChart, Tooltip } from 'layerchart';
  import { format, PeriodType } from '@layerstack/utils';

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

  $: binByTime = bin()
    .thresholds((_data, min, max) => timeDays(min, max))
    .value((d) => d.starred_at);
  $: chartDataByDay = binByTime(chartData);
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
      subheading="{format(data.stargazers.length)} stargazers"
    >
      <div class="h-[300px]">
        <LineChart
          data={chartData}
          x="starred_at"
          y="count"
          series={[{ key: 'count', color: 'var(--color-secondary)' }]}
          padding={{ left: 36, bottom: 32, right: 24 }}
          props={{
            xAxis: { format: PeriodType.Day },
            yAxis: { format: 'metric' }
          }}
        >
          <svelte:fragment slot="marks">
            <LinearGradient class="from-secondary/50 to-secondary/1" vertical let:gradient>
              <Area line={{ class: 'stroke-2 stroke-secondary' }} fill={gradient} tweened />
            </LinearGradient>
          </svelte:fragment>

          <svelte:fragment slot="tooltip">
            <Tooltip.Root let:data>
              <Tooltip.Header>{format(data.starred_at, PeriodType.DayTime)}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="User" value={data.user.login} />
                <Tooltip.Item label="Count" value={data.count} />
              </Tooltip.List>
            </Tooltip.Root>
          </svelte:fragment>
        </LineChart>
      </div>

      <div class="h-[100px]">
        <BarChart
          data={chartDataByDay}
          x="x0"
          y="length"
          yDomain={[0, null]}
          padding={{ left: 36, bottom: 32, right: 24 }}
          tooltip={{ mode: 'bisect-x' }}
          axis="y"
          grid={false}
          props={{
            bars: { rounded: false, class: 'stroke-none fill-secondary' },
            yAxis: { grid: true, format: 'metric', ticks: 3 },
            rule: { class: 'stroke-surface-content/20' }
          }}
        >
          <svelte:fragment slot="tooltip">
            <Tooltip.Root let:data>
              <Tooltip.Header>{format(data.x0, PeriodType.Day)}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="Count" value={data.length} />
              </Tooltip.List>
            </Tooltip.Root>
          </svelte:fragment>
        </BarChart>
      </div>
    </Card>

    <slot />
  </div>
</main>
