<!-- src/lib/components/Header.svelte -->
<script lang="ts">
	import IconCart from '$lib/icons/IconCart.svelte';
	import IconMenu from '$lib/icons/IconMenu.svelte';
	import MobileMenu from './MobileMenu.svelte';

	export let cartCount = 0;

	let menuOpen = false;

	// Lock body scroll when the drawer is open (client-only)
	$: if (typeof document !== 'undefined') {
		document.body.classList.toggle('no-scroll', menuOpen);
	}
</script>

<header class="site-header">
	<div class="container bar">
		<button
			class="icon-btn"
			aria-label="Open menu"
			aria-expanded={menuOpen}
			on:click={() => (menuOpen = true)}
		>
			<IconMenu />
		</button>

		<div class="brand" style="text-align:center; flex:1">
			<a href="/">SitaAlexandra</a>
		</div>

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

	<!-- Pass a single `open` prop + a close callback -->
	<MobileMenu open={menuOpen} onClose={() => (menuOpen = false)} />
</header>
