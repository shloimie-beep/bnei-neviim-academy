import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getKidFromCookies } from '@/lib/auth/kid-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  fileName: z.string().max(120),
  contentType: z.string().regex(/^image\/(jpeg|png|webp|heic)$/),
});

export async function POST(req: NextRequest) {
  const kid = await getKidFromCookies();
  if (!kid) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const ext = parsed.data.fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExt = /^(jpg|jpeg|png|webp|heic)$/.test(ext) ? ext : 'jpg';
  const path = `${kid.kidId}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

  const { data, error } = await supabase.storage
    .from('proofs')
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: 'storage_signed_url_failed', detail: error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    path,
    signedUrl: data.signedUrl,
    token: data.token,
  });
}
