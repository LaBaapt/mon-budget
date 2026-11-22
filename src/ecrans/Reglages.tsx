// Panneau « Réglages » : revenus, sauvegarde (export / import), réinitialisation.
import { useRef, useState } from 'react';
import type { Revenu } from '../types';
import { useBudget } from '../etat';
import { euros, lireMontant, montantPourChamp, versCentimes, versEuros } from '../format';
import { aujourdhui, libelleDate, libelleMoisCourt, moisCourant } from '../mois';
import { enregistrerRevenu, supprimerRevenu } from '../actions';
import { depuisJson, donneesInitiales, nouvelId, versJson } from '../donnees';
import { Champ, Panneau } from '../composants/Communs';
import { IconeDroite } from '../composants/Icones';

export function Reglages(props: { onFermer: () => void }) {
  const { d, modifier, remplacer, message } = useBudget();
  const [revenuOuvert, setRevenuOuvert] = useState<Revenu | 'nouveau' | null>(null);
  const champFichier = useRef<HTMLInputElement>(null);

  /** Exporter : crée un fichier .json avec toutes les données. */
  async function exporter() {
    const nomFichier = `mon-budget-${aujourdhui()}.json`;
    const texte = versJson({ ...d, meta: { ...d.meta, derniereSauvegarde: new Date().toISOString() } });
    const fichier = new File([texte], nomFichier, { type: 'application/json' });
    try {
      // Sur iPhone : ouvre la feuille de partage (« Enregistrer dans Fichiers », AirDrop, mail…)
      if (navigator.canShare?.({ files: [fichier] })) {
        await navigator.share({ files: [fichier], title: 'Sauvegarde Mon Budget' });
      } else {
        // Sur PC : téléchargement classique
        const url = URL.createObjectURL(fichier);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomFichier;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      modifier((x) => { x.meta.derniereSauvegarde = new Date().toISOString(); });
      message('Sauvegarde créée');
    } catch (e) {
      if ((e as Error).name !== 'AbortError') message("La sauvegarde n'a pas pu être créée");
    }
  }

  /** Importer : remplace toutes les données par celles d'un fichier de sauvegarde. */
  async function importer(fichier: File | undefined) {
    if (!fichier) return;
    try {
      const nouvelles = depuisJson(await fichier.text());
      if (window.confirm('Remplacer toutes tes données actuelles par celles de ce fichier ?')) {
        remplacer(nouvelles);
        message('Données importées');
      }
    } catch (e) {
      window.alert((e as Error).message);
    }
    if (champFichier.current) champFichier.current.value = '';
  }

  function reinitialiser() {
    if (!window.confirm('Effacer toutes tes données et repartir des données initiales ?')) return;
    if (!window.confirm('Vraiment ? Pense à exporter une sauvegarde avant. Cette action est définitive.')) return;
    remplacer(donneesInitiales());
    message('Données réinitialisées');
  }

  return (
    <Panneau titre="Réglages" onFermer={props.onFermer}>
      <section className="carte">
        <h3>Revenus</h3>
        {d.revenus.map((r) => (
          <button key={r.id} className="ligne ligne-cliquable" onClick={() => setRevenuOuvert(r)}>
            <span className="ligne-texte">
              <span>{r.nom}</span>
              <span className="texte-secondaire petit">
                Depuis {libelleMoisCourt(r.debut)}{r.fin ? ` · jusqu'en ${libelleMoisCourt(r.fin)}` : ''}
              </span>
            </span>
            <span className="ligne-droite">{euros(versCentimes(r.montant))}<IconeDroite taille={16} /></span>
          </button>
        ))}
        <button className="lien" onClick={() => setRevenuOuvert('nouveau')}>+ Ajouter un revenu</button>
      </section>

      <section className="carte">
        <h3>Sauvegarde</h3>
        <p className="texte-secondaire petit">
          Tes données sont enregistrées uniquement sur cet appareil. Exporte une sauvegarde régulièrement
          (par exemple dans l'app Fichiers ou par mail) : si l'app est supprimée, tout est perdu.
        </p>
        <p className="petit">
          Dernière sauvegarde : {d.meta.derniereSauvegarde ? libelleDate(d.meta.derniereSauvegarde.slice(0, 10)) : 'jamais'}
        </p>
        <button className="bouton-principal large" onClick={exporter}>Exporter mes données</button>
        <button className="bouton-secondaire large" onClick={() => champFichier.current?.click()}>Importer une sauvegarde</button>
        <input ref={champFichier} type="file" accept="application/json,.json" hidden
          onChange={(e) => importer(e.target.files?.[0])} />
      </section>

      <section className="carte">
        <h3>Réinitialiser</h3>
        <p className="texte-secondaire petit">Efface tout et recharge les données de départ.</p>
        <button className="bouton-danger large" onClick={reinitialiser}>Réinitialiser avec les données initiales</button>
      </section>

      <p className="texte-secondaire petit centre">Mon Budget · version {__VERSION__}</p>

      {revenuOuvert && (
        <EditionRevenu revenu={revenuOuvert === 'nouveau' ? null : revenuOuvert} onFermer={() => setRevenuOuvert(null)}
          onEnregistrer={(r) => modifier((x) => enregistrerRevenu(x, r))}
          onSupprimer={(id) => modifier((x) => supprimerRevenu(x, id))} />
      )}
    </Panneau>
  );
}

function EditionRevenu(props: {
  revenu: Revenu | null;
  onFermer: () => void;
  onEnregistrer: (r: Revenu) => void;
  onSupprimer: (id: string) => void;
}) {
  const r = props.revenu;
  const [nom, setNom] = useState(r?.nom ?? '');
  const [montant, setMontant] = useState(r ? montantPourChamp(versCentimes(r.montant)) : '');
  const [debut, setDebut] = useState(r?.debut ?? moisCourant());
  const [fin, setFin] = useState(r?.fin ?? '');
  const [erreur, setErreur] = useState('');

  function enregistrer() {
    const centimes = lireMontant(montant);
    if (!nom.trim()) return setErreur('Donne un nom au revenu.');
    if (centimes === null) return setErreur('Le montant est invalide.');
    if (!debut) return setErreur('Indique le mois de début.');
    if (fin && fin < debut) return setErreur('Le mois de fin est avant le mois de début.');
    props.onEnregistrer({ ...(r ?? {}), id: r?.id ?? nouvelId('revenu'), nom: nom.trim(), montant: versEuros(centimes), debut, fin: fin || null });
    props.onFermer();
  }

  return (
    <Panneau titre={r ? 'Modifier le revenu' : 'Nouveau revenu'} onFermer={props.onFermer}
      pied={<>
        {r && <button className="bouton-danger" onClick={() => {
          if (!window.confirm(`Supprimer « ${r.nom} » ?`)) return;
          props.onSupprimer(r.id);
          props.onFermer();
        }}>Supprimer</button>}
        <button className="bouton-principal" onClick={enregistrer}>Enregistrer</button>
      </>}>
      <div className="formulaire">
        <Champ libelle="Nom"><input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Salaire net, prime…" /></Champ>
        <Champ libelle="Montant mensuel (€)"><input inputMode="decimal" value={montant} onChange={(e) => setMontant(e.target.value)} /></Champ>
        <Champ libelle="Mois de début"><input type="month" value={debut} onChange={(e) => setDebut(e.target.value)} /></Champ>
        <Champ libelle="Mois de fin (facultatif)" aide="Dernier mois inclus. Vide = sans fin.">
          <div className="champ-avec-bouton">
            <input type="month" value={fin} onChange={(e) => setFin(e.target.value)} />
            {fin && <button className="bouton-secondaire" onClick={(e) => { e.preventDefault(); setFin(''); }}>Effacer</button>}
          </div>
        </Champ>
        {erreur && <p className="negatif">{erreur}</p>}
      </div>
    </Panneau>
  );
}
