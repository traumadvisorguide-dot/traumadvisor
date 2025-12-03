/* == FONCTIONS ================================== (CREATION LIEU) == */
/**------------------------------------------------------------------ //
* @instanceIn      {loadPage}                        ../
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        processLieuCreationSubmission
* @description     TRAITEMENT DE LA SOUMISSION DE CRÉATION DE LIEU
*                  Valider les données du formulaire, les collecter et naviguer.
* ---------------- --------------- --------------- - ---------------- //
* @param           {Object}        formElmnt       - L'objet contenant toutes les briques de données 
* @example                                           {lieux: [...], types: [...], page_title: "..."}
* ------------------------------------------------------------------- */
function processLieuCreationSubmission(formElmnt) {
      const adresseElmnt = formElmnt.querySelector('#adressSalle');
      const adresseError = document.getElementById('adresseError'); 
      
      if (adresseError) {                                             // 1. Réinitialiser l'état d'erreur
            adresseError.classList.add('hidden');
            adresseError.textContent = '';
      }
      
      const adresseValue = creaPgElmnts.adressElmnt ? creaPgElmnts.adressElmnt.value.trim() : '';
      
      if (adresseValue === '') {                                      // 2. Validation : Le champ adresseSalle est-il vide ?
            console.error("Validation échouée : Le champ adresseSalle est vide.");
            
            if (adresseError) {                                       // Afficher le message d'erreur si l'élément existe                          
                  adresseError.textContent = "Veuillez sélectionner une adresse valide (champ requis).";
                  adresseError.classList.remove('hidden');
            }
            
            if (creaPgElmnts.adressElmnt) {
                  creaPgElmnts.adressElmnt.focus();                   // Activer le focus sur le champ vide (Objectif du client)
                  creaPgElmnts.adressElmnt.reportValidity();
            }
            
            updateStatus({ log: `❌.Form |submitLieuCreation : Validation échouée.`, type: 'error' });
            return;   
      }
      
      appData.adresseSalle = adresseValue;                            // 📘✅ Collecte des données
      appData.nomSalle = formElmnt.querySelector('#nomSalle')?.value || '';
      appData.typeEtablissement = formElmnt.querySelector('#typeEtablissement')?.value || '';
      
      updateStatus({ log: `✅.Form |submitLieuCreation : OK. Validation réussie. Données collectées: ${appData}`, type: 'success' });
      showPage('evaluations_page');                                   // Passer à la page d'évaluation
}
      
// Fonction appelée par le script Google Maps après son chargement
/**------------------------------------------------------------------ //
* @instanceIn      <html> <head> callback
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        googleMapsCallback
* @description     INITIALISE L'AUTOCOMPLETION GOOGLE MAPS
* ------------------------------------------------------------------- */
function googleMapsCallback() {
      isMapsScriptLoaded = true;                                      // Le script Maps est prêt, nous levons le deuxième drapeau
      tryToInitAutocomplete();                                        // Tentative d'initialisation (si le DOM est déjà prêt)
}

/**------------------------------------------------------------------ //
* @version         25.10.09 (23:16)
* @instanceIn      {initializeDOMElements} {initAutocomplete}       ../
* @instanceCount   2
* ---------------- --------------- --------------- - ---------------- //
* @function        tryToInitAutocomplete
* @description     VÉRIFIE SI TOUT EST PRÊT POUR LANCER L'AUTOCOMPLETION
*                  Permet de démembrer la fonction initialit initAutocomplete
* ------------------------------------------------------------------- */
function tryToInitAutocomplete() {
      if (isInit.allDOMLoaded && isInit.mapsScriptLoaded) {
            updateStatus({ log:`Synchronisation : DOM et Maps chargés. Initialisation de l'autocomplétion.` });
            initAutocomplete();
      } else {
            updateStatus({ log:`Attente de chargement : DOM prêt=${isInit.allDOMLoaded}, Maps prêt=${isInit.mapsScriptLoaded}` });
      }
}

/**-----------------------------------------------------------------------------//
* @instanceIn      <html> <head> callback
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - --------------------------//
* @function        initAutocomplete
* @description     INITIALISE L'AUTOCOMPLETION GOOGLE MAPS
* ---------------------------------------------------------------------------- */
function initAutocomplete() {
      if (!creaPgElmnts.adressElmnt) {
            console.error("Erreur critique : Le champ d'adresse n'a pas été trouvé lors de l'initialisation Maps.");
            return;
      }
      
      const autocomplete = new google.maps.places.Autocomplete(creaPgElmnts.adressElmnt, {           // Initialiser service autocomplétion sur le champ d'entrée.
            types: ['geocode'],                                                // Restreindre recherche > 'geocode' suffisant pour adresses
            componentRestrictions: { country: ["fr", "be", "ch"] },            // Restreindre aux pays souhaités
      });
      
      autocomplete.addListener('place_changed', () => {                        // Écouter sélection de l'utilisateur
            const place = autocomplete.getPlace();                             // 'place_changed' <= quand utilisateur sélectionne une suggestion
            
            if (!place.geometry) {
                  console.log(`Détails d'adresse non trouvés pour l'entrée: ${place.name}`);  // L'utilisateur a entré une adresse mais n'a pas sélectionné de suggestion
                  return;
            }
            
            console.log(`Adresse complète: ${place.formatted_address}`);       // Utiliser les données de l'adresse sélectionnée
            extractAddressComponents(place);                                   // Extraire infos spécif. (rue, ville, CP) via place.address_components
      });
} 

// Fonction utilitaire pour extraire les composants (facultatif mais utile)
function extractAddressComponents(place) {
      let street = '';
      let city = '';
      let postalCode = '';
      
      for (const component of place.address_components) {
            const type = component.types[0];
            if (type === 'street_number') {
                  street = component.long_name;
            } else if (type === 'route') {
                  street = (street ? street + ' ' : '') + component.long_name; // Concaténer le numéro de rue et le nom de la rue
            } else if (type === 'locality') {
                  city = component.long_name;
            } else if (type === 'postal_code') {
                  postalCode = component.long_name;
            }
      }
      // console.log('Rue/Numéro:', street); console.log('Ville:', city); console.log('Code Postal:', postalCode);
      const fullAddress = `${street}. ${city}. ${postalCode}`;
      appData.adresseSalle = fullAddress; 
      // google.script.run.processAddress({ street: street, city: city, postalCode: postalCode }); <= envoie pas immédiat
}

