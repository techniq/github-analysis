<script lang="ts">
  import { fly } from 'svelte/transition';
  import { mdiCalendar, mdiSourcePull } from '@mdi/js';
  import { scaleBand } from 'd3-scale';

  import { Axis, Chart, Highlight, Points, Svg, Tooltip as ChartTooltip } from 'layerchart';

  import { ListItem, DividerDot, Button, Icon, Tooltip, Duration, Card, BarStack } from 'svelte-ux';
  import { format, sortFunc } from '@layerstack/utils';

  const colors = {
    draft: 'bg-gray-500',
    open: 'bg-emerald-500',
    closed: 'bg-red-500',
    merged: 'bg-violet-500'
  };

  let { data } = $props();

  let pullRequests = $derived(
    data.pullRequests.nodes.sort(sortFunc('createdAt', 'asc')).filter((d) => d)
  );

  let stateSplit = $derived.by(() => {
    return [
      {
        label: 'Draft',
        value: pullRequests.filter((d) => d.isDraft).length,
        color: colors.draft,
        style: 'background-color:' + colors.draft,
        classes: { root: colors.draft }
      },
      {
        label: 'Open',
        value: pullRequests.filter((d) => d.state === 'OPEN' && !d.isDraft).length,
        color: colors.open,
        style: 'background-color:' + colors.open,
        classes: { root: colors.open }
      },

      {
        label: 'Merged',
        value: pullRequests.filter((d) => d.state === 'MERGED' && !!d.mergedAt && !d.isDraft)
          .length,
        color: colors.merged,
        style: 'background-color:' + colors.merged,
        classes: { root: colors.merged }
      },
      {
        label: 'Closed',
        value: pullRequests.filter((d) => d.state === 'CLOSED' && !d.mergedAt && !d.isDraft).length,
        color: colors.closed,
        style: 'background-color:' + colors.closed,
        classes: { root: colors.closed }
      }
    ];
  });

  let averageDuration = $derived.by(() => {
    const prToConsider = pullRequests.filter((d) => !!d.closedAt);
    const duration = prToConsider.reduce(
      (acc, pr) => acc + (pr.closedAt.getTime() - pr.createdAt.getTime()),
      0
    );
    return { milliseconds: duration / prToConsider.length };
  });
</script>

<main class="p-4 grid gap-3">
  <Card class="p-4" style="height: {32 + 56 + pullRequests.length * 16}px">
    <Chart
      data={pullRequests}
      x={['createdAt', 'closedAt']}
      y="number"
      yScale={scaleBand()}
      padding={{ left: 36, bottom: 56 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
        <Axis placement="bottom" tickMultiline />
        <Points class="fill-emerald-500 stroke-emerald-700" links />
        <Highlight points={{ class: 'fill-emerald-500' }} lines area />
      </Svg>

      <ChartTooltip.Root>
        {#snippet children({ data })}
          <div class="col-span-full text-center text-primary-400">#{data.number}</div>
          <div class="col-span-full max-w-[300px] text-sm text-center mb-2">{data.title}</div>
          <ChartTooltip.Item label="Created At" value={data.createdAt} format="daytime" />
          <ChartTooltip.Item label="Closed At" value={data.closedAt} format="daytime" />
          <ChartTooltip.Separator />
          <ChartTooltip.Item label="duration" valueAlign="right">
            <Duration start={data.createdAt} end={data.closedAt} totalUnits={2} />
          </ChartTooltip.Item>
        {/snippet}
      </ChartTooltip.Root>
    </Chart>
  </Card>

  <div class="flex items-center justify-between">
    <div class="text-xs text-surface-content/50 tracking-widest">Last 50 pull requests</div>
    <div>Average duration: <Duration duration={averageDuration} totalUnits={2} /></div>
  </div>

  <BarStack data={stateSplit} let:item>
    <div class="truncate text-xs font-semibold text-surface-content">
      {item.label} ({format(item.value, 'integer')})
    </div>
  </BarStack>
  <div>
    {#each pullRequests as pr}
      <ListItem
        icon={mdiSourcePull}
        avatar={{
          class:
            'text-surface-content/90' +
            (pr.isDraft
              ? ' bg-gray-500'
              : pr.state === 'OPEN'
                ? ' bg-emerald-500'
                : pr.state === 'CLOSED'
                  ? ' bg-red-500'
                  : ' bg-violet-500')
        }}
        title={pr.title}
      >
        <div slot="title" class="flex items-center justify-between">
          {pr.title}
          <!-- <Button
            variant="fill-outline"
            color={{ MERGED: 'secondary' }[pr.state]}
            size="sm"
            class="rounded-full leading-3 pointer-events-none"
          >
            {pr.state}
          </Button> -->
          {#if pr.reviewDecision}
            <Button
              variant="fill"
              color={{ APPROVED: 'primary' }[pr.reviewDecision]}
              size="sm"
              class="rounded-full leading-3 pointer-events-none ml-2"
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
            class="underline underline-offset-2 decoration-surface-content/30"
          >
            #{pr.number}
          </a>

          <DividerDot />
          <Tooltip>
            <Icon data={mdiCalendar} size="1rem" />
            {format(pr.createdAt, 'day')}

            <div
              slot="title"
              class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 bg-surface-300 border text-surface-content px-4 py-2 text-xs rounded-sm shadow-sm"
              transition:fly={{ y: -8 }}
            >
              <div class="text-surface-content/50 justify-self-end">Created:</div>
              <div class="justify-self-end">{format(pr.createdAt, 'daytime')}</div>
              <div class="text-surface-content/50 justify-self-end">Updated:</div>
              <div class="justify-self-end">{format(pr.updatedAt, 'daytime')}</div>
              <div class="text-surface-content/50 justify-self-end">Merged:</div>
              <div class="justify-self-end">{format(pr.mergedAt, 'daytime')}</div>
              <div class="text-surface-content/50 justify-self-end">Closed:</div>
              <div class="justify-self-end">{format(pr.closedAt, 'daytime')}</div>
            </div>
          </Tooltip>
        </div>
      </ListItem>
    {/each}
  </div>
</main>
