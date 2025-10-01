import type { RequestHandler } from './$types';
import { list } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import type { Product } from '$lib/types';

const META_PREFIX = 'products-meta/';

export const GET: RequestHandler = async () => {
	try {
		const { blobs } = await list({ prefix: META_PREFIX, token: BLOB_READ_WRITE_TOKEN });

		const metaBlobs = blobs.filter((b: any) =>
			(b.pathname || b.key || b.url)?.toString().endsWith('.json')
		);

		const items: Product[] = [];
		for (const b of metaBlobs) {
			const url: string = (b as any).downloadUrl || (b as any).url;
			const res = await fetch(`${url}?ts=${Date.now()}`, { cache: 'no-store' });
			if (!res.ok) continue;
			const p = await res.json().catch(() => null);
			if (p && p.id && p.imageUrl) items.push(p);
		}

		// default sort (optional): active first, then order then newest
		items.sort(
			(a, b) =>
				Number(b.active ?? true) - Number(a.active ?? true) ||
				(a.order ?? 9999) - (b.order ?? 9999) ||
				Number(b.updatedAt ?? 0) - Number(a.updatedAt ?? 0)
		);

		return new Response(JSON.stringify(items), {
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
		});
	} catch {
		return new Response(JSON.stringify([]), {
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
		});
	}
};
