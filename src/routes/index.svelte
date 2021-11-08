<script context="module" lang="ts">
	export async function load({ session }) {
		return {
			props: {
				user: session.user,
				accessToken: session.accessToken
			}
		};
	}
</script>

<script lang="ts">
	export let user: string;
	export let accessToken: string;
</script>

<a href="/auth/login" rel="external">Login to Github</a>

<div>User: {user}</div>
<div>Access Token: {accessToken}</div>
