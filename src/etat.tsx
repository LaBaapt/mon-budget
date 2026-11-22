// L'« état » de l'app : les données chargées, et la fonction pour les modifier.
// Toute modification est enregistrée automatiquement sur l'appareil.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Donnees } from './types';
import { charger, demanderStockagePersistant, enregistrer } from './stockage';
import { donneesInitiales, normaliser } from './donnees';

interface ContexteBudget {
  d: Donnees;
  /** Modifie les données : modifier((d) => { d.depenses.push(...) }) */
  modifier: (changement: (d: Donnees) => void) => void;
  /** Remplace toutes les données (import, réinitialisation). */
  remplacer: (nouvelles: Donnees) => void;
  /** Affiche un petit message en bas de l'écran. */
  message: (texte: string) => void;
}

const Contexte = createContext<ContexteBudget | null>(null);

/** À utiliser dans les écrans : const { d, modifier } = useBudget(); */
export function useBudget(): ContexteBudget {
  const c = useContext(Contexte);
  if (!c) throw new Error('useBudget doit être utilisé dans <FournisseurBudget>');
  return c;
}

export function FournisseurBudget({ children }: { children: ReactNode }) {
  const [d, setD] = useState<Donnees | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Au démarrage : on lit les données de l'appareil, ou on part des données initiales.
  useEffect(() => {
    charger().then((lues) => {
      const donnees = lues ? normaliser(lues) : donneesInitiales();
      setD(donnees);
      if (!lues) enregistrer(donnees);
    });
    demanderStockagePersistant();
  }, []);

  const modifier = useCallback((changement: (d: Donnees) => void) => {
    setD((avant) => {
      if (!avant) return avant;
      const copie = structuredClone(avant);
      changement(copie);
      enregistrer(copie);
      return copie;
    });
  }, []);

  const remplacer = useCallback((nouvelles: Donnees) => {
    setD(nouvelles);
    enregistrer(nouvelles);
  }, []);

  const message = useCallback((texte: string) => {
    setToast(texte);
    window.setTimeout(() => setToast((t) => (t === texte ? null : t)), 2500);
  }, []);

  if (!d) return <div className="chargement">Chargement…</div>;

  return (
    <Contexte.Provider value={{ d, modifier, remplacer, message }}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </Contexte.Provider>
  );
}