/* == NAVIGATION =================================== (EVALUATIONS) == */
/**------------------------------------------------------------------ //
* @version         25.11.17 (17:52)                - 25.10.09 (23:16)
* ---------------- --------------- --------------- - ---------------- //
* @function        updateBreadcrumbs
* @description     MET A JOUR LE FIL D'ARIANE 
*                  Fonction centrale de la page évaluation. 
*                  Met à jour les classes CSS des éléments de navigation breadcrumb.
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}      prntElmnt             - ID de la question cible (ID de la section à afficher).
* ------------------------------------------------------------------- */
function updateBreadcrumbs(refElmnt, newSecID) {
      updateStatus({ log: `Init updateBreadcrumbs... [param]refElmnt:${refElmnt} / newSecID:${newSecID}` });
      try {
            const newIndex = refElmnt.sub.findIndex(s => s.id === newSecID);
            updateStatus({ log: `./📄⚙️.Run-ng |updateBreadcrumbs : [param]newIndex:${newIndex}` });
            
            refElmnt.brdcrmbElmnts.forEach((item, index) => {
                  updateStatus({ log: `./📄⚙️.Run-ng |updateBreadcrumbs : [param]item:${item} / index:${index}` });
                  item.classList.remove('active', 'completed', 'disabled');
                  
                  if (index === newIndex) {
                        item.classList.add('active');                 // Étape actuelle
                  
                  } else if (index < newIndex) {
                        item.classList.add('completed');              // Étape complétée (passée)
                  
                  } else {                                            // Étape future
                        item.classList.add('disabled');               //    => On désactive l'accès direct aux étapes futures
                  }
            });
            updateStatus({ log: `.../📄✅.Run-ng |updateBreadcrumbs : Breadcrumbs mis à jour pour la section ${newSecID}` });
      } catch (error) {
            updateStatus({ log: `🚫.Catched |updateBreadcrumbs : Erreur lors de la mise à jour des breadcrumbs: ${error}`, type: 'error' });
      }
}


// ***************************************************************
// 1. Fonctions de Logique Métier (séparées du Dispatcher)
// ***************************************************************

/**-------------------------------------------------------------------------------------------- //
* @version        25.12.01 (16:34)
* @instanceIn     {actionDispatcher} & {handlePageData}   ../
* @instanceCount  4 (3 + 1)
* --------------- ----------------- ----------------- - --------------------------------------- //
* @function       handleRatingChange
* @description    MET A JOUR L'AFFICHAGE DE LA NOTE SÉLECTIONNÉE
*                 Met à jour l'affichage numérique de la note sélectionnée et gère le bouton Suivant.
*                 Cette fonction est appelée par actionDispatcher pour le cas 'handleRatingChange'.
* --------------- ----------------- ----------------- - --------------------------------------- //
* @param          {HTMLElement}     radioElement      - L'input radio qui a déclenché l'événement.
* --------------------------------------------------------------------------------------------- */
function handleRatingChange(radioElement) {
      console.debug( `Init handleRatingChange... [param]${radioElement.name} && ${radioElement.value}` );
      const radioName = radioElement.name;                                                      // Ex: 'eval-q1'
      const score = radioElement.value;                                                         // Ex: '5'
      if (!radioName.startsWith('eval-q')) return;

      const questionId = radioName.split('-')[1];                                               // Extrait l'identifiant de la question (ex: q1)
      const sectionId = `section_${questionId}`;                                                // 'section_q1'
      console.log(`handleRatingChange => ${radioName} && ${score} && ${questionId} && ${sectionId}`);

      const scoreDisplay = document.getElementById(`result-${questionId}`);                     // 1. MaJ affichage numérique note <= ID élément cible
      if (scoreDisplay) {
            console.log(`scoreDisplay.id: ${scoreDisplay.id}`);
            scoreDisplay.value = `${score}/5`;
      }

      checkSectionCompletion(sectionId);                                                        // 2. Vérifie la complétion => active le bouton de navigation
      const targetPage = Object.values(pages).find(p => p.label === 'eval');                    // Charge l'objet page à afficher <= nwPgID existe (if initial)
      const targetSctn = targetPage?.sub.find(s => s.id === sectionId);                          // Charge l'objet page à afficher <= nwPgID existe (if initial)
      if (targetSctn) {                                                                         // 3. Enregistre données de notation
            appData['note${targetSctn.label}'] = score;                                        //noteAccessibilite/noteApparence/noteAssise/noteAttention/noteAttente
      }

      console.warn( `✅.End-ng |handleRatingChange : Note ${score}/5 enregistrée pour ${questionId}.` );
}

/**-------------------------------------------------------------------------------------------- //
 * @version         25.12.02 (23:33)
 * ---------------- ------------------- ------------------- - --------------------------------- //
 * @function        handleRatingChange
 * @description     MET A JOUR L'AFFICHAGE DE LA NOTE SÉLECTIONNÉE
 *                  LOGIQUE CLÉ : Utiliser l'attribut 'for' du label pour trouver l'input associé.
 * ---------------- ------------------- ------------------- - --------------------------------- //
 * @param           {HTMLElement}       labelElement        - L'élément label survolé.
 * @returns         {string|null}                           > La valeur de la note ('1', '2', '3', etc.) ou null.    
 * -------------------------------------------------------------------------------------------- */
function getSectionFromLabel(labelElement) {
    
    const radioId = labelElement.getAttribute('for');                                           // 1. Récupère la valeur de l'attribut 'for' du label (e.g., "q1-r5")
    console.log(`getScoreFromLabel => radioId:${radioId}`)
    if (!radioId) {
        console.error("L'attribut 'for' est manquant sur le label.");
        return null;
    }

    const associatedRadio = document.getElementById(radioId);                                   // 2. Utilise document.getElementById() avec cet ID pour trouver l'input
    if (!associatedRadio || associatedRadio.type !== 'radio') {
        console.error(`Aucun input radio trouvé avec l'ID: ${radioId}`);
        return null;
    }
    console.log(`getScoreFromLabel => associatedRadio.value:${associatedRadio.value}`)
    return associatedRadio.value;                                                               // 3. Retourne la valeur de l'input
}

/**-------------------------------------------------------------------------------------------- //
 * @version         25.12.02 (23:33)
 * ---------------- ------------------- ------------------- - --------------------------------- //
 * @function        getScoreFromLabel
 * @description     MET A JOUR L'AFFICHAGE DE LA NOTE SÉLECTIONNÉE
 *                  LOGIQUE CLÉ : Utiliser l'attribut 'for' du label pour trouver l'input associé.
 * ---------------- ------------------- ------------------- - --------------------------------- //
 * @param           {HTMLElement}       labelElement        - L'élément label survolé.
 * @returns         {string|null}                           > La valeur de la note ('1', '2', '3', etc.) ou null.    
 * -------------------------------------------------------------------------------------------- */
function getScoreFromLabel(labelElement) {
    
    const radioId = labelElement.getAttribute('for');                                           // 1. Récupère la valeur de l'attribut 'for' du label (e.g., "q1-r5")
    console.log(`getScoreFromLabel => radioId:${radioId}`)
    if (!radioId) {
        console.error("L'attribut 'for' est manquant sur le label.");
        return null;
    }

    const associatedRadio = document.getElementById(radioId);                                   // 2. Utilise document.getElementById() avec cet ID pour trouver l'input
    if (!associatedRadio || associatedRadio.type !== 'radio') {
        console.error(`Aucun input radio trouvé avec l'ID: ${radioId}`);
        return null;
    }
    console.log(`getScoreFromLabel => associatedRadio.value:${associatedRadio.value}`)
    return associatedRadio.value;                                                               // 3. Retourne la valeur de l'input
}

/**-------------------------------------------------------------------------------------------- //
 * @version         25.12.02 (14:38)
 * ---------------- ------------------- ------------------- - --------------------------------- //
 * @function        displayNote
 * @description     MET À JOUR L'AFFICHAGE DE LA NOTE 
 *                  en utilisant la référence DOM pré-stockée dans pages.eval.sub, recherchée par l'index de la question (q1, q2, ...).
 * ---------------- ------------------- ------------------- - --------------------------------- //
 * @param           {number}            score               - Le score numérique à afficher (ex: 3.5).
 * @param           {HTMLElement}       element             - L'élément déclencheur du DOM (<label> ou <input> radio).
 * -------------------------------------------------------------------------------------------- */
