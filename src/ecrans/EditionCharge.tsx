// Panneau d'édition d'une charge fixe (ou d'ajout d'une nouvelle).
import { useState } from 'react';
import type { Charge, Frequence, Mois } from '../types';
import { useBudget } from '../etat';
import { lireMontant, montantPourChamp, versCentimes, versEuros } from '../format';
import { nomDuNumero } from '../mois';
import { CATEGORIES } from '../constantes';
import { enregistrerCharge, supprimerCharge } from '../actions';
import { nouvelId } from '../donnees';
import { Champ, Choix, Panneau } from '../composants/Communs';

export function EditionCharge(props: { charge: Charge | null; moisParDefaut: Mois; onFermer: () => void }) {
  const { modifier, message } = useBudget();
  const c = props.charge;

  const [nom, setNom] = useState(c?.nom ?? '');
  const [categorie, setCategorie] = useState(c?.categorie ?? 'Abonnements');
  const [montant, setMontant] = useState(c ? montantPourChamp(versCentimes(c.montant)) : '');
  const [frequence, setFrequence] = useState<Frequence>(c?.frequence ?? 'mensuelle');
  const [debut, setDebut] = useState(c?.debut ?? props.moisParDefaut);
  const [fin, setFin] = useState(c?.fin ?? '');
  const [moisAnnuel, setMoisAnnuel] = useState<number | ''>(c?.moisAnnuel ?? '');
  const [note, setNote] = useState(c?.note ?? '');
  const [erreur, setErreur] = useState('');

  const categories = c && !CATEGORIES.includes(c.categorie) ? [...CATEGORIES, c.categorie] : CATEGORIES;

  function enregistrer() {
    const centimes = lireMontant(montant);
    if (!nom.trim()) return setErreur('Donne un nom à la charge.');
    if (centimes === null) return setErreur('Le montant est invalide (exemple : 12,50).');
    if (frequence !== 'annuelle' && !debut) return setErreur('Indique le mois de début.');
    if (debut && fin && fin < debut) return setErreur('Le mois de fin est avant le mois de début.');
    const charge: Charge = {
      id: c?.id ?? nouvelId('charge'),
      nom: nom.trim(),
      categorie,
      frequence,
      montant: versEuros(centimes),
      debut: debut || null,
      // Une ponctuelle ne compte qu'une fois : dans son mois (début = fin).
      fin: frequence === 'ponctuelle' ? debut || null : fin || null,
      moisAnnuel: frequence === 'annuelle' ? (moisAnnuel === '' ? null : moisAnnuel) : undefined,
      note: note.trim() || null,
    };
    if (frequence !== 'annuelle') delete charge.moisAnnuel;
    modifier((d) => enregistrerCharge(d, charge));
    message(c ? 'Charge modifiée' : 'Charge ajoutée');
    props.onFermer();
  }

  return (
    <Panneau titre={c ? 'Modifier la charge' : 'Nouvelle charge'} onFermer={props.onFermer}
      pied={<>
        {c && (
          <button className="bouton-danger" onClick={() => {
            if (!window.confirm(`Supprimer « ${c.nom} » ?`)) return;
            modifier((d) => supprimerCharge(d, c.id));
            message('Charge supprimée');
            props.onFermer();
          }}>Supprimer</button>
        )}
        <button className="bouton-principal" onClick={enregistrer}>Enregistrer</button>
      </>}>
      <div className="formulaire">
        <Champ libelle="Nom"><input value={nom} onChange={(e) => setNom(e.target.value)} /></Champ>
        <Champ libelle="Catégorie">
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            {categories.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Champ>
        <Champ libelle="Montant (€)">
          <input inputMode="decimal" value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="0,00" />
        </Champ>
        <div className="champ">
          <span className="champ-libelle">Fréquence</span>
          <Choix petit valeur={frequence} onChange={setFrequence} options={[
            { valeur: 'mensuelle', libelle: 'Mensuelle' },
            { valeur: 'annuelle', libelle: 'Annuelle' },
            { valeur: 'ponctuelle', libelle: 'Ponctuelle' },
          ]} />
        </div>
        {frequence === 'annuelle' && (
          <Champ libelle="Mois de l'année où elle est payée">
            <select value={moisAnnuel} onChange={(e) => setMoisAnnuel(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">— À renseigner —</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{nomDuNumero(n)}</option>
              ))}
            </select>
          </Champ>
        )}
        <Champ libelle={frequence === 'ponctuelle' ? 'Mois' : 'Mois de début'}
          aide={frequence === 'annuelle' ? 'Première année où elle est payée.' : undefined}>
          <input type="month" value={debut} onChange={(e) => setDebut(e.target.value)} />
        </Champ>
        {frequence !== 'ponctuelle' && (
          <Champ libelle="Mois de fin (facultatif)" aide="Dernier mois inclus. Vide = sans fin.">
            <div className="champ-avec-bouton">
              <input type="month" value={fin} onChange={(e) => setFin(e.target.value)} />
              {fin && <button className="bouton-secondaire" onClick={(e) => { e.preventDefault(); setFin(''); }}>Effacer</button>}
            </div>
          </Champ>
        )}
        <Champ libelle="Note (facultatif)">
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </Champ>
        {erreur && <p className="negatif">{erreur}</p>}
      </div>
    </Panneau>
  );
}
