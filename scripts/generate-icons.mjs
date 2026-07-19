/**
 * Generate PWA PNG icons from the brand mark.
 * Requires: npm i -D sharp
 * Run: npm run generate-icons
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const ACCENT = '#0F766E'; // teal-700 — trust / security

function lockSvg(size, { maskable = false } = {}) {
  // Safe zone for maskable: keep content in center 80%
  const pad = maskable ? size * 0.18 : size * 0.12;
  const inner = size - pad * 2;
  const rx = size * (maskable ? 0.22 : 0.22);
  const lockScale = inner / 32;
  const ox = pad + (inner - 32 * lockScale) / 2;
  const oy = pad + (inner - 32 * lockScale) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  <rect width="${size}" height="${size}" rx="${rx}" fill="${ACCENT}"/>
  <g transform="translate(${ox},${oy}) scale(${lockScale})">
    <path d="M16 8a4 4 0 0 0-4 4v3h-1a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1v-3a4 4 0 0 0-4-4zm-2 4a2 2 0 1 1 4 0v3h-4v-3zm2 7.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="white"/>
  </g>
</svg>`;
}

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const t of targets) {
  const svg = lockSvg(t.size, { maskable: t.maskable });
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  const path = join(outDir, t.name);
  writeFileSync(path, buf);
  console.log('Wrote', path, `(${buf.length} bytes)`);
}

// Also update favicon.svg brand color
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="${ACCENT}"/>
  <path d="M16 8a4 4 0 0 0-4 4v3h-1a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1v-3a4 4 0 0 0-4-4zm-2 4a2 2 0 1 1 4 0v3h-4v-3zm2 7.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="white"/>
</svg>
`;
writeFileSync(join(__dirname, '..', 'public', 'favicon.svg'), favicon);
console.log('Updated favicon.svg');
