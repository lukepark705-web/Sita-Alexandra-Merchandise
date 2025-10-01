import type { RequestHandler } from './$types';
import { list } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';

const PREFIX = 'overrides/';

export const GET: RequestHandler = async () => {
	try {
		const { blobs } = await list({ prefix: PREFIX, token: BLOB_READ_WRITE_TOKEN });
		// Fetch each `overrides/<productId>.json` (ignore health or other files)
		const jsonBlobs = blobs.filter((b: any) =>
			(b.pathname || b.key || b.url)?.toString().endsWith('.json')
		);

		const pairs = await Promise.all(
			jsonBlobs.map(async (b: any) => {
				const full = b.downloadUrl || b.url;
				// product id = filename without extension
				const name = (b.pathname || b.key || '').toString().split('/').pop() || '';
				const productId = name.replace(/\.json$/i, '');
				const res = await fetch(`${full}?ts=${Date.now()}`, { cache: 'no-store' });
				const data = await res.json().catch(() => ({}));
				return [productId, data?.url as string | undefined] as const;
			})
		);

		const map: Record<string, string> = {};
		for (const [pid, url] of pairs) if (pid && url) map[pid] = url;

		return new Response(JSON.stringify(map), {
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
		});
	} catch {
		return new Response(JSON.stringify({}), {
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
		});
	}
};
