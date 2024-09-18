<script lang="ts">
  import { fly } from 'svelte/transition';
  import { mdiCalendar, mdiSourcePull } from '@mdi/js';
  import { scaleTime, scaleBand } from 'd3-scale';

  import {
    Axis,
    Chart,
    Highlight,
    Points,
    Svg,
    Tooltip as ChartTooltip,
    TooltipItem,
    TooltipSeparator
  } from 'layerchart';

  import {
    ListItem,
    DividerDot,
    Button,
    format,
    Icon,
    Tooltip,
    PeriodType,
    Duration,
    formatDate,
    Card,
    sortFunc
  } from 'svelte-ux';

  export let data;

  $: pullRequests = data.pullRequests.nodes.sort(sortFunc('createdAt', 'asc'));
</script>

<svelte:head>
  <title>GitHub Pull Request Analysis</title>
  <meta name="description" content="Analyze and visualize GitHub pull request timelines, track their states, and gain insights into development workflows." />

  <!-- Open Graph meta tags for social media sharing -->
  <meta property="og:title" content="GitHub Pull Request Analysis" />
  <meta property="og:description" content="Analyze and visualize GitHub pull request timelines, track their states, and gain insights into development workflows." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://github.techniq.dev/pullrequests" /> 
  <meta property="og:image" content="https://github.techniq.dev/opengraph-image-pullrequests.jpg" /> <!-- Replace with a relevant image URL -->

  <!-- Twitter Card meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="GitHub Pull Request Analysis" />
  <meta name="twitter:description" content="Analyze and visualize GitHub pull request timelines, track their states, and gain insights into development workflows." />
  <meta name="twitter:image" content="https://github.techniq.dev/twitter-image-pullrequests.jpg" /> <!-- Replace with a relevant image URL -->

  <!-- Canonical URL -->
  <link rel="canonical" href="https://github.techniq.dev/pullrequests" />

  <!-- Additional meta tags for better SEO -->
  <meta name="keywords" content="GitHub, pull requests, analysis, visualization, timeline, development workflow" />
  <meta name="robots" content="index, follow" />
</svelte:head>



<main class="grid gap-3 p-4">
  <Card class="p-4" style="height: {32 + 56 + pullRequests.length * 16}px">
    <Chart
      data={pullRequests}
      x={['createdAt', 'closedAt']}
      xScale={scaleTime()}
      y="number"
      yScale={scaleBand()}
      padding={{ left: 36, bottom: 56 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis
          placement="left"
          grid={{ style: 'stroke-dasharray: 2' }}
          labelProps={{ dx: -8 }}
          rule
        />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day)}
          labelProps={{ rotate: 315, textAnchor: 'end', verticalAnchor: 'middle', dy: 10 }}
        />
        <Points class="fill-emerald-500 stroke-emerald-700" links />
        <Highlight points={{ class: 'fill-emerald-500' }} lines area />
      </Svg>
      <ChartTooltip let:data>
        <div class="col-span-full text-center text-primary-400">#{data.number}</div>
        <div class="col-span-full mb-2 max-w-[300px] text-center text-sm">{data.title}</div>
        <TooltipItem label="Created At" value={format(data.createdAt, PeriodType.DayTime)} />
        <TooltipItem label="Closed At" value={format(data.closedAt, PeriodType.DayTime)} />
        <TooltipSeparator />
        <TooltipItem label="duration" valueAlign="right">
          <Duration start={data.createdAt} end={data.closedAt} totalUnits={2} />
        </TooltipItem>
      </ChartTooltip>
    </Chart>
  </Card>

  <div>
    {#each data.pullRequests.nodes as pr}
      <ListItem
        icon={mdiSourcePull}
        avatar={{ class: 'bg-surface-300 text-surface-content/90' }}
        title={pr.title}
      >
        <div slot="title">
          {pr.title}
          <Button
            variant="fill-outline"
            color={{ MERGED: 'secondary' }[pr.state]}
            size="sm"
            class="pointer-events-none rounded-full leading-3"
          >
            {pr.state}
          </Button>
          {#if pr.reviewDecision}
            <Button
              variant="fill-outline"
              color={{ APPROVED: 'green' }[pr.reviewDecision]}
              size="sm"
              class="pointer-events-none rounded-full leading-3"
            >
              {pr.reviewDecision}
            </Button>
          {/if}
        </div>
        <div slot="subheading" class="text-sm text-surface-content/50">
          {pr.repository.nameWithOwner}
          <DividerDot />
          <a
            href={pr.url}
            target="_blank"
            class="underline decoration-surface-content/30 underline-offset-2"
          >
            #{pr.number}
          </a>

          <DividerDot />
          <Tooltip>
            <Icon data={mdiCalendar} size="1rem" />
            {format(pr.createdAt, PeriodType.Day)}

            <div
              slot="title"
              class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 rounded border bg-surface-300 px-4 py-2 text-xs text-surface-content shadow"
              transition:fly={{ y: -8 }}
            >
              <div class="justify-self-end text-surface-content/50">Created:</div>
              <div class="justify-self-end">{format(pr.createdAt, PeriodType.DayTime)}</div>
              <div class="justify-self-end text-surface-content/50">Updated:</div>
              <div class="justify-self-end">{format(pr.updatedAt, PeriodType.DayTime)}</div>
              <div class="justify-self-end text-surface-content/50">Merged:</div>
              <div class="justify-self-end">{format(pr.mergedAt, PeriodType.DayTime)}</div>
              <div class="justify-self-end text-surface-content/50">Closed:</div>
              <div class="justify-self-end">{format(pr.closedAt, PeriodType.DayTime)}</div>
            </div>
          </Tooltip>
        </div>
      </ListItem>
    {/each}
  </div>
</main>
