export type Category = 'Men' | 'Women' | 'Kids' | 'Games' | 'Accessories & Collectibles';

export interface Product {
	id: string; // slug, stable
	name: string;
	category: Category;
	price: number;
	imageUrl: string; // public CDN URL
	active?: boolean;
	order?: number;
	createdAt?: number;
	updatedAt?: number;
}
