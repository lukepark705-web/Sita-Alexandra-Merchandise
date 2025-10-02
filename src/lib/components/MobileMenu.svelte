<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { session } from '$lib/stores/session';

	export let open = false;
	// Not empty: keep a tiny comment to satisfy eslint(no-empty)
	export let onClose: () => void = () => {
		/* noop */
	};

	const dispatch = createEventDispatcher();

	function close() {
		onClose?.();
		dispatch('close');
	}

	/** Compute sticky header height (fallback to 56px) */
	function getHeaderOffset(): number {
		if (typeof document === 'undefined') return 56;
		const bar = document.querySelector('.site-header .bar') as HTMLElement | null;
		const header = bar ?? (document.querySelector('.site-header') as HTMLElement | null);
		return header ? Math.ceil(header.getBoundingClientRect().height) : 56;
	}

	/** Smoothly scroll to an element ID, compensating for the sticky header */
	function smoothScrollToId(id: string) {
		if (typeof window === 'undefined' || !id) return;
		const target = document.getElementById(id);
		if (!target) return;

		const header = getHeaderOffset();
		const y = window.scrollY + target.getBoundingClientRect().top - (header + 8);

		// Update hash without default jump
		history.pushState(null, '', `#${encodeURIComponent(id)}`);

		window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });

		// A11y: focus target after a short delay (without re-scrolling)
		target.setAttribute('tabindex', '-1');
		setTimeout(() => {
			try {
				target.focus({ preventScroll: true });
			} catch (err) {
				/* ignore focus errors (older browsers / iOS) */
			}
			setTimeout(() => target.removeAttribute('tabindex'), 800);
		}, 180);
	}

	/** Handle clicks on in-page anchors; allow normal nav for real links */
	function handleAnchorClick(e: MouseEvent) {
		const a = e.currentTarget as HTMLAnchorElement;
		const href = a.getAttribute('href') || '';

		if (href.startsWith('#')) {
			e.preventDefault();
			const id = href.slice(1);

			// Close first (so overlay doesn't hide the scroll)
			close();

			// After unmount frame, perform the scroll
			setTimeout(() => smoothScrollToId(id), 10);
		}
		// else: let normal navigation happen for resolved links (e.g. admin)
	}

	onMount(() => {
		function onKeydown(ev: KeyboardEvent) {
			if (ev.key === 'Escape' && open) close();
		}
		window.addEventListener('keydown', onKeydown);

		// Gentle auto-scroll to current hash (useful when coming from external link)
		if (typeof window !== 'undefined' && window.location.hash) {
			const id = decodeURIComponent(window.location.hash.slice(1));
			// Wait a tick for layout (images/fonts) then scroll
			setTimeout(() => smoothScrollToId(id), 60);
		}

		return () => {
			window.removeEventListener('keydown', onKeydown);
		};
	});
</script>

