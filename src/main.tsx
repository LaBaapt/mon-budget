// Point d'entrée : affiche l'app et active le mode hors ligne.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import './styles.css';
import { FournisseurBudget } from './etat';
import { App } from './App';

createRoot(document.getElementById('racine')!).render(
  <StrictMode>
    <FournisseurBudget>
      <App />
    </FournisseurBudget>
  </StrictMode>,
);

// Service worker = ce qui permet à l'app de marcher sans connexion (uniquement une fois publiée).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
  });
}
