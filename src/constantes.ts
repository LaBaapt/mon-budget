// Listes fixes utilisées dans l'interface.
import type { IdEnveloppe, TypeCompte } from './types';

export const ENVELOPPES: { id: IdEnveloppe; nom: string; couleur: string }[] = [
  { id: 'besoins', nom: 'Besoins', couleur: '#4F7CFF' },
  { id: 'epargne', nom: 'Épargne', couleur: '#A78BFA' },
  { id: 'plaisir', nom: 'Plaisir', couleur: '#F472B6' },
];

export function enveloppe(id: IdEnveloppe) {
  return ENVELOPPES.find((e) => e.id === id)!;
}

/** Catégories de charges, dans l'ordre d'affichage. */
export const CATEGORIES = [
  'Logement', 'Assurances', 'Crédits', 'Abonnements', 'Transport', 'Vie courante', 'Banque', 'Impôts',
];

export const TYPES_COMPTE: { valeur: TypeCompte; libelle: string }[] = [
  { valeur: 'epargne', libelle: 'Épargne' },
  { valeur: 'investissement', libelle: 'Investissement' },
  { valeur: 'retraite', libelle: 'Retraite' },
  { valeur: 'autre', libelle: 'Autre' },
];

export function libelleTypeCompte(t: TypeCompte): string {
  if (t === 'courant') return 'Compte courant';
  return TYPES_COMPTE.find((x) => x.valeur === t)?.libelle ?? t;
}

/** Nombre de jours sans sauvegarde avant d'afficher un rappel. */
export const JOURS_RAPPEL_SAUVEGARDE = 30;