/**
 * Met à jour l'affichage de la note en utilisant la référence DOM pré-stockée 
 * dans pages.eval.sub, recherchée par l'index de la question (q1, q2, ...).
 * * @param {number|null|undefined} score - Le score numérique à afficher (entre 0 et 5).
 * @param {HTMLElement} element - L'élément déclencheur du DOM (<label> ou <input> radio).
 */
function getInfos(element) {
    if (!element || !pages.eval || !pages.eval.sub) {
        console.error("Erreur: Structure pages.eval.sub ou élément déclencheur manquant.");
        return;
    }
    
    let questionId = null; // e.g., "q1", "q2"
    const tagName = element.tagName;
    
    // --- 1. Extraction de l'ID de la question (qX) à partir du DOM ---
    if (tagName === 'LABEL') { 
        const radioId = element.getAttribute('for'); 
        if (radioId) {
            questionId = radioId.split('-')[0]; // Ex: "q1-r5" -> "q1"
        }
    } else if (tagName === 'INPUT' && element.type === 'radio') {
        const nameAttr = element.getAttribute('name'); 
        if (nameAttr) {
            const parts = nameAttr.split('-');
            questionId = parts[parts.length - 1]; // Ex: "eval-q1" -> "q1"
        }
    }
    
    if (!questionId || !questionId.startsWith('q')) {
        console.warn(`ID de question invalide ou non trouvé dans le DOM: ${element.outerHTML}`);
        return;
    }

    // --- 2. Détermination de l'INDEX dans pages.eval.sub ---
    const questionNumber = parseInt(questionId.substring(1), 10); 
    
    if (isNaN(questionNumber) || questionNumber < 1) {
        console.error(`Impossible de déterminer le numéro de question à partir de l'ID: ${questionId}`);
        return;
    }

    const targetIndex = questionNumber - 1; // q1 -> index 0
    if (targetIndex < 0 || targetIndex >= pages.eval.sub.length) { 
        console.error(`Index de section ${targetIndex} hors limites pour pages.eval.sub.`);
        return;
    }
        
    return targetIndex;
}

function displayNote(score, targetIndex) {

    const sectionData = pages.eval.sub[targetIndex];
    const targetDisplayElmnt = sectionData.noteDisplayElmnt; 

    console.log (`displayNote: >> ${sectionData} && targetDisplayElmnt`)
    
    // --- 3. Mise à jour de la valeur via la référence DOM stockée ---
    if (!targetDisplayElmnt) {
        console.error(`Référence DOM (noteDisplayElmnt) manquante dans les données pour l'index : ${targetIndex}`);
        return;
    }
    
    let scoreFinal;

    // Vérifie si le score est un nombre valide (y compris 0)
    if (typeof score === 'number' && !isNaN(score)) {
        // Optionnel: Utilisez toFixed(1) pour un formatage uniforme comme 3.0/5
        scoreFinal = `${score.toFixed(1)}/5`; 
        
        // Optionnel: Mettre à jour la propriété 'sub.note' si vous la suivez
        if (sectionData.hasOwnProperty('note')) {
             sectionData.note = score;
        }
    } else {
        scoreFinal = `⏳/5`; // Placeholder
    }
    
    // Si targetDisplayElmnt est un <span>/<div>, utilisez textContent. 
    // Si c'est un <input> ou <textarea>, utilisez .value.
    // Nous conservons votre choix (.textContent) :
    targetDisplayElmnt.value = scoreFinal;
    console.log(`Note (${scoreFinal}) mise à jour pour ${questionId} (Index ${targetIndex}) via référence DOM stockée.`);
}

// NOTE IMPORTANTE: 
// Si 'noteDisplayElmnt' est un champ de formulaire (<input type="text">), 
// il faudrait utiliser targetDisplayElmnt.value = scoreFinal; au lieu de .textContent.
// Vérifiez si vous utilisez un <input> ou un <span>/<div> pour l'affichage du score.

/**-------------------------------------------------------------------------------------------- //
 * @version        25.12.01 (16:34)
 * --------------- ----------------- ----------------- - -------------------------------------- //
 * @function       checkSectionCompletion
 * @description    VÉRIFIE SI UNE SECTION D'ÉVALUATION EST COMPLÉTÉE
 *                 Et gère l'état du bouton Suivant.
 *                 Cette fonction est réutilisée pour la validation avant la navigation
 * --------------- ----------------- ----------------- - -------------------------------------- //
 * @param          {string}          sectionId         - L'ID de la section (e.g., 'section_q1').
 * @returns        {boolean}                           > Vrai si la section est complétée.
 * -------------------------------------------------------------------------------------------- */
function checkSectionCompletion(sectionId) {
      const questionPrefix = sectionId.replace('section_', ''); // 'q1'
      const radioGroupName = `eval-${questionPrefix}`;                     // Détermine le nom du groupe radio à partir de l'ID de section (ex: section_q1 -> eval-q1)
      
      const FORM = document.getElementById('evaluationForm');           // !!!!!!! => VOIR SI ON UTILISE FORM Ou document
      
      const isCompleted = FORM.querySelector(`input[name="${radioGroupName}"]:checked`) !== null;     // Vérifie si un radio button de ce groupe est coché
      const nextButtonId = `btn-next-${questionPrefix}`;                     // Détermine l'ID du bouton "Suivant" (ex: section_q1 -> btn-next-q1)
      const nextButton = document.getElementById(nextButtonId);

      if (nextButton) {
            nextButton.disabled = !isCompleted;
            nextButton.textContent = isCompleted ? 'Suivant' : 'Sélectionnez une note...';
      }
      return isCompleted;
}







/* == GÉNÉRATEUR D'AVIS ============================ (EVALUATIONS) == */
/**------------------------------------------------------------------ //
* @instanceIn      {initRatings}     ../trmdvsr-03-launch-js
* ---------------- --------------- --------------- - ---------------- //
* @function        regenerateComment
* @description     LANCE UNE NOUVELLE GÉNÉRATION D'AVIS
* Fonction globale appelée par les boutons "Regénérer". Elle relance la génération du commentaire pour une question spécifique. Les boutons ne doivent être activés qu'après la génération d'un premier commentaire
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}        questionKey     - L'ID court de la question (ex: 'q1').
* @param           {string}        humorAction     - L'action à effectuer: humorAdd / humorRed
* @param           {string}        dataKey         - La clé à utiliser dans appData.evaluation.ratings (Ex: 'noteAccessibilite').
*-------------------------------------------------------------------- */
function regenerateComment(questionKey, humorAction, dataKey) {
      const radioGroupName = `eval-${questionKey}`;                   // Le nom du groupe radio est construit (ex: 'eval-q1')
      const selectedRadio = document.querySelector(`input[name="${radioGroupName}"]:checked`);
      
      adjustHumorLevel(humorAction, questionKey);                     // Demande l'ajustement du niveau d'humour (pas besoin de var. car var. glob.)
      
      if (!selectedRadio) {
            updateStatus({ conteneurID: questionKey, type: 'warn', isLoading: false, questionID: questionKey, log: `Impossible de régénérer : aucune note n'est sélectionnée pour ${questionKey}.`,
                  message:    `Houston, we avons eu un problème.`
            });
            return;
      }
      
      const noteRef = parseInt(selectedRadio.value, 10);
      updateStatus({ conteneurID: questionKey, type: 'loading', isLoading: true, questionID: questionKey, log: `regenerateComment : questionKey: ${questionKey} / noteRef: ${noteRef}`,
            message:    `L'IA réfléchit... Elle n'a pas l'habitude. Ça peut être long...`, 
      });
      askForAvis(questionKey, noteRef, dataKey);                      // 3. Appel au serveur pour générer l'avis
}

