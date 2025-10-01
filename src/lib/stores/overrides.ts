import { writable } from 'svelte/store';

const _map = writable<Record<string, string>>({});

export const overrides = {
	subscribe: _map.subscribe,
	async refresh() {
		try {
			const r = await fetch(`/api/overrides?ts=${Date.now()}`, { cache: 'no-store' });
			if (r.ok) _map.set(await r.json());
		} catch {
			_map.set({});
		}
	},
	optimisticSet(pid: string, url: string) {
		_map.update((m) => ({ ...m, [pid]: url }));
	},
	apply(pid: string, url: string) {
		_map.update((m) => ({ ...m, [pid]: url }));
	},
	remove(pid: string) {
		_map.update(({ [pid]: _, ...rest }) => rest);
	}
};
