<script lang="ts">
  import { mdiAccount, mdiDatabase, mdiPlay, mdiSourceBranch } from '@mdi/js';

  import { Button, ListItem, TextField } from 'svelte-ux';
  import { PeriodType, format } from '@layerstack/utils';

  import { goto } from '$app/navigation';

  let { data } = $props();

  let owner = $derived(data.variables.owner);
  let repo = $derived(data.variables.repo);
  let branch = $derived(data.variables.branch);

  function run() {
    const params = new URLSearchParams();
    params.set('owner', owner);
    params.set('repo', repo);
    params.set('branch', branch);
    goto(`?${params}`);
  }
</script>

<main>
  <form
    class="flex gap-2 bg-surface-100 border-b p-4"
    onsubmit={(e) => {
      e.preventDefault();
      run();
    }}
  >
    <TextField
      label="User"
      bind:value={owner}
      icon={mdiAccount}
      dense
      placeholder="User or organization"
      class="grow"
    />
    <TextField
      label="Repository"
      bind:value={repo}
      icon={mdiDatabase}
      dense
      placeholder="Name of repository"
      class="grow"
    />
    <TextField
      label="Branch"
      bind:value={branch}
      icon={mdiSourceBranch}
      dense
      placeholder="Name of repository"
      class="grow"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="primary">Run</Button>
  </form>

  <div class="relative min-h-[56px] p-4">
    {#each data.commits as commit}
      <ListItem>
        <div slot="title">
          {commit.node.message}
          <span class="text-xs text-surface-content/50 whitespace-nowrap">
            {format(commit.node.committedDate, PeriodType.TimeOnly)}
          </span>
        </div>
        <div slot="actions"></div>
      </ListItem>
    {/each}
  </div>
</main>