/**------------------------------------------------------------------ //
* @instanceIn      {regenerateComment} ../
* ---------------- --------------- --------------- - ---------------- //
* @function        adjustHumorLevel
* @description     AJUSTE LE NIVEAU D'HUMOUR
* Fonction globale appelée dans regenerateComment. Elle s'occupe de savoir si on est toujours entre 0 et 6 car Traumadvisor_IA_Agent.generateToneKey va générer une clé de tonalité [n1, n2, n3] où chaque n va de 0 à 2 pour choisir parmi un des 3 niveaux d'humeur BONNE, NEUTRE, MAUVAISE.
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}{'humorRed'|'humorAdd'}   action                  - L'action à effectuer. Augmenter ou diminuer.
* @param           {string}                          questionID_forRefonly   - L'ID de la question (ex: 'q1').
* @returns         {string}                          humourLevel             - Le niveau de 0 à 6. Mais c'est une variable globale donc ce n'était pas nécessaire
*-------------------------------------------------------------------- */
function adjustHumorLevel(action, questionID_forRefonly) {    
      if (action === 'humorAdd' && humourLevel < 6) humourLevel++; 
      if (action === 'humorRed' && humourLevel > 0) humourLevel--;
      
      updateStatus({ conteneurID: questionID_forRefonly, type: 'info', isLoading: false, questionID: questionID_forRefonly, log: `adjustHumorLevel : humourLevel: ${humourLevel}`, 
            message:    `L'IA revoit son niveau d'humour`,       
      });
      return humourLevel;
}

/**------------------------------------------------------------------ //
* @instanceIn      {askForAvis} ../
* ---------------- --------------- --------------- - ---------------- //
* @function        updateAvis
* @description     AFFICHE L'AVIS
* Met à jour l'avis dans le champ de texte dédié.
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}      questionID    - L'ID de la question (ex: 'q1').
* @param           {string}      commentText   - Le nouveau texte.
* @param           {string}      dataKey       - La clé à utiliser dans appData.evaluation.ratings (Ex: 'noteAccessibilite').
*-------------------------------------------------------------------- */
function updateAvis(questionID, commentText, dataKey) {               // Fonction qui met à jour le champ (elle a besoin de questionKey)

      const textAreaId = 'avis-zone-creation_' + questionID;
      const textArea = document.getElementById(textAreaId);
      
      if (textArea) {      
            textArea.value = commentText;
            appData.comments[dataKey] = commentText;                  // Enregistre toute modif du texte dans l'objet global
            
      } else {
            updateStatus({ conteneurID: questionID, type: 'error', isLoading: false, questionID: questionID, log: `Le champ de commentaire avec l'ID ${textAreaId} n'a pas été trouvé.`,
                  message:    'Il me faut un champ pour écrire mon avis...',
            });
      }
}

/**------------------------------------------------------------------ //
* @instanceIn      {regenerateComment} & {initializeSectionListeners} 
* @instanceTotal   2
* ---------------- --------------- --------------- - ---------------- //
* @function        askForAvis
* @description     GÉNÉRE UN AVIS (DÉCOMP)
* Générateur d'avis décomposé en 2 étapes pour avoir un feedback visuel du processus possiblement long. 
* Étape 1 : Charger les datas de cette question avec un appel côté serveur de requestAvisAgent🛠️ (./traumadvisor_APP/2 - Evaluation.gs/)
* Étape 2 : Générer un avis construit en 3 parties  avec un appel côté serveur de receiveAvisAgent🛠️ (./traumadvisor_APP/2 - Evaluation.gs/)
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}      questionID    - L'ID de la question (ex: 'q1').
* @param           {string}      noteRef       - La note sélectionnée par l'utilisateur.
* @param           {string}      dataKey       - La clé à utiliser dans appData.evaluation.ratings (Ex: 'noteAccessibilite').
*-------------------------------------------------------------------- */
function askForAvis(questionID, noteRef, dataKey) {

      document.body.classList.toggle('is-loading', true);             // DÉBUT du processus : Désactiver les boutons
      
      const conteneurName = `boutons-humour-${questionID}`;      
      const conteneur = document.getElementById(conteneurName);
      const boutons = conteneur.querySelectorAll('button');           // Sélectionne TOUS les boutons à l'intérieur
      
      boutons.forEach(btn => btn.disabled = true);                    // Désactiver
      
      // Au début de l'appel
      updateStatus({ conteneurID: questionID, type: 'loading', isLoading: true, questionID: questionID, log: `askForAvis...[param]questionID:${questionID} , 
            noteref: ${noteRef}`,
            message: 'Appel de l\'IA pour générer l\'avis...',
      });
                                                              
      google.script.run                                               // ÉTAPE 1 : Chargement
            .withSuccessHandler( (result) => {
            
                  // si startAgentProcessing revient du serveur avec succès
                  updateStatus({ conteneurID: result.questionID, type: 'loading', isLoading: true, questionID: result.questionID, message: result.message, 
                                log: `askForAvis | 1.startAgentProcessing[success]...` });
            
                  google.script.run                                   // ÉTAPE 2 : Finalisation
                        .withSuccessHandler( (result) => {
                        
                              updateStatus({ conteneurID: result.questionID, type: 'success', isLoading: false, questionID: result.questionID, message: 'Terminé!', 
                                            log: `askForAvis | 2.receiveAvisAgent[success] : result.questionID:${result.questionID} | 
                                            result.commentText:${result.commentText} | humourLevel:${humourLevel} | dataKey:${result.dataKey}` });
                              
                              updateAvis(result.questionID, result.commentText, result.dataKey); // Mettre à jour le champ de commentaire
                              document.body.classList.toggle('is-loading', false); // Réactiver les boutons
                              boutons.forEach(btn => btn.disabled = false);
                              if(document.getElementById(conteneurName).style.display === 'none') {
                                    document.getElementById(conteneurName).style.display = 'flex';
                              }
                        
                        })
                        .withFailureHandler( (error) => {
                              updateStatus({ conteneurID: error.questionID, type: 'error', isLoading: false, questionID: error.questionID, 
                                            log:        `askForAvis | 2.receiveAvisAgent : Erreur AI:${error}`,
                                            message:    'Erreur lors de la génération. Veuillez réessayer.' });
                              document.body.classList.toggle('is-loading', false); // Réactiver les boutons (après échec étape 2)
                              boutons.forEach(btn => btn.disabled = false);
                        })
                        .receiveAvisAgent(result.data, result.questionID, result.noteRef, humourLevel, result.dataKey); // < Lance cette function côté serveur
            })
            .withFailureHandler( (error) => {
                  updateStatus({ conteneurID: error.questionID, type: 'fail', isLoading: false, questionID: error.questionID, 
                                message: `Erreur de chargement: ${error.message}`, log: `askForAvis | 1.requestAvisAgent : Fail AI:${error}` });
                  document.body.classList.toggle('is-loading', false);// Réactiver les boutons (après échec étape 1)
                  boutons.forEach(btn => btn.disabled = false);
            })
            .requestAvisAgent(questionID, noteRef, dataKey);          // < Lance cette function côté serveur
}

