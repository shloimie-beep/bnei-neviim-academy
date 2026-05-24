// Parent-to-parent (and parent-to-kids) shared note wall.
// GET  /api/parent-notes  → recent visible notes
// POST /api/parent-notes  → create a note
// Author identity comes from the signed-in parent session.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getParentFromSupabase } from '@/lib/auth/parent-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PostBody = z.object({
  body: z.string().min(1).max(1000),
  visibleToKids: z.boolean().default(true),
  visibleUntil: z.string().datetime().optional().nullable(),
});

function parentDisplayName(email: string): string {
  const lower = email.toLowerCase();
  if (lower.includes('shloimie') || lower === (process.env.EMAIL_CC_SHLOIMIE ?? '').toLowerCase()) {
    return 'Tatty';
  }
  if (lower.includes('ahuva') || lower === (process.env.EMAIL_TO_AHUVA ?? '').toLowerCase()) {
    return 'Mommy';
  }
  return email.split('@')[0];
}

export async function GET() {
  const parent = await getParentFromSupabase();
  if (!parent) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const sb = getSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await sb
    .from('parent_notes')
    .select('*')
    .or(`visible_until.is.null,visible_until.gt.${nowIso}`)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, notes: data ?? [] });
}

export async function POST(req: NextRequest) {
  const parent = await getParentFromSupabase();
  if (!parent) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  const parsed = PostBody.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const sb = getSupabaseAdminClient();
  const { data, error } = await sb
    .from('parent_notes')
    .insert({
      author_user_id: parent.userId,
      author_name: parentDisplayName(parent.email),
      body: parsed.data.body.trim(),
      visible_to_kids: parsed.data.visibleToKids,
      visible_until: parsed.data.visibleUntil ?? null,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, note: data });
}
