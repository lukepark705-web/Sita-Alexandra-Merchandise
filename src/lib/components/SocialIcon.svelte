<script lang="ts">
	export let name: 'instagram' | 'threads' | 'tiktok' | 'twitter' | 'pinterest' | 'tumblr' =
		'instagram';
	export let size = 18;
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.7"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'instagram'}
		<rect x="3" y="3" width="18" height="18" rx="5" />
		<path d="M16 11.37A4 4 0 1 1 12.63 8" />
		<circle cx="17.5" cy="6.5" r="1" />
	{:else if name === 'threads'}
		<path d="M12 3c-5 0-8 2.5-8 9s3 9 8 9 8-2.5 8-9-3-9-8-9Z" />
		<path d="M8.5 12c.5-1.5 2-2 3.5-2s3 .8 3.5 2-1 3-3.5 3-3.5 1-3.5 3" />
	{:else if name === 'tiktok'}
		<path d="M9 7v8a3 3 0 1 0 3-3h0V4a6 6 0 0 0 6 6" />
	{:else if name === 'twitter'}
		<path
			d="M22 5.8c-.7.4-1.6.7-2.5.8.9-.6 1.5-1.4 1.8-2.5-.8.5-1.8.9-2.8 1.1A3.9 3.9 0 0 0 12 8.5v.7C8.1 9 5 7.4 3 5c-.8 1.4-.4 3.3 1 4.3-.6 0-1.2-.2-1.7-.5 0 1.8 1.3 3.3 3 3.7-.5.1-1 .2-1.5.1.4 1.4 1.8 2.5 3.5 2.6A7.9 7.9 0 0 1 2 17a11 11 0 0 0 6 1.8c7.2 0 11.2-6 11-11.4.8-.5 1.5-1.2 2-2z"
		/>
	{:else if name === 'pinterest'}
		<path d="M12 21c-1-2.8-.2-3.7.7-7-1.8-2.3.2-6 2.8-6s3.8 2.7 2.5 5.5c-.9 2-2.9 3.3-4.7 3" />
		<circle cx="12" cy="12" r="10" />
	{:else}
		<!-- tumblr -->
		<path d="M14 4h-3V8H8v3h3v4a4 4 0 0 0 5 4v-3c-1 0-2-.5-2-1.7V11h3V8h-3z" />
	{/if}
</svg>
