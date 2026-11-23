// Journal des opérations : carte « Dernières opérations » (Mon mois) et panneau « Tout voir ».
import { useState } from 'react';
import type { Mois } from '../types';
import { useBudget } from '../etat';
import { operationsDuMois, type Operation } from '../calculs';
import { euros } from '../format';
import { libelleJour, nomMois } from '../mois';
import { enveloppe } from '../constantes';
import { Choix, Panneau } from '../composants/Communs';
import { IconeDroite } from '../composants/Icones';

/** Ce qui se passe quand on touche une opération (ouvrir l'écran de modification). */
export type OuvrirOperation = (op: Operation) => void;

/** Couleur de la pastille : celle de l'enveloppe, vert pour une rentrée, gris pour un virement. */
function couleur(op: Operation): string {
  if (op.depense) return enveloppe(op.depense.enveloppeId).couleur;
  if (op.sorte === 'virement') return 'var(--texte-secondaire)';
  return 'var(--positif)';
}

/** Une liste d'opérations, regroupées par jour. */
function ListeOperations(props: { operations: Operation[]; onOuvrir: OuvrirOperation }) {
  const jours: { date: string; ops: Operation[] }[] = [];
  for (const op of props.operations) {
    const dernier = jours[jours.length - 1];
    if (dernier && dernier.date === op.date) dernier.ops.push(op);
    else jours.push({ date: op.date, ops: [op] });
  }
  return (
    <>
      {jours.map((j) => (
        <div key={j.date} className="jour">
          <div className="jour-titre">{libelleJour(j.date)}</div>
          {j.ops.map((op) => (
            <button key={op.id} className="ligne ligne-cliquable" onClick={() => props.onOuvrir(op)}>
              <span className="ligne-texte">
                <span><span className="pastille" style={{ background: couleur(op) }} />{op.libelle}</span>
                <span className="texte-secondaire petit">{op.detail}</span>
              </span>
              <span className={`ligne-droite ${op.sorte === 'depense' ? '' : op.sorte === 'virement' ? 'texte-secondaire' : 'positif'}`}>
                {op.sorte === 'virement' ? euros(op.montant) : euros(op.montant, true)}
                <IconeDroite taille={16} />
              </span>
            </button>
          ))}
        </div>
      ))}
    </>
  );
}

/** Carte de Mon mois : les 5 dernières opérations du mois + « Tout voir ». */
export function DernieresOperations(props: { mois: Mois; onOuvrir: OuvrirOperation }) {
  const { d } = useBudget();
  const [journalOuvert, setJournalOuvert] = useState(false);
  const operations = operationsDuMois(d, props.mois);

  return (
    <section className="carte">
      <div className="ligne">
        <h3>Dernières opérations</h3>
        {operations.length > 0 && (
          <button className="lien" onClick={() => setJournalOuvert(true)}>Tout voir →</button>
        )}
      </div>
      {operations.length === 0 ? (
        <p className="texte-secondaire petit">Aucune opération en {nomMois(props.mois)}. Touche + pour en ajouter une.</p>
      ) : (
        <ListeOperations operations={operations.slice(0, 5)} onOuvrir={props.onOuvrir} />
      )}
      {journalOuvert && (
        <JournalOperations mois={props.mois} onOuvrir={props.onOuvrir} onFermer={() => setJournalOuvert(false)} />
      )}
    </section>
  );
}

type Filtre = 'tout' | 'depenses' | 'rentrees';

/** Panneau plein écran : toutes les opérations du mois, avec un filtre. */
function JournalOperations(props: { mois: Mois; onOuvrir: OuvrirOperation; onFermer: () => void }) {
  const { d } = useBudget();
  const [filtre, setFiltre] = useState<Filtre>('tout');
  const toutes = operationsDuMois(d, props.mois);

  // « Rentrées » regroupe les rentrées, les reports et les virements entre comptes.
  const affichees = toutes.filter((op) =>
    filtre === 'tout' ? true : filtre === 'depenses' ? op.sorte === 'depense' : op.sorte !== 'depense');
  const totalDepenses = toutes.filter((op) => op.sorte === 'depense').reduce((t, op) => t + op.montant, 0);
  // Les virements entre comptes ne sont pas de l'argent en plus : ils ne comptent pas dans le total.
  const totalRentrees = toutes.filter((op) => op.sorte === 'rentree' || op.sorte === 'report').reduce((t, op) => t + op.montant, 0);

  return (
    <Panneau titre={`Opérations de ${nomMois(props.mois)}`} onFermer={props.onFermer}>
      <Choix petit valeur={filtre} onChange={setFiltre} options={[
        { valeur: 'tout', libelle: 'Tout' },
        { valeur: 'depenses', libelle: 'Dépenses' },
        { valeur: 'rentrees', libelle: 'Rentrées' },
      ]} />

      <section className="carte">
        {filtre !== 'rentrees' && (
          <div className="ligne"><span>Total des dépenses</span><strong>{euros(totalDepenses)}</strong></div>
        )}
        {filtre !== 'depenses' && (
          <div className="ligne"><span>Total des rentrées</span><strong className="positif">{euros(totalRentrees, true)}</strong></div>
        )}
      </section>

      <section className="carte">
        {affichees.length === 0
          ? <p className="texte-secondaire petit">Rien à afficher.</p>
          : <ListeOperations operations={affichees} onOuvrir={props.onOuvrir} />}
      </section>
    </Panneau>
  );
}
