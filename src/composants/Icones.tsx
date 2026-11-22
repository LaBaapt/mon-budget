// Petites icônes dessinées en SVG (pas de bibliothèque externe).
type P = { taille?: number };

const svg = (taille: number, contenu: React.ReactNode) => (
  <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {contenu}
  </svg>
);

export const IconePlus = ({ taille = 28 }: P) => svg(taille, <path d="M12 5v14M5 12h14" />);
export const IconeCroix = ({ taille = 18 }: P) => svg(taille, <path d="M6 6l12 12M18 6L6 18" />);
export const IconeGauche = ({ taille = 22 }: P) => svg(taille, <path d="M15 18l-6-6 6-6" />);
export const IconeDroite = ({ taille = 22 }: P) => svg(taille, <path d="M9 18l6-6-6-6" />);
export const IconeEffacer = ({ taille = 26 }: P) =>
  svg(taille, <><path d="M21 5H9l-6 7 6 7h12z" /><path d="M17 9l-6 6M11 9l6 6" /></>);
export const IconeReglages = ({ taille = 22 }: P) =>
  svg(taille, <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </>);
export const IconeMois = ({ taille = 24 }: P) =>
  svg(taille, <><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" /></>);
export const IconeCharges = ({ taille = 24 }: P) =>
  svg(taille, <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></>);
export const IconeComptes = ({ taille = 24 }: P) =>
  svg(taille, <><path d="M3 10l9-6 9 6" /><path d="M5 10v8M10 10v8M14 10v8M19 10v8M3 21h18" /></>);
