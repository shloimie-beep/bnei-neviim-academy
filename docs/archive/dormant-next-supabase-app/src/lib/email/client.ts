/**
 * Resend email client — lazy-init singleton.
 *
 * Wraps the `resend` SDK and exposes a single `sendEmail` function. Every send
 * is mirrored to the `notifications` table (channel = `email`) with
 * `delivered = true/false`. All errors are caught — `sendEmail` never throws.
 *
 * Logging policy: we record only subject + recipient + ok/error. We do NOT
 * persist the rendered HTML or text body in the notifications row — proof
 * content may contain private kid info, and the schema's `body` column is
 * therefore stored truncated/null. The render output stays in transit only.
 */

import { Resend } from 'resend';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is not set — email client cannot initialize',
    );
  }
  _resend = new Resend(apiKey);
  return _resend;
}

function getFromAddress(): string {
  // Per ARCHITECTURE.md, sending identity is something like
  // family@family.webcraftmedia.digital. Default keeps the route working in
  // local dev even if FROM is not pinned.
  return (
    process.env.EMAIL_FROM ??
    'Family Accountability <family@family.webcraftmedia.digital>'
  );
}

export type SendEmailArgs = {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Optional kid this email is related to, for the notifications audit row. */
  relatedKidId?: string | null;
};

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

type LogArgs = {
  recipient: string;
  subject: string;
  delivered: boolean;
  error?: string | null;
  relatedKidId?: string | null;
};

async function logEmailNotification(args: LogArgs): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from('notifications').insert({
      channel: 'email',
      recipient: args.recipient,
      subject: args.subject,
      // Deliberately NOT logging the body — proof content may be private.
      body: null,
      delivered: args.delivered,
      error: args.error ?? null,
      related_kid_id: args.relatedKidId ?? null,
    });
  } catch (logErr) {
    // Last-resort fallback — never throw from logging. Don't log the email
    // body here either.
    // eslint-disable-next-line no-console
    console.error('[email] failed to write notifications row', logErr);
  }
}

function joinRecipients(value: string | string[] | undefined): string {
  if (!value) return '';
  return Array.isArray(value) ? value.join(', ') : value;
}

/**
 * Send an email via Resend. Logs to `notifications` and returns a result
 * object. Never throws.
 */
export async function sendEmail(
  args: SendEmailArgs,
): Promise<SendEmailResult> {
  const recipient = joinRecipients(args.to);

  try {
    const resend = getResend();
    const from = getFromAddress();

    const response = await resend.emails.send({
      from,
      to: args.to,
      cc: args.cc,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });

    // Resend's SDK returns `{ data, error }`. We treat presence of `error`
    // as a soft failure even when no exception fires.
    const responseError =
      response && typeof response === 'object' && 'error' in response
        ? (response as { error: unknown }).error
        : null;

    if (responseError) {
      const message =
        responseError instanceof Error
          ? responseError.message
          : typeof responseError === 'string'
            ? responseError
            : JSON.stringify(responseError);
      await logEmailNotification({
        recipient,
        subject: args.subject,
        delivered: false,
        error: message,
        relatedKidId: args.relatedKidId,
      });
      return { ok: false, error: message };
    }

    const id =
      response &&
      typeof response === 'object' &&
      'data' in response &&
      response.data &&
      typeof response.data === 'object' &&
      'id' in response.data
        ? String((response.data as { id: unknown }).id)
        : undefined;

    await logEmailNotification({
      recipient,
      subject: args.subject,
      delivered: true,
      relatedKidId: args.relatedKidId,
    });

    return { ok: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logEmailNotification({
      recipient,
      subject: args.subject,
      delivered: false,
      error: message,
      relatedKidId: args.relatedKidId,
    });
    return { ok: false, error: message };
  }
}
