// Generează thumbnails + manifest cu dimensiunile originale (incremental, concurență limitată)
// Usage examples:
//   node scripts/make-thumbs.mjs
//   node scripts/make-thumbs.mjs --width=560 --quality=80 --format=jpg
//   node scripts/make-thumbs.mjs --format=webp
//   node scripts/make-thumbs.mjs --force        # regenerează tot

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const fullDir      = path.resolve('assets/img/galerie');
const thumbDir     = path.resolve('assets/img/thumbnails');
const manifestPath = path.resolve('assets/img/manifest.json');

const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const m = arg.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [arg, true];
  })
);

// Config din CLI sau fallback-uri
const WIDTH   = Number(args.width ?? 480);
const QUALITY = Number(args.quality ?? 74);
const FORMAT  = String(args.format ?? 'jpg').toLowerCase(); // jpg | webp | avif
const FORCE   = Boolean(args.force ?? false);

// Validare format
const allowedFormats = new Set(['jpg', 'jpeg', 'webp', 'avif']);
if (!allowedFormats.has(FORMAT)) {
  console.error(`Unsupported --format=${FORMAT}. Use: jpg | webp | avif`);
  process.exit(1);
}

// Helpers de format
const extFor = (fmt) => (fmt === 'jpeg' ? 'jpg' : fmt);

// FS helpers
async function exists(p){ try{ await fs.access(p); return true; } catch{ return false; } }
async function mtime(p){ return (await fs.stat(p)).mtimeMs; }

// Colectează fișiere
await fs.mkdir(thumbDir, { recursive: true });
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const all = (await fs.readdir(fullDir)).filter(f => exts.has(path.extname(f).toLowerCase())).sort();

// Încarcă manifestul vechi (dacă există)
let manifest = {};
if (await exists(manifestPath)) {
  try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8') || '{}'); }
  catch { manifest = {}; }
}

// Pipeline de procesare cu concurență limitată
const CONCURRENCY = 6;
const queue = [...all];
let done = 0, skipped = 0, errors = 0;

function outName(file){
  // standardizează extensia de ieșire
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext);
  return base + '.' + extFor(FORMAT);
}

async function processOne(file){
  const src = path.join(fullDir, file);
  const dst = path.join(thumbDir, outName(file));

  // Skip incremental dacă nu e FORCE și thumb există & e mai nou
  if (!FORCE && await exists(dst)) {
    try {
      const [ms, md] = await Promise.all([mtime(src), mtime(dst)]);
      if (md >= ms) { skipped++; return; }
    } catch { /* reprocesează dacă stat eșuează */ }
  }

  const img = sharp(src).rotate(); // respectă orientarea EXIF
  const meta = await img.metadata();

  // Build transform & output
  let pipeline = img.resize({ width: WIDTH, withoutEnlargement: true });
  let written;

  if (FORMAT === 'jpg' || FORMAT === 'jpeg') {
    written = await pipeline
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(dst);
  } else if (FORMAT === 'webp') {
    written = await pipeline
      .webp({ quality: QUALITY })
      .toFile(dst);
  } else if (FORMAT === 'avif') {
    written = await pipeline
      .avif({ quality: QUALITY })
      .toFile(dst);
  }

  // Update manifest
  manifest[file] = {
    original: { width: meta.width ?? null, height: meta.height ?? null },
    thumb:    { width: written.width, height: written.height, format: FORMAT, path: path.relative(process.cwd(), dst) },
    updatedAt: new Date().toISOString()
  };

  done++;
  console.log('✓', file, '→', path.relative(process.cwd(), dst));
}

async function runPool(){
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const f = queue.shift();
      if (!f) break;
      try { await processOne(f); }
      catch (err) { errors++; console.error('✗', f, '\n ', err?.message || err); }
    }
  });
  await Promise.all(workers);
}

await runPool();

// Scrie manifestul
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`\nDone. Processed: ${done}, skipped: ${skipped}, errors: ${errors}`);
console.log('Manifest:', path.relative(process.cwd(), manifestPath));
