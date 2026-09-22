'use client';

import { Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { t, type Locale } from '@/lib/i18n';

type Props = {
  count: number;
  locale: Locale;
};

export function StreakBadge({ count, locale }: Props) {
  if (count <= 0) return null;
  return (
    <motion.div
      key={count}
      className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-ink"
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 0.4, times: [0, 0.5, 1] }}
    >
      <Flame size={16} strokeWidth={1.75} color="#C8A052" />
      <span className="text-sm font-medium">
        {count} {t('streak', locale)}
      </span>
    </motion.div>
  );
}
