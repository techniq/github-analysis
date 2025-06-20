<script lang="ts">
  import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
  import { Button, DividerDot, ListItem } from 'svelte-ux';
  import { format, sortFunc } from '@layerstack/utils';

  import { goto } from '$app/navigation';

  let { data } = $props();

  function prevPage() {
    const params = new URLSearchParams(window.location.search);
    params.set('before', data.stargazers.pageInfo.startCursor);
    params.delete('after');
    goto(`?${params}`);
  }

  function nextPage() {
    const params = new URLSearchParams(window.location.search);
    params.delete('before');
    params.set('after', data.stargazers.pageInfo.endCursor);
    goto(`?${params}`);
  }
</script>

<div class="grid gap-1">
  <div class="text-xs text-surface-content/50 mb-1">Recent Stargazers</div>
  <div>
    {#each [...data.stargazers.users].sort(sortFunc('starredAt', 'desc')) as user}
      {@const name = user.name ?? user.login}
      <ListItem>
        <a slot="avatar" href="https://github.com/{user.login}" target="_blank">
          <img src={user.avatarUrl} alt="{name}'s avatar" class="w-8 rounded-full" />
        </a>
        <div slot="title">
          <a href="https://github.com/{user.login}" target="_blank">
            {name}
          </a>
          <span class="text-xs text-surface-content/50 whitespace-nowrap">
            {format(user.starredAt, 'daytime', { variant: 'short' })}
          </span>
        </div>
        <div slot="subheading" class="text-xs text-surface-content/50">
          {format(user.followers.totalCount)} followers <DividerDot />
          {format(user.following.totalCount)} following
        </div>
      </ListItem>
    {/each}
  </div>
  <div class="text-right">
    <Button
      icon={mdiChevronLeft}
      disabled={!data.stargazers.pageInfo.hasPreviousPage}
      on:click={prevPage}
    />
    <Button
      icon={mdiChevronRight}
      disabled={!data.stargazers.pageInfo.hasNextPage}
      on:click={nextPage}
    />
  </div>
</div>
