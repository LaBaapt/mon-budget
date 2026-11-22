// Écran « Charges fixes ».
import { useState } from 'react';
import type { Charge, Mois } from '../types';
import { useBudget } from '../etat';
import { chargeAnnuelleIncomplete, chargeCompteDans, chargesDuMois, chargesFixes, prochainChangementCharges } from '../calculs';
import { euros, versCentimes } from '../format';
import { libelleMois, libelleMoisCourt, nomDuNumero, nomMois } from '../mois';
import { CATEGORIES } from '../constantes';
import { Interrupteur, SelecteurMois } from '../composants/Communs';
import { IconeDroite } from '../composants/Icones';
import { EditionCharge } from './EditionCharge';

/** Petites étiquettes affichées sous le nom d'une charge. */
function etiquettes(c: Charge): string[] {
  const liste: string[] = [];
  if (c.frequence === 'ponctuelle') liste.push('Ponctuelle');
  if (c.frequence === 'annuelle') {
    liste.push(c.moisAnnuel ? `1×/an en ${nomDuNumero(c.moisAnnuel)}` : '1×/an · mois à renseigner');
  }
  if (c.frequence === 'mensuelle' && c.debut && c.fin && c.debut === c.fin) {
    const nom = nomMois(c.debut);
    liste.push(`${nom[0].toUpperCase()}${nom.slice(1)} uniquement`);
  } else if (c.fin && c.frequence !== 'ponctuelle') {
    liste.push(`Jusqu'en ${libelleMoisCourt(c.fin)}`);
  }
  if (c.note && /^engag/i.test(c.note.trim())) liste.push('Engagé');
  return liste;
}

export function ChargesFixes(props: { mois: Mois; setMois: (m: Mois) => void }) {
  const { d } = useBudget();
  const { mois } = props;
  const [voirTout, setVoirTout] = useState(false);
  const [edition, setEdition] = useState<Charge | 'nouvelle' | null>(null);

  const duMois = chargesDuMois(d, mois);
  const total = chargesFixes(d, mois);
  const changement = prochainChangementCharges(d, mois);
  const incompletes = d.charges.filter(chargeAnnuelleIncomplete);
  const affichees = voirTout ? d.charges : duMois;

  // Regroupement par catégorie, dans l'ordre de la liste CATEGORIES (les autres à la fin)
  const categories = [...CATEGORIES, ...new Set(d.charges.map((c) => c.categorie).filter((c) => !CATEGORIES.includes(c)))];
  const groupes = categories
    .map((cat) => ({
      cat,
      charges: affichees.filter((c) => c.categorie === cat),
      sousTotal: duMois.filter((c) => c.categorie === cat).reduce((t, c) => t + versCentimes(c.montant), 0),
    }))
    .filter((g) => g.charges.length > 0);

  return (
    <div className="ecran">
      <header className="entete">
        <SelecteurMois mois={mois} onChange={props.setMois} min={d.parametres.premierMois} />
      </header>

      <section className="carte carte-bleue">
        <div className="petit">Charges fixes · {libelleMois(mois)}</div>
        <div className="gros-chiffre">{euros(total)}</div>
        <div className="petit">{duMois.length} charge{duMois.length > 1 ? 's' : ''} ce mois-ci</div>
        {changement && (
          <div className="petit">À partir de {libelleMoisCourt(changement.mois)} : <strong>{euros(changement.total)}</strong></div>
        )}
      </section>

      {incompletes.map((c) => (
        <button key={c.id} className="encart-orange" onClick={() => setEdition(c)}>
          <strong>{c.nom}</strong> est une charge annuelle sans mois renseigné : elle n'est comptée dans aucun mois.
          <span className="lien bloc">Renseigner le mois →</span>
        </button>
      ))}

      <Interrupteur libelle="Voir aussi les charges terminées ou à venir" actif={voirTout} onChange={setVoirTout} />

      {groupes.map((g) => (
        <section className="carte" key={g.cat}>
          <div className="ligne"><h3>{g.cat}</h3><span className="texte-secondaire">{euros(g.sousTotal)}</span></div>
          {g.charges.map((c) => {
            const compte = chargeCompteDans(c, mois);
            return (
              <button key={c.id} className={`ligne ligne-cliquable ${compte ? '' : 'grise'}`} onClick={() => setEdition(c)}>
                <span className="ligne-texte">
                  <span>{c.nom}</span>
                  <span className="etiquettes">
                    {etiquettes(c).map((e) => <span className="etiquette" key={e}>{e}</span>)}
                  </span>
                </span>
                <span className="ligne-droite">{euros(versCentimes(c.montant))}<IconeDroite taille={16} /></span>
              </button>
            );
          })}
        </section>
      ))}

      <button className="bouton-secondaire large" onClick={() => setEdition('nouvelle')}>+ Ajouter une charge</button>

      {edition && (
        <EditionCharge
          charge={edition === 'nouvelle' ? null : edition}
          moisParDefaut={mois}
          onFermer={() => setEdition(null)}
        />
      )}
    </div>
  );
}
