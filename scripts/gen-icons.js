// Generates the PWA icon set from assets/icon.svg.
// Run with: node scripts/gen-icons.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIcoMod = require('png-to-ico');
const pngToIco = pngToIcoMod.default || pngToIcoMod;

const root = path.join(__dirname, '..');
const svg = fs.readFileSync(path.join(root, 'assets', 'icon.svg'));
const pub = path.join(root, 'public');

async function png(size, file) {
  const out = path.join(pub, file);
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(out);
  console.log('wrote', file, `(${size}x${size})`);
  return out;
}

(async () => {
  await png(192, 'logo192.png');
  await png(512, 'logo512.png');
  await png(180, 'apple-touch-icon.png');

  // favicon.ico from 16/32/48 px renders
  const tmp = [16, 32, 48];
  const buffers = [];
  for (const s of tmp) {
    const b = await sharp(svg, { density: 384 }).resize(s, s).png().toBuffer();
    buffers.push(b);
  }
  const ico = await pngToIco(buffers);
  fs.writeFileSync(path.join(pub, 'favicon.ico'), ico);
  console.log('wrote favicon.ico (16/32/48)');
})();
