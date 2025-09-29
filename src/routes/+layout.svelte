<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

</script>

<Header />

<slot />

<SiteFooter />
