import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { createHmac } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

const OTP_COOKIE = 'otp';
const SID_COOKIE = 'sid';

function sign(data: string) {
	const secret = env.SESSION_SECRET ?? '';
	return createHmac('sha256', secret).update(data).digest('hex');
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { code = '', name = '' } = await request.json().catch(() => ({}));

		const raw = cookies.get(OTP_COOKIE);
		if (!raw) return json({ ok: false, error: 'OTP missing' }, { status: 401 });

		const parsed = JSON.parse(raw) as { email: string; codeHash: string; exp: number };
		if (Date.now() > parsed.exp) return json({ ok: false, error: 'OTP expired' }, { status: 401 });

		const codeSan = String(code).replace(/[^\d]/g, ''); // guard against stray characters
		if (sign(codeSan) !== parsed.codeHash) {
			return json({ ok: false, error: 'Invalid code' }, { status: 401 });
		}

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
			secure: !dev,
			maxAge: 60 * 60 * 24 * 90 // 90 days
		});

		return json({ ok: true });
	} catch (e: any) {
		console.error('[verify-otp] failed', e);
		return json({ ok: false, error: e?.message ?? 'Unexpected error' }, { status: 500 });
	}
};
