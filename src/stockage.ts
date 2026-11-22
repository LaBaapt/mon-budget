// Sauvegarde sur l'appareil, dans IndexedDB (la « base de données » du navigateur).
// On range tout l'objet Donnees sous une seule clé : simple et suffisant.
import type { Donnees } from './types';

const BASE = 'mon-budget';
const MAGASIN = 'donnees';
const CLE = 'etat';

function ouvrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BASE, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(MAGASIN);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Lit les données enregistrées (null si c'est le premier lancement). */
export async function charger(): Promise<Donnees | null> {
  try {
    const db = await ouvrir();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(MAGASIN, 'readonly').objectStore(MAGASIN).get(CLE);
      req.onsuccess = () => resolve((req.result as Donnees) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Secours si IndexedDB n'est pas disponible (navigation privée…)
    const texte = localStorage.getItem(BASE);
    return texte ? (JSON.parse(texte) as Donnees) : null;
  }
}

/** Enregistre toutes les données. */
export async function enregistrer(d: Donnees): Promise<void> {
  try {
    const db = await ouvrir();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MAGASIN, 'readwrite');
      tx.objectStore(MAGASIN).put(d, CLE);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    localStorage.setItem(BASE, JSON.stringify(d));
  }
}

/** Demande au navigateur de ne pas effacer les données quand l'espace manque. */
export function demanderStockagePersistant(): void {
  navigator.storage?.persist?.().catch(() => undefined);
}
