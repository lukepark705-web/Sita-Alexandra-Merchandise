import { writable } from 'svelte/store';
import { liveQuery } from 'dexie';
import { db, type CartItem } from '$lib/db';

export const cartItems = writable<CartItem[]>([]);
export const cartCount = writable(0);

liveQuery(() => db.cartItems.toArray()).subscribe((rows) => {
	cartItems.set(rows);
	cartCount.set(rows.reduce((n, r) => n + (r.qty ?? 1), 0));
});

export async function addToCart(p: {
	productId: string;
	name: string;
	image: string;
	price: number;
}) {
	const existing = await db.cartItems.where('productId').equals(p.productId).first();
	if (existing) {
		await db.cartItems.update(existing.id, { qty: (existing.qty ?? 1) + 1 });
	} else {
		await db.cartItems.add({
			id: crypto.randomUUID(),
			productId: p.productId,
			name: p.name,
			image: p.image,
			price: p.price,
			qty: 1
		});
	}
}
export async function clearCart() {
	await db.cartItems.clear();
}
