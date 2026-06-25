import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public', 'locations');
const MAX_WIDTH = 1280;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;

function collectImages(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectImages(full));
    } else {
      const ext = extname(entry).toLowerCase();
      if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
        results.push(full);
      }
    }
  }
  return results;
}

async function optimizeImage(filePath: string): Promise<void> {
  const ext = extname(filePath).toLowerCase();
  const rel = relative(process.cwd(), filePath);

  const meta = await sharp(filePath).metadata();
  const originalWidth = meta.width ?? 0;
  const originalSize = statSync(filePath).size;

  let pipeline = sharp(filePath).rotate(); // auto-rotate based on EXIF

  if (originalWidth > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  if (ext === '.png') {
    pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 });
  } else {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  }

  // Write to a temp file first (sharp keeps the source handle open), then replace
  const tmpPath = filePath + '.tmp';
  await pipeline.toFile(tmpPath);

  const { renameSync, unlinkSync } = await import('fs');
  const newSize = statSync(tmpPath).size;

  if (newSize < originalSize) {
    renameSync(tmpPath, filePath);
    const saved = ((originalSize - newSize) / 1024).toFixed(1);
    const pct = (((originalSize - newSize) / originalSize) * 100).toFixed(0);
    console.log(`✅  ${rel}  ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB  (-${saved}KB, ${pct}%)`);
  } else {
    unlinkSync(tmpPath);
    console.log(`⏭️   ${rel}  already optimal (${(originalSize / 1024).toFixed(0)}KB), skipped`);
  }
}

async function main() {
  const images = collectImages(PUBLIC_DIR);
  console.log(`\n🔍 Found ${images.length} images in public/locations\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const img of images) {
    const before = statSync(img).size;
    totalBefore += before;
    await optimizeImage(img);
    totalAfter += statSync(img).size;
  }

  const savedKB = ((totalBefore - totalAfter) / 1024).toFixed(0);
  const savedPct = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0);
  console.log(`\n🎉 Done! Total: ${(totalBefore / 1024).toFixed(0)}KB → ${(totalAfter / 1024).toFixed(0)}KB  (saved ${savedKB}KB, ${savedPct}%)\n`);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
