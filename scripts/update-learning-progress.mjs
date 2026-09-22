import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'public', 'index.html');

const pagesArg = process.argv[2];
const noteArg = process.argv.slice(3).join(' ').trim();
const pages = Number(pagesArg);
const goal = 30;

if (!Number.isFinite(pages) || pages < 0) {
  console.error('Usage: node scripts/update-learning-progress.mjs <pagesLearned> [note]');
  console.error('Example: node scripts/update-learning-progress.mjs 3.5 "Latest report: 3.5 pages learned."');
  process.exit(1);
}

const displayPages = Number.isInteger(pages) ? String(pages) : String(pages).replace(/0+$/, '').replace(/\.$/, '');
const percent = Math.min(100, Math.round((pages / goal) * 100));
const note = noteArg || `Latest report: ${displayPages} pages learned. Each day we can update this progress as the boys move closer to the trip.`;

let html = fs.readFileSync(indexPath, 'utf8');

html = html
  .replace(/<span id="pagesLearned">[^<]*<\/span>/, `<span id="pagesLearned">${displayPages}</span>`)
  .replace(/<div class="goal-label" id="goalPercent">[^<]*<\/div>/, `<div class="goal-label" id="goalPercent">${percent}%</div>`)
  .replace(/<div class="progress-fill" id="goalProgressFill" style="--progress: [^"]*;"><\/div>/, `<div class="progress-fill" id="goalProgressFill" style="--progress: ${percent}%;"></div>`)
  .replace(/<p class="goal-note" data-i18n="goalNote">.*?<\/p>/, `<p class="goal-note" data-i18n="goalNote">${note}</p>`)
  .replace(/pagesLearned:\s*[\d.]+,/, `pagesLearned: ${displayPages},`)
  .replace(/goalNote:\s*"[^"]*"/, `goalNote: "${note.replace(/"/g, '\\"')}"`);

fs.writeFileSync(indexPath, html);
console.log(`Updated homepage learning progress to ${displayPages}/${goal} (${percent}%).`);
