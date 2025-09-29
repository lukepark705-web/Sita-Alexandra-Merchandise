<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import ProductCarousel from '$lib/components/ProductCarousel.svelte';

	const men = [
		{ name: 'Arena Tee', image: '/merch/men-1.jpg', price: 29.0 },
		{ name: 'Branded Sports Kit', image: '/merch/men-2.jpg', price: 69.0 },
		{ name: 'Branded Sports Kit', image: '/merch/men-3.jpg', price: 99.0 },
		{ name: 'Branded Cap', image: '/merch/men-4.jpg', price: 24.0 },
		{ name: 'Branded Cap', image: '/merch/men-5.jpg', price: 59.0 }
	];

	const women = [
		{ name: 'Branded Tee', image: '/merch/women-1.jpg', price: 32.0 },
		{ name: 'Hoodies', image: '/merch/women-2.jpg', price: 72.0 },
		{ name: 'Female Sports Kit', image: '/merch/women-3.jpg', price: 119.0 },
		{ name: 'Branded Tee', image: '/merch/women-4.jpg', price: 28.0 },
		{ name: 'Branded Cap', image: '/merch/women-5.jpg', price: 26.0 }
	];

	const kids = [
		{ name: 'Mini Fan Tee', image: '/merch/kids-1.jpg', price: 22.0 },
		{ name: 'Youth Hoodie', image: '/merch/kids-2.jpg', price: 44.0 },
		{ name: 'Sticker Pack', image: '/merch/kids-3.jpg', price: 12.0 },
		{ name: 'Poster', image: '/merch/kids-4.jpg', price: 10.0 },
		{ name: 'Baseball Cap', image: '/merch/kids-5.jpg', price: 18.0 }
	];

	const games = [
		{ name: 'Poster Set', image: '/merch/games-1.jpg', price: 25.0 },
		{ name: 'Card Game', image: '/merch/games-2.jpg', price: 28.0 },
		{ name: 'Deluxe Board', image: '/merch/games-3.jpg', price: 39.0 },
		{ name: 'Tour Puzzle', image: '/merch/games-4.jpg', price: 22.0 },
		{ name: 'Badge Pack', image: '/merch/games-5.jpg', price: 14.0 }
	];

	const accessories = [
		{ name: 'Armband – Signature', image: '/merch/extras-1.jpg', price: 14.0 },
		{ name: 'Comic – Vol. 1', image: '/merch/extras-2.jpg', price: 19.0 },
		{ name: 'Enamel Pin Set', image: '/merch/extras-3.jpg', price: 16.0 },
		{ name: 'Keychain', image: '/merch/extras-4.jpg', price: 12.0 },
		{ name: 'Lanyard', image: '/merch/extras-5.jpg', price: 10.0 }
	];
</script>

<Hero img="/merch/limited.jpg" ctaHref="#women" />

<ProductCarousel id="men" title="Men" items={men} />
<ProductCarousel id="women" title="Women" items={women} />
<ProductCarousel id="kids" title="Kids" items={kids} />
<ProductCarousel id="games" title="Games" items={games} />
<ProductCarousel id="accessories" title="Accessories & Collectibles" items={accessories} />
