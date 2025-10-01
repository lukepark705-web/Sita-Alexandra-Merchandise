import type { RequestHandler } from './$types';
import { createHmac } from 'node:crypto';
import {
	DEXIE_CLOUD_CLIENT_ID,
	DEXIE_CLOUD_CLIENT_SECRET,
	SESSION_SECRET
} from '$env/static/private';
import { VITE_DEXIE_CLOUD_URL } from '$env/static/private';

const SID_COOKIE = 'sid';

function verifySession(raw?: string | null) {
	if (!raw) return null;
	try {
		const { session, mac } = JSON.parse(raw);
		const sig = createHmac('sha256', SESSION_SECRET).update(session).digest('hex');
		if (sig !== mac) return null;
		return JSON.parse(session) as { email: string; name?: string };
	} catch {
		return null;
	}
}

export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
	const { public_key } = await request.json();
	const me = verifySession(cookies.get(SID_COOKIE));
	if (!me) return new Response('Unauthorized', { status: 401 });

	const res = await fetch(`${VITE_DEXIE_CLOUD_URL}/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify({
			grant_type: 'client_credentials',
			scopes: ['ACCESS_DB'],
			public_key,
			client_id: DEXIE_CLOUD_CLIENT_ID,
			client_secret: DEXIE_CLOUD_CLIENT_SECRET,
			claims: { sub: me.email, email: me.email, name: me.name }
		})
	});

	if (!res.ok) return new Response(`Token error: ${await res.text()}`, { status: 500 });
	const tokens = await res.json();
	return new Response(JSON.stringify(tokens), {
		headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
	});
};
