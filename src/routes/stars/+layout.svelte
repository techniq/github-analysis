<script lang="ts">
  import { bin } from 'd3-array';
  import { timeDays } from 'd3-time';

  import { mdiAccount, mdiDatabase, mdiPlay } from '@mdi/js';

  import { Button, Card, TextField } from 'svelte-ux';
  import { Area, BarChart, LinearGradient, LineChart, Tooltip } from 'layerchart';
  import { format, PeriodType } from '@layerstack/utils';

  import { goto } from '$app/navigation';

  let { data, children } = $props();

  let owner = $derived(data.variables.owner);
  let repo = $derived(data.variables.repo);

  function run() {
    const params = new URLSearchParams();
    params.set('owner', owner);
    params.set('repo', repo);
    goto(`?${params}`);
  }

  // Add running count for easier chart value
  let chartData = $derived(
    data.stargazers.map((d, i) => {
      return {
        ...d,
        count: i + 1
      };
    })
    // .slice(-50);
  );

  let binByTime = $derived(
    bin<(typeof chartData)[0], Date>()
      .thresholds((_data, min, max) => timeDays(min, max))
      .value((d) => d.starred_at)
  );
  let chartDataByDay = $derived(binByTime(chartData));
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
      label="Owner"
      bind:value={owner}
      icon={mdiAccount}
      dense
      placeholder="User or organization"
      class="grow"
    />
    <TextField
      label="Repository"
      bind:value={repo}
      icon={mdiDatabase}
      dense
      placeholder="Name of repository"
      class="grow"
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
          padding={{ left: 36, bottom: 40, right: 24 }}
          props={{
            xAxis: { tickMultiline: true },
            yAxis: { format: 'metric' }
          }}
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
              <Tooltip.Header>{format(data.starred_at, PeriodType.DayTime)}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="User" value={data.user.login} />
                <Tooltip.Item label="Count" value={data.count} />
              </Tooltip.List>
            </Tooltip.Root>
          {/snippet}
        </LineChart>
      </div>

      <div class="h-[100px]">
        <BarChart
          data={chartDataByDay}
          x="x0"
          y="length"
          yDomain={[0, null]}
          padding={{ left: 36, bottom: 32, right: 24 }}
          axis="y"
          grid={false}
          props={{
            tooltip: { context: { mode: 'bisect-x' } },
            bars: { rounded: 'none', class: 'stroke-none fill-secondary' },
            yAxis: { grid: true, format: 'metric', ticks: 3 },
            rule: { class: 'stroke-surface-content/20' }
          }}
        >
          {#snippet tooltip({ context })}
            {@const data = context.tooltip.data}
            <Tooltip.Root>
              <Tooltip.Header>{format(data.x0, PeriodType.Day)}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="Count" value={data.length} />
              </Tooltip.List>
            </Tooltip.Root>
          {/snippet}
        </BarChart>
      </div>
    </Card>

    {@render children?.()}
  </div>
</main>
