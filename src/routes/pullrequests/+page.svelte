<script lang="ts">
  import { mdiCalendar, mdiSourcePull } from '@mdi/js';
  import {
    AppBar,
    ListItem,
    DividerDot,
    Button,
    format,
    Icon,
    Tooltip,
    dateDisplay,
    PeriodType
  } from 'svelte-ux';
  import { fly } from 'svelte/transition';

  export let data;
</script>

<AppBar title="Pull Requests" />

<main class="p-4">
  <div class="relative min-h-[56px]">
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
