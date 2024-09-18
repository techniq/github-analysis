<script lang="ts">
  import { mdiAccount, mdiDatabase, mdiPlay } from '@mdi/js';
  import { scaleBand, scaleSqrt } from 'd3-scale';
  import { max, range } from 'd3-array';

  import { goto } from '$app/navigation';

  import { Button, Card, TextField } from 'svelte-ux';

  import {
    Axis,
    Chart,
    Circle,
    Highlight,
    Points,
    Svg,
    Text,
    Tooltip,
    TooltipItem
  } from 'layerchart';

  export let data;

  let owner = 'techniq';
  let repo = 'svelte-ux';

  function run() {
    const params = new URLSearchParams();
    params.set('owner', owner);
    params.set('repo', repo);
    goto(`?${params}`);
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>


<svelte:head>
  <title>{owner}/{repo} - Commit Punchcard - GitHub Analysis</title>
  <meta name="description" content="Visualize the commit activity of {owner}/{repo} on GitHub with an interactive punchcard. See the most active days and hours for contributions." />

  <!-- Open Graph meta tags for social media sharing -->
  <meta property="og:title" content="{owner}/{repo} - GitHub Commit Punchcard" />
  <meta property="og:description" content="Visualize the commit activity of {owner}/{repo} on GitHub with an interactive punchcard. See the most active days and hours for contributions." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://github.techniq.dev/punchcard?owner={owner}&repo={repo}" /> 
  <meta property="og:image" content="https://github.techniq.dev/opengraph-image-punchcard.jpg" /> <!-- Replace with a relevant image URL -->

  <!-- Twitter Card meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{owner}/{repo} - GitHub Commit Punchcard" />
  <meta name="twitter:description" content="Visualize the commit activity of {owner}/{repo} on GitHub with an interactive punchcard. See the most active days and hours for contributions." />
  <meta name="twitter:image" content="https://github.techniq.dev/twitter-image-punchcard.jpg" /> <!-- Replace with a relevant image URL -->

  <!-- Canonical URL -->
  <link rel="canonical" href="https://github.techniq.dev/punchcard?owner={owner}&repo={repo}" />

  <!-- Additional meta tags for better SEO -->
  <meta name="keywords" content="GitHub, punchcard, commits, activity, analysis, visualization, {owner}, {repo}" />
  <meta name="robots" content="index, follow" />
</svelte:head>





<main>
  <form class="flex gap-2 border-b bg-surface-100 p-4" on:submit|preventDefault={run}>
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

  <div class="relative min-h-[56px] p-4">
    <!-- <Card class="grid grid-cols-[repeat(25,1fr)] grid-rows-[repeat(8,1fr)] gap-1 p-4 text-right">
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

    <Card class="group mt-4 h-[300px] p-4">
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
        let:xScale
        let:yScale
      >
        {@const minBandwidth = Math.min(xScale.bandwidth(), yScale.bandwidth())}
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
          <Axis placement="bottom" format={(d) => `${d}:00`} grid />
          <Points let:points>
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
                class="fill-white stroke-emerald-800 stroke-2 text-xs opacity-0 transition-all group-hover:opacity-100"
                capHeight=".6rem"
              />
            {/each}
          </Points>
          <Highlight area axis="x" />
          <Highlight area axis="y" />
        </Svg>
        <Tooltip header={(d) => daysOfWeek[d.weekday] + ' @ ' + d.hour + ':00'} let:data>
          <TooltipItem label="Commits" value={data?.count} valueAlign="right" />
        </Tooltip>
      </Chart>
    </Card>
  </div>
</main>
