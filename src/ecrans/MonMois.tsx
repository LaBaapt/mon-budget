// Écran « Mon mois » (accueil).
import { useState } from 'react';
import type { Depense, IdEnveloppe, Mois } from '../types';
import { useBudget } from '../etat';
import {
  chargesFixes, depensesParEnveloppe, enveloppesPrevues, repartitionDuMois, rentreesCourantDuMois,
  resteADepenser, resteARepartir, sortiesCourantDuMois,
} from '../calculs';
import { euros, versCentimes } from '../format';
import { libelleDate, moisDe, nomMois } from '../mois';
import { ENVELOPPES, JOURS_RAPPEL_SAUVEGARDE, enveloppe } from '../constantes';
import { changerRepartition, supprimerDepense, supprimerRentree } from '../actions';
import { Barre, Panneau, SelecteurMois } from '../composants/Communs';
import { IconeCroix, IconeDroite, IconeReglages } from '../composants/Icones';
import { FinDuMois } from './FinDuMois';

export interface OuvrirAjouter {
  (options: { mode: 'depense' | 'rentree'; depense?: Depense }): void;
}

export function MonMois(props: {
  mois: Mois;
  setMois: (m: Mois) => void;
  ouvrirAjouter: OuvrirAjouter;
  allerCharges: () => void;
  ouvrirReglages: () => void;
}) {
  const { d, modifier, message } = useBudget();
  const { mois } = props;
  const [enveloppeOuverte, setEnveloppeOuverte] = useState<IdEnveloppe | null>(null);

  const reste = resteARepartir(d, mois);
  const aDepenser = resteADepenser(d, mois);
  const prevu = enveloppesPrevues(d, mois);
  const depense = depensesParEnveloppe(d, mois);
  const pct = repartitionDuMois(d, mois);
  const base = Math.max(0, reste);

  // Revenus réguliers actifs ce mois-ci (une ligne chacun)
  const revenus = d.revenus.filter((r) => r.debut <= mois && (r.fin === null || mois <= r.fin));
  const entrees = rentreesCourantDuMois(d, mois);
  const sorties = sortiesCourantDuMois(d, mois);
  const nomCompte = (id: string | null) => (id ? d.comptes.find((c) => c.id === id)?.nom ?? id : 'Autres');

  // Rappel de sauvegarde si aucun export depuis 30 jours
  const reference = d.meta.derniereSauvegarde ?? d.meta.creeLe;
  const joursSansSauvegarde = (Date.now() - new Date(reference).getTime()) / 86_400_000;

  function supprimer(id: string, libelle: string) {
    if (window.confirm(`Supprimer « ${libelle} » ?`)) {
      modifier((x) => supprimerRentree(x, id));
      message('Supprimé');
    }
  }

  function changerPct(env: 'besoins' | 'epargne', delta: number) {
    const b = env === 'besoins' ? pct.besoins + delta : pct.besoins;
    const e = env === 'epargne' ? pct.epargne + delta : pct.epargne;
    if (b < 0 || e < 0 || b + e > 100) return;
    modifier((x) => changerRepartition(x, mois, b, e));
  }

  return (
    <div className="ecran">
      <header className="entete">
        <SelecteurMois mois={mois} onChange={props.setMois} min={d.parametres.premierMois} />
        <button className="bouton-icone" aria-label="Réglages" onClick={props.ouvrirReglages}>
          <IconeReglages />
        </button>
      </header>

      {joursSansSauvegarde > JOURS_RAPPEL_SAUVEGARDE && (
        <button className="rappel" onClick={props.ouvrirReglages}>
          Pense à faire une sauvegarde de tes données →
        </button>
      )}

      {/* Le gros chiffre */}
      <section className="carte carte-heros">
        <div className="texte-secondaire">Il te reste à dépenser</div>
        <div className={`gros-chiffre ${aDepenser < 0 ? 'negatif' : 'positif'}`}>{euros(aDepenser)}</div>
        <div className="texte-secondaire petit">Besoins + plaisir restants. L'épargne est mise de côté à part.</div>
      </section>

      {/* Résumé */}
      <section className="carte">
        <h3>Résumé</h3>
        {revenus.length === 0 && (
          <div className="ligne"><span>Salaire</span><span>{euros(0)}</span></div>
        )}
        {revenus.map((r) => (
          <div className="ligne" key={r.id}><span>{r.nom}</span><span>{euros(versCentimes(r.montant))}</span></div>
        ))}
        {entrees.map((r) => (
          <div className="ligne positif" key={r.id}>
            <span>{r.libelle || `Rentrée depuis ${nomCompte(r.depuisCompteId)}`}</span>
            <span className="ligne-droite">
              {euros(versCentimes(r.montant), true)}
              {r.type !== 'report' && (
                <button className="bouton-croix" aria-label="Supprimer" onClick={() => supprimer(r.id, r.libelle || 'cette rentrée')}>
                  <IconeCroix />
                </button>
              )}
            </span>
          </div>
        ))}
        {sorties.map((r) => (
          <div className="ligne negatif" key={r.id}>
            <span>Virement vers {nomCompte(r.versCompteId)}</span>
            <span className="ligne-droite">
              {euros(-versCentimes(r.montant))}
              <button className="bouton-croix" aria-label="Supprimer" onClick={() => supprimer(r.id, 'ce virement')}>
                <IconeCroix />
              </button>
            </span>
          </div>
        ))}
        <button className="ligne ligne-cliquable" onClick={props.allerCharges}>
          <span>Charges fixes</span>
          <span className="ligne-droite">{euros(-chargesFixes(d, mois))}<IconeDroite taille={16} /></span>
        </button>
        <div className="separateur" />
        <div className={`ligne gras ${reste < 0 ? 'negatif' : ''}`}>
          <span>Reste à répartir</span><span>{euros(reste)}</span>
        </div>
      </section>

      {reste < 0 && (
        <section className="encart-rouge">
          Il manque <strong>{euros(-reste)}</strong> pour couvrir tes charges fixes ce mois-ci.
          Tes enveloppes sont à zéro tant que ce n'est pas comblé.
          <button className="lien" onClick={() => props.ouvrirAjouter({ mode: 'rentree' })}>
            Ajouter une rentrée d'argent →
          </button>
        </section>
      )}

      {/* Enveloppes */}
      <section className="carte">
        <h3>Mes enveloppes</h3>
        {ENVELOPPES.map((e) => (
          <button key={e.id} className="enveloppe" onClick={() => setEnveloppeOuverte(e.id)}>
            <div className="ligne">
              <span><span className="pastille" style={{ background: e.couleur }} />{e.nom} <span className="texte-secondaire">{pct[e.id]} %</span></span>
              <span className="ligne-droite">
                <span><strong>{euros(depense[e.id])}</strong> <span className="texte-secondaire">/ {euros(prevu[e.id])}</span></span>
                <IconeDroite taille={16} />
              </span>
            </div>
            <Barre depense={depense[e.id]} prevu={prevu[e.id]} couleur={e.couleur} />
          </button>
        ))}
      </section>

      {/* Répartition */}
      <section className="carte">
        <div className="ligne">
          <h3>Répartition</h3>
          <span className="repartition-resume">{pct.besoins} / {pct.epargne} / {pct.plaisir}</span>
        </div>
        {(['besoins', 'epargne'] as const).map((id) => (
          <div className="ligne ligne-repartition" key={id}>
            <span><span className="pastille" style={{ background: enveloppe(id).couleur }} />{enveloppe(id).nom}
              <span className="texte-secondaire petit bloc">{euros(Math.round((base * pct[id]) / 100))}</span>
            </span>
            <span className="compteur">
              <button aria-label="Moins 5 %" disabled={pct[id] < 5} onClick={() => changerPct(id, -5)}>−</button>
              <span>{pct[id]} %</span>
              <button aria-label="Plus 5 %" disabled={pct.besoins + pct.epargne + 5 > 100} onClick={() => changerPct(id, 5)}>+</button>
            </span>
          </div>
        ))}
        <div className="ligne ligne-repartition">
          <span><span className="pastille" style={{ background: enveloppe('plaisir').couleur }} />Plaisir
            <span className="texte-secondaire petit bloc">le reste, automatiquement · {euros(prevu.plaisir)}</span>
          </span>
          <span className="compteur"><span>{pct.plaisir} %</span></span>
        </div>
      </section>

      <FinDuMois mois={mois} />

      {enveloppeOuverte && (
        <DetailEnveloppe
          id={enveloppeOuverte}
          mois={mois}
          onFermer={() => setEnveloppeOuverte(null)}
          onModifier={(dep) => props.ouvrirAjouter({ mode: 'depense', depense: dep })}
          onSupprimer={(dep) => {
            if (window.confirm('Supprimer cette dépense ?')) {
              modifier((x) => supprimerDepense(x, dep.id));
              message('Dépense supprimée');
            }
          }}
        />
      )}
    </div>
  );
}

