import type { RequestHandler } from './$types';
import { Resend } from 'resend';
import { createHmac, randomInt } from 'node:crypto';
import { RESEND_API_KEY, RESEND_FROM, SESSION_SECRET } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);
const TTL_MINUTES = 10;
const COOKIE = 'otp';

function sign(data: string) {
	return createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { email } = await request.json();
	if (!email) return new Response('Email required', { status: 400 });

	const code = String(randomInt(100000, 999999));
	const payload = JSON.stringify({
		email,
		codeHash: sign(code),
		exp: Date.now() + TTL_MINUTES * 60_000
	});

	cookies.set(COOKIE, payload, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		maxAge: TTL_MINUTES * 60
	});

	// Resend recommends using a verified domain or onboarding@resend.dev while testing.
	const from = RESEND_FROM?.includes('@')
		? `SitaAlexandra <${RESEND_FROM}>`
		: 'onboarding@resend.dev';

	await resend.emails.send({
		from,
		to: [email],
		subject: 'Your sign-in code',
		text: `Your code is ${code}. It expires in ${TTL_MINUTES} minutes.`
	});

	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' }
	});
};
