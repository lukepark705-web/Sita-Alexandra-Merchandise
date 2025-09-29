<!-- src/routes/cart/+page.svelte -->
<script lang="ts">
	import IconCart from '$lib/icons/IconCart.svelte';
</script>

<section class="coming container">
	<!-- Accent ring background -->
	<div class="aura" aria-hidden="true"></div>

	<div class="chip">
		<IconCart size={18} />
		<span>Cart</span>
	</div>

	<h1>Great things are on the horizon</h1>
	<p class="lead">
		Something big is brewing! Our store is in the works and will be launching soon.
	</p>

	<div class="highlights" role="list">
		<span role="listitem">Secure checkout</span>
		<span role="listitem">Worldwide shipping</span>
		<span role="listitem">Limited drops</span>
	</div>

	<a href="/" class="cta">← Continue browsing</a>
</section>

<style>
	.coming {
		position: relative;
		min-height: 70vh;
		display: grid;
		place-items: center;
		text-align: center;
		gap: 14px;
		padding: 48px 16px 72px;
	}

	/* soft gradient aura using your palette tokens */
	.aura {
		position: absolute;
		inset: auto 0 0 0;
		top: 8%;
		width: 100%;
		height: 42vh;
		pointer-events: none;
		background:
			radial-gradient(60% 60% at 50% 20%, var(--robin) 0%, transparent 60%),
			radial-gradient(50% 50% at 20% 70%, var(--violet) 0%, transparent 60%),
			radial-gradient(40% 40% at 80% 60%, var(--rose) 0%, transparent 60%);
		filter: blur(40px);
		opacity: 0.18;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: #fff;
		box-shadow: var(--shadow-xs);
		font-weight: 600;
	}

	h1 {
		margin: 10px 0 6px;
		font-family: 'CircularStd', system-ui;
		font-weight: 700;
		letter-spacing: 0.02em;
		font-size: clamp(26px, 6vw, 44px);
		color: var(--ink);
	}

	.lead {
		margin: 0 auto;
		max-width: 38ch;
		color: var(--muted);
		font-size: clamp(14px, 3.6vw, 16px);
		line-height: 1.6;
	}

	.highlights {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		margin-top: 12px;
	}
	.highlights > span {
		padding: 7px 10px;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: #fff;
		font-weight: 600;
		font-size: 13px;
	}

	.cta {
		display: inline-block;
		margin-top: 16px;
		padding: 10px 14px;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: #fff;
		box-shadow: var(--shadow-xs);
		transition: transform 0.12s ease;
	}
	.cta:active {
		transform: translateY(1px);
	}
</style>
