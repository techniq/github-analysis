<script lang="ts">
	import { writable } from 'svelte/store';
	import { flip } from 'svelte/animate';

	import {
		AppLayout,
		initGraphClient,
		ErrorNotification,
		ViewportCenter,
		Card,
		Button,
		createTheme
	} from 'svelte-ux';

	import { user } from '$lib/stores';

	import NavMenu from './_NavMenu.svelte';

	export let data;

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
		AppBar: 'bg-accent-500 text-white shadow-md',
		AppLayout: {
			nav: 'bg-neutral-800'
		},
		NavItem: {
			root: 'text-gray-400 hover:text-white hover:bg-gray-300/10 [&:where(.is-active)]:text-sky-400 [&:where(.is-active)]:bg-gray-500/10 pl-6 py-2',
			indicator: 'bg-sky-500'
		}
	});

	$user = data.user;
</script>

{#if !data.accessToken}
	<ViewportCenter>
		<Card title="Authenticate" subheading="Login to retrieve access token for GraphQL">
			<div class="px-4 pb-4">
				<Button href="/auth/login" rel="external" class="bg-blue-500 hover:bg-blue-600 text-white">
					Login
				</Button>
			</div>
		</Card>
	</ViewportCenter>
{:else}
	<AppLayout>
		<nav slot="nav" class="nav h-full">
			<NavMenu />
		</nav>

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
		@apply bg-black/10;
	}

	:global(nav h1) {
		@apply py-2 pl-4 mt-4 text-sm text-gray-200 font-bold bg-black/20 border-t border-b border-white/10;
	}

	:global(nav h2) {
		@apply pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold;
	}
</style>
