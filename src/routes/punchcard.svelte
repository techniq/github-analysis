<script lang="ts">
	import { mdiPlay } from '@mdi/js';

	import {
		AppBar,
		Button,
		Card,
		CircularProgress,
		fetchStore,
		Overlay,
		TextField
	} from 'svelte-ux';

	import { user } from '$lib/stores';

	let owner = 'techniq';
	let repo = 'svelte-ux';
	let branch = 'master';

	const query = fetchStore();

	function run() {
		query.fetch(`https://api.github.com/repos/${owner}/${repo}/stats/punch_card`, {
			onDataChange(data) {
				// TODO: Add summary per weekday and hour
				return data.map((d) => {
					return { weekday: d[0], hour: d[1], count: d[2] };
				});
			}
		});
	}
	run();
</script>

<AppBar title="Punch Card" />

<main>
	<div class="flex gap-2 bg-white border-b p-4">
		<TextField
			label="Owner"
			bind:value={owner}
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
			<Card class="grid grid-rows-[repeat(8,1fr)] grid-cols-[repeat(25,1fr)] gap-1 p-4 text-right">
				{#each Array.from({ length: 24 }) as _, i}
					<div class="text-xs font-bold" style="grid-row: 1; grid-column: {i + 2}">{i}:00</div>
				{/each}

				<div class="text-sm font-bold" style="grid-row: 2; grid-column: 1">Sun</div>
				<div class="text-sm font-bold" style="grid-row: 3; grid-column: 1">Mon</div>
				<div class="text-sm font-bold" style="grid-row: 4; grid-column: 1">Tue</div>
				<div class="text-sm font-bold" style="grid-row: 5; grid-column: 1">Wed</div>
				<div class="text-sm font-bold" style="grid-row: 6; grid-column: 1">Thu</div>
				<div class="text-sm font-bold" style="grid-row: 7; grid-column: 1">Fri</div>
				<div class="text-sm font-bold" style="grid-row: 8; grid-column: 1">Sat</div>

				{#each $query.data as item}
					<div class="text-xs" style="grid-row: {item.weekday + 2}; grid-column: {item.hour + 2}">
						{item.count || '-'}
					</div>
				{/each}
			</Card>
		{/if}
	</div>
</main>
