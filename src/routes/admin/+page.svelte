<script lang="ts">
	import { session } from '$lib/stores/session';
	import { overrides } from '$lib/stores/overrides';
	import { onMount } from 'svelte';

	let productId = '';
	let file: File | null = null;
	let map: Record<string, string> = {};

	onMount(async () => {
		await session.refresh();
		await overrides.refresh();
	});
	$: map = $overrides;

	function pick(e: Event) {
		file = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
	}

	async function uploadNew() {
		if (!productId || !file) {
			alert('Choose product id and file');
			return;
		}
		// optimistic preview
		overrides.optimisticSet(productId, URL.createObjectURL(file));
		const fd = new FormData();
		fd.append('productId', productId);
		fd.append('file', file);
		const r = await fetch('/api/admin/override', { method: 'POST', body: fd });
		if (!r.ok) {
			alert('Upload failed');
			return;
		}
		const { url } = await r.json();
		overrides.apply(productId, url);
		productId = '';
		file = null;
		(document.getElementById('newfile') as HTMLInputElement).value = '';
	}

	async function replace(pid: string) {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = async () => {
			const f = input.files?.[0];
			if (!f) return;
			overrides.optimisticSet(pid, URL.createObjectURL(f));
			const fd = new FormData();
			fd.append('productId', pid);
			fd.append('file', f);
			const r = await fetch('/api/admin/override', { method: 'POST', body: fd });
			if (!r.ok) {
				alert('Upload failed');
				return;
			}
			const { url } = await r.json();
			overrides.apply(pid, url);
		};
		input.click();
	}

	async function remove(pid: string) {
		if (!confirm('Delete this override?')) return;
		const blobUrl = map[pid];
		await fetch('/api/admin/override', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ productId: pid, blobUrl })
		});
		overrides.remove(pid);
	}
</script>

{#if $session.user?.role !== 'admin'}
	<section class="container" style="padding:32px 16px 64px">
		<h2>Admin</h2>
		<p>Sign in with an admin email to access the media manager.</p>
	</section>
{:else}
	<section class="container" style="padding:24px 16px">
		<h2 class="ttl">Image Manager</h2>
		<div class="card-admin">
			<div class="row">
				<label>Product ID (slug)</label>
				<input placeholder="e.g. arena-tee" bind:value={productId} />
			</div>
			<div class="row">
				<label>Choose image</label>
				<input id="newfile" type="file" accept="image/*" on:change={pick} />
			</div>
			<button class="primary" on:click={uploadNew}>Upload</button>
		</div>

		<h3 class="subttl">Current Overrides</h3>
		<div class="grid">
			{#each Object.entries(map) as [pid, url]}
				<article class="ovr">
					<img src={url} alt={pid} />
					<div class="ovr-meta"><strong>{pid}</strong></div>
					<div class="ovr-actions">
						<button on:click={() => replace(pid)}>Replace</button>
						<button class="danger" on:click={() => remove(pid)}>Delete</button>
					</div>
				</article>
			{/each}
			{#if Object.keys(map).length === 0}
				<p style="color:var(--muted)">No overrides yet.</p>
			{/if}
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
	.row {
		display: grid;
		gap: 6px;
		margin: 10px 0;
	}
	input {
		width: 100%;
		padding: 0.7rem 0.9rem;
		border: 1px solid #e6e8ec;
		border-radius: 12px;
	}
	button.primary {
		margin-top: 8px;
		background: #000;
		color: #fff;
		border: none;
		border-radius: 999px;
		padding: 0.8rem 1.2rem;
		font-weight: 800;
	}
	.subttl {
		margin: 20px 0 8px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 12px;
	}
	.ovr {
		border: 1px solid var(--border);
		border-radius: 14px;
		overflow: hidden;
		background: #fff;
	}
	.ovr img {
		width: 100%;
		height: 180px;
		object-fit: cover;
	}
	.ovr-actions {
		display: flex;
		gap: 8px;
		padding: 10px;
		border-top: 1px solid #f0f2f5;
	}
	.ovr-actions button {
		flex: 1;
		border: 1px solid #e6e8ec;
		border-radius: 10px;
		padding: 0.5rem 0.7rem;
		background: #fff;
		font-weight: 700;
	}
	.ovr-actions button.danger {
		color: #b00020;
		border-color: #f1c4c7;
	}
</style>