/* == GÉNÉRATEUR D'AVIS - INIT ===================== (EVALUATIONS) == */
/**------------------------------------------------------------------ //
* @instanceIn      {initRatings}     ../trmdvsr-03-launch-js
* ---------------- --------------- --------------- - ---------------- //
* @function        initializeSectionListeners
* @description     Attache les écouteurs d'événements (délégation) à la section principale pour gérer les sélections de notes et les boutons d'humeur.
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}        questionID      - L'ID de la question (ex: 'q1').
* @param           {string}        dataKey         - La clé à utiliser dans appData.evaluation.ratings (Ex: 'noteAccessibilite').
*-------------------------------------------------------------------- */
function initializeSectionListeners(questionID, dataKey) {
      const section = document.getElementById(`section_${questionID}`);             // Ciblage de la section parente
      const humourConteneur = document.getElementById(`boutons-humour-${questionID}`);
      
      if (humourConteneur) {
            humourConteneur.style.display = 'none';
      }
      
      if (!section) {
            updateStatus({  conteneurID: 'eval', type: 'warn', isLoading: false, log: `initializeSectionListeners | Section non trouvée pour l'ID:  ${section}.`,
            questionID:   questionID, message:      "Veuillez relancer la page." });
            return;
      }
      
      section.addEventListener( 'change', function(event) {           // --- 1. Gestion des Événements 'change'  ---
      
            const target = event.target;
            // --- 1. GESTION DES RADIOS --->                         // Vérifie si l'élément qui a changé est un input radio de cette section
            if (target.type === 'radio' && target.name === `eval-${questionID}`) {
            
                  const noteValue = target.value;
                  appData[dataKey] = parseInt(noteValue, 10);         // Type comme nombre entier base10 (radix) et enregistre dans l'objet global
                  askForAvis(questionID, noteValue, dataKey)          // 🚨 LOGIQUE PRINCIPALE : Lancement du processus
            }
            
            // --- 2. GESTION DU TEXTAREA --->                        // Vérifie si l'élément qui a changé est le textarea spécifique
            if (target.tagName === 'TEXTAREA' && target.id === `avis-zone-creation_${questionID}`) {
            
                  const nouveauTexte = target.value;
                  appData.comments[dataKey] = nouveauTexte;           // Enregistre toute modif du texte dans l'objet global
                  //saveCommentDraft(questionID, nouveauTexte);       // 🚨 Logique pour enregistrer ou traiter le nouveau texte
                  /**------------------------------------------------ //
                  * à faire plus tard, l'enregistrement de modification de texte pour nourrir l'IA. 
                  * 
                  */
            }
            
            // --- 3. GESTION DU BONUS ---> // Vérifie si l'élément qui a changé est le checkbox
            if (target.type === 'checkbox' && target.id === 'q5-bonus') {
                  const isChecked = target.checked;                   // Renvoie un boolean true:coché/false:décoché
                  appData.bonus = isChecked;                          // Logique pour mettre à jour appData.bonus
                  updateStatus({  conteneurID: 'eval', type: 'info', isLoading: false, log: `appData.bonus: ${appData.bonus}`, questionID:   questionID, 
                                message:      "L'initialisation est ok" });
            }
      } );
      
      
      section.addEventListener( 'click', function(event) {            // --- 2. Gestion des Événements 'click' (Boutons d'Humeur) -- //
      
            let target = event.target;
            
            if (!target.classList.contains('submit-button')) {        // .closest() => remonte au bouton >> assure que 'target' === bouton parent
                  target = target.closest('.submit-button');
            }
            
            
            if (target && target.closest(`#boutons-humour-${questionID}`) && !target.disabled) { // Vérifie si on a trouvé un bouton d'humeur valide et non désactivé
                  const humorType = target.dataset.humorType;         // Utilise dataset            
                  if (humorType) {
                        regenerateComment(questionID, humorType, dataKey);
                  }
            }
      });
      
      updateStatus({  conteneurID: questionID, type: 'success', isLoading: false, log: `initializeSectionListeners | questionKey:${questionID}`, 
            questionID: questionID, message:    "L'initialisation est ok" });
}


/* == PHOTOS > DRAG&DROP - FN PRIVATE ============== (EVALUATIONS) == */
/**------------------------------------------------------------------ //
* @instanceIn    {initPhotoUploader} on <fileInput id="input_photo_principale"> ../.
* ---------------- --------------- --------------- - ---------------- //
* @function      handleFileSelection
* @description   GERE LA SELECTION D'IMAGES
* Crée un tableau avec les images et lance opencropModule pour chacun d'entre elle dans la limite de MAX_FILES
*-------------------------------------------------------------------- */
function handleFileSelection() {
      const newFiles = Array.from(fileInput.files);
      const imageFiles = newFiles.filter(file => file.type.startsWith("image/"));
      
      fileInput.value = '';
      
      imageFiles.forEach( file => {
            const availableSlots = MAX_FILES - uploadedFiles.length;
            if (availableSlots > 0) {
                  opencropModule(file);
            
            } else {
                  updateStatus({  conteneurID: "export", type: 'warn', isLoading: false, current: 0, total: 0, message: `Attention: La limite maximale de ${MAX_FILES} photos est atteinte.` });
            }
      } );
}
/**------------------------------------------------------------------ //
* @instanceIn    {handleFileSelection}   ../.
* ---------------- --------------- --------------- - ---------------- //
* @function      handleFileSelection
* @description   OUVRE LE MODULE ET INSÈRE L'IMAGE
*-------------------------------------------------------------------- */
function opencropModule(file) {
      currentFile = file;
      cropModule.style.display = 'flex';                              // Affiche le module
      const imageUrl = URL.createObjectURL(file);
      imageToCrop.src = imageUrl;
      
      imageToCrop.onload = function() {
      
            if (cropperInstance) { cropperInstance.destroy(); }
            cropperInstance = new Cropper(imageToCrop, {
                  aspectRatio: 1, 
                  viewMode: 1,    
                  responsive: true,
                  autoCropArea: 0.8,
            });
      };
}

/**------------------------------------------------------------------ //
* @instanceIn    {??}   ../.
* ---------------- --------------- --------------- - ---------------- //
* @function      closecropModule
* @description   FERME LE MODULE
*-------------------------------------------------------------------- */
function closecropModule() {
      if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
      }
      if (imageToCrop.src) { URL.revokeObjectURL(imageToCrop.src); };
      
      imageToCrop.src = '';
      currentFile = null;
      cropModule.style.display = 'none';
}

