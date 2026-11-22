// Petites fonctions pour manipuler les mois ("AAAA-MM") et les dates ("AAAA-MM-JJ").
import type { Mois } from './types';

const NOMS_MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
const NOMS_MOIS_COURTS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

/** Ajoute (ou retire si négatif) des mois : ajouterMois("2026-12", 1) = "2027-01". */
export function ajouterMois(m: Mois, n: number): Mois {
  const [a, mm] = m.split('-').map(Number);
  const total = a * 12 + (mm - 1) + n;
  const annee = Math.floor(total / 12);
  const mois = (total % 12) + 1;
  return `${annee}-${String(mois).padStart(2, '0')}`;
}

/** Numéro du mois (1 à 12). */
export function numeroMois(m: Mois): number {
  return Number(m.slice(5, 7));
}

/** Le mois d'une date "AAAA-MM-JJ". */
export function moisDe(date: string): Mois {
  return date.slice(0, 7);
}

/** "décembre" */
export function nomMois(m: Mois): string {
  return NOMS_MOIS[numeroMois(m) - 1];
}

/** "Décembre 2026" */
export function libelleMois(m: Mois): string {
  const n = nomMois(m);
  return `${n[0].toUpperCase()}${n.slice(1)} ${m.slice(0, 4)}`;
}

/** "févr. 2027" */
export function libelleMoisCourt(m: Mois): string {
  return `${NOMS_MOIS_COURTS[numeroMois(m) - 1]} ${m.slice(0, 4)}`;
}

/** Nom d'un mois à partir de son numéro (1 → "janvier"). */
export function nomDuNumero(n: number): string {
  return NOMS_MOIS[n - 1];
}

/** Date du jour au format "AAAA-MM-JJ" (heure locale). */
export function aujourdhui(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Mois en cours. */
export function moisCourant(): Mois {
  return moisDe(aujourdhui());
}

/** Dernier jour du mois "AAAA-MM-JJ". */
export function dernierJour(m: Mois): string {
  const [a, mm] = m.split('-').map(Number);
  const jours = new Date(a, mm, 0).getDate();
  return `${m}-${String(jours).padStart(2, '0')}`;
}

/** "22/11/2026" */
export function libelleDate(date: string): string {
  const [a, m, j] = date.split('-');
  return `${j}/${m}/${a}`;
}
