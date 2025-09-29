<script lang="ts">
	export let dir: 'left' | 'right' = 'right',
		size = 20;
</script>

<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
	<path
		d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'}
		stroke="currentColor"
		stroke-width="1.8"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
