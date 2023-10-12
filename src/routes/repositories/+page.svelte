<script lang="ts">
  import { mdiBookVariant, mdiSourceCommit, mdiStar, mdiTimelineClockOutline } from '@mdi/js';
  import { Button, ListItem, Tooltip } from 'svelte-ux';

  export let data;
</script>

<main class="p-4">
  <div class="relative min-h-[56px]">
    {#if data}
      {#each data.repositories.nodes as repo}
        {@const [owner, name] = repo.nameWithOwner.split('/')}

        <ListItem
          icon={mdiBookVariant}
          avatar={{ class: 'bg-gray-400 text-white/90 w-8 h-8 text-sm' }}
          subheading={repo.description}
        >
          <div slot="title">
            <a href="https://github.com/{repo.nameWithOwner}" target="_blank">
              {repo.nameWithOwner}
            </a>
          </div>
          <div slot="actions">
            <Tooltip title="View stars">
              <Button
                icon={mdiStar}
                href="/stars?owner={owner}&repo={name}"
                variant="fill-outline"
                size="sm"
                color="accent"
              >
                {repo.stargazerCount} Stars
              </Button>
            </Tooltip>

            <Tooltip title="View punchcard">
              <Button
                icon={mdiTimelineClockOutline}
                href="/punchcard?owner={owner}&repo={name}"
                variant="fill-outline"
                size="sm"
                color="accent"
                iconOnly={false}
              />
            </Tooltip>

            <Tooltip title="View commits">
              <Button
                icon={mdiSourceCommit}
                href="/commits?owner={owner}&repo={name}"
                variant="fill-outline"
                size="sm"
                color="accent"
                iconOnly={false}
              />
            </Tooltip>
          </div>
        </ListItem>
      {/each}
    {/if}
  </div>
</main>
