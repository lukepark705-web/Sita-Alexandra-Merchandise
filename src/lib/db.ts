import Dexie, { type Table } from 'dexie';
import dexieCloud from 'dexie-cloud-addon';

export interface CartItem {
	id: string;
	productId: string;
	name: string;
	image: string;
	price: number;
	qty: number;
}

export interface ImageOverride {
	id: string; // @id
	productId: string; // slug/id of the product
	imageUrl: string; // new image URL
	updatedAt: number;
}

class AppDB extends Dexie {
	cartItems!: Table<CartItem, string>;
	overrides!: Table<ImageOverride, string>;

	constructor() {
		super('sita_merch', { addons: [dexieCloud] });

		// bump schema version to include overrides
		this.version(2).stores({
			cartItems: '@id, productId, name, price',
			overrides: '@id, productId'
		});

		this.cloud.configure({
			databaseUrl: import.meta.env.VITE_DEXIE_CLOUD_URL!,
			requireAuth: true,
			fetchTokens: (params) =>
				fetch('/api/dexie-cloud-tokens', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'same-origin',
					body: JSON.stringify(params)
				}).then((r) => r.json())
		});
	}
}

export const db = new AppDB();
