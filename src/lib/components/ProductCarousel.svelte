<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import IconChevron from '$lib/icons/IconChevron.svelte';
	import ProductCard from './ProductCard.svelte';

	export let title = 'Category';
	export let id = '';
	export let items: Array<{ name: string; image: string; price: number }> = [];

	let track: HTMLDivElement;
	let slides: HTMLElement[] = [];
	let io: IntersectionObserver | null = null;

	// Derived / runtime state
	let total = 0; // items.length
	let looped: typeof items = []; // 3x list
	let posIndex = 0; // index within the looped DOM list (0..3*total-1)
	let active = 0; // logical active index (0..total-1)
	let suppress = false; // ignore IO & handlers while we do programmatic jumps
	let scrollEndTimer: number | null = null;
	let cleanupFns: Array<() => void> = [];

	// Build a 3x loop so we can recenter to the middle copy seamlessly
	$: {
		total = items?.length ?? 0;
		looped = total ? [...items, ...items, ...items] : [];
	}

	function normalize(n: number, m: number) {
		// true modulo into [0..m-1]
		return ((n % m) + m) % m;
	}

	function pickMostVisible(entries: IntersectionObserverEntry[]) {
		let best: IntersectionObserverEntry | null = null;
		for (const e of entries) {
			if (!e.isIntersecting) continue;
			if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
		}
		return best;
	}

	function quickRecenter(toIndex: number) {
		// Jump instantly to an equivalent slide in the middle copy
		// while temporarily disabling snap so there is no jolt.
		if (!slides[toIndex]) return;
		suppress = true;
		track.classList.add('no-snap');
		slides[toIndex].scrollIntoView({
			behavior: 'auto',
			inline: 'center',
			block: 'nearest'
		});
		posIndex = toIndex;
		// Only use rAF in the browser (prevents SSR crash)
		if (browser) {
			requestAnimationFrame(() => {
				track.classList.remove('no-snap');
				setTimeout(() => (suppress = false), 0);
			});
		} else {
			track.classList.remove('no-snap');
			suppress = false;
		}
	}

	function handleScrollEnd() {
		if (!total) return;
		// If the user (or a smooth arrow) drifted into the first or third copy,
		// quietly snap back to the equivalent item in the middle copy.
		if (posIndex < total || posIndex >= total * 2) {
			const desired = active + total; // middle copy for current logical item
			quickRecenter(desired);
		}
	}

	function onScroll() {
		// Debounce as a fallback when 'scrollend' isn't available
		if (scrollEndTimer !== null) clearTimeout(scrollEndTimer);
		scrollEndTimer = window.setTimeout(handleScrollEnd, 120);
	}

	function step(delta: number) {
		if (!total || !slides.length) return;

		// Prevent stepping beyond physical edges; recenter first if needed.
		const lastIdx = looped.length - 1;
		if (posIndex + delta < 0 || posIndex + delta > lastIdx) {
			quickRecenter(active + total);
		}

		const nextPos = posIndex + delta;
		if (!slides[nextPos]) {
			// As a safety net, recenter and recompute.
			quickRecenter(active + total);
			return step(delta);
		}

		posIndex = nextPos;
		// Smoothly scroll to the adjacent slide (this preserves wrap smoothness)
		slides[posIndex].scrollIntoView({
			behavior: 'smooth',
			inline: 'center',
			block: 'nearest'
		});
	}

	function next() {
		step(1);
	}
	function prev() {
		step(-1);
	}

	function init() {
		// Clean up previous observers/listeners
		io?.disconnect?.();
		for (const f of cleanupFns) f();
		cleanupFns = [];

		if (!track || !total) return;

		slides = Array.from(track.children) as HTMLElement[];
		slides.forEach((el, i) => el.setAttribute('data-index', String(i)));

		// IntersectionObserver only tracks which slide is most visible.
		// It does *not* perform recenters (that happens on scrollend).
		io = new IntersectionObserver(
			(entries) => {
				if (suppress) return;
				const best = pickMostVisible(entries);
				if (!best) return;
				const idx = Number((best.target as HTMLElement).dataset.index);
				posIndex = idx;
				active = normalize(idx, total);
			},
			{
				root: track,
				threshold: [0.5, 0.75, 0.95] // stable "most visible" without chatty churn
			}
		);
		slides.forEach((el) => io!.observe(el));

		// Start centered on the first item of the middle copy
		posIndex = total;
		active = 0;
		quickRecenter(posIndex);

		// Listen for scroll end (native, if available) + a debounced fallback
		const nativeScrollEnd = () => handleScrollEnd();
		// 'scrollend' may not exist; type-cast for TS and rely on the scroll fallback.
		track.addEventListener('scrollend', nativeScrollEnd as unknown as EventListener, {
			passive: true
		});
		track.addEventListener('scroll', onScroll, { passive: true });

		cleanupFns.push(() => {
			track.removeEventListener('scrollend', nativeScrollEnd as unknown as EventListener);
			track.removeEventListener('scroll', onScroll);
		});
	}

	onMount(() => {
		if (browser) {
			// init once on mount (client only)
			requestAnimationFrame(init);
		}
		return () => {
			io?.disconnect?.();
			for (const f of cleanupFns) f();
		};
	});

	// Re-init if the number of items changes (avoids re-init on trivial re-renders)
	let lastCount = -1;
	$: if (total !== lastCount) {
		lastCount = total;
		// Guard rAF so SSR doesn't crash
		if (browser) requestAnimationFrame(init);
	}
