<script lang="ts">
	import { AppBar, ListItem, Avatar, cls, DividerDot } from 'svelte-ux';

	export let data;
</script>

<AppBar title="Pull Requests" />

<main class="p-4">
	<div class="relative min-h-[56px]">
		{#each data.pullRequests.nodes as pr}
			<ListItem title={pr.title} subheading={pr.repository.nameWithOwner}>
				<Avatar
					slot="avatar"
					class={cls(
						'text-white font-semibold',
						pr.state[0] === 'M' ? 'bg-purple-600' : 'bg-gray-500'
					)}>{pr.state[0]}</Avatar
				>
				<div slot="subheading" class="text-sm text-black/50">
					{pr.repository.nameWithOwner}
					<DividerDot />
					#{pr.number}
				</div>
			</ListItem>
		{/each}
	</div>
</main>
