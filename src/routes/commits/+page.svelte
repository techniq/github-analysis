<script lang="ts">
  import { mdiAccount, mdiDatabase, mdiPlay, mdiSourceBranch } from '@mdi/js';

  import { Button, ListItem, PeriodType, TextField, format } from 'svelte-ux';

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

<svelte:head>
  <title>
    {owner}/{repo}@{branch} - Commits - GitHub Analysis
  </title>
  <meta
    name="description"
    content="View commits for {owner}/{repo} on branch {branch}."
  />

  <!-- Open Graph meta tags for social media sharing -->
  <meta property="og:title" content="{owner}/{repo}@{branch} - Commits" />
  <meta
    property="og:description"
    content="View commits for {owner}/{repo} on branch {branch}."
  />
  <meta property="og:type" content="website" />
  <meta
    property="og:url"
    content="https://github.techniq.dev/commits?owner={owner}&repo={repo}&branch={branch}"
  />

  <!-- Twitter Card meta tags -->
  <meta name="twitter:card" content="summary" />
  <meta
    name="twitter:title"
    content="{owner}/{repo}@{branch} - Commits"
  />
  <meta
    name="twitter:description"
    content="View commits for {owner}/{repo} on branch {branch}."
  />

  <!-- Consider adding a canonical URL if applicable -->
  <link
    rel="canonical"
    href="https://github.techniq.dev/commits?owner={owner}&repo={repo}&branch={branch}"
  />
</svelte:head>


<main>
  <form class="flex gap-2 border-b bg-surface-100 p-4" on:submit|preventDefault={run}>
    <TextField
      label="User"
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
    <Button type="submit" icon={mdiPlay} variant="fill" color="primary">Run</Button>
  </form>

  <div class="relative min-h-[56px] p-4">
    {#each data.commits as commit}
      <ListItem>
        <div slot="title">
          {commit.node.message}
          <span class="whitespace-nowrap text-xs text-surface-content/50">
            {format(commit.node.committedDate, PeriodType.TimeOnly)}
          </span>
        </div>
        <div slot="actions" ></div>
      </ListItem>
    {/each}
  </div>
</main>
