<script lang="ts">
  import { mdiAccount, mdiDatabase, mdiPlay, mdiSourceBranch, mdiSourceRepository } from '@mdi/js';
  import { scaleBand, scaleLinear, scaleSqrt } from 'd3-scale';
  import { max, range } from 'd3-array';

  import { AppBar, Button, Card, ProgressCircle, fetchStore, Overlay, TextField } from 'svelte-ux';

  import {
    Axis,
    Baseline,
    Chart,
    Circle,
    HighlightRect,
    Points,
    Svg,
    Text,
    Tooltip,
    TooltipItem
  } from 'layerchart';

  import { user } from '$lib/stores';

  let owner = 'techniq';
  let repo = 'svelte-ux';
  let branch = 'master';

  const query = fetchStore();

  function run() {
    query.fetch(`https://api.github.com/repos/${owner}/${repo}/stats/punch_card`, {
      onDataChange(data) {
        // TODO: Add summary per weekday and hour
        return data.map((d) => {
          return { weekday: d[0], hour: d[1], count: d[2] };
        });
      }
    });
  }
  run();

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<AppBar title="Punch Card" />

<main>
  <form class="flex gap-2 bg-white border-b p-4" on:submit|preventDefault={run}>
    <TextField
      label="Owner"
      bind:value={owner}
      icon={mdiAccount}
      dense
      placeholder="User or organization"
      shrinkLabel
      class="flex-1"
    />
    <TextField
      label="Repository"
      bind:value={repo}
      icon={mdiDatabase}
      dense
      placeholder="Name of repository"
      shrinkLabel
      class="flex-1"
    />
    <TextField
      label="Branch"
      bind:value={branch}
      icon={mdiSourceBranch}
      dense
      placeholder="Name of repository"
      shrinkLabel
      class="flex-1"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="accent">Run</Button>
  </form>

  <div class="relative min-h-[56px] p-4">
    {#if $query.loading}
      <Overlay center class="rounded">
        <ProgressCircle />
      </Overlay>
    {/if}

    {#if $query.data}
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
          data={$query.data}
          x={(d) => d.hour}
          xScale={scaleBand()}
          y={(d) => d.weekday}
          yScale={scaleBand()}
          yDomain={range(7)}
          r={(d) => d.value}
          padding={{ left: 24, bottom: 36 }}
          tooltip={{ mode: 'band' }}
          let:xScale
          let:yScale
        >
          {@const minBandwidth = Math.min(xScale.bandwidth(), yScale.bandwidth())}
          {@const maxValue = max($query.data, (d) => d.count)}
          {@const rScale = scaleSqrt()
            .domain([0, maxValue])
            .range([0, minBandwidth / 2 - 5])}
          <Svg>
            <Axis
              placement="left"
              format={(d) => daysOfWeek[d]}
              gridlines={{ style: 'stroke-dasharray: 2' }}
            />
            <Axis placement="bottom" format={(d) => `${d}:00`} gridlines />
            <Baseline y />
            <Points let:points>
              {#each points as point, index}
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={rScale(point.data.count)}
                  class="fill-emerald-600"
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
            </Points>
            <HighlightRect axis="x" />
            <HighlightRect axis="y" />
          </Svg>
          <Tooltip header={(d) => daysOfWeek[d.weekday] + ' @ ' + d.hour + ':00'} let:data>
            <TooltipItem label="Commits" value={data?.count} valueAlign="right" />
          </Tooltip>
        </Chart>
      </Card>
    {/if}
  </div>
</main>
