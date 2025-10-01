import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { SESSION_SECRET, RESEND_API_KEY, BLOB_READ_WRITE_TOKEN } from '$env/static/private';

export const GET: RequestHandler = async () => {
	// Minimal health info: just confirm env presence.
	const envOK = Boolean(SESSION_SECRET && RESEND_API_KEY && BLOB_READ_WRITE_TOKEN);
	return json({ envOK });
};
