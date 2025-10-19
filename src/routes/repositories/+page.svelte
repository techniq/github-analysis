<script lang="ts">
  import { mdiBookVariant, mdiSourceCommit, mdiStar, mdiTimelineClockOutline } from '@mdi/js';
  import { Button, ListItem, Tooltip, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format } from '@layerstack/utils';
  import { goto } from '$app/navigation';
  import { REPO_KIND } from './kind.js';

  let { data } = $props();
  let kind = $state(data.kind);

  let description = $derived(
    Object.values(REPO_KIND).find((k) => k.value === kind.value)?.description
  );
</script>

<main>
  <ToggleGroup
    bind:value={kind.value}
    variant="underline"
    classes={{
      options: 'justify-start h-10 px-4',
      option: 'flex items-center gap-2'
    }}
    on:change={(e) => goto(`?kind=${e.detail.value}`)}
  >
    {#each Object.values(REPO_KIND) as { label, value }}
      <ToggleOption {value}>
        {label}
      </ToggleOption>
    {/each}
  </ToggleGroup>

  <div class="relative min-h-[56px] p-4">
    {#if data}
      <div class="flex justify-between">
        <div class="text-xs text-surface-content/50 mb-1 tracking-widest">Repositories</div>
        <div class="text-xs text-surface-content/50">{description}</div>
      </div>
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
