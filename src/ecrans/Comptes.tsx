// Écran « Comptes » : compte courant + épargne & investissements.
import { useState } from 'react';
import type { Compte, Mois, TypeCompte } from '../types';
import { useBudget } from '../etat';
import {
  COMPTE_COURANT, chargesFixes, mouvementsCompte, rentreesCourantDuMois, resteARepartir, revenusDuMois, soldeCompte,
} from '../calculs';
import { euros, lireMontant, montantPourChamp, versCentimes, versEuros } from '../format';
import { libelleDate, libelleMois } from '../mois';
import { TYPES_COMPTE, libelleTypeCompte } from '../constantes';
import { enregistrerCompte, supprimerCompte, supprimerRentree } from '../actions';
import { nouvelId } from '../donnees';
import { Champ, Panneau } from '../composants/Communs';
import { IconeCroix, IconeDroite } from '../composants/Icones';

export function Comptes(props: { mois: Mois; allerMonMois: () => void }) {
  const { d } = useBudget();
  const [ouvert, setOuvert] = useState<Compte | 'nouveau' | null>(null);

  const courant = d.comptes.find((c) => c.id === COMPTE_COURANT);
  const autres = d.comptes.filter((c) => c.id !== COMPTE_COURANT);
  const totalAutres = autres.reduce((t, c) => t + soldeCompte(d, c.id), 0);
  const entrees = rentreesCourantDuMois(d, props.mois).reduce((t, r) => t + versCentimes(r.montant), 0);

  return (
    <div className="ecran">
      <header className="entete"><h1>Comptes</h1></header>

      <button className="carte carte-encadree" onClick={props.allerMonMois}>
        <div className="ligne">
          <span><strong>{courant?.nom ?? 'Compte courant'}</strong>
            {courant?.banque && <span className="texte-secondaire"> · {courant.banque}</span>}</span>
          <IconeDroite taille={16} />
        </div>
        <div className="texte-secondaire petit">{libelleMois(props.mois)}</div>
        <div className="ligne"><span>Revenus du mois</span><span>{euros(revenusDuMois(d, props.mois) + entrees)}</span></div>
        <div className="ligne"><span>Charges fixes</span><span>{euros(-chargesFixes(d, props.mois))}</span></div>
        <div className={`ligne gras ${resteARepartir(d, props.mois) < 0 ? 'negatif' : ''}`}>
          <span>Reste à répartir</span><span>{euros(resteARepartir(d, props.mois))}</span>
        </div>
      </button>

      <section className="carte">
        <div className="ligne"><h3>Épargne & investissements</h3><strong>{euros(totalAutres)}</strong></div>
        {autres.length === 0 && <p className="texte-secondaire">Aucun compte pour l'instant.</p>}
        {autres.map((c) => (
          <button key={c.id} className="ligne ligne-cliquable" onClick={() => setOuvert(c)}>
            <span className="ligne-texte"><span>{c.nom}</span><span className="texte-secondaire petit">{libelleTypeCompte(c.type)}</span></span>
            <span className="ligne-droite">{euros(soldeCompte(d, c.id))}<IconeDroite taille={16} /></span>
          </button>
        ))}
      </section>

      <button className="bouton-secondaire large" onClick={() => setOuvert('nouveau')}>+ Ajouter un compte</button>

      {ouvert && <DetailCompte compte={ouvert === 'nouveau' ? null : ouvert} onFermer={() => setOuvert(null)} />}
    </div>
  );
}

/** Détail d'un compte : solde, historique, et modification (ou création si compte = null). */
function DetailCompte(props: { compte: Compte | null; onFermer: () => void }) {
  const { d, modifier, message } = useBudget();
  const c = props.compte;
  const [nom, setNom] = useState(c?.nom ?? '');
  const [type, setType] = useState<TypeCompte>(c?.type ?? 'epargne');
  const [solde, setSolde] = useState(c ? montantPourChamp(versCentimes(c.solde ?? 0)) : '0');
  const [erreur, setErreur] = useState('');
  const mouvements = c ? mouvementsCompte(d, c.id) : [];

  function enregistrer() {
    const centimes = lireMontant(solde.replace('-', '').replace('−', ''));
    const negatif = /^[-−]/.test(solde.trim());
    if (!nom.trim()) return setErreur('Donne un nom au compte.');
    if (centimes === null) return setErreur('Le solde de départ est invalide.');
    modifier((x) => enregistrerCompte(x, {
      ...(c ?? {}),
      id: c?.id ?? nouvelId('compte'),
      nom: nom.trim(),
      type,
      solde: versEuros(negatif ? -centimes : centimes),
    }));
    message(c ? 'Compte modifié' : 'Compte ajouté');
    props.onFermer();
  }

  return (
    <Panneau titre={c ? c.nom : 'Nouveau compte'} onFermer={props.onFermer}
      pied={<>
        {c && (
          <button className="bouton-danger" onClick={() => {
            if (mouvements.length > 0) return window.alert('Ce compte a des mouvements : supprime-les d\'abord.');
            if (!window.confirm(`Supprimer le compte « ${c.nom} » ?`)) return;
            modifier((x) => supprimerCompte(x, c.id));
            message('Compte supprimé');
            props.onFermer();
          }}>Supprimer</button>
        )}
        <button className="bouton-principal" onClick={enregistrer}>Enregistrer</button>
      </>}>
      {c && (
        <section className="carte carte-heros">
          <div className="texte-secondaire">Solde</div>
          <div className="gros-chiffre">{euros(soldeCompte(d, c.id))}</div>
        </section>
      )}

      <div className="formulaire">
        <Champ libelle="Nom"><input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Livret A, PEA…" /></Champ>
        <Champ libelle="Type">
          <select value={type} onChange={(e) => setType(e.target.value as TypeCompte)}>
            {TYPES_COMPTE.map((t) => <option key={t.valeur} value={t.valeur}>{t.libelle}</option>)}
          </select>
        </Champ>
        <Champ libelle="Solde de départ (€)" aide="Le solde du compte avant les mouvements notés dans l'app.">
          <input inputMode="decimal" value={solde} onChange={(e) => setSolde(e.target.value)} />
        </Champ>
        {erreur && <p className="negatif">{erreur}</p>}
      </div>

      {c && (
        <section className="carte">
          <h3>Historique</h3>
          {mouvements.length === 0 && <p className="texte-secondaire">Aucun mouvement pour l'instant.</p>}
          {mouvements.map((mv) => (
            <div className="ligne" key={mv.id}>
              <span className="ligne-texte">
                <span>{mv.libelle}</span>
                <span className="texte-secondaire petit">{mv.id.startsWith('cloture-') ? 'Fin de mois' : libelleDate(mv.date)}</span>
              </span>
              <span className={`ligne-droite ${mv.montant < 0 ? 'negatif' : 'positif'}`}>
                {euros(mv.montant, true)}
                {mv.rentreeId && (
                  <button className="bouton-croix" aria-label="Supprimer" onClick={() => {
                    if (!window.confirm('Supprimer ce mouvement ?')) return;
                    modifier((x) => supprimerRentree(x, mv.rentreeId!));
                  }}><IconeCroix /></button>
                )}
              </span>
            </div>
          ))}
          <div className="separateur" />
          <div className="ligne texte-secondaire"><span>Solde de départ</span><span>{euros(versCentimes(c.solde ?? 0))}</span></div>
        </section>
      )}
    </Panneau>
  );
}
