// Tests des règles de calcul avec les valeurs de contrôle du cahier des charges.
// Lancer : npm test
import { describe, expect, it } from 'vitest';
import initiales from '../03_donnees_initiales.json';
import { donneesInitiales } from './donnees';
import {
  chargeCompteDans, chargesFixes, enveloppesPrevues, montantACloturer, repartitionDuMois,
  resteADepenser, resteARepartir, soldeCompte, surplusFinDeMois,
} from './calculs';
import { versCentimes, euros, lireMontant } from './format';
import { ajouterMois } from './mois';
import type { Charge, Donnees } from './types';

const controle = initiales.valeursDeControle as unknown as Record<
  string,
  { chargesFixes: number; resteARepartir: number; besoins: number; epargne: number; plaisir: number }
>;
const moisControles = Object.keys(controle).filter((k) => k !== 'note');

describe('Valeurs de contrôle (aucune dépense ni rentrée, 60 / 20 / 20)', () => {
  const d = donneesInitiales();
  for (const m of moisControles) {
    const attendu = controle[m];
    it(`${m}`, () => {
      expect(chargesFixes(d, m)).toBe(versCentimes(attendu.chargesFixes));
      expect(resteARepartir(d, m)).toBe(versCentimes(attendu.resteARepartir));
      const env = enveloppesPrevues(d, m);
      expect(env.besoins).toBe(versCentimes(attendu.besoins));
      expect(env.epargne).toBe(versCentimes(attendu.epargne));
      expect(env.plaisir).toBe(versCentimes(attendu.plaisir));
    });
  }

  it('il y a bien 5 mois de contrôle', () => {
    expect(moisControles).toEqual(['2026-12', '2027-01', '2027-02', '2027-03', '2027-04']);
  });
});

describe('Exemple : rentrée de 300 € en décembre depuis « Autres »', () => {
  const d = donneesInitiales();
  d.rentrees.push({
    id: 'r1', date: '2026-12-10', montant: 300, versCompteId: 'courant', depuisCompteId: null, libelle: 'Gain',
  });
  it('reste à répartir 280,91 € et enveloppes 168,55 / 56,18 / 56,18', () => {
    expect(resteARepartir(d, '2026-12')).toBe(28091);
    expect(enveloppesPrevues(d, '2026-12')).toEqual({ besoins: 16855, epargne: 5618, plaisir: 5618 });
  });
  it("ne touche pas les autres mois", () => {
    expect(resteARepartir(d, '2027-01')).toBe(11406);
  });
});

describe('Il te reste à dépenser', () => {
  it('décembre sans rien : −19,09 € (le manque est déduit)', () => {
    const d = donneesInitiales();
    expect(resteADepenser(d, '2026-12')).toBe(-1909);
    expect(surplusFinDeMois(d, '2026-12')).toBe(0);
  });
  it('janvier : besoins + plaisir restants, moins les dépenses', () => {
    const d = donneesInitiales();
    expect(resteADepenser(d, '2027-01')).toBe(6844 + 2281);
    d.depenses.push({ id: 'd1', date: '2027-01-05', montant: 50, enveloppeId: 'besoins' });
    d.depenses.push({ id: 'd2', date: '2027-01-06', montant: 10.5, enveloppeId: 'plaisir' });
    d.depenses.push({ id: 'd3', date: '2027-01-07', montant: 2, enveloppeId: 'epargne' });
    expect(resteADepenser(d, '2027-01')).toBe(6844 + 2281 - 5000 - 1050);
    // surplus + épargne restante proposés à la clôture
    expect(montantACloturer(d, '2027-01')).toBe(6844 + 2281 - 5000 - 1050 + (2281 - 200));
  });
});

describe('Charges', () => {
  const base: Charge = { id: 'x', nom: 'X', categorie: 'Abonnements', frequence: 'annuelle', montant: 10, debut: '2027-01', fin: null };
  it("une annuelle sans moisAnnuel ne compte nulle part (Amazon Prime)", () => {
    expect(chargeCompteDans({ ...base, moisAnnuel: null }, '2027-01')).toBe(false);
  });
  it('une annuelle compte seulement dans son mois', () => {
    const c = { ...base, moisAnnuel: 4 };
    expect(chargeCompteDans(c, '2027-04')).toBe(true);
    expect(chargeCompteDans(c, '2027-05')).toBe(false);
    expect(chargeCompteDans(c, '2028-04')).toBe(true);
    expect(chargeCompteDans({ ...c, debut: '2027-05' }, '2027-04')).toBe(false);
  });
  it('la date de fin est incluse', () => {
    const c: Charge = { ...base, frequence: 'mensuelle', debut: '2026-12', fin: '2027-02' };
    expect(chargeCompteDans(c, '2027-02')).toBe(true);
    expect(chargeCompteDans(c, '2027-03')).toBe(false);
    expect(chargeCompteDans(c, '2026-11')).toBe(false);
  });
});

describe('Répartition par mois', () => {
  it('un nouveau mois reprend les pourcentages du mois précédent', () => {
    const d: Donnees = donneesInitiales();
    d.pourcentages['2027-02'] = { besoins: 50, epargne: 30 };
    expect(repartitionDuMois(d, '2027-01')).toEqual({ besoins: 60, epargne: 20, plaisir: 20 });
    expect(repartitionDuMois(d, '2027-05')).toEqual({ besoins: 50, epargne: 30, plaisir: 20 });
  });
});

describe('Comptes', () => {
  it('solde = départ + rentrées vers − rentrées depuis + clôtures', () => {
    const d = donneesInitiales();
    d.rentrees.push({ id: 'a', date: '2027-01-02', montant: 100, versCompteId: 'livret-a', depuisCompteId: 'per' });
    d.clotures.push({ mois: '2026-12', surplus: 50, versCompteId: 'livret-a', montantVire: 50, montantReporte: 0 });
    expect(soldeCompte(d, 'livret-a')).toBe(15000);
    expect(soldeCompte(d, 'per')).toBe(143000 - 10000);
  });
  it('un virement depuis le compte courant baisse le reste à répartir', () => {
    const d = donneesInitiales();
    d.rentrees.push({ id: 'b', date: '2027-01-02', montant: 14.06, versCompteId: 'livret-a', depuisCompteId: 'courant' });
    expect(resteARepartir(d, '2027-01')).toBe(10000);
  });
});

describe('Formats', () => {
  it('affiche les montants à la française', () => {
    expect(euros(152127)).toBe('1 521,27 €');
    expect(euros(-1909)).toBe('−19,09 €');
    expect(euros(0)).toBe('0,00 €');
  });
  it('lit les montants saisis', () => {
    expect(lireMontant('12,5')).toBe(1250);
    expect(lireMontant('0,07')).toBe(7);
    expect(lireMontant('1,234')).toBeNull();
  });
  it('calcule les mois', () => {
    expect(ajouterMois('2026-12', 1)).toBe('2027-01');
    expect(ajouterMois('2027-01', -1)).toBe('2026-12');
  });
});
