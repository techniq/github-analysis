<script lang="ts">
  import { format as formatDate } from 'date-fns';

  import { mdiAccount, mdiDatabase, mdiPlay } from '@mdi/js';

  import { Button, ListItem, PeriodType, TextField, format } from 'svelte-ux';
  import { createPropertySortFunc } from 'svelte-ux/utils/sort';

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
  <form class="flex gap-2 bg-white border-b p-4" on:submit|preventDefault={run}>
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
    <Button type="submit" icon={mdiPlay} variant="fill" color="blue">Run</Button>
  </form>

  <div class="p-4">
    <div class="text-black/50 text-xs mb-2 tracking-wider">{data.stargazers.length} stargazers</div>
    <div class="h-[300px] p-4 border border-gray-300 rounded bg-white mb-3">
      <Chart
        data={chartData}
        x="starredAt"
        xScale={scaleTime()}
        y="count"
        yDomain={[0, null]}
        yNice
        padding={{ left: 16, bottom: 24 }}
        tooltip
      >
        <Svg>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" format={(d) => format(d, PeriodType.Month, 'short')} rule />
          <LinearGradient class="from-accent-500/50 to-accent-500/0" vertical let:url>
            <Area line={{ class: 'stroke-2 stroke-accent-500' }} fill={url} />
          </LinearGradient>
          <Highlight points lines />
        </Svg>

        <Tooltip header={(data) => formatDate(data.starredAt, 'MM/d/yyyy @ h:mm aa')} let:data>
          <TooltipItem label="User" value={data.name ?? data.login} />
          <TooltipItem label="Count" value={data.count} />
        </Tooltip>
      </Chart>
    </div>

    <div>
      {#each [...data.stargazers].sort(createPropertySortFunc('starredAt', 'desc')) as stargazer}
        {@const name = stargazer.name ?? stargazer.login}
        <ListItem>
          <img
            slot="avatar"
            src={stargazer.avatarUrl}
            alt="{name}'s avatar"
            class="w-8 w-8 rounded-full"
          />
          <div slot="title">
            <a href="https://github.com/{stargazer.login}" target="_blank">
              {name}
            </a>
            <span class="text-xs text-black/50 whitespace-nowrap">
              {formatDate(stargazer.starredAt, 'MM/d/yyyy @ h:mm aa')}
            </span>
          </div>
          <div slot="actions" />
        </ListItem>
      {/each}
    </div>
  </div>
</main>
