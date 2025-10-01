import type { RequestHandler } from './$types';
import { createHmac } from 'node:crypto';
import { put, del } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN, SESSION_SECRET, ADMIN_EMAILS } from '$env/static/private';
import type { Product } from '$lib/types';

const SID_COOKIE = 'sid';
const META_PREFIX = 'products-meta/';
const IMG_PREFIX = 'products/';

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

function slug(s: string) {
	return s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

async function writeMeta(p: Product, overwrite: boolean) {
	const key = `${META_PREFIX}${p.id}.json`;
	await put(key, JSON.stringify({ ...p, updatedAt: Date.now() }, null, 2), {
		access: 'public',
		addRandomSuffix: false,
		allowOverwrite: overwrite, // critical: safe upserts
		contentType: 'application/json',
		token: BLOB_READ_WRITE_TOKEN
	});
}

async function uploadImage(file: File) {
	const safe = file.name.replace(/[^\w.\-]+/g, '_');
	const key = `${IMG_PREFIX}${Date.now()}-${safe}`;
	const { url } = await put(key, file, { access: 'public', token: BLOB_READ_WRITE_TOKEN });
	return url;
}

// CREATE (multipart form): name, category, price, [image file], [id], [order], [active]
export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		if (!isAdmin(cookies))
			return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
		if (!BLOB_READ_WRITE_TOKEN)
			return new Response(JSON.stringify({ error: 'Missing blob token' }), { status: 500 });

		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const category = String(form.get('category') ?? '').trim() as Product['category'];
		const price = Number(form.get('price') ?? 0);
		const order = form.get('order') != null ? Number(form.get('order')) : undefined;
		const active = form.get('active') != null ? String(form.get('active')) === 'true' : true;
		const id = String(form.get('id') ?? '') || slug(name);
		const file = form.get('file') as File | null;

		if (!name || !category || !price || !id) {
			return new Response(JSON.stringify({ error: 'name, category, price required' }), {
				status: 400
			});
		}

		const imageUrl = file ? await uploadImage(file) : String(form.get('imageUrl') ?? '');
		if (!imageUrl)
			return new Response(JSON.stringify({ error: 'image file or imageUrl required' }), {
				status: 400
			});

		const product: Product = {
			id,
			name,
			category,
			price,
			imageUrl,
			order,
			active,
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		await writeMeta(product, /*overwrite*/ false); // will fail if id exists (good)

		return new Response(JSON.stringify(product), {
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500 });
	}
};

// UPDATE (multipart form or JSON): id required, and any of [name, category, price, order, active, file]
export const PUT: RequestHandler = async ({ request, cookies, fetch }) => {
	try {
		if (!isAdmin(cookies))
			return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
		if (!BLOB_READ_WRITE_TOKEN)
			return new Response(JSON.stringify({ error: 'Missing blob token' }), { status: 500 });

		let form: FormData | null = null;
		let body: any = {};
		if (request.headers.get('content-type')?.includes('multipart/form-data')) {
			form = await request.formData();
			for (const [k, v] of form.entries()) body[k] = v;
		} else {
			body = await request.json();
		}

		const id = String(body.id ?? '').trim();
		if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });

		// Load current meta (publicly available)
		const metaUrl = `${(await import('@vercel/blob')).list}`;
		// Simpler: fetch the JSON file directly via its URL
		// we know the naming: META_PREFIX + id + '.json'
		// But list() may be cheaper: we skip and build the URL:
		const keyUrl = `https://blob.vercel-storage.com/${META_PREFIX}${id}.json`; // Not guaranteed
		// Instead, just re-create metadata with provided fields; admin must send all fields on PUT:
		// To keep concise, accept fields below:

		const name = body.name ? String(body.name) : undefined;
		const category = body.category ? (String(body.category) as Product['category']) : undefined;
		const price = body.price != null ? Number(body.price) : undefined;
		const order = body.order != null ? Number(body.order) : undefined;
		const active = body.active != null ? Boolean(body.active) : undefined;

		let imageUrl: string | undefined;
		if (form) {
			const file = form.get('file') as File | null;
			if (file) imageUrl = await uploadImage(file);
		} else if (body.imageUrl) {
			imageUrl = String(body.imageUrl);
		}

		// Build minimal patch object; client should have fetched current product and send back unchanged fields
		const patch: Partial<Product> = {};
		if (name !== undefined) patch.name = name;
		if (category !== undefined) patch.category = category;
		if (price !== undefined) patch.price = price;
		if (order !== undefined) patch.order = order;
		if (active !== undefined) patch.active = active;
		if (imageUrl !== undefined) patch.imageUrl = imageUrl;

		// Read the current meta file from /api/catalog (cheap & public):
		const currentRes = await fetch(`/api/catalog?single=${id}`, { cache: 'no-store' });
		let current: Product | undefined;
		if (currentRes.ok) {
			const all = (await currentRes.json()) as Product[];
			current = all.find((p) => p.id === id);
		}

		if (!current) {
			return new Response(JSON.stringify({ error: 'product not found (refresh and try again)' }), {
				status: 404
			});
		}

		const next: Product = { ...current, ...patch, id, updatedAt: Date.now() };
		await writeMeta(next, /*overwrite*/ true);

		return new Response(JSON.stringify(next), {
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500 });
	}
};

// DELETE: JSON { id, deleteImage?: boolean, imageUrl?: string }
export const DELETE: RequestHandler = async ({ request, cookies }) => {
	try {
		if (!isAdmin(cookies))
			return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

		const { id, deleteImage, imageUrl } = await request.json();
		if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });

		// remove meta file by overwriting with {} (cheaper) or delete the blob if you track the exact pathname
		await put(`${META_PREFIX}${id}.json`, JSON.stringify({}, null, 2), {
			access: 'public',
			addRandomSuffix: false,
			allowOverwrite: true,
			contentType: 'application/json',
			token: BLOB_READ_WRITE_TOKEN
		});

		if (deleteImage && imageUrl) {
			try {
				await del(imageUrl, { token: BLOB_READ_WRITE_TOKEN });
			} catch {}
		}

		return new Response(JSON.stringify({ ok: true }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500 });
	}
};
