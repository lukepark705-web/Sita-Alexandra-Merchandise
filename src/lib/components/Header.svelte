<script lang="ts">
	import IconCart from '$lib/icons/IconCart.svelte';
	import IconMenu from '$lib/icons/IconMenu.svelte';
	import MobileMenu from './MobileMenu.svelte';
	import { session } from '$lib/stores/session';
	import { page } from '$app/stores';

	export let cartCount = 0;

	let menuOpen = false;
	// Are we on the homepage?
	$: atHome = $page.url.pathname === '/';
</script>

<header class="site-header">
	<div class="container bar">
		<!-- Left: hamburger on home, home button on routes -->
		{#if atHome}
			<button class="icon-btn" aria-label="Open menu" on:click={() => (menuOpen = true)}>
				<IconMenu />
			</button>
		{:else}
			<a class="icon-btn" href="/" aria-label="Go to home">
				<!-- simple home svg, no extra icon component needed -->
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M3 11.5 12 4l9 7.5"></path>
					<path d="M5 10.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9.5"></path>
				</svg>
			</a>
		{/if}

		<!-- Center: brand -->
		<div class="brand" style="text-align:center; flex:1">
			<a href="/">SitaAlexandra</a>
		</div>

		<!-- Right: admin gear (if admin) + cart -->
		<div style="display:flex; gap:8px; align-items:center">
			{#if $session.user?.role === 'admin'}
				<a class="icon-btn" href="/admin/products" aria-label="Admin">⚙️</a>
			{/if}

			<a class="icon-btn" href="/cart" aria-label="Open cart" style="position:relative">
				<IconCart />
				{#if cartCount > 0}
					<span
						style="
            position:absolute; top:-4px; right:-4px; background:var(--violet); color:#fff;
            border-radius:10px; font-size:11px; padding:1px 6px; line-height:16px; border:2px solid #fff;"
					>
						{cartCount}
					</span>
				{/if}
			</a>
		</div>
	</div>

	<!-- Only mount the drawer on the homepage -->
	{#if atHome}
		<MobileMenu bind:open={menuOpen} onClose={() => (menuOpen = false)} />
	{/if}
</header>
