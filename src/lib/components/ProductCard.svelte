<script lang="ts">
	import IconCart from '$lib/icons/IconCart.svelte';
	export let item: { name: string; image: string; price: number } = {
		name: '',
		image: '',
		price: 0
	};
</script>

<article class="card" aria-label={item.name}>
	<div class="img-wrap">
		<img src={item.image} alt={item.name} loading="lazy" />
	</div>
	<div class="tag"><span class="currency">$</span>{item.price.toFixed(2)}</div>
	<a class="to-cart" href="/cart" aria-label={`Go to cart with ${item.name}`}>
		<IconCart size={18} /> Cart
	</a>
</article>
