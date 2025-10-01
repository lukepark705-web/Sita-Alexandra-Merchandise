<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { onMount } from 'svelte';
	import { db } from '$lib/db';
	import { session } from '$lib/stores/session';
	import { overrides } from '$lib/stores/overrides';

	onMount(() => {
		session.refresh(); // who am I?
		overrides.refresh(); // load public manifest (works for anonymous)
	});

	// start Dexie Cloud sync only when logged in
	$: if ($session.user) {
		db.cloud.sync();
	}
</script>

<Header />
<slot />
<SiteFooter />
