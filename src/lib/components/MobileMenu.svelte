<script lang="ts">
	export let open = false;
	export let onClose: () => void = () => {};
	export let links = [
		{ label: 'Men', href: '#men' },
		{ label: 'Women', href: '#women' },
		{ label: 'Kids', href: '#kids' },
		{ label: 'Games', href: '#games' },
		{ label: 'Accessories', href: '#accessories' } // new
	];
</script>

{#if open}
	<div class="drawer" role="dialog" aria-modal="true">
		<nav class="panel">
			<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
				<strong class="brand">Menu</strong>
				<button class="icon-btn" on:click={onClose} aria-label="Close menu">✕</button>
			</div>

			<ul class="menu-list">
				{#each links as l}
					<li class="menu-item">
						<a href={l.href} on:click={onClose}>{l.label}</a>
					</li>
				{/each}
			</ul>

			<div style="margin-top:16px">
				<span class="badge">Limited Edition</span>
			</div>
		</nav>
		<div class="backdrop" on:click={onClose} />
	</div>
{/if}