</script>

<section {id} aria-roledescription="carousel">
	<h3 class="section-title">{title}</h3>

	<div class="carousel">
		<div class="carousel-track" bind:this={track} class:no-snap={false}>
			{#if total === 0}
				<!-- optional empty state -->
				<div class="empty">No items</div>
			{:else}
				{#each looped as item, i (i)}
					<div
						class="slide"
						data-index={i}
						aria-roledescription="slide"
						aria-label={`${normalize(i, total) + 1} of ${total}`}
					>
						<ProductCard {item} />
					</div>
				{/each}
			{/if}
		</div>

		{#if total > 1}
			<div class="nav">
				<button class="arrow prev" aria-label="Previous" on:click={prev}>
					<IconChevron dir="left" />
				</button>
				<button class="arrow next" aria-label="Next" on:click={next}>
					<IconChevron dir="right" />
				</button>
			</div>
		{/if}
	</div>
</section>

<style>
	section {
		position: relative;
	}

	.section-title {
		margin: 0 0 0.75rem 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.carousel {
		position: relative;
	}

	.carousel-track {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: 10%;
		padding-inline: 10%;
		/* smoother physics on iOS */
		-webkit-overflow-scrolling: touch;
		overscroll-behavior-inline: contain;
		scrollbar-width: none; /* Firefox */
	}
	.carousel-track::-webkit-scrollbar {
		display: none; /* WebKit */
	}

	/* disable snapping only during silent recenters to prevent jolt */
	.carousel-track.no-snap {
		scroll-snap-type: none !important;
	}

	.slide {
		flex: 0 0 auto;
		/* Width can be tuned; this keeps one prominent card in view with peeking neighbors */
		inline-size: clamp(220px, 60vw, 360px);
		scroll-snap-align: center;
		/* Avoid layout shifts while images load */
		contain: content;
	}

	.nav {
		pointer-events: none;
		position: absolute;
		inset-block-start: 50%;
		inset-inline: 0;
		display: flex;
		justify-content: space-between;
		transform: translateY(-50%);
		padding-inline: 0.5rem;
	}

	.arrow {
		pointer-events: auto;
		display: grid;
		place-items: center;
		inline-size: 2.5rem;
		block-size: 2.5rem;
		border-radius: 999px;
		border: 1px solid var(--border, rgba(0, 0, 0, 0.12));
		background: var(--background, rgba(255, 255, 255, 0.85));
		backdrop-filter: blur(6px);
		cursor: pointer;
		transition:
			transform 120ms ease,
			background 120ms ease,
			border-color 120ms ease;
	}
	.arrow:hover {
		transform: scale(1.05);
	}
	.arrow:active {
		transform: scale(0.98);
	}

	/* Respect reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.carousel-track {
			scroll-behavior: auto !important;
		}
	}
</style>
