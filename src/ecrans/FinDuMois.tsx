// Bloc « Fin du mois » : clôture du mois et choix du surplus.
import { useState } from 'react';
import type { Mois } from '../types';
import { useBudget } from '../etat';
import { clotureDu, epargneRestante, montantACloturer, COMPTE_COURANT } from '../calculs';
import { euros, lireMontant, montantPourChamp, versCentimes } from '../format';
import { ajouterMois, aujourdhui, dernierJour, moisCourant, nomMois } from '../mois';
import { annulerCloture, cloturer } from '../actions';

type Decision = 'reporter' | 'virer' | 'partager';

export function FinDuMois({ mois }: { mois: Mois }) {
  const { d, modifier, message } = useBudget();
  const comptesEpargne = d.comptes.filter((c) => c.id !== COMPTE_COURANT);
  const [decision, setDecision] = useState<Decision>('reporter');
  const [compteId, setCompteId] = useState(
    comptesEpargne.find((c) => c.id === 'livret-a')?.id ?? comptesEpargne[0]?.id ?? '',
  );
  const [partTexte, setPartTexte] = useState('');

  const cloture = clotureDu(d, mois);
  const suivant = ajouterMois(mois, 1);
  const nomCompte = (id: string | null) => d.comptes.find((c) => c.id === id)?.nom ?? '';

  // Mois déjà clôturé : on affiche ce qui a été décidé.
  if (cloture) {
    const vire = versCentimes(cloture.montantVire);
    const reporte = versCentimes(cloture.montantReporte);
    const suivantCloture = clotureDu(d, suivant);
    return (
      <section className="carte">
        <h3>Fin du mois · {nomMois(mois)} clôturé ✓</h3>
        <p>
          {versCentimes(cloture.surplus) === 0 && 'Il ne restait rien à répartir.'}
          {vire > 0 && <>{euros(vire)} virés sur {nomCompte(cloture.versCompteId)}. </>}
          {reporte > 0 && <>{euros(reporte)} reportés sur {nomMois(suivant)}.</>}
        </p>
        <button className="bouton-secondaire" onClick={() => {
          if (suivantCloture) {
            window.alert(`Annule d'abord la clôture de ${nomMois(suivant)}.`);
            return;
          }
          if (window.confirm(`Annuler la clôture de ${nomMois(mois)} ?`)) {
            modifier((x) => annulerCloture(x, mois));
            message('Clôture annulée');
          }
        }}>
          Annuler la clôture
        </button>
      </section>
    );
  }

  // Le bloc n'apparaît qu'à partir du dernier jour du mois (ou pour un mois passé).
  const courant = moisCourant();
  const visible =
    (mois < courant && mois >= d.parametres.premierMois) ||
    (mois === courant && aujourdhui() === dernierJour(mois));
  if (!visible) return null;

  const total = montantACloturer(d, mois);
  const dontEpargne = epargneRestante(d, mois);
  const part = Math.min(total, lireMontant(partTexte) ?? 0);
  const pasDeCompte = comptesEpargne.length === 0;

  let vire = 0;
  if (decision === 'virer') vire = total;
  if (decision === 'partager') vire = part;
  const reporte = total - vire;

  let phrase = '';
  if (total === 0) phrase = 'Rien à reporter ni à virer.';
  else if (vire === 0) phrase = `${euros(reporte)} seront ajoutés à ${nomMois(suivant)}.`;
  else if (reporte === 0) phrase = `${euros(vire)} iront sur ${nomCompte(compteId)}.`;
  else phrase = `${euros(vire)} iront sur ${nomCompte(compteId)}, ${euros(reporte)} seront ajoutés à ${nomMois(suivant)}.`;

  return (
    <section className="carte carte-fin-mois">
      <h3>Fin du mois</h3>
      <p>
        Il te reste <strong className="positif">{euros(total)}</strong>
        {dontEpargne > 0 && <span className="texte-secondaire"> (dont {euros(dontEpargne)} d'épargne)</span>}.
        {total > 0 && ' Qu\'en fais-tu ?'}
      </p>

      {total > 0 && (
        <div className="options-fin">
          <button className={decision === 'reporter' ? 'actif' : ''} onClick={() => setDecision('reporter')}>
            <strong>Reporter</strong><span>sur {nomMois(suivant)}</span>
          </button>
          <button className={decision === 'virer' ? 'actif' : ''} disabled={pasDeCompte} onClick={() => setDecision('virer')}>
            <strong>{nomCompte(compteId) || 'Épargne'}</strong><span>tout virer</span>
          </button>
          <button className={decision === 'partager' ? 'actif' : ''} disabled={pasDeCompte} onClick={() => {
            setDecision('partager');
            if (!partTexte) setPartTexte(montantPourChamp(Math.round(total / 2)));
          }}>
            <strong>Partager</strong><span>un peu des deux</span>
          </button>
        </div>
      )}

      {total > 0 && decision !== 'reporter' && comptesEpargne.length > 1 && (
        <label className="champ">
          <span className="champ-libelle">Vers quel compte ?</span>
          <select value={compteId} onChange={(e) => setCompteId(e.target.value)}>
            {comptesEpargne.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </label>
      )}

      {total > 0 && decision === 'partager' && (
        <label className="champ">
          <span className="champ-libelle">Part à virer sur {nomCompte(compteId)} (€)</span>
          <input inputMode="decimal" value={partTexte} onChange={(e) => setPartTexte(e.target.value)} />
        </label>
      )}

      <p className="texte-secondaire">{phrase}</p>
      <button className="bouton-principal" onClick={() => {
        modifier((x) => cloturer(x, mois, vire > 0 ? compteId : null, vire));
        message(`${nomMois(mois)[0].toUpperCase()}${nomMois(mois).slice(1)} clôturé`);
      }}>
        Clôturer {nomMois(mois)}
      </button>
    </section>
  );
}