/**------------------------------------------------------------------ //
* @instanceIn    {??}   ../.
* ---------------- --------------- --------------- - ---------------- //
* @function      handleCropAndAdd
* @description   www
*-------------------------------------------------------------------- */
function handleCropAndAdd() {
      if (!cropperInstance) return;
      
      const croppedCanvas = cropperInstance.getCroppedCanvas({        // 1. Obtenir le canvas rogné à la taille d'exportation souhaitée (1080x1080)
            width: EXPORT_SIZE,                                       // 1080
            height: EXPORT_SIZE,                                      // 1080
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
      });
      
      croppedCanvas.toBlob( (blob) => {                               // 2. Convertir le canvas en un objet File (Blob)
            if (blob) {
                  const originalName = currentFile.name.replace(/(\.[\w\d_-]+)$/i, ''); // Créer un nouvel objet File avec le nom du fichier d'origine et la taille d'export
                  const filename = originalName + `-${EXPORT_SIZE}x${EXPORT_SIZE}.png`;
                  const previewUrl = URL.createObjectURL(blob);       // Stocker l'URL d'objet du Blob pour la prévisualisation (pour éviter le re-rognage)
                  
                  uploadedFiles.push({                                // Stocker le Blob et le nom pour l'enregistrement Drive
                        name: filename,
                        blob: blob,
                        previewUrl: previewUrl,
                        size: blob.size                               // Taille du blob rogné
                  });
                  updateImageDisplay();
                  closecropModule();
                  
                  if (uploadedFiles.length < MAX_FILES) {
                        limitMessage.textContent = '';
                  }
            } else {
                  console.error("Échec de la création du Blob après rognage.");
            }
      }, 'image/png'); 
}

// ----------------------------------------------------
// FONCTIONS UTILITAIRES ET AFFICHAGE (Inchangées)
// ----------------------------------------------------

function removeFile(index) {
      if (index >= 0 && index < uploadedFiles.length) {
            // Libérer l'URL d'objet de prévisualisation avant de supprimer
            URL.revokeObjectURL(uploadedFiles[index].previewUrl);
            uploadedFiles.splice(index, 1);
            limitMessage.textContent = '';
            updateImageDisplay();
      }
}

/**------------------------------------------------------------------ //
* @instanceIn    {initDragDropListeners} on["drop"] & {handleCropAndAdd} & {removeFile}        ../trmdvsr-03-launch-js
* @instanceCount 3
* ---------------- --------------- --------------- - ---------------- //
* @function      updateImageDisplay
* @description   MET À JOUR LA LISTE DES PHOTOS
*-------------------------------------------------------------------- */
function updateImageDisplay() {

      while (previewContainer.firstChild) {
            previewContainer.removeChild(previewContainer.firstChild);// Nettoyer le conteneur et le statut
      }
      updateStatus({  conteneurID: "export", isLoading: false, message: '' });                // Nettoyer les messages précédents
      
      if (uploadedFiles.length === 0) {
            const para = document.createElement("p");
            para.classList.add('trmdvsr-sstexte'); 
            para.textContent = "Aucun fichier sélectionné pour le moment.";
            previewContainer.appendChild(para);
            exportBtn.disabled = true;
            return;
      } 
      
      exportBtn.disabled = false;
      
      const list = document.createElement("ul");
      list.id = "photo-list";                                         //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 2025-10-17 (01:38) : n'existe pas en id                              
      list.classList.add('photo-list-container');                     // Class ok 
      previewContainer.appendChild(list);
      
      uploadedFiles.forEach( (file, index) => {
            const listItem = document.createElement("li");
            listItem.setAttribute('draggable', 'true');
            listItem.dataset.index = index;
            listItem.classList.add('photo-item');                     // Class ok
            
            const image = document.createElement("img");
            image.src = file.previewUrl;                              // Utilisation de l'URL d'objet stockée
            image.alt = file.name;
            image.classList.add('photo-image');                       // Class ok
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener( 'click', (event) => {
                  event.stopPropagation(); 
                  removeFile(parseInt(listItem.dataset.index));
            } );
            listItem.appendChild(deleteBtn);
            
            if (index === 0) {
                  const badge = document.createElement('div');
                  badge.textContent = "Principale";
                  badge.classList.add('badge-principale');
                  listItem.appendChild(badge);
            }
            
            const info = document.createElement('div');
            info.textContent = `${file.name} (${returnFileSize(file.size)})`;
            info.classList.add('photo-info');                         // Class ok
            
            listItem.appendChild(image);
            listItem.appendChild(info);
            list.appendChild(listItem);
      });
}

/**------------------------------------------------------------------ //
* @instanceIn    ??
* @instanceCount ?
* ---------------- --------------- --------------- - ---------------- //
* @function      returnFileSize
* @description   ??
*-------------------------------------------------------------------- */
function returnFileSize(number) {
      if (number < 1024) return `${number} octets`;
      if (number >= 1024 && number < 1048576) return `${(number / 1024).toFixed(1)} Ko`;
      if (number >= 1048576) return `${(number / 1048576).toFixed(1)} Mo`;
}

/* == PHOTOS > DRAG&DROP - INIT ==================== (EVALUATIONS) == */
/**------------------------------------------------------------------ //
* @instanceIn    {initPageEvalPhotoUploader}        ../trmdvsr-03-launch-js
* ---------------- --------------- --------------- - ---------------- //
* @function      initDragDropListeners
* @description   INITIALISE LE DRAG & DROP
*                previewContainer cible la classe ".conteneur-image-preview". 
*                On pourrait spécifier cette classe dans un sous ensemble d'un conteneur spécifique.
*-------------------------------------------------------------------- */
function initDragDropListeners() {
      
      previewContainer.addEventListener( 'dragstart', (event) => {
            if (event.target.tagName === 'LI' && event.target.draggable) {
                  draggedItem = event.target;
                  setTimeout(() => {
                  event.target.classList.add('is-dragging');
                  }, 0);
                  event.dataTransfer.setData('text/plain', event.target.dataset.index);
            }
      } );
      
      previewContainer.addEventListener( 'dragend', (event) => {
            event.target.classList.remove('is-dragging');
            draggedItem = null;
      } );
      
      previewContainer.addEventListener( 'dragover', (event) => {
            event.preventDefault(); 
            const target = event.target.closest('li');
            if (target && target !== draggedItem) {
                  target.classList.add('is-drag-over');
            }
      } );
      
      previewContainer.addEventListener( 'dragleave', (event) => {
            if (event.target.tagName === 'LI') {
            event.target.classList.remove('is-drag-over');
            }
      } );
      
      previewContainer.addEventListener( 'drop', (event) => {
            event.preventDefault();
            const target = event.target.closest('li');
            if (draggedItem && target && draggedItem !== target) {
                  const fromIndex = parseInt(draggedItem.dataset.index);
                  const toIndex = parseInt(target.dataset.index);
                  target.classList.remove('is-drag-over');
                  const [movedFile] = uploadedFiles.splice(fromIndex, 1);
                  uploadedFiles.splice(toIndex, 0, movedFile);
                  
                  updateImageDisplay();                               // Finalité on update l'affichage
            
            } else if (target) {
                  target.classList.remove('is-drag-over');
            }
      } );
}

