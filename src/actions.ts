// ACTIONS : toutes les modifications des données passent par ici.
// Chaque fonction reçoit une copie des données (« d ») et la modifie directement.
// (La copie est faite dans etat.tsx, avant l'appel.)
import type { Charge, Compte, Depense, Donnees, Mois, Rentree, Revenu } from './types';
import { COMPTE_COURANT, montantACloturer } from './calculs';
import { versEuros } from './format';
import { ajouterMois, nomMois } from './mois';

/** Ajoute ou remplace un élément (même id) dans une liste. */
function enregistrerDans<T extends { id: string }>(liste: T[], element: T) {
  const i = liste.findIndex((x) => x.id === element.id);
  if (i >= 0) liste[i] = element;
  else liste.push(element);
}

// --- Dépenses ---------------------------------------------------------------
export function enregistrerDepense(d: Donnees, dep: Depense) {
  enregistrerDans(d.depenses, dep);
  d.meta.derniereEnveloppe = dep.enveloppeId;
}
export function supprimerDepense(d: Donnees, id: string) {
  d.depenses = d.depenses.filter((x) => x.id !== id);
}

// --- Rentrées ---------------------------------------------------------------
/** Ajoute une rentrée, ou remplace celle qui a le même id (modification). */
export function enregistrerRentree(d: Donnees, r: Rentree) {
  enregistrerDans(d.rentrees, r);
}
export function supprimerRentree(d: Donnees, id: string) {
  d.rentrees = d.rentrees.filter((x) => x.id !== id);
}

// --- Charges fixes ----------------------------------------------------------
export function enregistrerCharge(d: Donnees, c: Charge) {
  enregistrerDans(d.charges, c);
}
export function supprimerCharge(d: Donnees, id: string) {
  d.charges = d.charges.filter((x) => x.id !== id);
}

// --- Revenus ----------------------------------------------------------------
export function enregistrerRevenu(d: Donnees, r: Revenu) {
  enregistrerDans(d.revenus, r);
}
export function supprimerRevenu(d: Donnees, id: string) {
  d.revenus = d.revenus.filter((x) => x.id !== id);
}

// --- Comptes ----------------------------------------------------------------
export function enregistrerCompte(d: Donnees, c: Compte) {
  enregistrerDans(d.comptes, c);
}
export function supprimerCompte(d: Donnees, id: string) {
  if (id === COMPTE_COURANT) return; // le compte courant ne se supprime pas
  d.comptes = d.comptes.filter((x) => x.id !== id);
}

// --- Répartition ------------------------------------------------------------
/** Mémorise les pourcentages Besoins / Épargne du mois m (Plaisir = le reste). */
export function changerRepartition(d: Donnees, m: Mois, besoins: number, epargne: number) {
  if (besoins < 0 || epargne < 0 || besoins + epargne > 100) return; // total > 100 interdit
  d.pourcentages[m] = { besoins, epargne };
}

// --- Clôture de fin de mois -------------------------------------------------
/** Id de la rentrée « Report de … » créée par la clôture du mois m. */
export function idReport(m: Mois): string {
  return `report-${m}`;
}

/**
 * Clôture le mois m.
 * - montantVire (centimes) part sur le compte « versCompteId » (son solde augmente) ;
 * - le reste est reporté : une rentrée « Report de <mois> » est créée
 *   sur le compte courant, le 1er du mois suivant.
 */
export function cloturer(d: Donnees, m: Mois, versCompteId: string | null, montantVire: number) {
  const total = montantACloturer(d, m);
  const vire = versCompteId ? Math.min(Math.max(0, montantVire), total) : 0;
  const reporte = total - vire;
  d.clotures = d.clotures.filter((c) => c.mois !== m);
  d.clotures.push({
    mois: m,
    surplus: versEuros(total),
    versCompteId: vire > 0 ? versCompteId : null,
    montantVire: versEuros(vire),
    montantReporte: versEuros(reporte),
  });
  d.rentrees = d.rentrees.filter((r) => r.id !== idReport(m));
  if (reporte > 0) {
    d.rentrees.push({
      id: idReport(m),
      date: `${ajouterMois(m, 1)}-01`,
      montant: versEuros(reporte),
      versCompteId: COMPTE_COURANT,
      depuisCompteId: null,
      libelle: `Report de ${nomMois(m)}`,
      type: 'report',
    });
  }
}

/** Annule la clôture du mois m (et le report qu'elle avait créé). */
export function annulerCloture(d: Donnees, m: Mois) {
  d.clotures = d.clotures.filter((c) => c.mois !== m);
  d.rentrees = d.rentrees.filter((r) => r.id !== idReport(m));
}
