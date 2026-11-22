# Mon Budget — mode d'emploi

## 1. Mettre l'app en ligne (une seule fois)

**a) Valider le travail de la nuit**

1. Sur GitHub, ouvre le dépôt **mon-budget**, onglet **Pull requests**.
2. Ouvre la pull request « Mon Budget : première version complète ».
3. Clique sur le bouton vert **Merge pull request**, puis **Confirm merge**.

**b) Activer GitHub Pages**

1. Dans le dépôt, clique sur l'onglet **Settings** (l'engrenage, en haut à droite).
2. Dans le menu de gauche, clique sur **Pages**.
3. Sous **Build and deployment**, dans la liste **Source**, choisis **GitHub Actions**.
   (Rien d'autre à remplir.)

**c) Lancer la mise en ligne**

1. Clique sur l'onglet **Actions** du dépôt.
2. À gauche, clique sur **Déploiement sur GitHub Pages**.
3. Clique sur **Run workflow** (à droite), puis sur le bouton vert **Run workflow**.
4. Attends 1 à 2 minutes que la ligne devienne verte ✅.

Ensuite, c'est automatique : chaque modification fusionnée dans `main` remet l'app à jour.

> ℹ️ Si le dépôt est **privé**, GitHub Pages demande un abonnement payant. Dans ce cas, le plus simple
> est de passer le dépôt en public (Settings → General → tout en bas, « Change visibility »).
> Tes données, elles, ne sont **jamais** sur GitHub : elles restent sur ton téléphone.

## 2. L'adresse de l'app

👉 **https://labaapt.github.io/mon-budget/**

## 3. Installer l'app sur l'iPhone

1. Ouvre l'adresse ci-dessus dans **Safari** (pas Chrome).
2. Touche le bouton **Partager** (le carré avec une flèche vers le haut, en bas de l'écran).
3. Fais défiler et touche **Sur l'écran d'accueil**.
4. Touche **Ajouter** en haut à droite.

L'icône « Mon Budget » apparaît sur l'écran d'accueil. Ouvre toujours l'app depuis cette icône :
elle s'affiche en plein écran et fonctionne même sans connexion.

> ⚠️ L'app installée et la page ouverte dans Safari ont **chacune leurs propres données**.
> Utilise toujours l'icône de l'écran d'accueil.

## 4. Sauvegarder mes données

Tes données sont enregistrées **uniquement sur ton iPhone**. Si tu supprimes l'app ou changes de
téléphone, elles sont perdues… sauf si tu as une sauvegarde. L'app te le rappelle si tu n'en as pas
fait depuis 30 jours.

**Faire une sauvegarde**

1. Dans l'app, sur **Mon mois**, touche l'**engrenage** en haut à droite.
2. Touche **Exporter mes données**.
3. Choisis **Enregistrer dans Fichiers** (par exemple dans iCloud Drive), ou envoie-la-toi par mail.

Le fichier s'appelle `mon-budget-AAAA-MM-JJ.json`.

**Récupérer une sauvegarde** (nouveau téléphone, PC…)

1. Engrenage → **Importer une sauvegarde**.
2. Choisis le fichier `.json`. L'app demande confirmation, puis remplace toutes les données.

**Repartir de zéro** : Engrenage → **Réinitialiser avec les données initiales** (fais une sauvegarde
avant !).

## 5. Utilisation au quotidien

- **+** (bouton bleu rond) : ajouter une **dépense** (choisis l'enveloppe) ou une **rentrée d'argent**.
- **Mon mois** : ce qu'il te reste à dépenser, tes enveloppes, la répartition 60 / 20 / 20.
  Touche une enveloppe pour voir, modifier ou supprimer ses dépenses.
- **Charges fixes** : touche une charge pour la modifier. Pense à renseigner le mois d'Amazon Prime.
- **Comptes** : Livret A, PER… Touche un compte pour voir son historique.
- **Fin du mois** : à partir du dernier jour du mois, un bloc apparaît en bas de Mon mois pour
  choisir quoi faire de ce qui reste (reporter, virer sur le Livret A, ou partager), puis clôturer.
