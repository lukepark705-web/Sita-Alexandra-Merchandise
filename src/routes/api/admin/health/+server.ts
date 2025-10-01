import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { VITE_DEXIE_CLOUD_URL } from '$env/static/private';

export const GET: RequestHandler = async ({ cookies }) => {
	const haveKey = Boolean(env.RESEND_API_KEY);
	const haveFrom = Boolean(env.RESEND_FROM);
	const dbUrl = VITE_DEXIE_CLOUD_URL || null;

	// Optional: prove you're logged in (if you set a sid cookie)
	const sid = cookies.get('sid') ?? null;

	return json({
		ok: true,
		resend: {
			haveKey,
			haveFrom,
			from: env.RESEND_FROM || null
		},
		dexie: { dbUrl },
		sessionCookiePresent: Boolean(sid)
	});
};
