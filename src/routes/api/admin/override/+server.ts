import type { RequestHandler } from './$types';
import { createHmac } from 'node:crypto';
import { put, del } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN, SESSION_SECRET, ADMIN_EMAILS } from '$env/static/private';

const SID_COOKIE = 'sid';
const OVERRIDE_PREFIX = 'overrides/';

function isAdmin(cookies: App.Cookies) {
	const raw = cookies.get(SID_COOKIE);
	if (!raw) return false;
	try {
		const { session, mac } = JSON.parse(raw);
		const mac2 = createHmac('sha256', SESSION_SECRET).update(session).digest('hex');
		if (mac !== mac2) return false;
		const { email } = JSON.parse(session) as { email: string };
		const admins = (ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase());
		return admins.includes(email.toLowerCase());
	} catch {
		return false;
	}
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		if (!isAdmin(cookies))
			return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
		if (!BLOB_READ_WRITE_TOKEN)
			return new Response(JSON.stringify({ error: 'Missing blob token' }), { status: 500 });

		const form = await request.formData();
		const file = form.get('file') as File | null;
		const productId = String(form.get('productId') ?? '');
		if (!file || !productId)
			return new Response(JSON.stringify({ error: 'file and productId required' }), {
				status: 400
			});

		// 1) Upload image (unique key)
		const safe = file.name.replace(/[^\w.\-]+/g, '_');
		const key = `products/${Date.now()}-${safe}`;
		const { url } = await put(key, file, { access: 'public', token: BLOB_READ_WRITE_TOKEN });

		// 2) Upsert per-product override file: overrides/<productId>.json
		const oKey = `${OVERRIDE_PREFIX}${productId}.json`;
		await put(oKey, JSON.stringify({ url }, null, 2), {
			access: 'public',
			addRandomSuffix: false,
			allowOverwrite: true, // overwrite safely without races
			contentType: 'application/json',
			token: BLOB_READ_WRITE_TOKEN
		});

		return new Response(JSON.stringify({ url }), {
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, cookies }) => {
	try {
		if (!isAdmin(cookies))
			return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
		if (!BLOB_READ_WRITE_TOKEN)
			return new Response(JSON.stringify({ error: 'Missing blob token' }), { status: 500 });

		const { productId, blobUrl } = await request.json();
		if (productId) {
			const oKey = `${OVERRIDE_PREFIX}${productId}.json`;
			await put(oKey, JSON.stringify({}, null, 2), {
				access: 'public',
				addRandomSuffix: false,
				allowOverwrite: true,
				contentType: 'application/json',
				token: BLOB_READ_WRITE_TOKEN
			});
		}
		if (blobUrl) {
			try {
				await del(blobUrl, { token: BLOB_READ_WRITE_TOKEN });
			} catch {}
		}

		return new Response(JSON.stringify({ ok: true }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500 });
	}
};
