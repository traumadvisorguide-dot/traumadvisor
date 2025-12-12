/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initLIS_navigation}  listeners sur <body>'submit'
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        handleFormSubmit
 * @description     GESTIONNAIRE DÉDIÉ AUX SOUMISSIONS DE FORMULAIRES
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {Event}         event           - L'objet événement.
 * -------------------------------------------------------------------------------------------- */
function handleFormSubmit(event) {
    console.debug( `⚙️.Init handleFormSubmit...[param]event: ${event}` );
    event.preventDefault();                                                                     // Essentiel : Bloquer la soumission native du navigateur
    
    const formElmnt = event.target.closest('form[data-action]');                                // Trouve l'élément qui a l'attribut data-action, en remontant l'arbre DOM
    if (!formElmnt) {                                                                           // Si aucun élément avec data-action n'est trouvé
        console.error( `❌.Form |handleFormSubmit : Pas de data-action.` );
        return;
    }
    const action = trgtElmnt.dataset.action ?? '';                                              // Coalescence des nuls pour assurer bon traitement info
    switch (action) {
        case 'submitLieuCreation':                                                              // Logique de validation et d'envoi des données du formulaire
            processLieuCreationSubmission(formElmnt);                                           // => trmdvsr-pages.js
        break;
        
        case 'submitEvaluation':
            console.warn( `✅.Form |handleFormSubmit : Soumission OK.` );                       // Logique de sauvegarde des évaluations
        break;
        
        default:
            console.error( `❌.Form |handleFormSubmit : Action de formulaire non gérée: ${action}` );
        break;
    }
}

/** ------------------------------------------------------------------------------------------- //
 * C. GESTIONNAIRE DÉDIÉ AUX MISES À JOUR DE CHAMPS (CHANGE/INPUT)
 * Voir si on doit réintégrer ses propriétées
 * -------------------------------------------------------------------------------------------- */
function handleFieldUpdate(event) {
    const field = event.target;
    if (!field.matches('input, select, textarea')) return;            // Cibler uniquement les champs qui nous intéressent
    
    const eventType = event.type;
    const value = field.value;
    const fieldId = field.id || field.name;
    
    if (eventType === 'input') {                                      // Logique de validation ou de mise à jour de l'état en temps réel
        console.log( `⚙️.Input |handleFieldUpdate [${eventType}] - Champ: ${fieldId}` );
        // Ex: checkPasswordStrength(value);
        if (fieldId === 'inputNomLieu' && value.length < 3) {         // Validation ou feedback en temps réel, ex:
            field.style.borderColor = 'red';                          // Afficher un message d'erreur en temps réel
        } else {
            field.style.borderColor = '';
        }
    }
    if (eventType === 'change') {
        // Ex: updateAppData(fieldId, value);
        if (fieldId === 'selectLieux') {                              // Mise à jour de l'état global ou déclenchement d'un calcul // Ex: si change une option, on met à jour le prix
            // Dans votre cas, le 'change' du select ne fait rien ici, car la validation est sur le bouton 'click'.
            console.log( `⚙️.Change |handleFieldUpdate : Select lieux mis à jour (valeur: ${value}).` );
        }
    }
    console.log( `⚙️.Run-ng |handleFieldUpdate [${eventType}] : Champ ${fieldId} mis à jour.` );
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initLIS_navigation}                        ../
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initDatas
 * @description     GESTIONNAIRE DÉDIÉ AUX TOUCHES CLAVIER (KEYUP/KEYDOWN)
 *                  Utilisé pour intercepter des touches spécifiques avant le submit du formulaire
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {Object}        event           - L'objet contenant toutes les briques de données 
 * -------------------------------------------------------------------------------------------- */
function handleKeyEvents(event) {
    const field = event.target;        
    if (field.id === 'adressSalle' || field.id === 'autreChampAvecAutoComplete') {              // Cibler spécifiquement le champ d'adresse pour bloquer 'Enter'
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();                                                             // Empêche la soumission accidentelle par Entrée lors de l'autocomplétion
            console.warn( `⚠️.Keydown |handleKeyEvents : Touche Entrée interceptée sur le champ ${field.id}.` );
        }
    }
}

/** ------------------------------------------------------------------------------------------- //
 * @version         25.12.01 (16:34)
 * @instanceIn      {actionDispatcher} & {initDatas}   ../
 * @instanceCount   4 (3 + 1)
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        handleRatingChange
 * @description     MET A JOUR L'AFFICHAGE DE LA NOTE SÉLECTIONNÉE
 *                  Logique métier : Met à jour l'affichage numérique de la note sélectionnée et gère le bouton Suivant.
 *                  Cette fonction est appelée par actionDispatcher pour le cas 'handleRatingChange'.
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {HTMLElement}   radioElement    - L'input radio qui a déclenché l'événement.
 * -------------------------------------------------------------------------------------------- */
