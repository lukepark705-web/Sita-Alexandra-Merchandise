import { writable } from 'svelte/store';

type Me = { user: null | { email: string; name?: string; role: 'admin' | 'user' } };

const _session = writable<Me>({ user: null });

export const session = {
	subscribe: _session.subscribe,
	async refresh() {
		try {
			const r = await fetch('/api/auth/me');
			_session.set(await r.json());
		} catch {
			_session.set({ user: null });
		}
	}
};

// auto-load once
session.refresh();
