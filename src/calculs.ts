// ===========================================================================
// RÈGLES DE CALCUL (section 6 du cahier des charges)
// Tout est calculé en CENTIMES ENTIERS. On n'arrondit qu'à l'affichage.
// Ces fonctions ne modifient jamais les données : elles ne font que calculer.
// ===========================================================================
import type { Charge, Donnees, IdEnveloppe, Mois, Rentree, Repartition } from './types';
import { versCentimes } from './format';
import { ajouterMois, dernierJour, moisDe, numeroMois, nomMois } from './mois';

/** Id du compte courant (son « solde », c'est le budget du mois). */
export const COMPTE_COURANT = 'courant';

/** Est-ce que la période [debut, fin] contient le mois m ? (fin null = sans fin) */
function dansLaPeriode(m: Mois, debut: Mois | null, fin: Mois | null): boolean {
  if (!debut) return false;
  return debut <= m && (fin === null || m <= fin);
}

/**
 * Une charge compte-t-elle dans le mois m ?
 * - mensuelle ou ponctuelle : debut <= m et (fin vide ou m <= fin)
 * - annuelle : même règle + le numéro du mois = moisAnnuel.
 *   Sans moisAnnuel (ou sans début), elle ne compte nulle part.
 */
export function chargeCompteDans(charge: Charge, m: Mois): boolean {
  if (!dansLaPeriode(m, charge.debut, charge.fin)) return false;
  if (charge.frequence === 'annuelle') {
    return charge.moisAnnuel != null && numeroMois(m) === charge.moisAnnuel;
  }
  return true;
}

/** Une charge annuelle sans mois renseigné (cas d'Amazon Prime) → alerte. */
export function chargeAnnuelleIncomplete(charge: Charge): boolean {
  return charge.frequence === 'annuelle' && (charge.moisAnnuel == null || !charge.debut);
}

/** Les charges qui comptent dans le mois m. */
export function chargesDuMois(d: Donnees, m: Mois): Charge[] {
  return d.charges.filter((c) => chargeCompteDans(c, m));
}

/** ChargesFixes(m) = somme des charges du mois (cigarettes incluses), en centimes. */
export function chargesFixes(d: Donnees, m: Mois): number {
  return chargesDuMois(d, m).reduce((total, c) => total + versCentimes(c.montant), 0);
}

/** Revenus réguliers (salaire…) actifs dans le mois m, en centimes. */
export function revenusDuMois(d: Donnees, m: Mois): number {
  return d.revenus
    .filter((r) => dansLaPeriode(m, r.debut, r.fin))
    .reduce((total, r) => total + versCentimes(r.montant), 0);
}

/** Rentrées vers le compte courant datées dans le mois m (reports inclus). */
export function rentreesCourantDuMois(d: Donnees, m: Mois): Rentree[] {
  return d.rentrees.filter((r) => r.versCompteId === COMPTE_COURANT && moisDe(r.date) === m);
}

/** Virements partis DU compte courant vers un autre compte, dans le mois m. */
export function sortiesCourantDuMois(d: Donnees, m: Mois): Rentree[] {
  return d.rentrees.filter((r) => r.depuisCompteId === COMPTE_COURANT && moisDe(r.date) === m);
}

/**
 * ResteÀRépartir(m) = revenus(m) + rentrées vers le compte courant en m (reports inclus)
 *                     − ChargesFixes(m)
 * (+ décision DECISIONS.md : un virement DEPUIS le compte courant vers un autre compte
 *  diminue le reste à répartir du mois.)
 */
export function resteARepartir(d: Donnees, m: Mois): number {
  const entrees = rentreesCourantDuMois(d, m).reduce((t, r) => t + versCentimes(r.montant), 0);
  const sorties = sortiesCourantDuMois(d, m).reduce((t, r) => t + versCentimes(r.montant), 0);
  return revenusDuMois(d, m) + entrees - sorties - chargesFixes(d, m);
}

/** Pourcentages par défaut (ceux des enveloppes des données initiales). */
function repartitionParDefaut(d: Donnees): Repartition {
  const b = d.enveloppes.find((e) => e.id === 'besoins')?.pourcentage ?? 60;
  const e = d.enveloppes.find((x) => x.id === 'epargne')?.pourcentage ?? 20;
  return { besoins: b, epargne: e };
}

/**
 * Pourcentages du mois m : ceux enregistrés pour m, sinon ceux du dernier mois
 * précédent qui en a, sinon ceux par défaut. Plaisir = 100 − Besoins − Épargne.
 */
export function repartitionDuMois(d: Donnees, m: Mois): Repartition & { plaisir: number } {
  let r = d.pourcentages[m];
  if (!r) {
    const precedents = Object.keys(d.pourcentages).filter((x) => x < m).sort();
    const dernier = precedents[precedents.length - 1];
    r = dernier ? d.pourcentages[dernier] : repartitionParDefaut(d);
  }
  return { besoins: r.besoins, epargne: r.epargne, plaisir: 100 - r.besoins - r.epargne };
}

/**
 * Montants prévus dans chaque enveloppe pour le mois m.
 * Base = max(0, ResteÀRépartir)
 * Besoins = Base × %B, Épargne = Base × %E (arrondis au centime)
 * Plaisir = Base − Besoins − Épargne (pour que la somme tombe juste)
 */
