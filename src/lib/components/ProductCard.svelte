<script lang="ts">
	import IconCart from '$lib/icons/IconCart.svelte';
	import { addToCart } from '$lib/stores/cart';
	import { overrides } from '$lib/stores/overrides';
	import { session } from '$lib/stores/session';

	export let item: { id?: string; name: string; image: string; price: number };
	const DEBUG = true;

	function productId() {
		return item.id ?? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	}

	// current image = override (if any) else original
	$: map = $overrides;
	$: img = map[productId()] ?? item.image;

	// admin?
	$: me = $session.user;
	$: isAdmin = me?.role === 'admin';

	let fileInput: HTMLInputElement | null = null;
	let saving = false;
	let errorMsg = '';

	async function addThenGo() {
		await addToCart({
			productId: productId(),
			name: item.name,
			image: img,
			price: item.price
		});
		window.location.href = '/cart';
	}

	function chooseFile() {
		fileInput?.click();
	}

	async function handleFile(e: Event) {
		const f = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!f) return;
		errorMsg = '';
		saving = true;

		const pid = productId();
		// instant preview
		const local = URL.createObjectURL(f);
		overrides.optimisticSet(pid, local);
		if (DEBUG) console.debug('[card] instant preview set', pid);

		// upload + update manifest
		const fd = new FormData();
		fd.append('file', f);
		fd.append('productId', pid);

		const r = await fetch('/api/admin/override', {
			method: 'POST',
			body: fd,
			credentials: 'same-origin'
		});

		saving = false;

		if (r.ok) {
			const { url } = await r.json();
			overrides.apply(pid, url);
			setTimeout(() => overrides.refresh(), 400);
		} else {
			const { error } = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
			errorMsg = error || 'Upload failed';
		}

		// element may have been re-rendered; guard it
		const input = e.currentTarget as HTMLInputElement | null;
		if (input) input.value = '';
	}
</script>

<article class="card" aria-label={item.name}>
	<div class="img-wrap">
		<img src={img} alt={item.name} loading="lazy" />
		{#if saving}<div class="badge saving">Saving…</div>{/if}
		{#if errorMsg}<div class="badge error" title={errorMsg}>Not saved</div>{/if}
	</div>

	<div class="tag"><span class="currency">$</span>{item.price.toFixed(2)}</div>

	{#if isAdmin}
		<button class="edit-btn" title="Update image" on:click={chooseFile}>✎</button>
		<input
			class="visually-hidden"
			type="file"
			accept="image/*"
			bind:this={fileInput}
			on:change={handleFile}
		/>
	{/if}

	<button
		class="to-cart"
		on:click|preventDefault={addThenGo}
		aria-label={`Add ${item.name} and open cart`}
	>
		<IconCart size={18} /> Cart
	</button>
</article>

<style>
	.edit-btn {
		position: absolute;
		left: 10px;
		top: 10px;
		z-index: 2;
		background: #fff;
		border: 1px solid #eaecef;
		border-radius: 999px;
		width: 34px;
		height: 34px;
		font-weight: 700;
		line-height: 1;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
	}
	.badge {
		position: absolute;
		right: 10px;
		top: 10px;
		z-index: 2;
		padding: 4px 8px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 700;
		border: 1px solid #eaecef;
		background: #fff;
	}
	.badge.error {
		color: #b00020;
		border-color: #f1c4c7;
		background: #fff5f5;
	}
</style>
