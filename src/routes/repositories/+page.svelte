<script lang="ts">
  import { mdiBookVariant, mdiSourceCommit, mdiStar, mdiTimelineClockOutline, 
    mdiCircleDouble as mdiIssues } from '@mdi/js';
  import { Button, ListItem, Tooltip, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format } from '@layerstack/utils';
  import { goto } from '$app/navigation';
  import { REPO_KIND } from './kind.js';

  let { data } = $props();
  let kind = $state(data.kind);
  let sort = $state(data.sort);
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
    {#each Object.values(REPO_KIND) as { label, value, description }}
      <Tooltip title={description} offset={2}>
        <ToggleOption {value}>
          {label}
        </ToggleOption>
      </Tooltip>
    {/each}
  </ToggleGroup>

  <div class="relative min-h-[56px] p-4">
    {#if data}
      <div class="flex items-end justify-between">
        <div class="text-xs text-surface-content/50 mb-1 tracking-widest">Repositories</div>
        <div class="h-8 mb-2">
          {#if ['my-owned', 'my-forks'].includes(kind.value)}
            <div class="flex items-center gap-2">
              <span class="text-sm text-surface-content/50 font-medium">Sort:</span>
              <ToggleGroup
                bind:value={sort}
                variant="outline"
                inset
                rounded="full"
                size="sm"
                on:change={(e) => goto(`?kind=${kind.value}&sort=${e.detail.value.toLowerCase()}`)}
              >
                <!-- <ToggleOption value="NAME">Name</ToggleOption> -->
                <!-- <ToggleOption value="CREATED_AT">Created</ToggleOption> -->
                <ToggleOption value="UPDATED_AT">Updated</ToggleOption>
                <!-- <ToggleOption value="PUSHED_AT">Pushed</ToggleOption> -->
                <ToggleOption value="STARGAZERS">Stars</ToggleOption>
              </ToggleGroup>
            </div>
          {/if}
        </div>
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

              <Tooltip title="View issues" offset={2}>
                <Button
                  icon={mdiIssues}
                  href="/issues?owner={owner}&repo={name}"
                  variant="fill-outline"
                  size="sm"
                  color="secondary"
                  iconOnly={false}
                />
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
