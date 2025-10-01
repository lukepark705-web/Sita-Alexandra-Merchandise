import type { RequestHandler } from './$types';
import { createHmac } from 'node:crypto';
import { SESSION_SECRET, ADMIN_EMAILS } from '$env/static/private';

const SID_COOKIE = 'sid';

function verify(raw?: string | null) {
	if (!raw) return null;
	try {
		const { session, mac } = JSON.parse(raw);
		const sig = createHmac('sha256', SESSION_SECRET).update(session).digest('hex');
		if (sig !== mac) return null;
		const u = JSON.parse(session) as { email: string; name?: string };
		const admins = (ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase());
		const role = admins.includes(u.email.toLowerCase()) ? 'admin' : 'user';
		return { ...u, role };
	} catch {
		return null;
	}
}

export const GET: RequestHandler = async ({ cookies }) => {
	const u = verify(cookies.get(SID_COOKIE));
	return new Response(JSON.stringify({ user: u }), {
		headers: { 'Content-Type': 'application/json' }
	});
};
