# traumadvisor
Guide des meilleures salles d'attente des professionnels de santé, hôpitaux, libéraux, centre, groupe... 


Ce script Google Apps Script est une bibliothèque qui permet de dupliquer les données de production vers des feuilles de test dédiées, assurant un environnement sécurisé pour le développement et la validation de nouvelles fonctionnalités.

---

### Fonctionnalités

* **Mode Test/Prod** : Basculez facilement entre les noms de feuilles de test et de production.
* **Copie complète** : Copie toutes les données (en-têtes inclus) des feuilles source.
* **Vérification de l'état** : Renvoie `true` si toutes les feuilles sont prêtes pour les tests.

---

### Installation et utilisation

Pour utiliser cette bibliothèque dans votre projet Apps Script, veuillez l'importer et appeler la fonction `preparerFeuilleDeTest()`.

**Exemple d'utilisation :**


```javascript
// La fonction preparerFeuilleDeTest est disponible après l'import de la bibliothèque
function executerMesTests() {
  const estPret = preparerFeuilleDeTest();
  if (estPret) {
    console.log("L'environnement de test est prêt !");
    // Placez ici votre code de test
  } else {
    console.log("Erreur : l'environnement de test n'a pas pu être préparé.");
  }
}
```
Initial commit with README.md
