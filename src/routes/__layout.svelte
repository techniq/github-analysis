<script context="module" lang="ts">
	export async function load({ session }) {
		return {
			props: {
				user: session.user,
				accessToken: session.accessToken
			}
		};
	}
</script>

<script lang="ts">
	import { writable } from 'svelte/store';
	import { flip } from 'svelte/animate';

	import {
		AppLayout,
		initGraphClient,
		ErrorNotification,
		ViewportCenter,
		Card,
		Button
	} from 'svelte-ux';

	import NavMenu from './_NavMenu.svelte';

	export let user: string;
	export let accessToken: string;

	const fetchErrors = writable([]);

	initGraphClient({
		url: 'https://api.github.com/graphql',
		config: {
			options: () => {
				return {
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				};
			},
			errors: fetchErrors
		}
	});
</script>

{#if accessToken}
	<AppLayout>
		<nav slot="nav" class="nav h-full">
			<NavMenu {user} />
		</nav>

		<slot />
	</AppLayout>
{:else}
	<ViewportCenter>
		<Card
			title="Security Error"
			subheading="An unexpected error occurred while retrieving security."
		>
			<div class="px-4 pb-4">
				<Button href="/auth/login" rel="external" class="bg-blue-500 hover:bg-blue-600 text-white">
					Login
				</Button>
			</div>
		</Card>
	</ViewportCenter>
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
</style>
