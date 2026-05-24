# Icons

SVG placeholders are in place so the PWA installs cleanly. They use the
project palette (parchment bg, burgundy circle, gold check).

If you want PNG icons (better Android/iOS coverage):

1. Generate them from `icon.svg` with any SVG-to-PNG converter
   (Inkscape, `librsvg`, online tools, Figma export).
2. Drop in `icon-192.png` and `icon-512.png`.
3. Update `public/manifest.json` to point at the PNGs instead.
4. Add `apple-touch-icon.png` (180x180) for iOS home-screen.