function handleRatingChange(radioElement) {
    console.debug( `Init handleRatingChange... [param]${radioElement.name} && ${radioElement.value}` );
    const radioName = radioElement.name;                                                        // Ex: 'eval-q1'
    const score = radioElement.value;                                                           // Ex: '5'
    if (!radioName.startsWith('eval-q')) return;

    const questionId = radioName.split('-')[1];                                                 // Extrait l'identifiant de la question (ex: q1)
    const sectionId = `section_${questionId}`;                                                  // 'section_q1'
    console.log(`handleRatingChange => ${radioName} && ${score} && ${questionId} && ${sectionId}`);

    const scoreDisplay = document.getElementById(`result-${questionId}`);                       // 1. MaJ affichage numérique note <= ID élément cible
    if (scoreDisplay) {
        console.log(`scoreDisplay.id: ${scoreDisplay.id}`);
        scoreDisplay.value = `${score}/5`;
    }

    checkSectionCompletion(sectionId);                                                          // 2. Vérifie la complétion => active le bouton de navigation
    const targetPage = Object.values(pages).find( p => p.id === 'evaluations_page' );           // Charge l'objet page à afficher <= nwPgID existe (if initial)
    const targetSctn = targetPage?.sub.find( s => s.id === sectionId );                         // Charge l'objet page à afficher <= nwPgID existe (if initial)
    if (targetSctn) {                                                                           // 3. Enregistre données de notation
        appData[`note${targetSctn.label}`] = score;                                             //noteAccessibilite/noteApparence/noteAssise/noteAttention/noteAttente
    }
    console.warn( `✅.End-ng |handleRatingChange : Note ${score}/5 enregistrée pour ${questionId}.` );
}

/**
 * // --- NOUVEAUX CAS POUR LA NOTATION ---
            case 'handleRatingRollover':
                // La logique de survol est très simple, on peut la traiter directement ou appeler une fonction
                if (eventType === 'mouseover') {
                    trgtElmnt.classList.add('is-hovering');
                } else if (eventType === 'mouseout') {
                    trgtElmnt.classList.remove('is-hovering');
                }
                break;
                
            case 'handleRatingChange':
                // Assurez-vous que c'est bien un événement 'change' sur un input radio de notation
                if (eventType === 'change' && trgtElmnt.name.startsWith('eval-q')) {
                    handleRatingChange(trgtElmnt); // Appel de la fonction de logique métier (voir point 3)
                }
                break;

// Depuis AVIS
/**-------------------------------------------------------------------- //
 * @instanceIn      {??} ../
 * ---------------- --------------- --------------- - ----------------- //
 * @function        handleStyleChange
 * @description     GÈRE LES CHANGEMENTS DE STYLE DEMANDÉS 
 *                  Logique d'Action : Ajoute un nouveau message de l'app à la suite.
 * ---------------- --------------- --------------- - ----------------- //
 * @param           {command}       action          - L'action à effectuer. Augmenter ou diminuer.
 *--------------------------------------------------------------------- */
function handleStyleChange(command) {
    console.log(`handleStyleChange`);

    const newTextPlaceholder = `[Nouvelle Proposition Stylistique] Suite à la commande "${command}" appliquée au texte précédent, voici une version mise à jour. (Intégration API personnelle requise).`;
    createMessageElement(newTextPlaceholder, 'app');                  // 1. Créer le nouveau message de l'app (mis à jour) - Garde l'historique visible
    currentText = newTextPlaceholder;                                 // Mettre à jour le texte actuel
    showActionMode();                                                 // 2. Rester en mode 3-Boutons (pour les actions suivantes)
}

/**-------------------------------------------------------------------- //
 * @instanceIn      {??} ../
 * ---------------- --------------- --------------- - ----------------- //
 * @function        handleOpenEdit
 * @description     OUVRE LA ZONE D'ÉDITION ET CHARGE LE TEXTE ACTUEL 
 *--------------------------------------------------------------------- */
function handleOpenEdit() {
    console.log(`handleOpenEdit`);
    editArea.value = currentText;                                     // 1. Charger le texte de la dernière bulle dans le textarea
    showEditMode();                                                   // 2. Basculer l'affichage
}

/**-------------------------------------------------------------------- //
 * @instanceIn      {??} ../
 * ---------------- --------------- --------------- - ----------------- //
 * @function        handleOpenEdit
 * @description     VALIDE L'ÉDITION DU TEXTE 
 *                  Ajoute le texte édité comme un message utilisateur et revient au mode 3-Boutons.
 *--------------------------------------------------------------------- */
function handleSendEdit() {
    const editedText = editArea.value.trim();
    console.log(`handleSendEdit => ${editedText}`);
    if (editedText === "") {                                // Si le texte est vide ou n'a pas changé, on peut gérer cela, mais pour l'instant on sort.
        showActionMode();                                   // Revenir au mode action si l'envoi est annulé
        return;
    }

    createMessageElement(editedText, 'user');               // 1. Afficher la version finale (l'édition utilisateur) - Ajout à l'historique
    
    currentText = editedText;                               // 2. Mettre à jour le texte actuel pour les futures actions (Ajouter/Enlever/Éditer)
    showActionMode();                                       // 3. Revenir au mode 3-Boutons
    editArea.value = '';                                    // 4. Vider le champ d'édition (par propreté)
}