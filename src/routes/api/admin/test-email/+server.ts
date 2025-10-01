import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

// Very light admin check (reuse your isAdmin if you have a stronger one)
function isAdminEmail(email: string) {
	const list = (env.ADMIN_EMAILS ?? '')
		.split(/[,;\s]+/)
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
	return list.includes(email.toLowerCase());
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { to } = (await request.json()) as { to: string };

		// If your session cookie contains user info, adapt this check accordingly:
		// For now, allow only admin recipients to avoid abuse during testing.
		if (!isAdminEmail(to)) {
			return json({ ok: false, error: 'Only admin recipients allowed for test.' }, { status: 403 });
		}

		if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
			return json({ ok: false, error: 'Resend env not set' }, { status: 500 });
		}

		const resend = new Resend(env.RESEND_API_KEY);
		const { data, error } = await resend.emails.send({
			from: env.RESEND_FROM!,
			to,
			subject: 'SitaAlexandra test email',
			text: 'This is a test email from your SvelteKit backend.'
		});

		if (error) {
			return json({ ok: false, error: error.message }, { status: 500 });
		}
		return json({ ok: true, id: data?.id });
	} catch (e: any) {
		return json({ ok: false, error: e?.message ?? 'Unknown error' }, { status: 500 });
	}
};
