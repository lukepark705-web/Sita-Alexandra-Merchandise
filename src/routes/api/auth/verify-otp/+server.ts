import type { RequestHandler } from './$types';
import { createHmac } from 'node:crypto';
import { SESSION_SECRET } from '$env/static/private';

const OTP_COOKIE = 'otp';
const SID_COOKIE = 'sid';

function sign(data: string) {
	return createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { code, name } = await request.json();
	const raw = cookies.get(OTP_COOKIE);
	if (!raw) return new Response('OTP missing', { status: 401 });

	const parsed = JSON.parse(raw) as { email: string; codeHash: string; exp: number };
	if (Date.now() > parsed.exp) return new Response('OTP expired', { status: 401 });
	if (sign(code) !== parsed.codeHash) return new Response('Invalid code', { status: 401 });

	const session = JSON.stringify({
		email: parsed.email,
		name: name || parsed.email.split('@')[0],
		iat: Date.now()
	});
	const mac = sign(session);

	cookies.delete(OTP_COOKIE, { path: '/' });
	cookies.set(SID_COOKIE, JSON.stringify({ session, mac }), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		maxAge: 60 * 60 * 24 * 90
	});

	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' }
	});
};
