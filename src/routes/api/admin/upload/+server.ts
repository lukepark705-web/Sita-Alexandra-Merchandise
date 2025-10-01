import type { RequestHandler } from './$types';
import { createHmac } from 'node:crypto';
import { put, del } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN, SESSION_SECRET, ADMIN_EMAILS } from '$env/static/private';

const SID_COOKIE = 'sid';

function isAdmin(cookies: App.Cookies) {
	const raw = cookies.get(SID_COOKIE);
	if (!raw) return false;
	try {
		const { session, mac } = JSON.parse(raw);
		const mac2 = createHmac('sha256', SESSION_SECRET).update(session).digest('hex');
		if (mac !== mac2) return false;
		const user = JSON.parse(session) as { email: string };
		const admins = (ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase());
		return admins.includes(user.email.toLowerCase());
	} catch {
		return false;
	}
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	if (!isAdmin(cookies)) return new Response('Unauthorized', { status: 401 });

	const form = await request.formData();
	const file = form.get('file') as File | null;
	if (!file || typeof file === 'string') return new Response('File required', { status: 400 });
	if (!BLOB_READ_WRITE_TOKEN) return new Response('Blob token missing', { status: 500 });

	const safeName = file.name.replace(/[^\w.\-]+/g, '_');
	const key = `products/${Date.now()}-${safeName}`;

	const { url } = await put(key, file, {
		access: 'public',
		token: BLOB_READ_WRITE_TOKEN
	});

	return new Response(JSON.stringify({ url }), { headers: { 'Content-Type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ request, cookies }) => {
	if (!isAdmin(cookies)) return new Response('Unauthorized', { status: 401 });
	const { url } = await request.json();
	if (!url) return new Response('url required', { status: 400 });
	if (!BLOB_READ_WRITE_TOKEN) return new Response('Blob token missing', { status: 500 });

	await del(url, { token: BLOB_READ_WRITE_TOKEN });
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' }
	});
};
