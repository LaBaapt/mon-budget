// Mise en forme des montants : 152 108 centimes → "1 521,08 €".

const ESPACE = ' '; // espace insécable (le montant ne se coupe pas en deux)

/** Convertit un montant en euros (ex. 152.08) en centimes entiers (15208). */
export function versCentimes(euros: number | null | undefined): number {
  if (euros == null || Number.isNaN(euros)) return 0;
  return Math.round(euros * 100);
}

/** Convertit des centimes en euros (pour l'enregistrement). */
export function versEuros(centimes: number): number {
  return centimes / 100;
}

/**
 * Affiche des centimes au format français : "1 521,27 €", "−19,09 €".
 * avecSigne = true ajoute un "+" devant les montants positifs.
 */
export function euros(centimes: number, avecSigne = false): string {
  const negatif = centimes < 0;
  const abs = Math.abs(centimes);
  const entier = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ESPACE);
  const decimales = String(abs % 100).padStart(2, '0');
  const signe = negatif ? '−' : avecSigne && centimes > 0 ? '+' : '';
  return `${signe}${entier},${decimales}${ESPACE}€`;
}

/**
 * Lit un montant saisi ("12,5", "12.50") et renvoie des centimes, ou null s'il est invalide.
 * Maximum 2 décimales.
 */
export function lireMontant(texte: string): number | null {
  const t = texte.trim().replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(t)) return null;
  return Math.round(parseFloat(t) * 100);
}

/** Centimes → texte modifiable dans un champ ("1521,27"). */
export function montantPourChamp(centimes: number): string {
  const s = (centimes / 100).toFixed(2).replace('.', ',');
  return s.endsWith(',00') ? s.slice(0, -3) : s;
}
