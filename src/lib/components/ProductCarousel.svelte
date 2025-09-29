<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import IconChevron from '$lib/icons/IconChevron.svelte';
	import ProductCard from './ProductCard.svelte';

	export let title = 'Category';
	export let id = '';
	export let items: Array<{ name: string; image: string; price: number }> = [];

	let track: HTMLDivElement;
	let slides: HTMLElement[] = [];
	let io: IntersectionObserver;

	let total = 0;
	let looped: typeof items = [];
	let currentIndex = 0;

	// Build a 3x loop so we can recenter to the middle copy seamlessly
	$: {
		total = items?.length ?? 0;
		looped = [...items, ...items, ...items];
	}

	function init() {
		if (!track) return;

		// Clean old observer
		io?.disconnect?.();

		slides = Array.from(track.children) as HTMLElement[];

		io = new IntersectionObserver(
			(entries) => {
				// pick the most visible slide in view
				let best: IntersectionObserverEntry | null = null;
				for (const e of entries) {
					if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
				}
				if (!best) return;

				const idx = Number((best.target as HTMLElement).dataset.index);
				currentIndex = idx;

				// If we drift into the first or third copy, jump to equivalent slide in the middle copy
				if (currentIndex < total) {
					const target = slides[currentIndex + total];
					target?.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
					currentIndex += total;
				} else if (currentIndex >= total * 2) {
					const target = slides[currentIndex - total];
					target?.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
					currentIndex -= total;
				}
			},
			{ root: track, threshold: 0.7 }
		);

		slides.forEach((el, i) => {
			el.setAttribute('data-index', String(i));
			io.observe(el);
		});

		// Start centered on the first item of the middle copy
		currentIndex = total;
		slides[currentIndex]?.scrollIntoView({
			behavior: 'instant',
			inline: 'center',
			block: 'nearest'
		});
	}

	onMount(() => {
		requestAnimationFrame(init);
		return () => io?.disconnect?.();
	});

	afterUpdate(() => {
		// Re-init when items change
		requestAnimationFrame(init);
	});

	function goto(i: number, smooth = true) {
		currentIndex = i;
		slides[currentIndex]?.scrollIntoView({
			behavior: smooth ? 'smooth' : 'instant',
			inline: 'center',
			block: 'nearest'
		});
	}

	function next() {
		goto(currentIndex + 1, true);
	}
	function prev() {
		goto(currentIndex - 1, true);
	}
</script>

<section {id}>
	<h3 class="section-title">{title}</h3>

	<div class="carousel">
		<div class="carousel-track" bind:this={track}>
			{#each looped as item, i}
				<div class="slide" data-index={i}>
					<ProductCard {item} />
				</div>
			{/each}
		</div>

		<div class="nav">
			<button class="arrow prev" aria-label="Previous" on:click={prev}>
				<IconChevron dir="left" />
			</button>
			<button class="arrow next" aria-label="Next" on:click={next}>
				<IconChevron dir="right" />
			</button>
		</div>
	</div>
</section>