/* == PHOTOS > SAVE  =============================== (EVALUATIONS) == */
/**------------------------------------------------------------------ //
* @version         25.10.21 (14:14)
* ---------------- --------------- --------------- - ---------------- //
* @function        saveThenNavigate
* @description     GERE LA NAVIGATION CONDITIONNÉE À UN ENREGISTREMENT
*                  Logique centralisée de sauvegarde et de navigation. C'est le cœur de la solution.
*-------------------------------------------------------------------- */
async function saveThenNavigate() {        

      const estValide = await handleSaveToDrive();                    // 1. Attend le résultat de l'opération asynchrone
      
      if (estValide) {                                                // 2. Conditionne le passage à l'étape suivante
            updateStatus({  conteneurID: "export", type: 'success', isLoading: false,
            message:      "Enregistrement réussi. Passage à l'étape suivante.", 
            });
            
            navigateTo('accroche');                                   // 3. Appelle la fonction de navigation
            
      } else {
            updateStatus({  conteneurID: "export", type: 'success', isLoading: false,
            message:      "L'enregistrement a échoué.", 
            });  
      }
}

/**------------------------------------------------------------------ //
* 
* ---------------- --------------- --------------- - ---------------- //
* @function        handleSaveToDrive
* @description     ENREGISTRE LES PHOTOS SUR LE DRIVE
*                  Fonction clé pour enregistrer les photos sur le drive
*-------------------------------------------------------------------- */
async function handleSaveToDrive() {

      const totalFiles = uploadedFiles.length;                        // uploadedFiles : variable globale stockée dans trmdvsr-global-js
      
      if (totalFiles === 0) {                                                       
            updateStatus({  conteneurID: "export", type: 'error', isLoading: false,
            message:      "Veuillez ajouter au moins une photo avant d'enregistrer.", 
            });
            return false;
      }
      
      document.body.classList.toggle('is-loading', true);             // DÉBUT du processus : Désactiver les boutons
      
      updateStatus({  conteneurID: "export", type: 'info', isLoading: false,
            message:      `Démarrage de l'enregistrement de ${totalFiles} photo(s)...`,
            current:      0, 
            total:        totalFiles,
      });
      
      const progressBar   =   document.getElementById("progressBar"); // Éléments de la barre de progression
      const progressText  =   document.getElementById("progressText");
      updateProgressDisplay_(progressBar, progressText, successCount, 0, totalFiles);// Initialisation à 0%
      
      for (let i = 0; i < totalFiles; i++) {                          // Boucle d'enregistrement
            const file = uploadedFiles[i];
            
            updateStatus({  conteneurID: "export", type: 'info', isLoading: false,
            message:      `Enregistrement en cours: ${file.name} (${i + 1}/${totalFiles})...`,
            current:      i,
            total:        totalFiles,
            });
            
            try {
            
                  const base64Data = await blobToBase64_(file.blob);  // 1. Convertir le Blob en Base64 (fonction personnalisée)
                  
                  const result = await new Promise( (resolve, reject) => { // 2. Appel de la fonction Apps Script
                        google.script.run
                              .withSuccessHandler(resolve)
                              .withFailureHandler(reject)
                              .saveFileToDrive(base64Data, file.name);// Enregistre le fichier sur le drive avec saveFileToDrive() côté server
                        });
                  
                  if (result === true) {
                        successCount++;
                        updateProgressDisplay_(successCount, i + 1, totalFiles); // NOUVEAU : Mise à jour de la barre de progression après succès
                  
                  } else {
                        errorCount++;
                        
                        updateStatus({  conteneurID: "export", type: "error", isLoading: false,
                              message:      `Erreur d'enregistrement pour ${file.name}: ${result}`,
                              current:      i,
                              total:        totalFiles,
                        });
                  }
            } catch (error) {            
                  errorCount++;
                  
                  updateStatus({  conteneurID: "export", type: "error", isLoading: false,
                        message:      `Erreur critique lors de l'envoi de ${file.name} : ${error}`,
                        current:      i,
                        total:        totalFiles,
                  });
            }
      }
      // Fin de l'opération
      const finalMessage = `${successCount} photo(s) rognée(s) enregistrée(s) dans Google Drive. ${errorCount > 0 ? `(${errorCount} échec(s))` : ''}`;
      
      updateStatus({  conteneurID: "export", isLoading: false, message: finalMessage,
            type:         errorCount > 0 ? "error" : "success",       // Définition conditionnelle du type de message pour log
      });
      
      document.body.classList.toggle('is-loading', false);            // DÉBUT du processus : Désactiver les boutons
}

/**------------------------------------------------------------------ //
* @instanceIn      {initRatings}                     ../trmdvsr-03-launch-js
* ---------------- --------------- --------------- - ---------------- //
* @function        updateProgressDisplay_
* @description     MET À JOUR LA BARRE ET LE TEXTE DE PROGRESSION
* ---------------- --------------- --------------- - ---------------- //
* @param           {Element}       progressbar     - La barre de progression.
* @param           {Element}       progressText    - Le texte de progression.
* @param           {number}        successCount    - Le nombre de fichiers enregistrés avec succès.
* @param           {number}        currentTotal    - Le total des fichiers traités jusqu'à présent (succès + échecs).
* @param           {number}        totalFiles      - Le nombre total de fichiers à traiter.
*-------------------------------------------------------------------- */
function updateProgressDisplay_(progressbar, progressText, successCount, currentTotal, totalFiles) {

      const textOverview  =   `(${successCount}/${totalFiles} images enregistrées)`
      const percentage = totalFiles > 0 ? Math.round((successCount / totalFiles) * 100) : 100;
      
      progressBar.style.width = `${percentage}%`;                     // Mise à jour de la barre (utilise la largeur en CSS)
      progressText.textContent = `${percentage}% ${textOverview}`;    // Mise à jour du texte
}