{#if open}
	<div class="drawer" role="dialog" aria-modal="true" aria-labelledby="menu-title">
		<nav class="panel" aria-label="Mobile menu">
			<header class="panel__head">
				<h2 id="menu-title">Browse</h2>
				<button type="button" class="icon-btn" aria-label="Close menu" on:click={close}>✕</button>
			</header>

			<ul class="menu-list" role="list">
				<li class="menu-item">
					<a href="#men" on:click={handleAnchorClick}>
						<span class="dot" aria-hidden="true"></span>
						<span>Men</span>
						<span class="chev" aria-hidden="true">›</span>
					</a>
				</li>
				<li class="menu-item">
					<a href="#women" on:click={handleAnchorClick}>
						<span class="dot" aria-hidden="true"></span>
						<span>Women</span>
						<span class="chev" aria-hidden="true">›</span>
					</a>
				</li>
				<li class="menu-item">
					<a href="#kids" on:click={handleAnchorClick}>
						<span class="dot" aria-hidden="true"></span>
						<span>Kids</span>
						<span class="chev" aria-hidden="true">›</span>
					</a>
				</li>
				<li class="menu-item">
					<a href="#games" on:click={handleAnchorClick}>
						<span class="dot" aria-hidden="true"></span>
						<span>Games</span>
						<span class="chev" aria-hidden="true">›</span>
					</a>
				</li>
				<li class="menu-item">
					<a href="#accessories" on:click={handleAnchorClick}>
						<span class="dot" aria-hidden="true"></span>
						<span>Accessories &amp; Collectibles</span>
						<span class="chev" aria-hidden="true">›</span>
					</a>
				</li>

				{#if $session.user?.role === 'admin'}
					<li class="menu-item admin">
						<!-- Use resolve() to satisfy svelte/no-navigation-without-resolve -->
						<a href={resolve('/admin/products')}>
							<span class="dot admin" aria-hidden="true"></span>
							<span>Admin · Products</span>
							<span class="badge">admin</span>
						</a>
					</li>
				{/if}
			</ul>
		</nav>

		<!-- Clickable backdrop -->
		<button type="button" class="backdrop" aria-label="Close menu" on:click={close}></button>
	</div>
{/if}

<style>
	/* ===== Drawer Layout ===== */
	.drawer {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: grid;
		grid-template-columns: min(82vw, 340px) 1fr;
	}

	/* ===== Panel (glass look) ===== */
	.panel {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.86));
		backdrop-filter: saturate(1.4) blur(10px);
		border-right: 1px solid rgba(17, 25, 45, 0.06);
		box-shadow: 0 10px 30px rgba(17, 25, 45, 0.12);
		padding: 16px 14px 24px;
		display: flex;
		flex-direction: column;
		animation: slideIn 0.22s ease-out both;
	}

	.panel__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4px 2px 8px;
	}

	.panel__head h2 {
		margin: 0;
		font-size: 14px;
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted, #6b7280);
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 20px;
		border: 1px solid #eaecef;
		background: #fff;
		box-shadow: var(--shadow-xs, 0 1px 2px rgba(0, 0, 0, 0.06));
		cursor: pointer;
	}

	/* ===== Backdrop ===== */
	.backdrop {
		background: rgba(0, 0, 0, 0.35);
		border: 0;
		padding: 0;
		margin: 0;
		width: 100%;
		height: 100%;
		animation: fadeIn 0.18s ease-out both;
	}

	/* ===== Menu ===== */
	.menu-list {
		list-style: none;
		padding: 6px 0 0;
		margin: 0;
	}

	.menu-item a {
		display: grid;
		grid-template-columns: 18px 1fr 14px;
		align-items: center;
		gap: 12px;
		padding: 12px 10px;
		border-radius: 12px;
		font-weight: 700;
		letter-spacing: 0.01em;
		color: var(--ink, #11192d);
		text-decoration: none;
		transition:
			background 0.18s ease,
			transform 0.06s ease;
	}

	/* subtle hover/active feel */
	.menu-item a:hover {
		background: rgba(40, 59, 137, 0.08);
	}
	.menu-item a:active {
		transform: translateY(0.5px);
	}

	/* small colored bullet per row */
	.dot {
		inline-size: 8px;
		block-size: 8px;
		border-radius: 999px;
		background: var(--marian, #283b89);
		opacity: 0.9;
	}
	.menu-item.admin .dot {
		background: #111;
	}

	/* right chevron */
	.chev {
		font-size: 20px;
		line-height: 1;
		opacity: 0.4;
	}

	/* Admin badge */
	.badge {
		justify-self: end;
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 999px;
		background: var(--ink, #11192d);
		color: #fff;
		opacity: 0.85;
	}

	@keyframes slideIn {
		from {
			transform: translateX(-10px);
			opacity: 0.6;
			filter: saturate(0.8);
		}
		to {
			transform: translateX(0);
			opacity: 1;
			filter: none;
		}
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* Mobile comfort */
	@media (max-width: 380px) {
		.menu-item a {
			padding: 12px 8px;
		}
	}
</style>
