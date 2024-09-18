<script lang="ts">
  import { mdiBookVariant, mdiSourceCommit, mdiStar, mdiTimelineClockOutline } from '@mdi/js';
  import { Button, ListItem, Tooltip, format } from 'svelte-ux';

  export let data;
</script>

<svelte:head>
  <title>Repositories - GitHub Analysis</title>
  <meta name="description" content="Explore and analyze a curated list of GitHub repositories, discover interesting projects, and gain insights into their activity and popularity." />

  <!-- Open Graph meta tags for social media sharing -->
  <meta property="og:title" content="GitHub Repository Insights" />
  <meta property="og:description" content="Explore and analyze a curated list of GitHub repositories, discover interesting projects, and gain insights into their activity and popularity." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://github.techniq.dev/repositories" /> 
  //TODO: Add a relevant image URL
  <meta property="og:image" content="https://github.techniq.dev/opengraph-image-repositories.jpg" /> <!-- Replace with a relevant image URL -->

  <!-- Twitter Card meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="GitHub Repository Insights" />
  <meta name="twitter:description" content="Explore and analyze a curated list of GitHub repositories, discover interesting projects, and gain insights into their activity and popularity." />
  //TODO: Add a relevant image URL
  <meta name="twitter:image" content="https://github.techniq.dev/twitter-image-repositories.jpg" /> <!-- Replace with a relevant image URL -->

  <!-- Canonical URL -->
  <link rel="canonical" href="https://github.techniq.dev/repositories" />

  <!-- Additional meta tags for better SEO -->
  <meta name="keywords" content="GitHub, repositories, open source, projects, analysis, insights, trends" />
  <meta name="robots" content="index, follow" />
</svelte:head>


<main class="p-4">
  <div class="relative min-h-[56px]">
    {#if data}
      <div class="mb-1 text-xs tracking-widest text-surface-content/50">Repositories</div>
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
