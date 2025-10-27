<script lang="ts">
  import { mdiAccount, mdiDatabase, mdiPlay } from '@mdi/js';
  import { scaleBand, scaleSqrt } from 'd3-scale';
  import { max, range } from 'd3-array';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import { Axis, Chart, Circle, Highlight, Points, Svg, Text, Tooltip } from 'layerchart';
  import { Button, Card, TextField } from 'svelte-ux';

  let { data } = $props();

  let owner = $derived(data.variables.owner);
  let repo = $derived(data.variables.repo);

  function run() {
    const params = new URLSearchParams();
    params.set('owner', owner);
    params.set('repo', repo);
    goto(`?${params}`);
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hoursOfDay = range(24).map((h) => `${h % 12 || 12}${h < 12 ? 'AM' : 'PM'}`);
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

  <div class="relative min-h-[56px] p-4">
    <!-- <Card class="grid grid-rows-[repeat(8,1fr)] grid-cols-[repeat(25,1fr)] gap-1 p-4 text-right">
				{#each Array.from({ length: 24 }) as _, i}
					<div class="text-xs font-bold" style="grid-row: 1; grid-column: {i + 2}">{i}:00</div>
				{/each}

				<div class="text-sm font-bold" style="grid-row: 2; grid-column: 1">Sun</div>
				<div class="text-sm font-bold" style="grid-row: 3; grid-column: 1">Mon</div>
				<div class="text-sm font-bold" style="grid-row: 4; grid-column: 1">Tue</div>
				<div class="text-sm font-bold" style="grid-row: 5; grid-column: 1">Wed</div>
				<div class="text-sm font-bold" style="grid-row: 6; grid-column: 1">Thu</div>
				<div class="text-sm font-bold" style="grid-row: 7; grid-column: 1">Fri</div>
				<div class="text-sm font-bold" style="grid-row: 8; grid-column: 1">Sat</div>

				{#each $query.data as item}
					<div class="text-xs" style="grid-row: {item.weekday + 2}; grid-column: {item.hour + 2}">
						{item.count || '-'}
					</div>
				{/each}
			</Card> -->

    <Card class="h-[300px] p-4 mt-4 group">
      <Chart
        data={data.punchCard}
        x={(d) => d.hour}
        xScale={scaleBand()}
        y={(d) => d.weekday}
        yScale={scaleBand()}
        yDomain={range(7)}
        r={(d) => d.value}
        padding={{ left: 24, bottom: 36 }}
        tooltip={{ mode: 'band' }}
      >
        {#snippet children({ context })}
          {@const minBandwidth = Math.min(context.xScale.bandwidth(), context.yScale.bandwidth())}
          {@const maxValue = max(data.punchCard, (d) => d.count)}
          {@const rScale = scaleSqrt()
            .domain([0, maxValue])
            .range([0, minBandwidth / 2 - 5])}
          <Svg>
            <Axis
              placement="left"
              format={(d) => daysOfWeek[d]}
              grid={{ style: 'stroke-dasharray: 2' }}
              rule
            />
            <Axis placement="bottom" format={(d) => hoursOfDay[d]} grid />
            <Points>
              {#snippet children({ points })}
                {#each points as point, index}
                  <Circle
                    cx={point.x}
                    cy={point.y}
                    r={rScale(point.data.count)}
                    class="fill-secondary"
                  />
                  <Text
                    x={point.x}
                    y={point.y}
                    value={point.data.count}
                    textAnchor="middle"
                    verticalAnchor="middle"
                    class="stroke-emerald-800 fill-white text-xs stroke-2 transition-all opacity-0 group-hover:opacity-100"
                    capHeight=".6rem"
                  />
                {/each}
              {/snippet}
            </Points>
            <Highlight area axis="x" />
            <Highlight area axis="y" />
          </Svg>

          <Tooltip.Root>
            {#snippet children({ data })}
              <Tooltip.Header>
                {daysOfWeek[data.weekday]} @ {hoursOfDay[data.hour]}
              </Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="Commits" value={data?.count} valueAlign="right" />
              </Tooltip.List>
            {/snippet}
          </Tooltip.Root>
        {/snippet}
      </Chart>
    </Card>
  </div>
</main>
