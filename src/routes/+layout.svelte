<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
  import posthog from 'posthog-js';
  import { mdiGithub, mdiLogin } from '@mdi/js';
  import { watch } from 'runed';

  import {
    AppLayout,
    ErrorNotification,
    ViewportCenter,
    Card,
    Button,
    AppBar,
    Tooltip,
    settings,
    ThemeSelect
  } from 'svelte-ux';
  import { initGraphClient } from '@layerstack/svelte-stores';

  import { dev } from '$app/environment';
  import { navigating, page } from '$app/state';
  import { appState } from '$lib/state.svelte';
  import NavMenu from './_NavMenu.svelte';
  import LoadingProgress from './LoadingProgress.svelte';

  import './app.css';

  let { data, children } = $props();

  settings({
    components: {
      AppLayout: {
        classes: {
          aside: 'border-r',
          nav: 'bg-surface-300'
        }
      },
      AppBar: {
        classes:
          'bg-primary text-primary-content shadow-md [text-shadow:1px_1px_2px_var(--color-primary-700)]'
      },
      NavItem: {
        classes: {
          root: 'text-sm text-surface-content/70 pl-6 py-2 hover:bg-surface-100/70 relative',
          active:
            'text-primary bg-surface-100 font-medium before:absolute before:bg-primary before:rounded-full before:w-1 before:h-2/3 before:left-[6px] shadow-sm z-10'
        }
      }
    }
  });

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

  appState.user = data.user;

  let currentPath = '';
  onMount(() => {
    // Posthog analytics
    if (!dev) {
      watch(
        () => page,
        () => {
          if (currentPath && currentPath !== page.url.pathname) {
            // Page navigated away
            posthog.capture('$pageleave');
          }
          // Page entered
          currentPath = page.url.pathname;
          posthog.capture('$pageview');
        }
      );
      const handleBeforeUnload = () => {
        // Hard reloads or browser exit
        posthog.capture('$pageleave');
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  });
</script>

{#if navigating.to}
  <div out:fade={{ duration: 200 }} class="absolute top-0 w-full z-9999">
    <LoadingProgress
      loading={navigating != null}
      timeout={3000}
      class="[--color:var(--color-emerald-400)] [--track-color:var(--color-emerald-600)] [&.error]:[--color:var(--color-red-400)] block h-1"
    />
  </div>
{/if}

{#if !data.accessToken}
  <ViewportCenter>
    <Card title="Authenticate" subheading="Login to retrieve access token for GraphQL">
      <div class="px-4 pb-4">
        <Button href="/auth/login" rel="external" variant="fill" color="primary" icon={mdiLogin}
          >Login</Button
        >
      </div>
    </Card>
  </ViewportCenter>
{:else}
  <AppLayout>
    {#snippet nav()}
      <NavMenu />
    {/snippet}

    <AppBar title="Github Analysis">
      <div slot="actions" class="flex gap-3 items-center">
        <div class="border-r border-primary-content/20 pr-2">
          <ThemeSelect keyboardShortcuts />
        </div>

        <Tooltip title="Discord" placement="left" offset={2}>
          <Button
            icon="M20.33 5.06C18.78 4.33 17.12 3.8 15.38 3.5 15.17 3.89 14.92 4.4 14.74 4.82 12.9 4.54 11.07 4.54 9.26 4.82 9.09 4.4 8.83 3.89 8.62 3.5 6.88 3.8 5.21 4.33 3.66 5.06 0.53 9.79-0.32 14.41 0.1 18.96 2.18 20.52 4.19 21.46 6.17 22.08 6.66 21.4 7.1 20.69 7.48 19.93 6.76 19.66 6.07 19.33 5.43 18.94 5.6 18.81 5.77 18.68 5.93 18.54 9.88 20.39 14.17 20.39 18.07 18.54 18.23 18.68 18.4 18.81 18.57 18.94 17.92 19.33 17.24 19.66 16.52 19.94 16.9 20.69 17.33 21.41 17.82 22.08 19.8 21.46 21.82 20.52 23.9 18.96 24.4 13.69 23.05 9.11 20.33 5.06ZM8.01 16.17C6.83 16.17 5.86 15.06 5.86 13.71 5.86 12.36 6.81 11.25 8.01 11.25 9.22 11.25 10.19 12.36 10.17 13.71 10.17 15.06 9.22 16.17 8.01 16.17ZM15.99 16.17C14.8 16.17 13.83 15.06 13.83 13.71 13.83 12.36 14.78 11.25 15.99 11.25 17.19 11.25 18.17 12.36 18.14 13.71 18.14 15.06 17.19 16.17 15.99 16.17Z"
            href="https://discord.gg/697JhMPD3t"
            class="p-2"
            target="_blank"
          />
        </Tooltip>

        <Tooltip title="Bluesky" placement="left" offset={2}>
          <Button
            icon="M5.43 3.26c2.66 2 5.52 6.05 6.57 8.22 1.05-2.17 3.91-6.22 6.57-8.22 1.92-1.44 5.03-2.56 5.03 0.99 0 0.71-0.41 5.95-0.64 6.81-0.83 2.96-3.85 3.71-6.53 3.25 4.69 0.8 5.89 3.44 3.3 6.09-4.9 5.02-7.04-1.26-7.58-2.87-0.1-0.3-0.15-0.43-0.15-0.31 0-0.12-0.05 0.02-0.15 0.31-0.55 1.61-2.69 7.89-7.58 2.87-2.58-2.65-1.38-5.29 3.3-6.09-2.68 0.46-5.7-0.3-6.53-3.25-0.24-0.85-0.64-6.09-0.64-6.81 0-3.55 3.11-2.43 5.03-0.99z"
            href="https://bsky.app/profile/techniq.dev"
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

    {@render children?.()}
  </AppLayout>
{/if}

{#if $fetchErrors.length}
  <div
    class="flex flex-col gap-4 fixed top-0 right-0 p-7 overflow-auto h-max-screen z-100 pointer-events-none"
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
