<script lang="ts">
  import { writable } from 'svelte/store';
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
  import { inject } from '@vercel/analytics';
  import { mdiGithub, mdiLogin, mdiTwitter } from '@mdi/js';

  import {
    AppLayout,
    initGraphClient,
    ErrorNotification,
    ViewportCenter,
    Card,
    Button,
    createTheme,
    AppBar,
    Tooltip
  } from 'svelte-ux';

  import { dev } from '$app/environment';
  import { navigating } from '$app/stores';
  import { user } from '$lib/stores';
  import NavMenu from './_NavMenu.svelte';
  import LoadingProgress from './LoadingProgress.svelte';

  export let data;

  inject({ mode: dev ? 'development' : 'production' });

  const fetchErrors = writable([]);

  initGraphClient({
    url: 'https://api.github.com/graphql',
    config: {
      options() {
        return {
          headers: {
            Authorization: `Bearer ${data.accessToken}`
          }
        };
      },
      errors: fetchErrors
    }
  });

  createTheme({
    // AppBar: 'bg-accent-500 text-white shadow-md',
    // AppLayout: {
    //   nav: 'bg-neutral-800'
    // },
    // NavItem: {
    //   root: 'text-sm text-gray-400 pl-6 py-2 hover:text-white hover:bg-gray-300/10 [&:where(.is-active)]:text-sky-400 [&:where(.is-active)]:bg-gray-500/10'
    // }
  });

  $user = data.user;
</script>

{#if $navigating}
  <div out:fade={{ duration: 200 }} class="absolute top-0 w-full z-[9999]">
    <LoadingProgress
      loading={$navigating != null}
      timeout={3000}
      class="[--color:theme(colors.emerald.400)] [--track-color:theme(colors.emerald.600)] [&.error]:[--color:theme(colors.red.400)] block h-1"
    />
  </div>
{/if}

{#if !data.accessToken}
  <ViewportCenter>
    <Card title="Authenticate" subheading="Login to retrieve access token for GraphQL">
      <div class="px-4 pb-4">
        <Button href="/auth/login" rel="external" variant="fill" color="blue" icon={mdiLogin}
          >Login</Button
        >
      </div>
    </Card>
  </ViewportCenter>
{:else}
  <AppLayout>
    <nav slot="nav" class="nav h-full">
      <NavMenu />
    </nav>

    <AppBar title="Github Analysis">
      <div slot="actions" class="flex gap-3">
        <Tooltip title="Open Twitter / X" placement="left" offset={2}>
          <Button
            icon={mdiTwitter}
            href="https://twitter.com/techniq35"
            class="p-2"
            target="_blank"
          />
        </Tooltip>

        <Tooltip title="View repository" placement="left" offset={2}>
          <Button
            icon={mdiGithub}
            href="https://github.com/techniq/github-analysis"
            class="p-2"
            target="_blank"
          />
        </Tooltip>
      </div>
    </AppBar>

    <slot />
  </AppLayout>
{/if}

{#if $fetchErrors.length}
  <div
    class="flex flex-col gap-4 fixed top-0 right-0 p-7 overflow-auto h-max-screen z-[100] pointer-events-none"
  >
    {#each $fetchErrors as error (error)}
      <div class="pointer-events-auto" animate:flip>
        <ErrorNotification
          title="An error has occurred"
          description={error.message}
          message={error.extensions?.message}
          stackTrace={error.extensions?.stackTrace}
          on:close={() => {
            $fetchErrors = $fetchErrors.filter((e) => e != error);
          }}
        />
      </div>
    {/each}
  </div>
{/if}

<style lang="postcss">
  @tailwind base;
  @tailwind components;

  :global(body) {
    @apply bg-black/10;
  }

  :global(nav h1) {
    @apply py-2 pl-4 mt-4 text-sm text-gray-200 font-bold bg-black/20 border-t border-b border-white/10;
  }

  :global(nav h2) {
    @apply pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold;
  }

  :global(.AppBar) {
    @apply bg-emerald-600 text-white shadow-md;
  }
  :global(nav) {
    @apply bg-neutral-800;
  }

  :global(.NavItem) {
    @apply text-sm text-neutral-400 pl-6 py-2 border-l-4 border-transparent;

    &:hover {
      @apply text-white bg-neutral-400/10;
    }

    &.is-active {
      @apply text-emerald-500 bg-neutral-400/10 border-emerald-400;
    }
  }

  @tailwind utilities;
</style>
