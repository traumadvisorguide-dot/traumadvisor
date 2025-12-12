/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {..}                   ../
 * @instanceCount   1 - unique     
 * ---------------- ----------------------- --------------- - --------------------------------- //
 * @function        ppltDrpdwnimized       
 * @description     MET À JOUR UN DROPDOWN
 *                  En ajoutant uniquement au <select>les nouvelles options <option> qui n'existent pas encore.
 * ---------------- ----------------------- --------------- - --------------------------------- //
 * @param           {HTMLSelectElement}     selectElement   - L'élément DOM <select> à mettre à jour.
 * @param           {Array<Object|string>}  data            - Le nouvel array de données (objets ou strings) à ajouter.
 * @param           {string}                textKey         - Clé pour le texte affiché (textContent), vide si array de strings.
 * @param           {string}                valueKey        - Clé pour la valeur de l'option (value), vide si array de strings.
 * -------------------------------------------------------------------------------------------- */
function ppltDrpdwn (selectElement, data, textKey = '', valueKey = '') {
    console.log(`Démarrage ppltDrpdwnimized pour ${selectElement.id}...`);
    updateStatus({ type: 'loading', isLdng: true, msg: "Mise à jour des salles d'attente." });

    const existingValues = new Set();                                                           // 1. Crée un Set (ensemble) des valeurs existantes => recherche rapide O(1). Utilisation de 'value' de <option> comme clé d'unicité.    
    for (const option of selectElement.options) existingValues.add(option.value);               // Parcourt les options existantes et ajouter leur valeur au Set
    
    let optionsAddedCount = 0;
    const fragment = document.createDocumentFragment();                                         // 2. Traite les nouvelles données en utilisant un DocumentFragment pour optimiser l'insertion dans le DOM
    
    data.forEach( item => {
        let value, text;

        if (textKey === '' || typeof item === 'string') {                                       // Cas => array de strings (ex: ['Type A', 'Type B'])
            value = item;
            text = item;

        } else {                                                                                // Cas => array d'objets (ex: [{id: 1, nom: 'Lieu'}])
            value = item[valueKey];
            text = item[textKey];
        }

        if ( !existingValues.has(String(value)) ) {                                             // 3. Vérifie l'existence : n'ajoute que si la valeur n'est pas déjà présente <= conversion en string essentielle car Set stocke la valeur de l'option qui est toujours une chaîne.
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            fragment.appendChild(option);
            optionsAddedCount++;
        }
    } );
    
    if (optionsAddedCount > 0) {                                                                // 4. Insertion finale dans le DOM
        selectElement.appendChild(fragment);
        console.log(`Dropdown mis à jour : ${optionsAddedCount} nouvelles options ajoutées.`);
    
    } else {
        console.log("Dropdown inchangé : aucune nouvelle option à ajouter.");
    }
}

/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */