import { Frank_Ruhl_Libre, Assistant } from 'next/font/google';

export const fontDisplay = Frank_Ruhl_Libre({
  subsets: ['latin', 'hebrew'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-display',
});

export const fontBody = Assistant({
  subsets: ['latin', 'hebrew'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
});
