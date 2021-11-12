<script lang="ts">
	import gql from 'graphql-tag';
	import { AppBar, CircularProgress, graphStore, ListItem, Overlay } from 'svelte-ux';

	const query = graphStore();
	$: query.fetch({
		query: gql`
			query ($last: Int!) {
				viewer {
					name
					repositories(last: $last) {
						nodes {
							name
							description
						}
					}
				}
			}
		`,
		variables: {
			last: 10
		}
	});
</script>

<AppBar title="Repositories" />

<main class="p-4">
	<div class="relative min-h-[56px]">
		{#if $query.loading}
			<Overlay center class="rounded">
				<CircularProgress />
			</Overlay>
		{/if}

		{#if $query.data}
			{#each $query.data.viewer.repositories.nodes as repo}
				<ListItem title={repo.name} subheading={repo.description} />
			{/each}
		{/if}
	</div>
</main>
