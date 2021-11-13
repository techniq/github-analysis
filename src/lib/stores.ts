import { writable } from 'svelte/store';

export let user = writable<{ login: string; name: string }>();
