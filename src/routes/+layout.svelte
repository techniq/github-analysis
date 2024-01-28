<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
  import posthog from 'posthog-js';
  import { mdiGithub, mdiLogin, mdiTwitter } from '@mdi/js';

  import {
    AppLayout,
    initGraphClient,
    ErrorNotification,
    ViewportCenter,
    Card,
    Button,
    AppBar,
    Tooltip,
    settings,
    ThemeSwitch
  } from 'svelte-ux';

  import { dev } from '$app/environment';
  import { navigating, page } from '$app/stores';
  import { user } from '$lib/stores';
  import NavMenu from './_NavMenu.svelte';
  import LoadingProgress from './LoadingProgress.svelte';

  export let data;

  settings({
    classes: {
      AppLayout: {
        aside: 'border-r',
        nav: 'bg-surface-300'
      },
      AppBar:
        'bg-primary text-primary-content shadow-md [text-shadow:1px_1px_2px_theme(colors.primary-700)]',
      NavItem: {
        root: 'text-sm text-surface-content/70 pl-6 py-2 hover:bg-surface-100/70 relative',
        active:
          'text-primary bg-surface-100 font-medium before:absolute before:bg-primary before:rounded-full before:w-1 before:h-2/3 before:left-[6px] shadow z-10'
      }
    },
    // themes: data.themes,
    themes: {
      light: ['light'],
      dark: ['dark']
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

  $user = data.user;

  let currentPath = '';
  onMount(() => {
    // Posthog analytics
    if (!dev) {
      const unsubscribePage = page.subscribe(($page) => {
        if (currentPath && currentPath !== $page.url.pathname) {
          // Page navigated away
          posthog.capture('$pageleave');
        }

        // Page entered
        currentPath = $page.url.pathname;
        posthog.capture('$pageview');
      });
      const handleBeforeUnload = () => {
        // Hard reloads or browser exit
        posthog.capture('$pageleave');
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        unsubscribePage();
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  });
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
      <div slot="actions" class="flex gap-3 items-center">
        <ThemeSwitch classes={{ switch: 'bg-surface-300/20 border-none' }} />
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
  @tailwind utilities;

  :global(body) {
    @apply bg-surface-200 accent-primary;
  }
</style>
