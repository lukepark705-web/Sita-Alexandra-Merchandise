import type { RequestHandler } from './$types';
import { createHmac } from 'node:crypto';
import { put, list } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN, SESSION_SECRET, ADMIN_EMAILS } from '$env/static/private';

const SID_COOKIE = 'sid';

function isAdmin(cookies: App.Cookies) {
	const raw = cookies.get(SID_COOKIE);
	if (!raw) return { ok: false, reason: 'no sid cookie' };
	try {
		const { session, mac } = JSON.parse(raw);
		const mac2 = createHmac('sha256', SESSION_SECRET).update(session).digest('hex');
		if (mac !== mac2) return { ok: false, reason: 'bad mac' };
		const { email } = JSON.parse(session) as { email: string };
		const admins = (ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase());
		return { ok: admins.includes(email.toLowerCase()), email };
	} catch (e) {
		return { ok: false, reason: 'parse error' };
	}
}

export const GET: RequestHandler = async ({ cookies }) => {
	const admin = isAdmin(cookies);
	const envOK = !!BLOB_READ_WRITE_TOKEN;

	let listOK = false;
	let putOK = false;
	try {
		if (envOK) {
			await list({ prefix: 'overrides/', token: BLOB_READ_WRITE_TOKEN });
			listOK = true;
			await put('overrides/.health.txt', 'ok', {
				access: 'public',
				addRandomSuffix: false,
				allowOverwrite: true, // <<< IMPORTANT FIX
				token: BLOB_READ_WRITE_TOKEN,
				contentType: 'text/plain'
			});
			putOK = true;
		}
	} catch (e: any) {
		return new Response(
			JSON.stringify({
				admin,
				envOK,
				listOK,
				putOK,
				error: String(e?.message ?? e)
			}),
			{ headers: { 'Content-Type': 'application/json' }, status: 500 }
		);
	}

	return new Response(JSON.stringify({ admin, envOK, listOK, putOK }), {
		headers: { 'Content-Type': 'application/json' }
	});
};
