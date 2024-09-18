<script lang="ts">
  import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
  import { Button, DividerDot, ListItem, PeriodType, format, sortFunc } from 'svelte-ux';

  import { goto } from '$app/navigation';

  export let data;

  function prevPage() {
    const params = new URLSearchParams(window.location.search);
    params.set('before', data.followers.pageInfo.startCursor);
    params.delete('after');
    goto(`?${params}`);
  }

  function nextPage() {
    const params = new URLSearchParams(window.location.search);
    params.delete('before');
    params.set('after', data.followers.pageInfo.endCursor);
    goto(`?${params}`);
  }
</script>


<svelte:head>
  <title>GitHub Follower Analysis</title>
  <meta name="description" content="Analyze and visualize recent followers on GitHub. Explore follower trends, demographics, and gain insights into audience growth." />

  <!-- Open Graph meta tags for social media sharing -->
  <meta property="og:title" content="GitHub Follower Analysis" />
  <meta property="og:description" content="Analyze and visualize recent followers on GitHub. Explore follower trends, demographics, and gain insights into audience growth." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://github.techniq.dev/followers" /> 
  <meta property="og:image" content="https://github.techniq.dev/opengraph-image-followers.jpg" /> <!-- Replace with a relevant image URL -->

  <!-- Twitter Card meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="GitHub Follower Analysis" />
  <meta name="twitter:description" content="Analyze and visualize recent followers on GitHub. Explore follower trends, demographics, and gain insights into audience growth." />
  <meta name="twitter:image" content="https://github.techniq.dev/twitter-image-followers.jpg" /> <!-- Replace with a relevant image URL -->

  <!-- Canonical URL -->
  <link rel="canonical" href="https://github.techniq.dev/followers" />

  <!-- Additional meta tags for better SEO -->
  <meta name="keywords" content="GitHub, followers, analysis, visualization, trends, audience growth, demographics" />
  <meta name="robots" content="index, follow" />
</svelte:head>



<div class="grid gap-1">
  <div class="mb-1 text-xs text-surface-content/50">Recent followers</div>
  <div>
    {#each [...data.followers.users].sort(sortFunc('starredAt', 'desc')) as user}
      {@const name = user.name ?? user.login}
      <ListItem>
        <a slot="avatar" href="https://github.com/{user.login}" target="_blank">
          <img src={user.avatarUrl} alt="{name}'s avatar" class="w-8 rounded-full" />
        </a>
        <div slot="title">
          <a href="https://github.com/{user.login}" target="_blank">
            {name}
          </a>
          <span class="whitespace-nowrap text-xs text-surface-content/50">
            <!-- {format(user.starredAt, PeriodType.DayTime)} -->
          </span>
        </div>
        <div slot="subheading" class="text-xs text-surface-content/50">
          {user.followers.totalCount} followers <DividerDot />
          {user.following.totalCount} following
        </div>
      </ListItem>
    {/each}
  </div>
  <div class="text-right">
    <Button
      icon={mdiChevronLeft}
      disabled={!data.followers.pageInfo.hasPreviousPage}
      on:click={prevPage}
    />
    <Button
      icon={mdiChevronRight}
      disabled={!data.followers.pageInfo.hasNextPage}
      on:click={nextPage}
    />
  </div>
</div>
