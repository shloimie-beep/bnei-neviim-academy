// One-shot: crop the Holy Flow Hero Logomark out of the brand card and
// write it as a 256x256 PNG ready to use as a circular avatar via CSS
// border-radius: 50%.
//
// Source: C:\Users\User\Downloads\Gemini_Generated_Image_cxnw8ucxnw8ucxnw.png
// (1024x1024 brand card — leftmost panel is the 1:1 Hero Logomark)

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'C:\\Users\\User\\Downloads\\Gemini_Generated_Image_cxnw8ucxnw8ucxnw.png';
const DST_DIR = 'C:\\Users\\User\\holyflow-platform\\marketing\\holyflow\\or-moshe';
const DST = `${DST_DIR}\\logo.png`;

mkdirSync(DST_DIR, { recursive: true });

// Leftmost panel on the brand card is the Hero Logomark — a 1:1 square that
// sits at roughly the top-left third of the 1024x1024 source. Use a 380-px
// square from a small inset so we miss any panel border, then resize to 256.
const SQUARE = 360;
const X = 18;
const Y = 18;

await sharp(SRC)
  .extract({ left: X, top: Y, width: SQUARE, height: SQUARE })
  .resize(256, 256, { fit: 'cover' })
  .png()
  .toFile(DST);

console.log(`Wrote ${DST}`);
