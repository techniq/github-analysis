<script lang="ts">
  import { bin } from 'd3-array';
  import { timeDay, timeDays } from 'd3-time';

  import { mdiAccount, mdiDatabase, mdiPlay } from '@mdi/js';

  import { Button, Card, Duration, TextField } from 'svelte-ux';
  import { Area, BarChart, LinearGradient, LineChart, Tooltip } from 'layerchart';
  import { format } from '@layerstack/utils';

  import { goto } from '$app/navigation';

  let { data, children } = $props();

  let owner = $derived(data.variables.owner);
  let repo = $derived(data.variables.repo);

  let xDomain = $state<[Date, Date] | null>(null);

  function run() {
    const params = new URLSearchParams();
    params.set('owner', owner);
    params.set('repo', repo);
    goto(`?${params}`);
  }

  // Add running count for easier chart value
  let chartData = $derived(data.issues.sortedData);

  let binByTime = $derived(
    bin<(typeof chartData)[0], Date>()
      .thresholds((_data, min, max) => timeDays(min, max))
      .value((d) => d.dt)
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
      subheading="{format(data.issues.issuesOpen)} open, {format(data.issues.issuesTotal)} total issues"
    >

      <div class="text-sm text-surface-content/50 ml-4">Mean duration: <Duration duration={{milliseconds: data.issues.medianDuration}} totalUnits={2} /></div>
      <div class="h-[300px]">
        <LineChart
          data={chartData}
          x="dt"
          {xDomain}
          y="count"
          series={[{ key: 'count', color: 'var(--color-secondary)' }]}
          padding={{ left: 36, bottom: 40, right: 24 }}
          props={{
            xAxis: { tickMultiline: true },
            yAxis: { format: 'metric' }
          }}
          brush={{
            xDomain,
            onBrushEnd: (e) => {
              xDomain = e.xDomain as typeof xDomain;
            },
            resetOnEnd: true
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
              <Tooltip.Header value={data.dt} format="daytime" />
              <Tooltip.List>
                <Tooltip.Item label="State" value={data.stateAtdt} />
                <Tooltip.Item label="Title" value={data.title} />
                {#if data.duration}
                  <Tooltip.Item label="Duration">
                    <Duration duration={{milliseconds: data.duration}} totalUnits={2} />
                  </Tooltip.Item>
                {/if}
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
          {xDomain}
          xInterval={timeDay}
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
          brush={{
            xDomain,
            onBrushEnd: (e) => {
              xDomain = e.xDomain as typeof xDomain;
            },
            resetOnEnd: true
          }}
        >
          {#snippet tooltip({ context })}
            {@const data = context.tooltip.data}
            <Tooltip.Root>
              <Tooltip.Header value={data.x0} format="day" />
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
