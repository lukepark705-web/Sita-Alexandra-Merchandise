<script lang="ts">
	import { onMount } from 'svelte';

	type Category = 'Men' | 'Women' | 'Kids' | 'Games' | 'Accessories & Collectibles';

	// Create form state
	let name = '';
	let category: Category = 'Kids';
	let price: number = 0;
	let order: number | '' = '';
	let active: boolean = true;
	let file: File | null = null;

	// Catalog state
	type Product = {
		id: string;
		name: string;
		category: Category;
		price: number;
		imageUrl: string;
		order?: number;
		active?: boolean;
	};
	let catalog: Product[] = [];
	let loading = true;
	let creating = false;

	function pick(e: Event) {
		file = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
	}

	async function load() {
		loading = true;
		try {
			const r = await fetch('/api/catalog?ts=' + Date.now(), { cache: 'no-store' });
			catalog = r.ok ? await r.json() : [];
		} catch {
			catalog = [];
		} finally {
			loading = false;
		}
	}

	async function create() {
		if (!name || !file) return;
		creating = true;
		try {
			const fd = new FormData();
			fd.append('name', name);
			fd.append('category', category);
			fd.append('price', String(price || 0));
			if (order !== '') fd.append('order', String(order));
			fd.append('active', String(active));
			fd.append('file', file);

			const r = await fetch('/api/admin/products', { method: 'POST', body: fd });
			if (!r.ok) {
				alert('Create failed');
			} else {
				// reset
				name = '';
				price = 0;
				order = '';
				active = true;
				file = null;
				const input = document.getElementById('newfile') as HTMLInputElement | null;
				if (input) input.value = '';
				await load();
			}
		} finally {
			creating = false;
		}
	}

	async function updatePrice(id: string, newPrice: number) {
		await fetch(`/api/admin/products/${id}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ price: newPrice })
		});
	}

	async function replaceImage(id: string) {
		const el = document.createElement('input');
		el.type = 'file';
		el.accept = 'image/*';
		el.onchange = async () => {
			const f = el.files?.[0];
			if (!f) return;
			const fd = new FormData();
			fd.append('file', f);
			const r = await fetch(`/api/admin/products/${id}/image`, { method: 'POST', body: fd });
			if (!r.ok) alert('Image update failed');
			await load();
		};
		el.click();
	}

	async function remove(id: string) {
		if (!confirm('Delete this product?')) return;
		await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
		await load();
	}

	onMount(load);
</script>

<section class="container" style="padding-block:16px">
	<h2 style="margin:0 0 12px">Add a Product</h2>

	<div class="card-admin">
		<div class="grid2">
			<div>
				<label for="name"> Name </label>
				<input id="name" bind:value={name} placeholder="e.g. Mini Fan Tee" />
			</div>

			<div>
				<label for="category"> Category </label>
				<select id="category" bind:value={category}>
					<option>Men</option><option>Women</option><option>Kids</option>
					<option>Games</option><option>Accessories & Collectibles</option>
				</select>
			</div>

			<div>
				<label for="price"> Price (USD) </label>
				<input id="price" type="number" min="0" step="0.01" bind:value={price} />
			</div>

			<div>
				<label for="order"> Order (optional) </label>
				<input id="order" type="number" step="1" bind:value={order} />
			</div>

			<div>
				<label for="active"> Active </label>
				<select id="active" bind:value={active}>
					<option value={true}>Yes</option>
					<option value={false}>No</option>
				</select>
			</div>

			<div>
				<label for="newfile"> Image </label>
				<input id="newfile" type="file" accept="image/*" on:change={pick} />
			</div>
		</div>

		<button
			class="primary"
			on:click|preventDefault={create}
			disabled={creating || !name || !file}
			style="margin-top:12px"
		>
			{creating ? 'Creating…' : 'Create'}
		</button>
	</div>

	<h3 style="margin:18px 0 10px">Catalog ({catalog.length})</h3>
	{#if loading}
		<p>Loading…</p>
	{:else if catalog.length === 0}
		<p>No products yet.</p>
	{:else}
		<div class="grid">
			{#each catalog as p (p.id)}
				<article class="prod">
					<img src={p.imageUrl} alt={p.name} />
					<div class="meta">
						<strong>{p.name}</strong>
						<div class="muted">{p.category}</div>
					</div>
					<div class="row">
						<input
							class="price"
							type="number"
							step="0.01"
							min="0"
							value={p.price}
							on:change={(e) =>
								updatePrice(p.id, Number((e.currentTarget as HTMLInputElement).value))}
						/>
						<button on:click={() => replaceImage(p.id)}>Replace image</button>
						<button class="danger" on:click={() => remove(p.id)}>Delete</button>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>
