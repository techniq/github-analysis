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
    dateDisplay,
    PeriodType,
    Duration,
    formatDate,
    Card
  } from 'svelte-ux';
  import { createPropertySortFunc } from 'svelte-ux/utils/sort';

  export let data;

  $: pullRequests = data.pullRequests.nodes.sort(createPropertySortFunc('createdAt', 'asc'));
</script>

<main class="p-4 grid gap-3">
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
        <div class="col-span-full text-center text-accent-400">#{data.number}</div>
        <div class="col-span-full max-w-[300px] text-sm text-center mb-2">{data.title}</div>
        <TooltipItem label="Created At" value={dateDisplay(data.createdAt)} />
        <TooltipItem label="Closed At" value={dateDisplay(data.closedAt)} />
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
        avatar={{ class: 'bg-gray-400 text-white/90' }}
        title={pr.title}
      >
        <div slot="title">
          {pr.title}
          <Button
            variant="fill-outline"
            color={{ MERGED: 'purple' }[pr.state]}
            size="sm"
            class="rounded-full leading-3 pointer-events-none"
          >
            {pr.state}
          </Button>
          {#if pr.reviewDecision}
            <Button
              variant="fill-outline"
              color={{ APPROVED: 'green' }[pr.reviewDecision]}
              size="sm"
              class="rounded-full leading-3 pointer-events-none"
            >
              {pr.reviewDecision}
            </Button>
          {/if}
        </div>
        <div slot="subheading" class="text-sm text-black/50">
          {pr.repository.nameWithOwner}
          <DividerDot />
          <a href={pr.url} target="_blank" class="underline underline-offset-2 decoration-gray-300">
            #{pr.number}
          </a>

          <DividerDot />
          <Tooltip>
            <Icon data={mdiCalendar} size="1rem" />
            {format(pr.createdAt, PeriodType.Day)}

            <div
              slot="title"
              class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 bg-gray-900/90 text-white px-4 py-2 text-xs rounded shadow"
              transition:fly={{ y: -8 }}
            >
              <div class="text-white/50 justify-self-end">Created:</div>
              <div class="justify-self-end">{dateDisplay(pr.createdAt)}</div>
              <div class="text-white/50 justify-self-end">Updated:</div>
              <div class="justify-self-end">{dateDisplay(pr.updatedAt)}</div>
              <div class="text-white/50 justify-self-end">Merged:</div>
              <div class="justify-self-end">{dateDisplay(pr.mergedAt)}</div>
              <div class="text-white/50 justify-self-end">Closed:</div>
              <div class="justify-self-end">{dateDisplay(pr.closedAt)}</div>
            </div>
          </Tooltip>
        </div>
      </ListItem>
    {/each}
  </div>
</main>
