<script lang="ts">
	import gql from 'graphql-tag';
	import { AppBar, ProgressCircle, graphStore, ListItem, Overlay } from 'svelte-ux';

	// Reference: https://gist.github.com/MichaelCurrin/f8a7a11451ce4ec055d41000c915b595

	const query = graphStore();
	$: query.fetch({
		query: gql`
			query ($first: Int!) {
				viewer {
					pullRequests(
						first: $first
						states: MERGED
						orderBy: { field: UPDATED_AT, direction: DESC }
					) {
						nodes {
							title
							repository {
								nameWithOwner
								isPrivate
							}
						}
					}

					repositories(first: 5) {
						nodes {
							name
							pullRequests(last: 5) {
								nodes {
									number
									url
									state
									reviews(last: 100) {
										nodes {
											author {
												login
											}
											state
										}
									}
								}
							}
						}
					}
				}

				# search(
				# 	# query: "is:merged is:pr is:public archived:false author:techniq -user:techniq"
				# 	query: "is:merged is:pr author:techniq"
				# 	type: ISSUE
				# 	first: 100
				# ) {
				# 	issueCount
				# 	edges {
				# 		node {
				# 			... on PullRequest {
				# 				number
				# 				title
				# 				repository {
				# 					nameWithOwner
				# 				}
				# 				createdAt
				# 				mergedAt
				# 				url
				# 				changedFiles
				# 				additions
				# 				deletions
				# 			}
				# 		}
				# 	}
				# }
			}
		`,
		variables: {
			first: 10
		}
	});

	$: console.log($query.data);
</script>

<AppBar title="Pull Requests" />

<main class="p-4">
	<div class="relative min-h-[56px]">
		{#if $query.loading}
			<Overlay center class="rounded">
				<ProgressCircle />
			</Overlay>
		{/if}

		{#if $query.data}
			{#each $query.data.viewer.pullRequests.nodes as pr}
				<ListItem title={pr.title} subheading={pr.repository.nameWithOwner} />
			{/each}
		{/if}
	</div>
</main>
