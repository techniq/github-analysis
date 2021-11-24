<script context="module" lang="ts">
	export async function load({ session }) {
		return {
			props: {
				accessToken: session.accessToken
			}
		};
	}
</script>

<script lang="ts">
	import { writable } from 'svelte/store';
	import { flip } from 'svelte/animate';
	import gql from 'graphql-tag';

	import {
		AppLayout,
		initGraphClient,
		ErrorNotification,
		ViewportCenter,
		Card,
		Button,
		graphStore,
		CircularProgress
	} from 'svelte-ux';

	import { user } from '$lib/stores';

	import NavMenu from './_NavMenu.svelte';

	export let accessToken: string;

	const fetchErrors = writable([]);

	initGraphClient({
		url: 'https://api.github.com/graphql',
		config: {
			options() {
				return {
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				};
			},
			errors: fetchErrors
		}
	});

	const query = graphStore();
	$: query.fetch({
		query: gql`
			query {
				viewer {
					login
					name
				}
			}
		`,
		config: {
			onDataChange(data) {
				$user = data.viewer;
			}
		}
	});
</script>

{#if !accessToken}
	<ViewportCenter>
		<Card title="Authenticate" subheading="Login to retrieve access token for GraphQL">
			<div class="px-4 pb-4">
				<Button href="/auth/login" rel="external" class="bg-blue-500 hover:bg-blue-600 text-white">
					Login
				</Button>
			</div>
		</Card>
	</ViewportCenter>
{:else if $query.loading}
	<ViewportCenter>
		<Card>
			<div class="grid place-items-center gap-4 p-4">
				<CircularProgress />
				<div class="text-lg">Loading user...</div>
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
</style>
