<script lang="ts">
  import { format } from 'date-fns';

  import { mdiAccount, mdiDatabase, mdiPlay, mdiSourceBranch } from '@mdi/js';

  import { Button, ListItem, TextField } from 'svelte-ux';

  import { goto } from '$app/navigation';

  export let data;

  let owner = data.variables.owner;
  let repo = data.variables.repo;
  let branch = data.variables.branch;

  function run() {
    const params = new URLSearchParams();
    params.set('owner', owner);
    params.set('repo', repo);
    params.set('branch', branch);
    goto(`?${params}`);
  }
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
    <TextField
      label="Branch"
      bind:value={branch}
      icon={mdiSourceBranch}
      dense
      placeholder="Name of repository"
      class="flex-1"
    />
    <Button type="submit" icon={mdiPlay} variant="fill" color="blue">Run</Button>
  </form>

  <div class="relative min-h-[56px] p-4">
    {#each data.commits as commit}
      <ListItem>
        <div slot="title">
          {commit.node.message}
          <span class="text-xs text-black/50 whitespace-nowrap">
            {format(commit.node.committedDate, 'h:mm aa')}
          </span>
        </div>
        <div slot="actions" />
      </ListItem>
    {/each}
  </div>
</main>
