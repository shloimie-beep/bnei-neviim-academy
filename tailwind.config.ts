import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
        },
        line: 'var(--line)',
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          soft: 'var(--gold-soft)',
        },
        rose: 'var(--rose)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Frank Ruhl Libre', 'serif'],
        body: ['var(--font-body)', 'Assistant', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['3rem', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        section: ['1.75rem', { lineHeight: '1.2' }],
        card: ['1.375rem', { lineHeight: '1.3' }],
        body: ['1.125rem', { lineHeight: '1.55' }],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
