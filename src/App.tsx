// L'app : les 3 onglets, le bouton « + » et les écrans qui s'ouvrent par-dessus.
import { useState } from 'react';
import type { Depense, Mois } from './types';
import { useBudget } from './etat';
import { moisCourant } from './mois';
import { MonMois } from './ecrans/MonMois';
import { ChargesFixes } from './ecrans/ChargesFixes';
import { Comptes } from './ecrans/Comptes';
import { Ajouter } from './ecrans/Ajouter';
import { Reglages } from './ecrans/Reglages';
import { IconeCharges, IconeComptes, IconeMois, IconePlus } from './composants/Icones';

type Onglet = 'mois' | 'charges' | 'comptes';

export function App() {
  const { d } = useBudget();
  const [onglet, setOnglet] = useState<Onglet>('mois');
  // Mois affiché : le mois en cours (mais pas avant le premier mois du budget)
  const [mois, setMois] = useState<Mois>(() => {
    const m = moisCourant();
    return m < d.parametres.premierMois ? d.parametres.premierMois : m;
  });
  const [ajouter, setAjouter] = useState<{ mode: 'depense' | 'rentree'; depense?: Depense } | null>(null);
  const [reglages, setReglages] = useState(false);

  function changerOnglet(o: Onglet) {
    setOnglet(o);
    window.scrollTo(0, 0);
  }

  return (
    <div className="app">
      <main>
        {onglet === 'mois' && (
          <MonMois mois={mois} setMois={setMois} ouvrirAjouter={setAjouter}
            allerCharges={() => changerOnglet('charges')} ouvrirReglages={() => setReglages(true)} />
        )}
        {onglet === 'charges' && <ChargesFixes mois={mois} setMois={setMois} />}
        {onglet === 'comptes' && <Comptes mois={mois} allerMonMois={() => changerOnglet('mois')} />}
      </main>

      <button className="bouton-plus" aria-label="Ajouter" onClick={() => setAjouter({ mode: 'depense' })}>
        <IconePlus />
      </button>

      <nav className="onglets">
        <button className={onglet === 'mois' ? 'actif' : ''} onClick={() => changerOnglet('mois')}>
          <IconeMois /><span>Mon mois</span>
        </button>
        <button className={onglet === 'charges' ? 'actif' : ''} onClick={() => changerOnglet('charges')}>
          <IconeCharges /><span>Charges fixes</span>
        </button>
        <button className={onglet === 'comptes' ? 'actif' : ''} onClick={() => changerOnglet('comptes')}>
          <IconeComptes /><span>Comptes</span>
        </button>
      </nav>

      {reglages && <Reglages onFermer={() => setReglages(false)} />}
      {ajouter && (
        <Ajouter mode={ajouter.mode} depense={ajouter.depense} moisAffiche={mois} onFermer={() => setAjouter(null)} />
      )}
    </div>
  );
}
