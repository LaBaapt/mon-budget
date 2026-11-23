// Écran « Ajouter » : une dépense ou une rentrée d'argent, avec un grand pavé numérique.
import { useState } from 'react';
import type { Depense, Donnees, IdEnveloppe, Mois, Rentree } from '../types';
import { useBudget } from '../etat';
import { COMPTE_COURANT, depensesParEnveloppe, enveloppesPrevues, resteARepartir, soldeCompte } from '../calculs';
import { euros, montantPourChamp, versCentimes, versEuros } from '../format';
import { aujourdhui, moisCourant, moisDe } from '../mois';
import { ENVELOPPES, enveloppe } from '../constantes';
import { enregistrerDepense, enregistrerRentree, supprimerDepense, supprimerRentree } from '../actions';
import { nouvelId } from '../donnees';
import { Champ, Choix } from '../composants/Communs';
import { IconeCroix, IconeEffacer } from '../composants/Icones';

type Mode = 'depense' | 'rentree';
const AUTRES = 'autres'; // origine « Autres » (gain, prêt d'un ami…)

export function Ajouter(props: {
  mode: Mode;
  depense?: Depense; // si présent : on modifie cette dépense
  rentree?: Rentree; // si présent : on modifie cette rentrée
  moisAffiche: Mois;
  onFermer: () => void;
}) {
  const { d: donnees, modifier, message } = useBudget();
  const edition = props.depense;
  const editionRentree = props.rentree;
  const enEdition = Boolean(edition || editionRentree);

  // Pour les aperçus, on fait comme si l'opération modifiée n'existait pas encore
  // (sinon elle serait comptée deux fois).
  const d: Donnees = {
    ...donnees,
    depenses: donnees.depenses.filter((x) => x.id !== edition?.id),
    rentrees: donnees.rentrees.filter((x) => x.id !== editionRentree?.id),
  };
  const operation = edition ?? editionRentree;

  // Date par défaut : aujourd'hui si on regarde le mois en cours, sinon le 1er du mois affiché.
  const dateParDefaut = props.moisAffiche === moisCourant() ? aujourdhui() : `${props.moisAffiche}-01`;

  const [mode, setMode] = useState<Mode>(edition ? 'depense' : editionRentree ? 'rentree' : props.mode);
  const [saisie, setSaisie] = useState(operation ? montantPourChamp(versCentimes(operation.montant)) : '');
  const [enveloppeId, setEnveloppeId] = useState<IdEnveloppe>(edition?.enveloppeId ?? d.meta.derniereEnveloppe);
  const [libelle, setLibelle] = useState(operation?.libelle ?? '');
  const [date, setDate] = useState(operation?.date ?? dateParDefaut);
  const [vers, setVers] = useState(editionRentree?.versCompteId ?? COMPTE_COURANT);
  const [depuis, setDepuis] = useState<string>(editionRentree?.depuisCompteId ?? AUTRES);

  const montant = saisie === '' ? 0 : Math.round(parseFloat(saisie.replace(',', '.')) * 100) || 0;
  const mois = moisDe(date || dateParDefaut);
  const nomCompte = (id: string) => d.comptes.find((c) => c.id === id)?.nom ?? id;

  // --- Pavé numérique : virgule acceptée, 2 décimales maximum ---
  function touche(t: string) {
    if (t === '⌫') return setSaisie((s) => s.slice(0, -1));
    setSaisie((s) => {
      if (t === ',') return s.includes(',') ? s : (s === '' ? '0,' : s + ',');
      if (s.includes(',') && s.split(',')[1].length >= 2) return s; // déjà 2 décimales
      if (s.replace(',', '').length >= 8) return s; // assez de chiffres !
      if (s === '0') return t;
      return s + t;
    });
  }

  // --- Aide du mode Dépense ---
  const prevu = enveloppesPrevues(d, mois)[enveloppeId];
  const dejaDepense = depensesParEnveloppe(d, mois)[enveloppeId];
  const resteApres = prevu - dejaDepense - montant;

  // --- Aperçu du mode Rentrée ---
  const origineCompte = depuis === AUTRES ? null : depuis;
  // Pour le compte courant, on montre le reste à répartir du mois de la date choisie.
  const avantApres = (id: string) => (id === COMPTE_COURANT ? resteARepartir(d, mois) : soldeCompte(d, id));
  const destAvant = avantApres(vers);
  const origAvant = origineCompte ? avantApres(origineCompte) : 0;

  // Les origines possibles = les autres comptes que la destination, + « Autres »
  const origines = d.comptes.filter((c) => c.id !== vers);

  function changerVers(id: string) {
    setVers(id);
    if (depuis === id) setDepuis(AUTRES);
  }

  function valider() {
    if (montant <= 0) return message('Saisis un montant');
    if (!date) return message('Choisis une date');
    if (mode === 'depense') {
      modifier((x) => enregistrerDepense(x, {
        id: edition?.id ?? nouvelId('dep'),
        date,
        montant: versEuros(montant),
        enveloppeId,
        libelle: libelle.trim() || undefined,
      }));
      message(edition ? 'Dépense modifiée' : 'Dépense ajoutée');
    } else {
      modifier((x) => enregistrerRentree(x, {
        id: editionRentree?.id ?? nouvelId('ren'),
        date,
        montant: versEuros(montant),
        versCompteId: vers,
        depuisCompteId: origineCompte,
        libelle: libelle.trim() || undefined,
        type: 'rentree',
      }));
      message(editionRentree ? 'Rentrée modifiée' : 'Rentrée ajoutée');
    }
    props.onFermer();
  }

  return (
    <div className="panneau ajouter" role="dialog" aria-label="Ajouter">
      <header className="panneau-entete">
        <button className="bouton-icone" aria-label="Fermer" onClick={props.onFermer}><IconeCroix taille={22} /></button>
        {enEdition ? <h2>{edition ? 'Modifier la dépense' : 'Modifier la rentrée'}</h2> : (
          <Choix petit valeur={mode} onChange={setMode} options={[
            { valeur: 'depense', libelle: 'Dépense' },
            { valeur: 'rentree', libelle: "Rentrée d'argent" },
          ]} />
        )}
        <span className="bouton-icone" />
      </header>

      <div className="panneau-contenu">
        <div className={`montant-saisi ${mode === 'rentree' ? 'positif' : ''}`}>
          {saisie === '' ? '0' : saisie}&nbsp;€
        </div>

        {mode === 'depense' ? (
          <>
            <Choix valeur={enveloppeId} onChange={setEnveloppeId}
              options={ENVELOPPES.map((e) => ({ valeur: e.id, libelle: e.nom, couleur: e.couleur }))} />
            <p className={`aide ${resteApres < 0 ? 'negatif' : ''}`}>
              Reste dans « {enveloppe(enveloppeId).nom} » après cette dépense : <strong>{euros(resteApres)}</strong>
            </p>
            <Champ libelle="Libellé (facultatif)">
              <input value={libelle} onChange={(e) => setLibelle(e.target.value)} placeholder="Courses, essence…" />
            </Champ>
          </>
        ) : (
          <>
            <div className="deux-colonnes">
              <Champ libelle="Vers quel compte ?">
                <select value={vers} onChange={(e) => changerVers(e.target.value)}>
                  {d.comptes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </Champ>
              <Champ libelle="D'où vient l'argent ?">
                <select value={depuis} onChange={(e) => setDepuis(e.target.value)}>
                  {origines.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  <option value={AUTRES}>Autres</option>
                </select>
              </Champ>
            </div>
            <Champ libelle={depuis === AUTRES ? 'Précise (gain, prêt d\'un ami…)' : 'Libellé (facultatif)'}>
              <input value={libelle} onChange={(e) => setLibelle(e.target.value)}
                placeholder={depuis === AUTRES ? 'Gain, prêt d\'un ami…' : 'Virement…'} />
            </Champ>

            <div className="apercu">
              <div className="ligne">
                <span>{vers === COMPTE_COURANT ? 'Reste à répartir du mois' : nomCompte(vers)}</span>
                <span>{euros(destAvant)} → <strong className="positif">{euros(destAvant + montant)}</strong></span>
              </div>
              {origineCompte ? (
                <>
                  <div className={`ligne ${origAvant - montant < 0 ? 'negatif' : ''}`}>
                    <span>{origineCompte === COMPTE_COURANT ? 'Reste à répartir du mois' : nomCompte(origineCompte)}</span>
                    <span>{euros(origAvant)} → <strong>{euros(origAvant - montant)}</strong></span>
                  </div>
                  {origAvant - montant < 0 && (
                    <div className="negatif petit">Solde insuffisant sur {nomCompte(origineCompte)}</div>
                  )}
                </>
              ) : (
                <div className="texte-secondaire petit">Aucun autre compte débité</div>
              )}
            </div>
          </>
        )}

        <Champ libelle="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Champ>

      </div>

      <div className="panneau-pied">
        {/* Le pavé numérique reste toujours visible en bas, au-dessus du bouton */}
        <div className="pave">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫'].map((t) => (
            <button key={t} onClick={() => touche(t)} aria-label={t === '⌫' ? 'Effacer' : t}>
              {t === '⌫' ? <IconeEffacer /> : t}
            </button>
          ))}
        </div>
        <div className="ajouter-boutons">
          {enEdition && (
            <button className="bouton-danger" onClick={() => {
              if (!window.confirm(edition ? 'Supprimer cette dépense ?' : 'Supprimer cette rentrée ?')) return;
              if (edition) modifier((x) => supprimerDepense(x, edition.id));
              if (editionRentree) modifier((x) => supprimerRentree(x, editionRentree.id));
              message('Supprimé');
              props.onFermer();
            }}>Supprimer</button>
          )}
          <button className={mode === 'rentree' ? 'bouton-vert' : 'bouton-principal'} onClick={valider} disabled={montant <= 0}>
            {mode === 'rentree'
              ? (editionRentree ? 'Enregistrer la rentrée' : 'Ajouter la rentrée')
              : (edition ? 'Enregistrer la dépense' : 'Valider la dépense')}
          </button>
        </div>
      </div>
    </div>
  );
}
