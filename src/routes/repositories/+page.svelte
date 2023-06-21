<script lang="ts">
	import gql from 'graphql-tag';
	import { AppBar, ProgressCircle, graphStore, ListItem, Overlay } from 'svelte-ux';

	const query = graphStore();
	$: query.fetch({
		query: gql`
			query ($last: Int!) {
				viewer {
					name
					repositories(last: $last) {
						nodes {
							nameWithOwner
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
				<ProgressCircle />
			</Overlay>
		{/if}

		{#if $query.data}
			{#each $query.data.viewer.repositories.nodes as repo}
				<ListItem title={repo.nameWithOwner} subheading={repo.description} />
			{/each}
		{/if}
	</div>
</main>