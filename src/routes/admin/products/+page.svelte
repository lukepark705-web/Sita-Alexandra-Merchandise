<script lang="ts">
	import { onMount } from 'svelte';
	import type { Product, Category } from '$lib/types';
	import { session } from '$lib/stores/session';

	let items: Product[] = [];
	let loading = false;
	let err = '';

	// new product form
	let name = '';
	let category: Category = 'Kids';
	let price: number | '' = '';
	let file: File | null = null;
	let order: number | '' = '';
	let active = true;

	function pick(e: Event) {
		file = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
	}

	async function load() {
		loading = true;
		err = '';
		const r = await fetch('/api/catalog?ts=' + Date.now(), { cache: 'no-store' });
		loading = false;
		if (!r.ok) {
			err = 'Failed to load catalog';
			items = [];
			return;
		}
		items = await r.json();
	}

	async function createProduct() {
		if (!name || !category || !price || !file) {
			alert('Fill name, category, price and choose an image');
			return;
		}
		const fd = new FormData();
		fd.append('name', name);
		fd.append('category', category);
		fd.append('price', String(price));
		if (order !== '') fd.append('order', String(order));
		fd.append('active', String(active));
		fd.append('file', file);

		const r = await fetch('/api/admin/product', { method: 'POST', body: fd });
		if (!r.ok) {
			const { error } = await r.json().catch(() => ({ error: 'Create failed' }));
			alert(error);
			return;
		}

		name = '';
		price = '';
		order = '';
		file = null;
		(document.getElementById('newfile') as HTMLInputElement).value = '';
		await load();
	}

	async function replaceImage(p: Product) {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = async () => {
			const f = input.files?.[0];
			if (!f) return;
			const fd = new FormData();
			fd.append('id', p.id);
			fd.append('file', f);
			const r = await fetch('/api/admin/product', { method: 'PUT', body: fd });
			if (!r.ok) {
				const { error } = await r.json().catch(() => ({ error: 'Update failed' }));
				alert(error);
				return;
			}
			await load();
		};
		input.click();
	}

	async function savePrice(p: Product, newPrice: number) {
		const r = await fetch('/api/admin/product', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: p.id, price: newPrice })
		});
		if (!r.ok) {
			const { error } = await r.json().catch(() => ({ error: 'Update failed' }));
			alert(error);
			return;
		}
		await load();
	}

	async function remove(p: Product) {
		if (!confirm(`Delete ${p.name}?`)) return;
		const r = await fetch('/api/admin/product', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: p.id })
		});
		if (!r.ok) {
			const { error } = await r.json().catch(() => ({ error: 'Delete failed' }));
			alert(error);
			return;
		}
		await load();
	}

	onMount(async () => {
		await session.refresh();
		if ($session.user?.role !== 'admin') return;
		await load();
	});
</script>

{#if $session.user?.role !== 'admin'}
	<section class="container" style="padding:32px 16px 64px">
		<h2>Admin</h2>
		<p>Sign in with an admin email to manage products.</p>
	</section>
{:else}
	<section class="container" style="padding:24px 16px 10px">
		<h2 class="ttl">Add a Product</h2>
		<div class="card-admin">
			<div class="grid2">
				<div>
					<label> Name </label>
					<input bind:value={name} placeholder="e.g. Mini Fan Tee" />
				</div>
				<div>
					<label> Category </label>
					<select bind:value={category}>
						<option>Men</option><option>Women</option><option>Kids</option>
						<option>Games</option><option>Accessories & Collectibles</option>
					</select>
				</div>
				<div>
					<label> Price (USD) </label>
					<input type="number" min="0" step="0.01" bind:value={price} />
				</div>
				<div>
					<label> Order (optional) </label>
					<input type="number" step="1" bind:value={order} />
				</div>
				<div>
					<label> Active </label>
					<select bind:value={active}
						><option value={true}>Yes</option><option value={false}>No</option></select
					>
				</div>
				<div>
					<label> Image </label>
					<input id="newfile" type="file" accept="image/*" on:change={pick} />
				</div>
			</div>
			<button class="primary" on:click={createProduct}>Create</button>
		</div>
	</section>

	<section class="container" style="padding:6px 16px 64px">
		<h3 class="subttl">Catalog ({items.length})</h3>
		{#if err}<p style="color:#b00020">{err}</p>{/if}
		{#if loading}<p>Loading…</p>{/if}
		<div class="grid">
			{#each items as p}
				<article class="prod">
					<img src={p.imageUrl} alt={p.name} />
					<div class="meta">
						<strong>{p.name}</strong>
						<span class="muted">{p.category}</span>
					</div>
					<div class="row">
						<input
							class="price"
							type="number"
							min="0"
							step="0.01"
							value={p.price}
							on:change={(e) => savePrice(p, Number((e.target as HTMLInputElement).value))}
						/>
						<button on:click={() => replaceImage(p)}>Replace image</button>
						<button class="danger" on:click={() => remove(p)}>Delete</button>
					</div>
				</article>
			{/each}
			{#if !items.length && !loading}<p class="muted">No products yet.</p>{/if}
		</div>
	</section>
{/if}

<style>
	.ttl {
		font-family: 'CircularStd';
		margin: 0 0 12px;
	}
	.card-admin {
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 14px;
		background: #fff;
		box-shadow: var(--shadow-xs);
	}
	.grid2 {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 10px;
	}
	input,
	select {
		width: 100%;
		padding: 0.7rem 0.9rem;
		border: 1px solid #e6e8ec;
		border-radius: 12px;
	}
	button.primary {
		margin-top: 10px;
		background: #000;
		color: #fff;
		border: none;
		border-radius: 999px;
		padding: 0.9rem 1.2rem;
		font-weight: 800;
	}
	.subttl {
		margin: 14px 0 8px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 12px;
	}
	.prod {
		border: 1px solid var(--border);
		border-radius: 14px;
		overflow: hidden;
		background: #fff;
	}
	.prod img {
		width: 100%;
		height: 180px;
		object-fit: cover;
	}
	.meta {
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.muted {
		color: #6b7280;
	}
	.row {
		display: flex;
		gap: 8px;
		padding: 10px;
		border-top: 1px solid #f0f2f5;
		align-items: center;
	}
	.price {
		width: 110px;
	}
	.danger {
		color: #b00020;
		border: 1px solid #f1c4c7;
		background: #fff;
		border-radius: 10px;
		padding: 0.6rem 0.8rem;
		font-weight: 700;
	}
	.row button {
		border: 1px solid #e6e8ec;
		background: #fff;
		border-radius: 10px;
		padding: 0.6rem 0.8rem;
		font-weight: 700;
	}
</style>
