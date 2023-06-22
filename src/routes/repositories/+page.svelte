<script lang="ts">
  // import gql from 'graphql-tag';
  import { AppBar, ProgressCircle, ListItem, Overlay } from 'svelte-ux';

  export let data;
</script>

<AppBar title="Repositories" />

<main class="p-4">
  <div class="relative min-h-[56px]">
    <!-- {#if $query.loading}
      <Overlay center class="rounded">
        <ProgressCircle />
      </Overlay>
    {/if} -->

    {#if data}
      {#each data.repositories.nodes as repo}
        <ListItem title={repo.nameWithOwner} subheading={repo.description} />
      {/each}
    {/if}
  </div>
</main>