export function enveloppesPrevues(d: Donnees, m: Mois): Record<IdEnveloppe, number> {
  const base = Math.max(0, resteARepartir(d, m));
  const { besoins: pb, epargne: pe } = repartitionDuMois(d, m);
  const besoins = Math.round((base * pb) / 100);
  const epargne = Math.round((base * pe) / 100);
  return { besoins, epargne, plaisir: base - besoins - epargne };
}

/** Total dépensé dans chaque enveloppe pour le mois m, en centimes. */
export function depensesParEnveloppe(d: Donnees, m: Mois): Record<IdEnveloppe, number> {
  const total: Record<IdEnveloppe, number> = { besoins: 0, epargne: 0, plaisir: 0 };
  for (const dep of d.depenses) {
    if (moisDe(dep.date) === m) total[dep.enveloppeId] += versCentimes(dep.montant);
  }
  return total;
}

/**
 * « Il te reste à dépenser » = (Besoins prévus − dépenses Besoins)
 *                            + (Plaisir prévu − dépenses Plaisir)
 *                            + min(0, ResteÀRépartir)
 */
export function resteADepenser(d: Donnees, m: Mois): number {
  const prevu = enveloppesPrevues(d, m);
  const depense = depensesParEnveloppe(d, m);
  return (
    prevu.besoins - depense.besoins +
    (prevu.plaisir - depense.plaisir) +
    Math.min(0, resteARepartir(d, m))
  );
}

/** Surplus de fin de mois = max(0, « Il te reste à dépenser »). */
export function surplusFinDeMois(d: Donnees, m: Mois): number {
  return Math.max(0, resteADepenser(d, m));
}

/** Ce qui reste dans l'enveloppe Épargne à la fin du mois (jamais négatif). */
export function epargneRestante(d: Donnees, m: Mois): number {
  return Math.max(0, enveloppesPrevues(d, m).epargne - depensesParEnveloppe(d, m).epargne);
}

/** Montant proposé à la clôture = surplus + épargne restante (même bloc). */
export function montantACloturer(d: Donnees, m: Mois): number {
  return surplusFinDeMois(d, m) + epargneRestante(d, m);
}

/** La clôture du mois m, si le mois est clôturé. */
export function clotureDu(d: Donnees, m: Mois) {
  return d.clotures.find((c) => c.mois === m) ?? null;
}

// ---------------------------------------------------------------------------
// Comptes
// ---------------------------------------------------------------------------

/** Un mouvement dans l'historique d'un compte. */
export interface Mouvement {
  id: string;
  date: string;
  libelle: string;
  montant: number; // centimes, positif = entrée, négatif = sortie
  rentreeId?: string; // si le mouvement vient d'une rentrée (supprimable)
}

function nomCompte(d: Donnees, id: string | null): string {
  if (id === null) return 'Autres';
  return d.comptes.find((c) => c.id === id)?.nom ?? id;
}

/** Historique d'un compte : rentrées, virements et clôtures, du plus récent au plus ancien. */
export function mouvementsCompte(d: Donnees, compteId: string): Mouvement[] {
  const liste: Mouvement[] = [];
  for (const r of d.rentrees) {
    if (r.versCompteId === compteId) {
      const origine = r.depuisCompteId ? `Depuis ${nomCompte(d, r.depuisCompteId)}` : 'Rentrée';
      liste.push({
        id: `${r.id}-vers`,
        date: r.date,
        libelle: r.libelle ? `${r.libelle}` : origine,
        montant: versCentimes(r.montant),
        rentreeId: r.type === 'report' ? undefined : r.id,
      });
    }
    if (r.depuisCompteId === compteId) {
      liste.push({
        id: `${r.id}-depuis`,
        date: r.date,
        libelle: `Virement vers ${nomCompte(d, r.versCompteId)}${r.libelle ? ` · ${r.libelle}` : ''}`,
        montant: -versCentimes(r.montant),
        rentreeId: r.id,
      });
    }
  }
  for (const c of d.clotures) {
    if (c.versCompteId === compteId && c.montantVire > 0) {
      liste.push({
        id: `cloture-${c.mois}`,
        date: dernierJour(c.mois),
        libelle: `Clôture de ${nomMois(c.mois)} ${c.mois.slice(0, 4)}`,
        montant: versCentimes(c.montantVire),
      });
    }
  }
  return liste.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/**
 * Solde d'un compte d'épargne = solde de départ + rentrées vers ce compte
 *                             − rentrées depuis ce compte + virements de clôture.
 */
export function soldeCompte(d: Donnees, compteId: string): number {
  const compte = d.comptes.find((c) => c.id === compteId);
  const depart = versCentimes(compte?.solde ?? 0);
  return mouvementsCompte(d, compteId).reduce((t, mv) => t + mv.montant, depart);
}

/**
 * Le prochain mois où le total des charges fixes change (cherche sur 36 mois).
 * Sert à afficher « À partir de janv. 2027 : … » sur l'écran Charges fixes.
 */
export function prochainChangementCharges(d: Donnees, m: Mois) {
  const actuel = chargesFixes(d, m);
  for (let i = 1; i <= 36; i++) {
    const suivant = ajouterMois(m, i);
    const total = chargesFixes(d, suivant);
    if (total !== actuel) return { mois: suivant, total };
  }
  return null;
}
