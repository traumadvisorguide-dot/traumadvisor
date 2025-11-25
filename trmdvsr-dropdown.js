/* DROPDOWN                                                           */
/*
    @function        populateDropdown       
    @description     Fonction de peuplement de dropdown réutilisable pour tous les cas.
    @param           {HTMLElement} selectElement   - L'élément <select> du DOM.
    @param           {Array}       data            - Le jeu de données.
    @param           {string}      [textKey='']    - La clé pour le texte affiché (si data est un array d'objets).
    @param           {string}      [valueKey='']   - La clé pour la valeur soumise (si data est un array d'objets). 
*/
function populateDropdown(selectElement, data, textKey = '', valueKey = '') {

    updateStatus({  etapeID: 'intro', type: 'loading', isLoading: true, 
        log:          `Init populateDropdown...[param]selectElement:${selectElement} | data:${data} | textKey:${textKey} | valueKey:${valueKey}`, 
        message:      "Initialisation du système de notation AAAAA terminée.", 
    });
    selectElement.innerHTML = ''; // Vider avant de remplir */
    /**
     * Il faudrait vérifier s'il y a des changements, 
     * nb d'items total. Et si ça a changé, update uniquement les nouveaux? versioning?
     * 
     */
    data.forEach(item => {
        const option = document.createElement('option');              // Écrit du html <option value=''>textContent</option
        
        if (textKey === '') {                                         // Si data est un array de strings (ex: ['Type A', 'Type B'])
            option.value = item;
            option.textContent = item;
    
        } else {                                                      // Si data est un array d'objets (ex: [{id: 1, nom: 'Lieu'}])
            option.value = item[valueKey];
            option.textContent = item[textKey];
        }
        selectElement.appendChild(option);
    });
}
/* ==================================================================
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ================================================================== */
