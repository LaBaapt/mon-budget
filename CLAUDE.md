# Mon Budget — notes pour les prochaines sessions

Web app (PWA) de budget personnel pour iPhone, utilisateur unique (Baptiste, non développeur).
Tout est en **français** : interface, code (noms de variables, commentaires) et documentation.
Spec complète : `02_SPEC_APP_BUDGET.md`. Données initiales : `03_donnees_initiales.json`.
Choix non couverts par la spec : `DECISIONS.md` (à compléter à chaque nouvelle décision).

## Commandes

- `npm install` puis `npm run dev` : lancer en local (http://localhost:5173/mon-budget/)
- `npm test` : tests Vitest des règles de calcul (doivent toujours passer)
- `npm run build` : vérification TypeScript + construction dans `dist/`
- `npm run icones` : régénérer les icônes PNG de `public/`

## Architecture (Vite + React + TypeScript, pas de backend)

- `src/types.ts` — modèle de données (`Donnees` = tout l'état enregistré)
- `src/calculs.ts` — **règles de calcul**, fonctions pures en centimes (testées dans `calculs.test.ts`)
- `src/actions.ts` — toutes les modifications des données (dépenses, charges, clôture…)
- `src/etat.tsx` — contexte React `useBudget()` → `{ d, modifier, remplacer, message }` ;
  `modifier(fn)` clone les données, applique `fn`, enregistre dans IndexedDB
- `src/stockage.ts` — IndexedDB ; `src/donnees.ts` — données initiales, import/export JSON
- `src/format.ts` (montants), `src/mois.ts` (mois "AAAA-MM"), `src/constantes.ts`
- `src/ecrans/` — MonMois, FinDuMois, ChargesFixes, EditionCharge, Comptes, Ajouter, Reglages
- `src/composants/` — Panneau, SelecteurMois, Choix, Champ, Barre, icônes SVG
- `src/styles.css` — CSS simple, couleurs du thème sombre en variables `:root`
- `public/` — manifest, service worker `sw.js`, icônes
- `.github/workflows/deploiement.yml` — tests + build + GitHub Pages sur push `main`

## Règles de calcul (section 6 de la spec) — en centimes entiers

- Charge comptée dans `m` : mensuelle/ponctuelle si `debut <= m` et (`fin` null ou `m <= fin`) ;
  annuelle : même chose + `moisAnnuel` = numéro du mois. Sans `moisAnnuel` → nulle part (alerte).
- `ChargesFixes(m)` = somme des charges de `m` (cigarettes incluses).
- `ResteÀRépartir(m)` = revenus(m) + rentrées vers `courant` datées en `m` (reports inclus)
  − ChargesFixes(m) (− virements depuis `courant` en `m`, cf. DECISIONS.md).
- `Base` = max(0, ResteÀRépartir) ; Besoins = round(Base×%B/100) ; Épargne = round(Base×%E/100) ;
  Plaisir = Base − Besoins − Épargne.
- « Il te reste à dépenser » = (Besoins − dépenses B) + (Plaisir − dépenses P) + min(0, ResteÀRépartir).
- Surplus = max(0, à dépenser) ; montant proposé à la clôture = surplus + épargne restante.
- Solde d'un compte = solde de départ + rentrées vers − rentrées depuis + virements de clôture.
- Valeurs de contrôle (2026-12 → 2027-04) dans le JSON initial, vérifiées par les tests.

## Conventions

- Montants **stockés en euros** (comme le JSON), **calculés en centimes** (`versCentimes`),
  affichés avec `euros(centimes)` → `1 521,27 €`, signe `−` pour les négatifs.
- Mois `"AAAA-MM"`, dates `"AAAA-MM-JJ"` (comparaison de chaînes = ordre chronologique).
- Écrans : composants fonctionnels simples ; panneaux plein écran via `<Panneau>`.
- Zones tactiles ≥ 44 px, champs en 16 px (évite le zoom Safari), zones sûres via `env(safe-area-inset-*)`.
- Le `base` Vite est `/mon-budget/` (nom du dépôt). URL : https://labaapt.github.io/mon-budget/
- Si on change le format des données, garder `normaliser()` (donnees.ts) compatible avec les anciennes
  sauvegardes.
- Changer `CACHE` dans `public/sw.js` n'est pas nécessaire à chaque version (les pages sont
  rechargées depuis internet en priorité).
