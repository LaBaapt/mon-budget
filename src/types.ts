// Types des données de l'app (même forme que 03_donnees_initiales.json).
// Les montants sont stockés en euros (ex. 152.08) ;
// tous les calculs, eux, se font en centimes entiers (voir calculs.ts).

/** Un mois au format "AAAA-MM", par exemple "2026-12". */
export type Mois = string;

export interface Revenu {
  id: string;
  nom: string;
  montant: number;
  debut: Mois;
  fin: Mois | null; // dernier mois inclus, null = sans fin
  note?: string | null;
}

export type Frequence = 'mensuelle' | 'annuelle' | 'ponctuelle';

export interface Charge {
  id: string;
  nom: string;
  categorie: string;
  frequence: Frequence;
  montant: number;
  debut: Mois | null;
  fin: Mois | null;
  moisAnnuel?: number | null; // 1 à 12, pour les charges annuelles
  note?: string | null;
}

export type IdEnveloppe = 'besoins' | 'epargne' | 'plaisir';

export interface Enveloppe {
  id: IdEnveloppe;
  nom: string;
  pourcentage: number | null;
  calcul?: string;
  note?: string | null;
}

export type TypeCompte = 'courant' | 'epargne' | 'investissement' | 'retraite' | 'autre';

export interface Compte {
  id: string;
  nom: string;
  type: TypeCompte;
  banque?: string;
  solde: number | null; // solde de départ (null pour le compte courant)
  note?: string | null;
}

export interface Depense {
  id: string;
  date: string; // "AAAA-MM-JJ"
  montant: number;
  enveloppeId: IdEnveloppe;
  libelle?: string;
}

export interface Rentree {
  id: string;
  date: string; // "AAAA-MM-JJ"
  montant: number;
  versCompteId: string; // "courant" = budget du mois
  depuisCompteId: string | null; // null = « Autres »
  libelle?: string;
  type?: 'rentree' | 'report'; // "report" = créé par une clôture
}

export interface Cloture {
  mois: Mois;
  surplus: number;
  versCompteId: string | null;
  montantVire: number;
  montantReporte: number;
}

/** Pourcentages choisis pour un mois (Plaisir = le reste). */
export interface Repartition {
  besoins: number;
  epargne: number;
}

/** Toutes les données de l'app, telles qu'enregistrées sur l'appareil. */
export interface Donnees {
  version: number;
  parametres: {
    devise: string;
    langue: string;
    premierMois: Mois;
    note?: string;
  };
  revenus: Revenu[];
  charges: Charge[];
  enveloppes: Enveloppe[];
  comptes: Compte[];
  depenses: Depense[];
  rentrees: Rentree[];
  clotures: Cloture[];
  /** Pourcentages par mois : { "2026-12": { besoins: 60, epargne: 20 } } */
  pourcentages: Record<Mois, Repartition>;
  /** Informations pratiques (dernière sauvegarde, etc.) */
  meta: {
    creeLe: string; // date ISO de la première ouverture
    derniereSauvegarde: string | null; // date ISO du dernier export
    derniereEnveloppe: IdEnveloppe; // présélectionnée dans « Ajouter »
  };
}
