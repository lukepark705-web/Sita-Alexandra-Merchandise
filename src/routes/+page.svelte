<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import ProductCarousel from '$lib/components/ProductCarousel.svelte';
	import { onMount } from 'svelte';

	// ---- Your original static rows (unchanged) ----
	const menSeed = [
		{ name: 'Arena Tee', image: '/merch/men-1.jpg', price: 29.0 },
		{ name: 'Branded Sports Kit', image: '/merch/men-2.jpg', price: 69.0 },
		{ name: 'Branded Sports Kit', image: '/merch/men-3.jpg', price: 99.0 },
		{ name: 'Branded Cap', image: '/merch/men-4.jpg', price: 24.0 },
		{ name: 'Branded Cap', image: '/merch/men-5.jpg', price: 59.0 }
	];

	const womenSeed = [
		{ name: 'Branded Tee', image: '/merch/women-1.jpg', price: 32.0 },
		{ name: 'Hoodies', image: '/merch/women-2.jpg', price: 72.0 },
		{ name: 'Female Sports Kit', image: '/merch/women-3.jpg', price: 119.0 },
		{ name: 'Branded Tee', image: '/merch/women-4.jpg', price: 28.0 },
		{ name: 'Branded Cap', image: '/merch/women-5.jpg', price: 26.0 }
	];

	const kidsSeed = [
		{ name: 'Mini Fan Tee', image: '/merch/kids-1.jpg', price: 22.0 },
		{ name: 'Youth Hoodie', image: '/merch/kids-2.jpg', price: 44.0 },
		{ name: 'Sticker Pack', image: '/merch/kids-3.jpg', price: 12.0 },
		{ name: 'Poster', image: '/merch/kids-4.jpg', price: 10.0 },
		{ name: 'Baseball Cap', image: '/merch/kids-5.jpg', price: 18.0 }
	];

	const gamesSeed = [
		{ name: 'Poster Set', image: '/merch/games-1.jpg', price: 25.0 },
		{ name: 'Card Game', image: '/merch/games-2.jpg', price: 28.0 },
		{ name: 'Deluxe Board', image: '/merch/games-3.jpg', price: 39.0 },
		{ name: 'Tour Puzzle', image: '/merch/games-4.jpg', price: 22.0 },
		{ name: 'Badge Pack', image: '/merch/games-5.jpg', price: 14.0 }
	];

	const accessoriesSeed = [
		{ name: 'Armband – Signature', image: '/merch/extras-1.jpg', price: 14.0 },
		{ name: 'Comic – Vol. 1', image: '/merch/extras-2.jpg', price: 19.0 },
		{ name: 'Enamel Pin Set', image: '/merch/extras-3.jpg', price: 16.0 },
		{ name: 'Keychain', image: '/merch/extras-4.jpg', price: 12.0 },
		{ name: 'Lanyard', image: '/merch/extras-5.jpg', price: 10.0 }
	];

	// ---- What we actually render (start with your seeds) ----
	type CardItem = { id?: string; name: string; image: string; price: number };

	let men: CardItem[] = [...menSeed];
	let women: CardItem[] = [...womenSeed];
	let kids: CardItem[] = [...kidsSeed];
	let games: CardItem[] = [...gamesSeed];
	let accessories: CardItem[] = [...accessoriesSeed];

	// Helper: append uniques only (by id if present, else name+image)
	function appendUnique(target: CardItem[], incoming: CardItem[]) {
		const seen = new Set(target.map((x) => (x.id ? `id:${x.id}` : `ni:${x.name}|${x.image}`)));
		const out: CardItem[] = [...target];
		for (const c of incoming) {
			const key = c.id ? `id:${c.id}` : `ni:${c.name}|${c.image}`;
			if (!seen.has(key)) {
				out.push(c);
				seen.add(key);
			}
		}
		return out;
	}

	// After mount, fetch any admin-added products and append to the correct row.
	onMount(async () => {
		try {
			const r = await fetch('/api/catalog?ts=' + Date.now(), { cache: 'no-store' });
			if (!r.ok) return;
			const live = (await r.json()) as Array<{
				id: string;
				name: string;
				category: 'Men' | 'Women' | 'Kids' | 'Games' | 'Accessories & Collectibles';
				price: number;
				imageUrl: string;
			}>;

			if (!Array.isArray(live) || live.length === 0) return;

			const menAdds: CardItem[] = [];
			const womenAdds: CardItem[] = [];
			const kidsAdds: CardItem[] = [];
			const gamesAdds: CardItem[] = [];
			const accessoriesAdds: CardItem[] = [];

			for (const p of live) {
				const card: CardItem = { id: p.id, name: p.name, image: p.imageUrl, price: p.price };
				if (p.category === 'Men') menAdds.push(card);
				else if (p.category === 'Women') womenAdds.push(card);
				else if (p.category === 'Kids') kidsAdds.push(card);
				else if (p.category === 'Games') gamesAdds.push(card);
				else accessoriesAdds.push(card); // 'Accessories & Collectibles'
			}

			// Append (keep your originals, add only new unique items)
			men = appendUnique(men, menAdds);
			women = appendUnique(women, womenAdds);
			kids = appendUnique(kids, kidsAdds);
			games = appendUnique(games, gamesAdds);
			accessories = appendUnique(accessories, accessoriesAdds);
		} catch (e) {
			console.warn('catalog fetch failed', e);
		}
	});
</script>

<Hero img="/merch/limited.jpg" ctaHref="#women" />

<!-- Your original layout stays the same -->
<ProductCarousel id="men" title="Men" items={men} />
<ProductCarousel id="women" title="Women" items={women} />
<ProductCarousel id="kids" title="Kids" items={kids} />
<ProductCarousel id="games" title="Games" items={games} />
<ProductCarousel id="accessories" title="Accessories & Collectibles" items={accessories} />
