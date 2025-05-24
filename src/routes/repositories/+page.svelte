<script lang="ts">
  import { mdiBookVariant, mdiSourceCommit, mdiStar, mdiTimelineClockOutline } from '@mdi/js';
  import { Button, ListItem, Tooltip } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  let { data } = $props();
</script>

<main class="p-4">
  <div class="relative min-h-[56px]">
    {#if data}
      <div class="text-xs text-surface-content/50 mb-1 tracking-widest">Repositories</div>
      <div>
        {#each data.repositories.nodes as repo}
          {@const [owner, name] = repo.nameWithOwner.split('/')}

          <ListItem
            icon={mdiBookVariant}
            avatar={{ class: 'bg-surface-300 text-surface-content/90 w-8 h-8 text-sm' }}
            subheading={repo.description}
          >
            <div slot="title">
              <a href="https://github.com/{repo.nameWithOwner}" target="_blank">
                {repo.nameWithOwner}
              </a>
            </div>
            <div slot="actions" class="whitespace-nowrap">
              <Tooltip title="View stars" offset={2}>
                <Button
                  icon={mdiStar}
                  href="/stars?owner={owner}&repo={name}"
                  variant="fill-outline"
                  size="sm"
                  color="secondary"
                >
                  {format(repo.stargazerCount, 'integer')} Stars
                </Button>
              </Tooltip>

              <Tooltip title="View punchcard" offset={2}>
                <Button
                  icon={mdiTimelineClockOutline}
                  href="/punchcard?owner={owner}&repo={name}"
                  variant="fill-outline"
                  size="sm"
                  color="secondary"
                  iconOnly={false}
                />
              </Tooltip>

              <Tooltip title="View commits" offset={2}>
                <Button
                  icon={mdiSourceCommit}
                  href="/commits?owner={owner}&repo={name}"
                  variant="fill-outline"
                  size="sm"
                  color="secondary"
                  iconOnly={false}
                />
              </Tooltip>
            </div>
          </ListItem>
        {/each}
      </div>
    {/if}
  </div>
</main>
