<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { session } from '$lib/stores/session';

	export let open = false;
	export let onClose: () => void;

	const dispatch = createEventDispatcher();
	function close() {
		onClose?.();
		dispatch('close');
	}
</script>

{#if open}
	<div class="drawer" role="dialog" aria-modal="true">
		<div class="panel">
			<button class="icon-btn" aria-label="Close menu" on:click={close}>✕</button>

			<ul class="menu-list" role="list">
				<li class="menu-item"><a href="#men" on:click={close}>Men</a></li>
				<li class="menu-item"><a href="#women" on:click={close}>Women</a></li>
				<li class="menu-item"><a href="#kids" on:click={close}>Kids</a></li>
				<li class="menu-item"><a href="#games" on:click={close}>Games</a></li>
				<li class="menu-item">
					<a href="#accessories" on:click={close}>Accessories & Collectibles</a>
				</li>

				{#if $session.user?.role === 'admin'}
					<li class="menu-item">
						<a href="/admin/products" on:click={close}>Admin · Products</a>
						<span class="badge">admin</span>
					</li>
				{/if}
			</ul>
		</div>

		<!-- backdrop must be interactive (a11y) and not self-closing -->
		<button type="button" class="backdrop" aria-label="Close menu" on:click={close}></button>
	</div>
{/if}

<style>
	.drawer {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: grid;
		grid-template-columns: min(80vw, 320px) 1fr;
	}
	.panel {
		background: #fff;
		border-right: 1px solid #eee;
		padding: 20px 16px 32px;
		box-shadow: var(--shadow-sm);
	}
	.backdrop {
		background: rgba(0, 0, 0, 0.35);
		border: 0;
		padding: 0;
		margin: 0;
		width: 100%;
		height: 100%;
	}
	.menu-list {
		list-style: none;
		padding: 0;
		margin: 12px 0 0;
	}
	.menu-item {
		padding: 14px 8px;
		border-bottom: 1px solid #f3f4f6;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		font-weight: 600;
	}
	.badge {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 999px;
		background: var(--ink);
		color: #fff;
		opacity: 0.85;
	}
</style>
