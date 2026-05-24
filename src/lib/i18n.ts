// Tiny i18n helper. Hebrew is the default on the kid side per SPEC.md.
// Tone is warm, kid-appropriate. Shlomo can edit any string here directly.
//
// Why no library: SPEC.md scope is small, only kid UI is bilingual,
// pulling in next-intl etc. is overkill.

export type Locale = 'he' | 'en';

export const LOCALES: Locale[] = ['he', 'en'];
export const DEFAULT_LOCALE: Locale = 'he';

type Dict = Record<Locale, string>;

const STRINGS: Record<string, Dict> = {
  appName: {
    he: 'אחריות משפחתית',
    en: 'Family Accountability',
  },
  parents: {
    he: 'הורים',
    en: 'Parents',
  },
  enterPin: {
    he: 'הזן את הקוד שלך',
    en: 'Enter your PIN',
  },
  wrongPin: {
    he: 'הקוד לא נכון',
    en: 'PIN is incorrect',
  },
  todayHeader: {
    he: 'היום',
    en: 'Today',
  },
  allDone: {
    he: 'סיימת הכל! אבא ואמא גאים בך',
    en: 'All done. Tatty and Mommy are proud of you.',
  },
  noGoals: {
    he: 'אין משימות עדיין. אבא יקבע אותן בפגישה הבאה',
    en: 'No goals yet. Tatty will set them at the next meeting.',
  },
  frozen: {
    he: 'הופסק. תדבר עם אבא',
    en: 'Paused. Talk to Tatty.',
  },
  streak: {
    he: 'ימים ברצף',
    en: 'day streak',
  },
  uploadPhoto: {
    he: 'להעלות תמונה',
    en: 'Upload photo',
  },
  proofNote: {
    he: 'להוסיף הערה',
    en: 'Add a note (optional)',
  },
  checkOff: {
    he: 'סמן שסיימת',
    en: 'Mark complete',
  },
  redo: {
    he: 'אבא או אמא רוצים שתעשה את זה שוב',
    en: 'Tatty or Mommy wants you to redo this',
  },
  loadError: {
    he: 'משהו השתבש. נסה שוב בעוד רגע',
    en: 'Something went wrong. Try again in a moment.',
  },
  signOut: {
    he: 'התנתקות',
    en: 'Sign out',
  },
};

export function t(key: keyof typeof STRINGS, locale: Locale = DEFAULT_LOCALE): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[locale] ?? entry.en ?? key;
}

export function dirFor(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'he' ? 'rtl' : 'ltr';
}

export function isRTL(locale: Locale): boolean {
  return locale === 'he';
}
