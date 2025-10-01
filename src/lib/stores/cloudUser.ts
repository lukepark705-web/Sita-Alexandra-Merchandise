import { readable } from 'svelte/store';
import { db } from '$lib/db';

export const cloudUser = readable<any>(null, (set) => {
	const sub = db.cloud.currentUser.subscribe(set);
	return () => sub?.unsubscribe?.();
});
