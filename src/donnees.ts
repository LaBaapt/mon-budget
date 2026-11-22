// Données de départ, import et export.
import type { Donnees } from './types';
import initiales from '../03_donnees_initiales.json';

/** Crée un identifiant unique (pour une dépense, une charge…). */
export function nouvelId(prefixe: string): string {
  return `${prefixe}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Complète un objet lu (fichier initial, sauvegarde importée…) pour qu'il ait
 * tous les champs attendus. Lève une erreur si ce n'est pas un fichier Mon Budget.
 */
export function normaliser(brut: unknown): Donnees {
  const o = brut as Partial<Donnees> & Record<string, unknown>;
  if (!o || typeof o !== 'object' || !Array.isArray(o.charges) || !Array.isArray(o.comptes)) {
    throw new Error("Ce fichier ne ressemble pas à une sauvegarde de Mon Budget.");
  }
  const enveloppes = Array.isArray(o.enveloppes) ? o.enveloppes : [];
  const pourcentages = o.pourcentages && typeof o.pourcentages === 'object' ? o.pourcentages : {};
  const premierMois = o.parametres?.premierMois ?? '2026-12';
  // Au premier lancement, on mémorise les pourcentages de départ pour le premier mois.
  if (Object.keys(pourcentages).length === 0) {
    pourcentages[premierMois] = {
      besoins: enveloppes.find((e) => e.id === 'besoins')?.pourcentage ?? 60,
      epargne: enveloppes.find((e) => e.id === 'epargne')?.pourcentage ?? 20,
    };
  }
  return {
    version: 2,
    parametres: {
      devise: o.parametres?.devise ?? 'EUR',
      langue: o.parametres?.langue ?? 'fr-FR',
      premierMois,
      note: o.parametres?.note,
    },
    revenus: Array.isArray(o.revenus) ? o.revenus : [],
    charges: o.charges,
    enveloppes,
    comptes: o.comptes,
    depenses: Array.isArray(o.depenses) ? o.depenses : [],
    rentrees: Array.isArray(o.rentrees) ? o.rentrees : [],
    clotures: Array.isArray(o.clotures) ? o.clotures : [],
    pourcentages,
    meta: {
      creeLe: o.meta?.creeLe ?? new Date().toISOString(),
      derniereSauvegarde: o.meta?.derniereSauvegarde ?? null,
      derniereEnveloppe: o.meta?.derniereEnveloppe ?? 'besoins',
    },
  };
}

/** Les données initiales (03_donnees_initiales.json), prêtes à l'emploi. */
export function donneesInitiales(): Donnees {
  // On fait une copie profonde pour ne jamais modifier le fichier d'origine en mémoire.
  const copie = JSON.parse(JSON.stringify(initiales)) as Record<string, unknown>;
  delete copie.valeursDeControle; // ne sert qu'aux tests
  return normaliser(copie);
}

/** Texte JSON de la sauvegarde. */
export function versJson(d: Donnees): string {
  return JSON.stringify(d, null, 2);
}

/** Lit un texte JSON de sauvegarde. */
export function depuisJson(texte: string): Donnees {
  let brut: unknown;
  try {
    brut = JSON.parse(texte);
  } catch {
    throw new Error("Le fichier n'est pas un JSON valide.");
  }
  return normaliser(brut);
}
