// GET /api/qr/<kid>  → 512x512 PNG QR code pointing at /kid/<kid>/pin
//
// Kids scan once, the URL opens directly on their tablet's PIN screen.
// PIN still required — QR is convenience, not auth. Open without login,
// publicly serveable (URL is short and well-known, all gating is at PIN).

import { NextResponse, type NextRequest } from 'next/server';
import QRCode from 'qrcode';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { kid: string } },
): Promise<NextResponse> {
  const kid = params.kid.toLowerCase();
  if (!/^[a-z\-]{2,30}$/.test(kid)) {
    return NextResponse.json({ ok: false, error: 'bad_kid' }, { status: 400 });
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') ?? req.nextUrl.origin;
  const url = `${base}/kid/${encodeURIComponent(kid)}/pin`;

  const png = await QRCode.toBuffer(url, {
    type: 'png',
    errorCorrectionLevel: 'M',
    width: 512,
    margin: 2,
    color: {
      dark: '#1A1A1A',
      light: '#FAF6EE',
    },
  });

  // Cast through `BlobPart` — Node's Buffer is a real ArrayBufferView at
  // runtime but @types/node 22's Buffer<ArrayBufferLike> is wider than
  // BlobPart's ArrayBufferView<ArrayBuffer>. Cast is safe; runtime works.
  const blob = new Blob([png as unknown as BlobPart], { type: 'image/png' });

  return new NextResponse(blob, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="kid-${kid}.png"`,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
