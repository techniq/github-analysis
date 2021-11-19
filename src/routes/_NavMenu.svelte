<script lang="ts">
	import {
		mdiAccount,
		mdiCodeBraces,
		mdiExitRun,
		mdiHome,
		mdiPeriodicTable,
		mdiSourceCommit,
		mdiTimelineClockOutline
	} from '@mdi/js';

	import { Avatar, Button, Dialog, Icon, NavItem, Toggle, Tooltip } from 'svelte-ux';

	import { user } from '$lib/stores';
</script>

<NavItem class="pl-4 py-2 border-b border-gray-600 ">
	<Avatar class="bg-gray-600 mr-4">
		<Icon path={mdiAccount} />
	</Avatar>

	<div class="flex-grow">
		<div>{$user.name}</div>
		<div class="text-xs text-white/30">{$user.login}</div>
	</div>

	<Toggle let:on={open} let:toggle>
		<Tooltip title="Sign out">
			<Button icon={mdiExitRun} on:click={toggle} class="p-2" />
		</Tooltip>

		<Dialog {open} on:close={toggle}>
			<div slot="title">Sign out</div>
			<div class="p-4">Are you sure you want to sign out?</div>

			<div slot="actions">
				<Button
					class="bg-blue-500 hover:bg-blue-600 text-white"
					icon={mdiExitRun}
					href="/auth/logout"
					rel="external"
				>
					Sign out
				</Button>
				<Button class="">Cancel</Button>
			</div>
		</Dialog>
	</Toggle>
</NavItem>

<NavItem text="Home" icon={mdiHome} path="/" class="pl-6 py-2 mt-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">User</div>
<NavItem text="Contributions" icon={mdiPeriodicTable} path="/contributions" class="pl-6 py-2" />
<NavItem text="Repositories" icon={mdiCodeBraces} path="/repositories" class="pl-6 py-2" />

<div class="pt-4 pb-2 pl-4 text-xs text-gray-200 font-bold">Repository</div>
<NavItem text="Punch Card" icon={mdiTimelineClockOutline} path="/punchcard" class="pl-6 py-2" />
<NavItem text="Commits" icon={mdiSourceCommit} path="/commits" class="pl-6 py-2" />
