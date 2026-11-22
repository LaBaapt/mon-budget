# Cahier des charges — Web app « Mon Budget » (v2, maquette validée)

## 1. Contexte

Baptiste, 26 ans, vient de se séparer et gère seul son budget (salaire net 2 100 €/mois). Il veut une **web app sur iPhone**, simple et claire, pour :

- savoir en un coup d'œil **combien il lui reste à dépenser ce mois-ci** ;
- répartir ce qui reste après ses charges fixes en **3 enveloppes en pourcentage** (Besoins / Épargne / Plaisir) ;
- noter ses **dépenses au jour le jour** et ses **rentrées d'argent** ;
- suivre ses **comptes** (compte courant, Livret A, PER…) ;
- **clôturer chaque mois** en choisissant quoi faire du surplus.

Utilisateur unique, pas de partage, pas de compte utilisateur. Appareils : iPhone (principal) et PC Windows.

Le dossier `maquette/` (s'il est présent) contient la maquette validée : fichiers `.dc.html` à lire comme référence visuelle (structure, textes, couleurs). Ce ne sont pas des fichiers à réutiliser tels quels.

## 2. Design

- **Thème sombre** uniquement.
  - Fond `#0B0F14`, cartes `#161B22`, champs/boutons secondaires `#232A35`, séparateurs `#2A313C`.
  - Texte `#F2F4F7`, texte secondaire `#A0A9B8`.
  - Accent (boutons) `#2F5FEF`, liens et onglet actif `#7EA2FF`.
  - Positif `#3DD68C`, négatif `#FF6B5E`, alerte (≥ 80 % d'une enveloppe) `#F79009`.
  - Enveloppes : Besoins `#4F7CFF`, Épargne `#A78BFA`, Plaisir `#F472B6`.
- Police Inter (repli : police système). Cartes arrondies (20 px), gros chiffres, zones tactiles ≥ 44 px.
- Tout en français, montants au format `1 521,27 €`, négatifs avec le signe `−`.
- Mobile d'abord (iPhone ~390 px de large), en respectant les zones sûres (encoche, barre du bas).

## 3. Navigation

Barre en bas avec **3 onglets** : **Mon mois**, **Charges fixes**, **Comptes**.
Un **bouton rond « + » flottant** (en bas à droite, au-dessus de la barre), visible sur ces 3 écrans, ouvre l'écran **Ajouter**.

## 4. Écrans

### 4.1 Mon mois (accueil)

- Sélecteur de mois `‹ Décembre 2026 ›` (mois courant par défaut).
- **Gros chiffre « Il te reste à dépenser »** = (Besoins prévus − dépensé) + (Plaisir prévu − dépensé) + (reste à répartir s'il est négatif). Vert si positif, rouge si négatif. Sous-texte : « Besoins + plaisir restants. L'épargne est mise de côté à part. »
- **Résumé** :
  - Salaire ;
  - une ligne par rentrée d'argent sur le compte courant ce mois-ci (en vert, avec une croix pour la supprimer), y compris le **report du mois précédent** (« Report de février ») ;
  - Charges fixes (cigarettes incluses), cliquable vers l'onglet Charges fixes ;
  - **Reste à répartir** (en rouge s'il est négatif).
- Si le reste à répartir est **négatif** : encart rouge « Il manque X € pour couvrir tes charges fixes… » avec un lien **« Ajouter une rentrée d'argent → »**.
- **Mes enveloppes** : Besoins, Épargne, Plaisir. Pour chacune : pastille de couleur, nom, pourcentage, « dépensé / prévu », barre de progression (orange ≥ 80 %, rouge si dépassée). Tap → liste des dépenses de l'enveloppe ce mois-ci (modifier / supprimer).
- **Bloc Répartition** : affiche « 60 / 20 / 20 ». Boutons − / + (pas de 5 %) pour **Besoins** et **Épargne**, avec le montant correspondant. **Plaisir = 100 − Besoins − Épargne**, calculé automatiquement (« le reste, automatiquement »). Interdire un total > 100. Les pourcentages sont mémorisés **par mois** (un nouveau mois reprend ceux du mois précédent).
- **Bloc « Fin du mois »** : visible à partir du dernier jour du mois (et pour tout mois passé non clôturé). « Il te reste X €. Qu'en fais-tu ? » avec 3 choix :
  - **Reporter** sur le mois suivant (crée une rentrée « Report de <mois> » sur le compte courant du mois suivant) ;
  - **Livret A** (ou le compte d'épargne choisi) : vire tout, le solde du compte est mis à jour ;
  - **Partager** : saisie de la part à virer, le reste est reporté.

  Une phrase résume le choix, puis bouton **« Clôturer <mois> »**. Un mois clôturé affiche ce qui a été décidé, avec la possibilité d'annuler la clôture.

### 4.2 Charges fixes

- Total du mois en haut (carte bleue), avec le nombre de charges et le total « à partir de » quand il change.
- Alerte si une charge annuelle n'a pas de mois renseigné (cas d'Amazon Prime).
- Charges du mois **regroupées par catégorie** (Logement, Assurances, Crédits, Abonnements, Transport, Vie courante, Banque, Impôts), avec sous-total. Étiquettes : « Jusqu'en févr. 2027 », « Décembre uniquement », « Engagé », « Ponctuelle », « 1×/an en avril ».
- Interrupteur « Voir aussi les charges terminées ou à venir » (affichées grisées).
- Tap sur une charge → édition (nom, catégorie, montant, fréquence mensuelle/annuelle/ponctuelle, mois de début, mois de fin, mois de l'année pour les annuelles, note). Bouton « + Ajouter une charge ».

### 4.3 Comptes

- **Compte courant** (carte encadrée en bleu) : reprend le mois en cours (revenus du mois, charges fixes, reste à répartir). Tap → onglet Mon mois.
- **Épargne & investissements** : liste des autres comptes (Livret A, PER…) avec leur solde et le total.
- Tap sur un compte → historique de ses mouvements (rentrées, virements, clôtures) et modification du nom ou du solde de départ.
- Bouton **« + Ajouter un compte »** (nom, type : épargne / investissement / retraite / autre, solde de départ).

### 4.4 Ajouter (écran plein, ouvert par le « + »)

Sélecteur en haut : **Dépense | Rentrée d'argent**. Pavé numérique en grand (virgule acceptée, 2 décimales max), montant affiché en grand.

**Mode Dépense**
- Choix de l'enveloppe : **Besoins / Épargne / Plaisir** (la dernière utilisée est présélectionnée).
- Ligne d'aide : « Reste dans « Besoins » après cette dépense : X € ».
- Champs : libellé (facultatif), date (aujourd'hui par défaut).
- Bouton **« Valider la dépense »**.

**Mode Rentrée d'argent** (montant en vert)
- **Vers quel compte ?** : compte courant ou un des autres comptes.
- **D'où vient l'argent ?** : un des autres comptes, ou **« Autres »**. Avec « Autres », le champ libellé demande de préciser (gain, prêt d'un ami…).
- **Aperçu en direct** :
  - compte de destination : solde avant → après (pour le compte courant : reste à répartir du mois avant → après) ;
  - compte d'origine s'il y en a un : solde avant → après, en rouge avec « Solde insuffisant sur … » s'il devient négatif ;
  - sinon : « Aucun autre compte débité ».
- Bouton **« Ajouter la rentrée »** (vert `#146C43`).
- Règle : si la destination est le compte courant, le montant s'ajoute au reste à répartir **du mois de la date choisie**, puis se répartit dans les 3 enveloppes. Si l'origine est un compte, son solde baisse du même montant (c'est un virement).

### 4.5 Réglages (icône engrenage sur Mon mois)

Revenus (salaire et autres revenus réguliers avec début/fin), **Exporter / Importer** mes données (JSON), réinitialiser avec les données initiales (avec confirmation).

## 5. Modèle de données

Fichier `03_donnees_initiales.json` (chargé au premier lancement) :

```ts
type Mois = string; // "AAAA-MM"
interface Revenu { id; nom; montant: number; debut: Mois; fin: Mois | null; note? }
interface Charge {
  id; nom; categorie: string;
  frequence: "mensuelle" | "annuelle" | "ponctuelle";
  montant: number; debut: Mois | null; fin: Mois | null;
  moisAnnuel?: number | null; // 1-12 pour les annuelles
  note?;
}
interface Enveloppe { id: "besoins" | "epargne" | "plaisir"; nom; pourcentage: number | null; calcul?; note? }
interface Compte { id; nom; type: "courant" | "epargne" | "investissement" | "retraite" | "autre"; banque?; solde: number | null; note? }
interface Depense { id; date: string; montant: number; enveloppeId: string; libelle? }
interface Rentree {
  id; date: string; montant: number;
  versCompteId: string;            // "courant" = budget du mois
  depuisCompteId: string | null;   // null = "Autres"
  libelle?: string;                // précision pour "Autres"
  type?: "rentree" | "report";     // "report" = créé par une clôture
}
interface Cloture { mois: Mois; surplus: number; versCompteId: string | null; montantVire: number; montantReporte: number }
// À stocker aussi : pourcentages par mois { [mois]: { besoins, epargne } }
```

Le solde d'un compte d'épargne = solde de départ + rentrées vers ce compte − rentrées depuis ce compte + virements de clôture. `valeursDeControle` sert uniquement aux tests.

## 6. Règles de calcul (pour un mois `m`)

- **Une charge compte dans `m`** :
  - mensuelle ou ponctuelle : `debut <= m` et (`fin` null ou `m <= fin`) ;
  - annuelle : `moisAnnuel` et `debut` renseignés, même règle de dates, et numéro du mois de `m` = `moisAnnuel`. Si `moisAnnuel` est vide, elle ne compte nulle part (alerte sur l'écran Charges fixes).
- **ChargesFixes(m)** = somme des charges de `m` (cigarettes incluses).
- **ResteÀRépartir(m)** = revenus(m) + rentrées vers le compte courant datées en `m` (reports inclus) − ChargesFixes(m).
- **Base** = max(0, ResteÀRépartir). Besoins prévus = Base × %B ; Épargne prévue = Base × %E ; **Plaisir prévu = Base − Besoins − Épargne** (pour que la somme tombe juste).
- **Il te reste à dépenser** = (Besoins prévus − dépenses Besoins) + (Plaisir prévu − dépenses Plaisir) + min(0, ResteÀRépartir).
- **Surplus de fin de mois** = max(0, « Il te reste à dépenser »). Ce qui reste dans l'enveloppe Épargne est proposé au virement de la même façon (même bloc).
- Calculer en **centimes entiers** ; arrondir seulement à l'affichage.

**Valeurs de contrôle** (aucune dépense ni rentrée, 60 / 20 / 20) :

| Mois | Charges fixes | Reste à répartir | Besoins | Épargne | Plaisir |
|---|---|---|---|---|---|
| 2026-12 | 2 119,09 € | −19,09 € | 0 € | 0 € | 0 € |
| 2027-01 | 1 985,94 € | 114,06 € | 68,44 € | 22,81 € | 22,81 € |
| 2027-02 | 1 885,94 € | 214,06 € | 128,44 € | 42,81 € | 42,81 € |
| 2027-03 | 1 673,35 € | 426,65 € | 255,99 € | 85,33 € | 85,33 € |
| 2027-04 | 1 745,34 € | 354,66 € | 212,80 € | 70,93 € | 70,93 € |

Exemple à tester : une rentrée de 300 € vers le compte courant en décembre, depuis « Autres » → reste à répartir 280,91 €, puis Besoins 168,55 €, Épargne 56,18 €, Plaisir 56,18 €.

## 7. Technique

- **PWA** installable sur l'écran d'accueil de l'iPhone (manifest, icônes, `apple-mobile-web-app-capable`, plein écran, zones sûres), qui fonctionne hors ligne (service worker).
- **Vite + React + TypeScript**. CSS simple ou Tailwind. Pas de backend.
- **Stockage local** (IndexedDB recommandé), initialisé avec `03_donnees_initiales.json`.
- **Export / import JSON**, avec un rappel discret si aucune sauvegarde depuis 30 jours.
- **Tests** (Vitest) des règles de calcul avec les valeurs de contrôle.
- **Déploiement** sur GitHub Pages via GitHub Actions (HTTPS), avec le bon `base` Vite pour un dépôt de projet.
- Code simple et commenté en français : Baptiste n'est pas développeur.

## 8. Hors périmètre (plus tard)

Synchronisation entre appareils, connexion aux banques, objectifs (apport immobilier), graphiques d'historique, budget idéal.
