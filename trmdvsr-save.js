/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {actionDispatcher}
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        saveAllSettings
 * @description     ENREGISTRE (simule une mise à jour de données).
 * -------------------------------------------------------------------------------------------- */
function saveAllSettings() {
    // Logique de validation et sauvegarde ici...
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {actionDispatcher}
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        updateData
 * @description     TRAITE LES DONNÉES SAISIES (simule une mise à jour de données).
 *                  C'est ici que vous traiteriez les événements 'change' ou 'input' pour les formulaires.
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {string}        key             - La clé de donnée à mettre à jour
 * @param           {string}        value           - La nouvelle valeur.
 * @param           {HTMLElement}   element         - L'élément déclencheur 
 * -------------------------------------------------------------------------------------------- */
function updateData(key, value, element) { // 📘 ============================================== */
    console.log(`Donnée mise à jour: ${key} = ${value} `);            // Logique métier : MàJ état global ou appeler une API (ex: Firestore)

    const feedback = document.getElementById('feedback-message');     // Exemple de feedback pour le 'change'
    if (feedback) {
        feedback.textContent = `Nom saisi: ${value || 'Non défini' } `;
    }
}