<script lang="ts">
	export let img = '/merch/limited.jpg'; // replace with your limited-edition image
	export let ctaText = 'Shop Limited Drop';
	export let ctaHref = '#women'; // take them into the grid fast
</script>

<section class="hero">
	<img src={img} alt="Limited edition release" />
	<a class="cta" href={ctaHref}>{ctaText} →</a>
</section>
