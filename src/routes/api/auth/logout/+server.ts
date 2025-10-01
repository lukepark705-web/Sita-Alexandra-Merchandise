import type { RequestHandler } from './$types';

const SID_COOKIE = 'sid';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete(SID_COOKIE, { path: '/' });
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' }
	});
};
