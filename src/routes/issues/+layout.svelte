<script lang="ts">
  import { flatRollup, rollup } from 'd3-array';
  import { timeDay } from 'd3-time';

  import { mdiAccount, mdiDatabase, mdiPlay } from '@mdi/js';

  import { Button, Card, DividerDot, Duration, TextField } from 'svelte-ux';
  import {
    Area,
    Axis,
    Bars,
    BarChart,
    Chart,
    Layer,
    LinearGradient,
    LineChart,
    Rule,
    Tooltip
  } from 'layerchart';
  import { format, sortFunc, startOfInterval } from '@layerstack/utils';

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

  let chartDataByDay = $derived(
    flatRollup(
      chartData,
      (v) => v.length,
      (d) => startOfInterval('day', d.dt)
    )
      .map(([date, count]) => ({ date, count }))
      .sort(sortFunc('date'))
  );

  let chartDataByState = $derived(
    rollup(
      chartData,
      (v) =>
        flatRollup(
          v,
          (v) => v.length,
          (d) => startOfInterval('day', d.dt)
        )
          .map(([date, count]) => ({ date, count }))
          .sort(sortFunc('date')),
      (d) => d.stateAtdt
    )
  );
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
    <Card>
      <div class="h-20 py-2">
        <Chart
          data={chartDataByDay}
          x="date"
          xInterval={timeDay}
          y="count"
          padding={{ left: 36, right: 24 }}
          brush={{
            mode: 'separated',
            xDomain,
            onChange: (e) => {
              xDomain = e.xDomain as typeof xDomain;
            },
            onReset: () => {
              xDomain = null;
            },
            classes: {
              range: 'border border-surface-content/50 bg-surface-content/10 rounded'
            },
            handleSize: 10
          }}
        >
          <Layer type="svg">
            <Axis placement="left" tickSpacing={20} grid />
            <Rule y class="stroke-surface-content/20" />
            <Bars class="fill-secondary" insets={{ x: 0.2 }} />
          </Layer>
        </Chart>
      </div>
    </Card>

    <Card>
      <div slot="header">
        <div class="text-lg">Issues over time</div>
        <div class="text-sm text-surface-content/50">
          <span class="text-surface-content">
            <Duration duration={{ milliseconds: data.issues.medianDuration }} totalUnits={2} />
          </span> mean duration
        </div>
        <div class="text-sm text-surface-content/50"></div>
      </div>

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
                    <Duration duration={{ milliseconds: data.duration }} totalUnits={2} />
                  </Tooltip.Item>
                {/if}
                <Tooltip.Item label="Count" value={data.count} />
              </Tooltip.List>
            </Tooltip.Root>
          {/snippet}
        </LineChart>
      </div>
    </Card>

    <Card>
      <div slot="header">
        <div class="text-lg">Issues by state</div>
        <div class="text-sm text-surface-content/50">
          <span class="text-surface-content">{format(data.issues.issuesOpen)}</span> open
          <DividerDot />
          <span class="text-surface-content">{format(data.issues.issuesClosed)}</span> closed
          <DividerDot />
          <span class="text-surface-content">{format(data.issues.issuesTotal)}</span> total
        </div>
        <div class="text-sm text-surface-content/50"></div>
      </div>

      <div class="h-[300px]">
        <BarChart
          x="date"
          {xDomain}
          xInterval={timeDay}
          padding={{ left: 36, bottom: 40, right: 24 }}
          series={[
            {
              key: 'OPEN',
              data: Array.from(chartDataByState.get('OPEN') || []),
              value: (d) => d.count,
              color: 'var(--color-green-500)'
            },
            {
              key: 'CLOSED',
              data: Array.from(chartDataByState.get('CLOSED') || []),
              value: (d) => -d.count,
              color: 'var(--color-red-500)'
            }
          ]}
          props={{
            bars: { rounded: 'none', class: 'stroke-none', insets: { x: 0.2 } },
            xAxis: { tickMultiline: true },
            yAxis: { format: 'metric' },
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
              <Tooltip.Header value={data.date} format="day" />
              <Tooltip.List>
                {#each context.tooltip.payload as item}
                  <Tooltip.Item
                    label={item.key}
                    value={Math.abs(item.value ?? 0)}
                    color={item.color}
                  />
                {/each}
              </Tooltip.List>
            </Tooltip.Root>
          {/snippet}
        </BarChart>
      </div>
    </Card>

    {@render children?.()}
  </div>
</main>