/** Liste des dépenses d'une enveloppe pour le mois. */
function DetailEnveloppe(props: {
  id: IdEnveloppe;
  mois: Mois;
  onFermer: () => void;
  onModifier: (d: Depense) => void;
  onSupprimer: (d: Depense) => void;
}) {
  const { d } = useBudget();
  const e = enveloppe(props.id);
  const liste = d.depenses
    .filter((x) => x.enveloppeId === props.id && moisDe(x.date) === props.mois)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const prevu = enveloppesPrevues(d, props.mois)[props.id];
  const depense = depensesParEnveloppe(d, props.mois)[props.id];

  return (
    <Panneau titre={`${e.nom} · ${nomMois(props.mois)}`} onFermer={props.onFermer}>
      <section className="carte">
        <div className="ligne"><span>Prévu</span><span>{euros(prevu)}</span></div>
        <div className="ligne"><span>Dépensé</span><span>{euros(depense)}</span></div>
        <div className={`ligne gras ${prevu - depense < 0 ? 'negatif' : ''}`}><span>Reste</span><span>{euros(prevu - depense)}</span></div>
        <Barre depense={depense} prevu={prevu} couleur={e.couleur} />
      </section>
      <section className="carte">
        <h3>Dépenses</h3>
        {liste.length === 0 && <p className="texte-secondaire">Aucune dépense ce mois-ci.</p>}
        {liste.map((dep) => (
          <div className="ligne" key={dep.id}>
            <button className="ligne-texte" onClick={() => props.onModifier(dep)}>
              <span>{dep.libelle || 'Sans libellé'}</span>
              <span className="texte-secondaire petit bloc">{libelleDate(dep.date)} · modifier</span>
            </button>
            <span className="ligne-droite">
              {euros(-versCentimes(dep.montant))}
              <button className="bouton-croix" aria-label="Supprimer" onClick={() => props.onSupprimer(dep)}>
                <IconeCroix />
              </button>
            </span>
          </div>
        ))}
      </section>
    </Panneau>
  );
}

