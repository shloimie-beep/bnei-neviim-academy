// Sticky mobile-first header used on the parent surfaces. Burgundy
// underline, parchment background, blends into the page on scroll-up.

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  backHref?: string;
  right?: ReactNode;
};

export function ParentHeader({ title, backHref, right }: Props) {
  return (
    <header className="bg-bg/95 border-line sticky top-0 z-20 -mx-4 mb-4 border-b px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back"
            className="ink-soft -ms-1 inline-flex h-9 w-9 items-center justify-center hover:text-ink"
          >
            <ChevronLeft size={22} strokeWidth={1.75} />
          </Link>
        )}
        <h1 className="font-display text-card flex-1 truncate">{title}</h1>
        {right}
      </div>
    </header>
  );
}
