<script lang="ts">
  import {
    mdiAccount,
    mdiBookVariant,
    mdiCodeBraces,
    mdiDownload,
    mdiExitRun,
    mdiHome,
    mdiPeriodicTable,
    mdiSourceCommit,
    mdiSourcePull,
    mdiStar,
    mdiTimelineClockOutline
  } from '@mdi/js';

  import { Avatar, Button, Dialog, NavItem, Toggle, Tooltip } from 'svelte-ux';

  import { user } from '$lib/stores';
  import { page } from '$app/stores';
</script>

<NavItem currentUrl={$page.url} class="pl-4 border-b border-b-neutral-600">
  <Avatar class="bg-gray-600 mr-4 overflow-hidden">
    <img src={$user.avatarUrl} />
    <!-- <Icon path={mdiAccount} /> -->
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

      <div slot="actions" class="flex items-center gap-2">
        <Button variant="fill" color="blue" icon={mdiExitRun} href="/auth/logout" rel="external">
          Sign out
        </Button>
        <Button>Cancel</Button>
      </div>
    </Dialog>
  </Toggle>
</NavItem>

<!-- <NavItem text="Home" icon={mdiHome} path="/" currentUrl={$page.url} class="mt-2" /> -->

<h2>User</h2>
<NavItem text="Repositories" icon={mdiBookVariant} path="/repositories" currentUrl={$page.url} />
<NavItem
  text="Contributions"
  icon={mdiPeriodicTable}
  path="/contributions"
  currentUrl={$page.url}
/>
<NavItem text="Pull Requests" icon={mdiSourcePull} path="/pullrequests" currentUrl={$page.url} />

<h2>Repository</h2>
<NavItem text="Stars" icon={mdiStar} path="/stars" currentUrl={$page.url} />
<NavItem
  text="Punch Card"
  icon={mdiTimelineClockOutline}
  path="/punchcard"
  currentUrl={$page.url}
/>
<!-- TODO: Improve and show -->
<!-- <NavItem text="Commits" icon={mdiSourceCommit} path="/commits" currentUrl={$page.url} /> -->

<h2>NPM</h2>
<NavItem text="Downloads" icon={mdiDownload} path="/downloads" currentUrl={$page.url} />
