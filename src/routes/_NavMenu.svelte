<script lang="ts">
  import {
    mdiAccount,
    mdiAccountSearch,
    mdiBookVariant,
    mdiCodeBraces,
    mdiDownload,
    mdiExitRun,
    mdiHome,
    mdiPeriodicTable,
    mdiSourceCommit,
    mdiSourcePull,
    mdiStar,
    mdiTimelineClockOutline,
    mdiCircleDouble as mdiIssues
  } from '@mdi/js';

  import { Avatar, Button, Dialog, NavItem, Toggle, Tooltip } from 'svelte-ux';

  import { appState } from '$lib/state.svelte';
  import { page } from '$app/state';
  
  let sp = $derived.by(() => {
    const o = page.url.searchParams.get('owner')
    const r = page.url.searchParams.get('repo')
    if (o && r) {
      return `?owner=${o}&repo=${r}`
    }
    return ''
  });
</script>

<NavItem path="" currentUrl={page.url} class="pl-4 border-b">
  <Avatar class="bg-surface-100 mr-4 overflow-hidden">
    <img src={appState.user.avatarUrl} alt="profile" />
    <!-- <Icon path={mdiAccount} /> -->
  </Avatar>

  <div class="grow">
    <div class="text-surface-content">{appState.user.name}</div>
    <div class="text-xs text-surface-content/50">{appState.user.login}</div>
  </div>

  <Toggle let:on={open} let:toggle let:toggleOff>
    <Tooltip title="Sign out">
      <Button icon={mdiExitRun} on:click={toggle} class="p-1 m-1 transition-none" />
    </Tooltip>

    <Dialog {open} on:close={toggleOff}>
      <div slot="title">Sign out</div>
      <div class="p-4">Are you sure you want to sign out?</div>

      <div slot="actions" class="flex items-center gap-2">
        <Button variant="fill" color="primary" icon={mdiExitRun} href="/auth/logout" rel="external">
          Sign out
        </Button>
        <Button>Cancel</Button>
      </div>
    </Dialog>
  </Toggle>
</NavItem>

<!-- <NavItem text="Home" icon={mdiHome} path="/" currentUrl={page.url} class="mt-2" /> -->

<h2>User</h2>
<NavItem text="Repositories" icon={mdiBookVariant} path="/repositories" currentUrl={page.url} />
<NavItem text="Followers" icon={mdiAccountSearch} path="/followers" currentUrl={page.url} />
<NavItem text="Contributions" icon={mdiPeriodicTable} path="/contributions" currentUrl={page.url} />
<NavItem text="Pull Requests" icon={mdiSourcePull} path="/pullrequests" currentUrl={page.url} />

<h2>Repository</h2>
<NavItem text="Stars" icon={mdiStar} path="/stars{sp}" currentUrl={page.url} />
<NavItem text="Issues" icon={mdiIssues} path="/issues{sp}" currentUrl={page.url} />
<NavItem text="Punch Card" icon={mdiTimelineClockOutline} path="/punchcard{sp}" currentUrl={page.url} />
<!-- TODO: Improve and show -->
<!-- <NavItem text="Commits" icon={mdiSourceCommit} path="/commits" currentUrl={page.url} /> -->

<h2>NPM</h2>
<NavItem text="Downloads" icon={mdiDownload} path="/downloads" currentUrl={page.url} />
