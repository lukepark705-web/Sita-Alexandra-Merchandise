<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let step: 'email' | 'code' = 'email';
	let email = '';
	let name = '';
	let code = '';
	let busy = false;
	let error = '';

	async function sendEmail() {
		error = '';
		busy = true;
		const r = await fetch('/api/auth/request-otp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email })
		});
		busy = false;
		if (!r.ok) {
			error = await r.text();
			return;
		}
		step = 'code';
	}

	async function verify() {
		error = '';
		busy = true;
		const r = await fetch('/api/auth/verify-otp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code, name })
		});
		busy = false;
		if (!r.ok) {
			error = await r.text();
			return;
		}
		dispatch('signedin');
	}
</script>

<div class="modal">
	<div class="panel">
		<button class="x" on:click={() => dispatch('close')} aria-label="Close">×</button>
		{#if step === 'email'}
			<h3>Sign in to save your cart</h3>
			<label for="email-input">Email</label>
			<input id="email-input" type="email" bind:value={email} placeholder="you@example.com" />
			<button class="primary" disabled={busy || !email} on:click={sendEmail}>Send code</button>
			{#if error}<p class="err">{error}</p>{/if}
		{:else}
			<h3>Enter the 6-digit code</h3>
			<label for="code-input">Code</label>
			<input id="code-input" inputmode="numeric" maxlength="6" bind:value={code} />
			<label for="name-input" style="margin-top:.5rem">Display name (optional)</label>
			<input id="name-input" bind:value={name} placeholder="Sita" />
			<button class="primary" disabled={busy || code.length < 6} on:click={verify}>Verify</button>
			{#if error}<p class="err">{error}</p>{/if}
		{/if}
	</div>
</div>

<style>
	.modal {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.35);
		display: grid;
		place-items: center;
		z-index: 80;
	}
	.panel {
		width: min(92vw, 420px);
		background: #fff;
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
	}
	.x {
		position: absolute;
		right: 10px;
		top: 6px;
		background: #000;
		color: #fff;
		border-radius: 999px;
		width: 28px;
		height: 28px;
	}
	h3 {
		margin: 0 0 0.75rem 0;
	}
	label {
		display: block;
		font-weight: 600;
		margin: 0.25rem 0;
	}
	input {
		width: 100%;
		padding: 0.7rem 0.9rem;
		border: 1px solid #e6e8ec;
		border-radius: 12px;
	}
	button.primary {
		margin-top: 12px;
		width: 100%;
		padding: 0.8rem 1rem;
		border-radius: 999px;
		background: #000;
		color: #fff;
		font-weight: 700;
	}
	.err {
		color: #b00020;
		margin: 0.5rem 0 0;
	}
</style>
