<script lang="ts">
	import { cartItems, clearCart } from '$lib/stores/cart';
	import SignInModal from '$lib/components/SignInModal.svelte';
	import { db } from '$lib/db';
	import { session } from '$lib/stores/session';

	let showSignIn = false;

	async function handleSignedIn() {
		await session.refresh();
		await db.cloud.sync();
		showSignIn = false;
	}

	$: me = $session.user;
	$: items = $cartItems;
	$: subtotal = items.reduce((n, r) => n + r.price * (r.qty ?? 1), 0);
</script>

<section class="cart-hero">
	<div class="copy">
		<h1>Great things are on the horizon</h1>
		<p>Our store is brewing — the Championship drop will be live soon.</p>

		<div class="cta-row">
			{#if me}
				<span class="hello"
					>Signed in as <strong>{me.name ?? me.email}</strong>{me.role === 'admin'
						? ' · Admin'
						: ''}</span
				>
				<button
					class="ghost"
					on:click={async () => {
						await db.cloud.logout();
						await fetch('/api/auth/logout', { method: 'POST' });
						await session.refresh();
					}}>Log out</button
				>
			{:else}
				<button class="primary" on:click={() => (showSignIn = true)}
					>Create account / Sign in</button
				>
			{/if}
			<button class="ghost" on:click={clearCart}>Clear cart</button>
		</div>
	</div>
</section>

{#if items.length}
	<section class="container cartlist">
		<h3>Your selections ({items.length})</h3>
		<ul class="list" role="list">
			{#each items as it}
				<li class="row">
					<img src={it.image} alt={it.name} />
					<div class="meta">
						<strong>{it.name}</strong>
						<span>Qty {it.qty ?? 1}</span>
					</div>
					<div class="price">${(it.price * (it.qty ?? 1)).toFixed(2)}</div>
				</li>
			{/each}
		</ul>
		<div class="total">Subtotal <b>${subtotal.toFixed(2)}</b></div>
	</section>
{/if}

{#if showSignIn}
	<SignInModal on:close={() => (showSignIn = false)} on:signedin={handleSignedIn} />
{/if}

<style>
	.cart-hero {
		padding: clamp(32px, 8vw, 80px) 16px;
		text-align: center;
		background: radial-gradient(1200px 400px at 50% -20%, #f6f7fb 0, #fff 60%), #fff;
	}
	.cart-hero h1 {
		font-size: clamp(28px, 8vw, 56px);
		line-height: 1.08;
		margin: 0 0 0.5rem;
	}
	.cart-hero p {
		color: #6b7280;
		margin: 0 auto 1rem;
		max-width: 42ch;
	}
	.cta-row {
		display: flex;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
		align-items: center;
	}
	.hello {
		color: #6b7280;
	}
	button.primary {
		background: #000;
		color: #fff;
		border: none;
		border-radius: 999px;
		padding: 0.9rem 1.2rem;
		font-weight: 800;
	}
	button.ghost {
		background: #fff;
		color: #000;
		border: 1px solid #e5e7eb;
		border-radius: 999px;
		padding: 0.9rem 1.2rem;
		font-weight: 700;
	}

	.cartlist {
		padding: 18px 16px 64px;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 12px 0;
		display: grid;
		gap: 10px;
	}
	.row {
		display: grid;
		grid-template-columns: 56px 1fr auto;
		gap: 10px;
		align-items: center;
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 8px 10px;
		background: #fff;
	}
	.row img {
		width: 56px;
		height: 56px;
		object-fit: cover;
		border-radius: 10px;
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.meta span {
		color: #6b7280;
		font-size: 13px;
	}
	.price {
		font-weight: 800;
	}
	.total {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 6px;
	}
</style>
