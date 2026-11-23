# Décisions prises pendant la construction

Points que le cahier des charges ne tranchait pas : voici le choix fait, toujours le plus simple
et le plus cohérent avec la spec. Tout peut être changé plus tard.

## Données et calculs

1. **Montants stockés en euros, calculés en centimes.** Les données gardent la forme de
   `03_donnees_initiales.json` (ex. `152.08`). Chaque calcul convertit d'abord en centimes entiers
   (`Math.round(montant × 100)`) ; on n'arrondit qu'à l'affichage. L'export JSON a donc la même
   forme que le fichier initial.
2. **Arrondi des enveloppes** : Besoins = `arrondi(Base × %B / 100)`, Épargne = `arrondi(Base × %E / 100)`
   (arrondi au centime le plus proche), Plaisir = Base − Besoins − Épargne. Cela redonne exactement
   les valeurs de contrôle.
3. **Virement depuis le compte courant** (Rentrée d'argent vers le Livret A, « D'où vient l'argent ? » =
   Compte courant) : il **diminue le reste à répartir** du mois de la date choisie. La spec ne disait
   que l'inverse (vers le compte courant = ajout) ; c'est le choix symétrique.
4. **Surplus de fin de mois** : le bloc « Fin du mois » propose **surplus + épargne restante**
   (surplus = max(0, « Il te reste à dépenser ») et épargne restante = max(0, Épargne prévue − dépenses
   Épargne)). Le texte précise « dont X € d'épargne ». Un mois négatif n'est jamais reporté en négatif.
5. **Report** : la rentrée « Report de <mois> » est datée du **1er du mois suivant**, vers le compte
   courant, avec l'identifiant `report-AAAA-MM`. Elle ne peut pas être supprimée avec la croix
   (il faut annuler la clôture).
6. **Annuler une clôture** supprime la clôture et son report. C'est refusé si le mois suivant est
   lui-même clôturé (il faut d'abord annuler celui-là), pour garder des chiffres cohérents.
7. Un mois clôturé reste modifiable (on peut encore ajouter une dépense) ; les montants de la
   clôture, eux, ne bougent pas tant qu'on ne l'annule pas puis la refait.
8. **Pourcentages par mois** : stockés dans `pourcentages: { "AAAA-MM": { besoins, epargne } }`.
   Un mois sans valeur reprend celles du dernier mois précédent qui en a, sinon 60 / 20.
   Au premier lancement, 60 / 20 est enregistré pour le premier mois (2026-12).
9. **Ponctuelle** : une charge ponctuelle a toujours début = fin (elle ne compte que dans son mois).
10. L'étiquette **« Engagé »** s'affiche quand la note de la charge commence par « Engagé »
    (cas de Canal+ et RMC Sport). Il n'y a pas de champ dédié.
11. **Étiquette « Décembre uniquement »** : charge mensuelle avec début = fin ;
    **« Jusqu'en févr. 2027 »** : charge avec une date de fin.
12. Le total « **À partir de …** » sur l'écran Charges fixes montre le prochain mois (sur 3 ans) où
    le total change.

## Écrans

13. **Mois affiché au démarrage** : le mois en cours, mais jamais avant le premier mois du budget
    (2026-12). Aujourd'hui (novembre 2026), l'app s'ouvre donc sur décembre 2026. On ne peut pas
    reculer avant décembre 2026.
14. Le mois choisi est **partagé** entre Mon mois, Charges fixes et Comptes (la carte Compte courant
    montre ce mois-là).
15. **Date par défaut** dans « Ajouter » : aujourd'hui si on regarde le mois en cours, sinon le 1er du
    mois affiché.
16. Bloc « Fin du mois » visible : le dernier jour du mois en cours, et pour tout mois passé (depuis
    2026-12) non clôturé. Pour la clôture, le compte proposé par défaut est le Livret A ; s'il y a
    plusieurs comptes, une liste permet d'en choisir un autre. Avec « Partager », la part proposée
    est la moitié.
17. Le **pavé numérique** de l'écran Ajouter reste fixé en bas, juste au-dessus du bouton, pour être
    toujours visible. Maximum 8 chiffres.
18. Un **solde insuffisant** est signalé en rouge mais n'empêche pas d'ajouter la rentrée.
19. Un compte ne peut être supprimé que s'il n'a aucun mouvement. Le compte courant ne se supprime pas.
20. L'écran Ajouter permet aussi de **modifier** une dépense (depuis le détail d'une enveloppe).
    Les rentrées, elles, se suppriment (croix) et se ressaisissent.
21. Les virements sortant du compte courant apparaissent dans le Résumé de Mon mois, en rouge.

## Technique

22. **Stockage** : IndexedDB, tout l'objet sous une seule clé (`mon-budget` / `donnees` / `etat`),
    avec repli sur localStorage si IndexedDB est indisponible. L'app demande au navigateur un
    stockage « persistant ».
23. **Rappel de sauvegarde** : bandeau sur Mon mois si aucun export depuis 30 jours
    (ou 30 jours après la première ouverture).
24. **Export** : sur iPhone, la feuille de partage s'ouvre (Enregistrer dans Fichiers, mail…) ;
    sur PC, le fichier se télécharge. L'import accepte une sauvegarde de l'app ou un fichier au format
    de `03_donnees_initiales.json`.
25. **Service worker écrit à la main** (`public/sw.js`, ~50 lignes) plutôt qu'un plugin : plus facile à
    lire. Pages : internet d'abord puis copie ; autres fichiers : copie d'abord.
26. **Police Inter** embarquée dans l'app (paquet `@fontsource/inter`, caractères latins seulement)
    pour fonctionner hors ligne.
27. **Icônes** générées par un petit script sans dépendance (`npm run icones`).
28. **Pas de routeur** : la navigation est un simple état React (onglet + panneaux ouverts).
29. Le dossier `maquette/` n'existait pas dans le dépôt : le design suit uniquement la section 2 de la spec.
30. Montants toujours affichés avec 2 décimales (`0,00 €`), avec des espaces insécables.

## Modifications après la première version

31. **Interrupteur « Voir aussi les charges terminées ou à venir » supprimé** (demande de Baptiste) :
    l'écran Charges fixes montre uniquement les charges du mois affiché. Pour voir une charge d'un
    autre mois, il suffit de changer de mois avec les flèches.
32. **Barre d'onglets qui remontait sur l'écran Comptes** (iPhone, app installée) : quand une page est
    plus courte que l'écran, iOS place mal les éléments fixés en bas. Chaque écran fait maintenant au
    moins la hauteur de l'écran (`min-height: 100vh`).
33. **Banque modifiable sur tous les comptes** (demande de Baptiste) : champ « Banque (facultatif) »
    dans le détail d'un compte. Pour le compte courant, un lien « Modifier » en haut de sa carte ouvre
    un panneau avec seulement le nom et la banque (pas de type ni de solde de départ) ; le reste de la
    carte renvoie toujours vers Mon mois. La banque s'affiche sous le type dans la liste des comptes.
34. **Mention « (cigarettes incluses) » retirée** de la ligne Charges fixes du Résumé (demande de
    Baptiste). Le calcul ne change pas : les cigarettes restent une charge fixe comme les autres.
