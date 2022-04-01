<script lang="ts">
	import { fly } from 'svelte/transition';
	import { format, startOfWeek, subDays } from 'date-fns';
	import gql from 'graphql-tag';

	import { mdiAccount, mdiDatabase, mdiPlay, mdiSourceBranch } from '@mdi/js';

	import {
		AppBar,
		Button,
		CircularProgress,
		graphStore,
		ListItem,
		Overlay,
		TextField
	} from 'svelte-ux';

	import { user } from '$lib/stores';

	let owner = $user.login;
	let repo = 'svelte-ux';
	let branch = 'master';

	const query = graphStore({
		query: gql`
			query ($owner: String!, $repo: String!, $branch: String!) {
				repository(owner: $owner, name: $repo) {
					diskUsage
					ref(qualifiedName: $branch) {
						target {
							... on Commit {
								id
								history(first: 10) {
									totalCount
									pageInfo {
										hasNextPage
									}
									edges {
										node {
											id
											oid
											message
											author {
												name
												email
												date
												avatarUrl
											}
											committedDate
											authoredDate
											pushedDate
											changedFiles
											additions
											deletions
										}
									}
								}
							}
						}
					}
				}
			}
		`
	});

	function run() {
		query.fetch({
			variables: {
				owner,
				repo,
				branch
			}
		});
	}
	run();
</script>

<AppBar title="Commits" />

<main>
	<div class="flex gap-2 bg-white border-b p-4">
		<TextField
			label="Owner"
			bind:value={owner}
			icon={mdiAccount}
			dense
			placeholder="User or organization"
			shrinkLabel
			class="flex-1"
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					run();
				}
			}}
		/>
		<TextField
			label="Repository"
			bind:value={repo}
			icon={mdiDatabase}
			dense
			placeholder="Name of repository"
			shrinkLabel
			class="flex-1"
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					run();
				}
			}}
		/>
		<TextField
			label="Branch"
			bind:value={branch}
			icon={mdiSourceBranch}
			dense
			placeholder="Name of repository"
			shrinkLabel
			class="flex-1"
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					run();
				}
			}}
		/>
		<Button on:click={() => run()} icon={mdiPlay} class="bg-blue-500 text-white hover:bg-blue-600">
			Run
		</Button>
	</div>

	<div class="relative min-h-[56px] p-4">
		{#if $query.loading}
			<Overlay center class="rounded">
				<CircularProgress />
			</Overlay>
		{/if}

		{#if $query.data}
			{#each $query.data.repository.ref.target.history.edges as commit}
				<ListItem>
					<div slot="title">
						{commit.node.message}
						<span class="text-xs text-black/50 whitespace-nowrap">
							{format(new Date(commit.node.committedDate), 'h:mm aa')}
						</span>
					</div>
					<div slot="actions" />
				</ListItem>
			{/each}
		{/if}
	</div>
</main>