/**------------------------------------------------------------------ //
* @instanceIn      {handleSaveToDrive}               ../trmdvsr-03-launch-js
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        blobToBase64_
* @description     Converti l'image
*                  Fonction utilitaire pour convertir un Blob en Base64
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}        blob            - Le blob a convertir.
*-------------------------------------------------------------------- */
function blobToBase64_(blob) {

      return new Promise( (resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {  
                  const base64 = reader.result.split(',')[1];         // La chaîne commence par "data:image/png;base64,"
                  resolve(base64);                                    // on ne garde que le Base64 pur
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
      } );
}

/* == INIT  ======================================== (EVALUATIONS) == */
/**------------------------------------------------------------------ //
* @instanceIn      {handlePageData}      ../trmdvsr-03-launch-js
* ---------------- --------------- --------------- - ---------------- //
* @function        initPageEval
* @description     INITIALISE LA PAGE EVALUATION
*-------------------------------------------------------------------- */
function initPageEval () {

      updateStatus({  conteneurID: 'eval', type: 'loading', isLoading: true, log: `Init Page Evaluation...`,  
            message:      `À vos évals... Prêt?`, 
      });
      
      initPageEvalNav();                                              // Navigation
      initPageEvalRatings();                                          // Module de Notation
      initPageEvalPhotoUploader();                                    // Module d'Upload Photo
      
      updateBreadcrumb('section_q1');                                 // Affiche l'étape et met à jour l'URL
      
      updateStatus({  conteneurID: 'eval', type: 'loading', isLoading: false, log: `Page Evaluation chargée`,  
            message:      `Feu! Partez!`, 
      });

}

/**------------------------------------------------------------------ //
* @instanceIn      {initPageEval}        ../
* ---------------- --------------- --------------- - ---------------- //
* @function        initPageEvalNav
* @description     INITIALISE LA NAVIGATION
*-------------------------------------------------------------------- */
function initPageEvalNav () {

      updateStatus({  conteneurID: 'eval', type: 'loading', isLoading: true, log: `Init Page Evaluation Nav...`,  
            message:      `Activation du système de navigation...`, 
      });
      
      const breadcrumbList = document.querySelector('.breadcrumb-nav');
      if (breadcrumbList) {
            breadcrumbList.addEventListener('click', navigateTo);     // Délégation d'événements pour les clics dans le fil d'Ariane
      } else {
            updateStatus({  conteneurID: 'eval', type: 'warn', isLoading: true, log: "Conteneur '.breadcrumb-list' introuvable.",  
                  message:      "Fil d'Ariane introuvable.", 
            });
      }
      
      const navButtons = document.querySelectorAll('.eval-btn');      // Récupérer tous les boutons qui participent à la navigation
      if (navButtons.length > 0) {
            navButtons.forEach(button => {
                  button.addEventListener('click', navigateTo);       // Chaque bouton appelle directement la fonction navigateTo
            });
      } else {
            updateStatus({  conteneurID: 'eval', type: 'warn', isLoading: true, log: "Aucun bouton avec la classe '.eval-btn' trouvé.",  
                  message:      "Aucun bouton trouvé", 
            });
      }
      
      updateStatus({  conteneurID: 'eval', type: 'loading', isLoading: true, log: `Init Page Evaluation Nav[end]`,  
            message:      `Système de navigation actif.`, 
      });
}

/**------------------------------------------------------------------ //
* @instanceIn      {initPageEval}        ../
* ---------------- --------------- --------------- - ---------------- //
* @function        initPageEvalRatings
* @description     INITIALISE TOUS LES SYSTÈMES DE NOTATION D'EVALUATION FORM
*-------------------------------------------------------------------- */
function initPageEvalRatings() {  

      updateStatus({  conteneurID: 'eval', type: 'loading', isLoading: true, log: `Init initRatings...`,  
            message:      `Configuration du système de notation AAAAA en cours...`, 
      });
      
      initializeSectionListeners('q1', 'noteAccessibilite');          // Q1: Accessibilité
      initializeSectionListeners('q2', 'noteApparence');              // Q2: Apparence
      initializeSectionListeners('q3', 'noteAssise');                 // Q3: Assise
      initializeSectionListeners('q4', 'noteAttention');              // Q4: Attentions
      initializeSectionListeners('q5', 'noteAttente');                // Q5: Attente
      
      updateStatus({  conteneurID: 'eval', type: 'loading', isLoading: false, log: `Init initRatings[end]`,  
            message:      `Initialisation du système de notation AAAAA terminée.`, 
      });
}

/**------------------------------------------------------------------ //
* @instanceIn    {initPageEval}        ../trmdvsr-03-launch-js
* ---------------- --------------- --------------- - ---------------- //
* @function      initPageEvalPhotoUploader
* @description   INITIALISE LES LISTENERS DE LA PARTIE PHOTO UPLOAD
* ---------------- --------------- --------------- - ---------------- //
* @returns       [ ||null]               null si erreur
*-------------------------------------------------------------------- */
function initPageEvalPhotoUploader() {

updateStatus({  conteneurID: "export", type: 'loading', isLoading: true, log: 'Init Module Photo Uploader...',
message:      "Chargement du module d'export photo.", 
});

fileInput =           document.getElementById("input_photo_principale");
previewContainer =    document.querySelector (".conteneur-image-preview");
limitMessage =        document.getElementById("limit-message");
//exportBtn =           document.getElementById("export-btn");

cropModule =          document.getElementById("crop-module");         // Initialisation des éléments du module
imageToCrop =         document.getElementById("image-to-crop");
const cropAndAddBtn = document.getElementById("crop-btn-add");
const cancelCropBtn = document.getElementById("crop-btn-cancel");

if (!fileInput || !previewContainer || !limitMessage || !exportBtn || !cropModule || !imageToCrop) {
updateStatus({  conteneurID: "export", type: 'error', isLoading: true, log: "Erreur d'initialisation : Éléments DOM critiques manquants.",
message:      "Erreur critique.", 
});
return;
}

fileInput.style.opacity = 0;
fileInput.addEventListener      ("change", handleFileSelection);      // Listener pour gérer la sélection d'image 
initDragDropListeners();                                              // Initialisation Drag n Drop listeners
cropAndAddBtn.addEventListener  ('click', handleCropAndAdd);
cancelCropBtn.addEventListener  ('click', closecropModule);
//exportBtn.addEventListener      ('click', saveThenNavigate);        // handleSaveToDrive > saveImageThenNavigateTo

updateStatus({  conteneurID: "export", type: 'loading', isLoading: false, log: 'Module Photo Uploader prêt.',
message:      "Glissez, déposez et rognez vos images avant d'exporter.", 
});
}

/* == LISTENER  ==================================== (EVALUATIONS) == */ /*voir si utile car on peut enregistrer les */
/**------------------------------------------------------------------ //
* -- NOUVEAU CODE POUR LA SOUMISSION DU FORMULAIRE --

document.getElementById('evaluationForm').addEventListener( 'submit', function(event) {
      event.preventDefault(); // Empêche la soumission par défaut
      
      if (!appData.lieuID) {                                          // Vérifie si l'ID du lieu a bien été défini dans l'objet global
            console.error("L'identifiant du lieu n'a pas été défini. Impossible de soumettre l'évaluation.");
            return;
      }

      // Collecte et stockage des données dans l'objet global
      appData.noteAccessibilite = parseInt(document.querySelector('.text-yellow-500').getAttribute('data-rating'), 10);
      appData.phraseAccroche = document.getElementById('comment').value;
      
      // Optionnel: Gérer les fichiers si besoin, mais c'est une étape plus complexe
      const coverPhotoFile = document.getElementById('coverPhoto').files[0];
      const secondaryPhotoFiles = document.getElementById('secondaryPhotos').files;
      
      // Affichage de l'état de soumission
      const submitBtn = event.target.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Envoi en cours...';
      submitBtn.disabled = true;
      
      // Appel de la fonction Apps Script
      if (typeof google !== 'undefined' && google.script && google.script.run) {
            // google.script.run.withSuccessHandler() est une bonne pratique pour gérer les réponses
            google.script.run
                  .withSuccessHandler( function(response) {
                        google.script.run.withSuccessHandler(html => {      // On charge la page de remerciements
                              document.body.innerHTML = html;
                        }).showPage('remerciements');
                  } )
                  .withFailureHandler( function(error) {
                        console.error('Erreur lors de la soumission de l\'évaluation:', error.message); // Gérer l'échec (ex: afficher un message d'erreur)
                        submitBtn.textContent = 'Soumettre mon évaluation'; // => modale custom ?
                        submitBtn.disabled = false;
                  } )
                  .saveAppData(appData);                                    // On envoie l'objet complet
      } else {
            // Fallback si Google Apps Script n'est pas disponible
            console.error("L'environnement Google Apps Script n'est pas disponible.");
      }
});*/ 
/** =================================================================
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ================================================================== */
