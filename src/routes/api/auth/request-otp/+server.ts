import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { Resend } from 'resend';
import { createHmac, randomInt } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

const OTP_COOKIE = 'otp';
const TTL_SECONDS = 10 * 60; // 10 minutes
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sign(data: string) {
	const secret = env.SESSION_SECRET ?? '';
	return createHmac('sha256', secret).update(data).digest('hex');
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Validate environment
		if (!env.RESEND_API_KEY || !env.RESEND_FROM || !env.SESSION_SECRET) {
			return json(
				{ ok: false, error: 'Email service or session secret not configured.' },
				{ status: 500 }
			);
		}

		const { email, name = '' } = await request.json().catch(() => ({}));
		if (!email || !EMAIL_RE.test(email)) {
			return json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 });
		}

		// Generate 6-digit code
		const code = String(randomInt(100000, 1000000 - 1));

		// Store hashed OTP in a cookie
		const payload = JSON.stringify({
			email,
			codeHash: sign(code),
			exp: Date.now() + TTL_SECONDS * 1000
		});

		cookies.set(OTP_COOKIE, payload, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: TTL_SECONDS
		});

		// Send the email via Resend
		const resend = new Resend(env.RESEND_API_KEY);
		const { data, error } = await resend.emails.send({
			from: env.RESEND_FROM!,
			to: email,
			subject: 'Your sign-in code',
			text:
				`Hi${name ? ` ${name}` : ''}!\n\n` +
				`Your one-time code is: ${code}\n` +
				`It expires in 10 minutes.`
		});

		if (error) {
			// Bubble up the exact error, so we can see it in the UI
			return json({ ok: false, error: error.message }, { status: 502 });
		}

		if (dev) console.log('[otp] sent', { email, code, id: data?.id });
		return json({ ok: true, id: data?.id });
	} catch (e: any) {
		console.error('[request-otp] failed', e);
		return json({ ok: false, error: e?.message ?? 'Unexpected error' }, { status: 500 });
	}
};
