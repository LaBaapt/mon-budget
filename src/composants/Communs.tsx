// Composants réutilisés sur plusieurs écrans.
import type { ReactNode } from 'react';
import type { Mois } from '../types';
import { ajouterMois, libelleMois } from '../mois';
import { IconeDroite, IconeGauche } from './Icones';

/** Panneau plein écran (édition, détail…) avec un bouton « ‹ Retour ». */
export function Panneau(props: { titre: string; onFermer: () => void; children: ReactNode; pied?: ReactNode }) {
  return (
    <div className="panneau" role="dialog" aria-label={props.titre}>
      <header className="panneau-entete">
        <button className="lien bouton-retour" onClick={props.onFermer}>
          <IconeGauche /> Retour
        </button>
        <h2>{props.titre}</h2>
        <span className="bouton-retour" />
      </header>
      <div className="panneau-contenu">{props.children}</div>
      {props.pied && <div className="panneau-pied">{props.pied}</div>}
    </div>
  );
}

/** Sélecteur « ‹ Décembre 2026 › ». */
export function SelecteurMois(props: { mois: Mois; onChange: (m: Mois) => void; min?: Mois }) {
  const peutReculer = !props.min || props.mois > props.min;
  return (
    <div className="selecteur-mois">
      <button className="bouton-icone" disabled={!peutReculer} aria-label="Mois précédent"
        onClick={() => props.onChange(ajouterMois(props.mois, -1))}>
        <IconeGauche />
      </button>
      <span>{libelleMois(props.mois)}</span>
      <button className="bouton-icone" aria-label="Mois suivant"
        onClick={() => props.onChange(ajouterMois(props.mois, 1))}>
        <IconeDroite />
      </button>
    </div>
  );
}

/** Choix parmi quelques options, en « pastilles » côte à côte. */
export function Choix<T extends string>(props: {
  options: { valeur: T; libelle: string; couleur?: string }[];
  valeur: T;
  onChange: (v: T) => void;
  petit?: boolean;
}) {
  return (
    <div className={`choix ${props.petit ? 'choix-petit' : ''}`}>
      {props.options.map((o) => (
        <button key={o.valeur} className={o.valeur === props.valeur ? 'actif' : ''}
          style={o.valeur === props.valeur && o.couleur ? { background: o.couleur, borderColor: o.couleur } : undefined}
          onClick={() => props.onChange(o.valeur)}>
          {o.couleur && o.valeur !== props.valeur && <span className="pastille" style={{ background: o.couleur }} />}
          {o.libelle}
        </button>
      ))}
    </div>
  );
}

/** Interrupteur on/off façon iPhone. */
export function Interrupteur(props: { actif: boolean; onChange: (v: boolean) => void; libelle: string }) {
  return (
    <label className="interrupteur">
      <span>{props.libelle}</span>
      <input type="checkbox" checked={props.actif} onChange={(e) => props.onChange(e.target.checked)} />
      <span className="interrupteur-curseur" />
    </label>
  );
}

/** Un champ de formulaire avec son étiquette. */
export function Champ(props: { libelle: string; children: ReactNode; aide?: ReactNode }) {
  return (
    <label className="champ">
      <span className="champ-libelle">{props.libelle}</span>
      {props.children}
      {props.aide && <span className="champ-aide">{props.aide}</span>}
    </label>
  );
}

/** Barre de progression d'une enveloppe : orange à partir de 80 %, rouge si dépassée. */
export function Barre(props: { depense: number; prevu: number; couleur: string }) {
  const ratio = props.prevu > 0 ? props.depense / props.prevu : props.depense > 0 ? 2 : 0;
  const couleur = ratio > 1 ? 'var(--negatif)' : ratio >= 0.8 ? 'var(--alerte)' : props.couleur;
  return (
    <div className="barre">
      <div className="barre-remplie" style={{ width: `${Math.min(100, ratio * 100)}%`, background: couleur }} />
    </div>
  );
}
