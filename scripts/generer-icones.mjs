// Génère les icônes PNG de l'app (sans aucune bibliothèque) : node scripts/generer-icones.mjs
// Dessin : fond sombre, carte bleue arrondie, et 3 barres aux couleurs des enveloppes.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const FOND = hex('#0B0F14');
const CARTE = hex('#2F5FEF');
const BARRES = [hex('#4F7CFF'), hex('#A78BFA'), hex('#F472B6')];
const BLANC = hex('#F2F4F7');

/** Vrai si (x, y) est dans le rectangle arrondi. */
function dansRect(x, y, x0, y0, l, h, r) {
  if (x < x0 || y < y0 || x > x0 + l || y > y0 + h) return false;
  const cx = Math.min(Math.max(x, x0 + r), x0 + l - r);
  const cy = Math.min(Math.max(y, y0 + r), y0 + h - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function pixel(u, v) {
  // u, v entre 0 et 1
  if (dansRect(u, v, 0.14, 0.18, 0.72, 0.64, 0.12)) {
    // trois barres horizontales de longueurs 60 / 20 / 20 (à la manière d'une répartition)
    const barres = [
      { y: 0.34, long: 0.48, c: BLANC },
      { y: 0.47, long: 0.30, c: BARRES[1] },
      { y: 0.60, long: 0.38, c: BARRES[2] },
    ];
    for (const b of barres) if (dansRect(u, v, 0.24, b.y, b.long, 0.07, 0.035)) return b.c;
    return CARTE;
  }
  return FOND;
}

function png(taille) {
  const lignes = [];
  const sur = 3; // anticrénelage : 3 × 3 échantillons par pixel
  for (let y = 0; y < taille; y++) {
    const ligne = Buffer.alloc(1 + taille * 3);
    for (let x = 0; x < taille; x++) {
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < sur; i++) for (let j = 0; j < sur; j++) {
        const c = pixel((x + (i + 0.5) / sur) / taille, (y + (j + 0.5) / sur) / taille);
        r += c[0]; g += c[1]; b += c[2];
      }
      const n = sur * sur;
      ligne[1 + x * 3] = Math.round(r / n);
      ligne[2 + x * 3] = Math.round(g / n);
      ligne[3 + x * 3] = Math.round(b / n);
    }
    lignes.push(ligne);
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const o of buf) c = crcTable[(c ^ o) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const bloc = (type, data) => {
    const t = Buffer.from(type);
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(taille, 0); ihdr.writeUInt32BE(taille, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8 bits, RVB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloc('IHDR', ihdr),
    bloc('IDAT', deflateSync(Buffer.concat(lignes))),
    bloc('IEND', Buffer.alloc(0)),
  ]);
}

writeFileSync('public/apple-touch-icon.png', png(180));
writeFileSync('public/icone-192.png', png(192));
writeFileSync('public/icone-512.png', png(512));
console.log('Icônes générées dans public/');
