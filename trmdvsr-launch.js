/* ** FONCTIONS ************************************************************ (CREATION LIEU) ** */
/* == NAVIGATION ============================================================= (EVALUATIONS) == */
/** ------------------------------------------------------------------------------------------- //
 * @version         25.11.17 (17:52)                - 25.10.09 (23:16)
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        updateBreadcrumbs
 * @description     MET A JOUR LE FIL D'ARIANE 
 *                  Fonction centrale de la page évaluation. 
 *                  Met à jour les classes CSS des éléments de navigation breadcrumb.
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {string}        prntElmnt       - ID de la question cible (ID de la section à afficher).
 * -------------------------------------------------------------------------------------------- */
function updateBreadcrumbs(refElmnt, newSecID) {
    console.debug( `Init updateBreadcrumbs... [param]refElmnt:${refElmnt} / newSecID:${newSecID}` );
    try {
        const newIndex = refElmnt.sub.findIndex( s => s.id === newSecID );
        console.log( `📄⚙️.Run-ng |updateBreadcrumbs : [param]newIndex:${newIndex}` );

        refElmnt.brdcrmbElmnts.forEach( (item, index) => {
            console.log( `📄⚙️.Run-ng |updateBreadcrumbs : [param]item:${item} / index:${index}` );
            item.classList.remove('active', 'completed', 'disabled');

            if (index === newIndex) {
                item.classList.add('active');                                                   // Étape actuelle

            } else if (index < newIndex) {
                item.classList.add('completed');                                                // Étape complétée (passée)

            } else {                                                                            // Étape future
                item.classList.add('disabled');                                                 // => On désactive l'accès direct aux étapes futures
            }
        } );
        console.log( `📄✅.Run-ng |updateBreadcrumbs : Breadcrumbs mis à jour pour la section ${newSecID}` );

    } catch (error) { console.error( `🚫.Catched |updateBreadcrumbs : Erreur lors de la mise à jour des breadcrumbs: ${error}` ); }
}

/** ------------------------------------------------------------------------------------------- //
 * @version         25.12.01 (16:34)
 * @instanceIn      {actionDispatcher} & {handlePageData}   ../
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
    //console.log(`Note (${scoreFinal}) mise à jour pour ${questionId} (Index ${targetIndex}) via référence DOM stockée.`);
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

/* == FONCTIONS NAVIGATION SPA - PRIVATE FN =================================================== */
/** ------------------------------------------------------------------------------------------- //
 * @version         25.10.09 (23:16)
 * @instanceIn      {actionDispatcher} & {handlePageData}   ../
 * @instanceCount   4 (3 + 1)
 * ---------------- --------------- --------------------- - ----------------------------------- //
 * @function        showPage
 * @description     GESTION DE L'AFFICHAGE PAR PAGE
 *                  Anime la transition de l'ancienne page vers la nouvelle
 *                  Gère la transition latérale entre les pages principales.
 *                  Affiche une page spécifique en utilisant la déstructuration. 
 * ---------------- --------------- --------------------- - ----------------------------------- //
 * @param           {string}        nwPgID                - L'ID de la page à afficher.
 * @param           {string|null}   nwSecIndx             - L'ID de la section à afficher dans la nouvelle page (si applicable).         
 * -------------------------------------------------------------------------------------------- */
function showPage(nwPgID = '', nwSecIndx = null) {
    console.log (`showPage : nwPgID: ${nwPgID} & nwSecIndx: ${nwSecIndx} & isInit.trnstng: ${isInit.trnstng}`)
    if (!nwPgID) return;                                                                        // CAS DÉFENSIF: pas de pgID => kill
    if (isInit.trnstng) return;                                                                 // CAS ANTI-REBOND : transition en cours => kill
    isInit.trnstng = true;                                                                      // 🚩 Active le flag ANTI-REBOND
    console.debug( `📄.Init showPage... [param]newPageID: ${nwPgID} ${nwSecIndx != null ? ` / newSectionIndex:${nwSecIndx}` : '' }` );
    try {
        const nwPg = Object.values(pages).find(p => p.ID === nwPgID);                           // Charge l'objet page à afficher <= nwPgID existe (if initial)
        if (!nwPg || !nwPg.element) {                                                           // CAS DÉFENSIF: Erreur si pas Element
            isInit.trnstng = false;                                                             // 🚩
            console.error( `📄❌.if-ed |showPage : nwPg '${nwPgID}' introuvable.` );
            return;
        }
        console.log( `./📄⚙️.Run-ng |showPage: newPg.ID: ${newPg.ID} & nwPg.hasSub: ${nwPg.hasSub}` );
        const targetSecIndx = nwSecIndx ?? nwPg.curSecIndx ?? 0;                                // =nwSecIndx sinon =curSecIndx sinon =0 
        nwPg.curSecIndx = targetSecIndx;                                                        // 🛟 Attribue le curSecIndx
        
        const activateSectionIfNeeded = () => {
            let secIndx2Dspl = nwPg.curSecIndx;                                                 // Utilise l'index que nous venons d'initialiser/mettre à jour
            if (nwPg.hasSub && nwPg.sub[secIndx2Dspl]) {                                        // S'il y a des sous-sections et que l'index est valide
                const nwSecID = nwPg.sub[secIndx2Dspl].id;
                console.log ( `./📄⚙️.Run-ng |showPage => activateSectionIfNeeded : nwSecIndx: ${secIndx2Dspl} / nwSecID: ${nwSecID}` );
                showSection(nwSecID, nwPgID);                                                   // Affiche la section (isAfterTransition => désactive le flag en interne ou non)
            }
            updateSPA_Height_(newPg.ID, nwSecIndx);                                              // Met à jour la hauteur du SPA après le changement de page/section
            console.log(`./📄⚙️.Run-ng |showPage : activateSectionIfNeeded OK`);
        };
        
        const completeTransition = (event) => {                                                 // <= appelé à la fin de l'apparition de la Nouvelle Page
            if (event.target !== nwPg.element) return;                                          // --- FILTRES ESSENTIELS CONTRE LE BUBBLING ---
            if (event.propertyName !== 'transform' && event.propertyName !== 'opacity') return; // Assure => 'transform' (ou 'opacity') qui se termine, et pas transition d'un enfant (bouton, etc.).
            nwPg.element.removeEventListener('transitionend', completeTransition);
            curPgID = nwPgID;                                                                   // 🛟 Enregistre la nouvelle page active
            activateSectionIfNeeded();                                                          // Active la section si besoin
            isInit.trnstng = false;                                                                  // 🚩 Désactive le flag (centralisé)
            console.warn( `.../📄✅.--End |showPage => Transition complete: ${curPgID} <= ${event.target.tagName} (${event.propertyName}) && ${nwPg.element.id}` );
        };
        
        const curPg = Object.values(pages).find(p => p.ID === curPgID);
        if (!curPg) {                                                                           // A. => Cas Initialisation
            nwPg.element.addEventListener('transitionend', completeTransition);                 // Pas { once: true } car possible multi-bubbling
            updateSPA_Height_(newPg.ID);                                                        // Lance MaJ hauteur en meme temps
            
            requestAnimationFrame(() => {                                                       // 2. Lancement des transitions après repaint
                nwPg.element.classList.add('active');                                           // => classe contient nouvelle position > lance anim
                console.log( `./📄⚙️.Run-ng |showPage : Pas de page en cours => Init page: newPg.ID=${newPg.ID} / requestAnimationFrame OK` );
            });
            return;
        }
        if (!curPg.element) {                                                                   // Gère les ERREURS sur la page COURANTE (flux d'arrêt)
            isInit.trnstng = false;                                                             // 🚩
            console.error( `📄❌.if-ed |showPage : Current Page '${curPgID}' introuvable.` );
            return;
        }
        
        const handleTransOutEnd = (event) => {                                                  // <= appelé à la fin de la sortie de la page actuelle
            if (event.target !== curPg.element) return;                                         // --- FILTRE ESSENTIEL CONTRE LE BUBBLING ---
            if (event.propertyName !== 'transform' && event.propertyName !== 'opacity') return;
            curPg.element.removeEventListener('transitionend', handleTransOutEnd);
            curPg.element.className = 'page';                                                   // remove tout en réécrivant 'page'
            curPg.element.style.transform = '';
            curPg.element.scrollTop = 0;
            curPg.element.display = 'none';
            curPg.element.style.opacity = '0';                                                  // Réinitialisation de l'opacité pour le retour
            console.warn ( `.../📄✅.--End ||showPage => handleTransOutEnd => ${event.target.tagName} : ${event.propertyName} COMPLETE` );
        };
        
        if (nwPgID === curPgID) {                                                               // B. => Cas Même page
            activateSectionIfNeeded();                                                          // Fait le travail sans attendre de transition
            isInit.trnstng = false;                                                                  // 🚩 Désactive le flag immédiatement
            console.warn( `.../📄✅.--End |showPage : Même page: [${curPgID}] / section=${nwSecIndx}. ` );
            return;
        }
        
        const isFrwrd = (nwPg.index > curPg.index);                                             // C. => Cas Transition Normale
        const [startPos, endPos] = isFrwrd ? ['100%', '-20%'] : ['-100%', '20%'];               // Définition des positions : [Pos départ newPage, Pos fin oldPage]
        
        curPg.element.addEventListener('transitionend', handleTransOutEnd, { once: true });
        nwPg.element.addEventListener('transitionend', completeTransition, { once: true });
        nwPg.element.style.transition = 'none';                                                 // Désactive temporairement pour éviter flickering
        nwPg.element.style.transform = `translateX(${startPos})`;                               // Position de DÉPART (hors écran)
        nwPg.element.style.display = 'block';                                                   // Rend la nouvelle page visible
        nwPg.element.classList.add('active');                                                   // Applique la classe .active (z-index, opacité, etc.)
        
        requestAnimationFrame( () => {                                                          // 2. Lancement des transitions après repaint
            nwPg.element.style.transition = 'transform 0.5s ease-out';
            nwPg.element.style.transform = 'translateX(0)';
            curPg.element.style.transition = `transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out`;
            curPg.element.classList.add('transition-out');                                      // 2. Préparation et Lancement de l'OUT (Page Courante)
            curPg.element.style.transform = `translateX(${endPos})`;
            curPg.element.style.opacity = '0';                                                  // Opacité à zéro pour la faire disparaître
            console.log( `./📄⚙️.Run-ng |showPage : ${nwPg.index} > ${curPg.index} => ${isFrwrd} ==> requestAnimationFrame OK` );
        } );
        console.info( `.../📄✅.--End |showPage : Transition de ${curPgID} vers ${nwPgID} effectuée.` );
    
    } catch (error) {
        isInit.trnstng = false;                                                                 // Sécurité en cas d'erreur
        console.error( `📄🚫.Catched |showPage : ${error} ` );
    }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {showPage} & {actionDispatcher}
 * @instanceCount   2 (1 + 1)
 * ---------------- --------------- --------------- - ------------------------------------------ //
 * @function        showSection
 * @description     GÈRE L'AFFICHAGE DES SECTIONS INTERNES AVEC TRANSITION LATÉRALE
 * ---------------- --------------- --------------- - ------------------------------------------ //
 * @param           {string}        nwSecID         - L'ID de la section à afficher.
 * @param           {string}        pgID            - L'ID de la page parente.
 * @param           {boolean}       isFrwrd         - Si Vrai, glissement de Droit à Gauche (Suivant). Si Faux, glissement de Gauche à Droite (Précédent).
 * --------------------------------------------------------------------------------------------- */
function showSection(nwSecID, pgID) {
    console.debug( `⚓.Init showSection... [param]newSectionID: ${nwSecID} / pageID: ${pgID} ` );
    try {
        const parentPage = Object.values(pages).find( p => p.ID === pgID);                       // Récupère element DOM dans l'objet pages
        if (!parentPage?.hasSub) return;                                                         // Sécurité et chaînage optionnel
        
        const curSecData = parentPage.sub[parentPage.curSecIndx];                                // Cherche la section active dans ce main
        const newSecData = parentPage.sub.find(s => s.id === nwSecID);
        
        const newSecIndx = parentPage.sub.findIndex(s => s.id === nwSecID);                      // Récup index cible
        const curSecIndx = parentPage.curSecIndx;                                                // Récup index actuel
        const dirFrwrd = newSecIndx > curSecIndx;                                                // Détermination de la direction (pour corriger si le breadcrumb est cliqué)
        const [startPos, endPos] = dirFrwrd ? ['100%', '-100%'] : ['-100%', '100%'];             // Définition des positions <= Déstructure pour concision
        if (!newSecData?.element || newSecData.id === curSecData.id) {                           // 1. CAS DÉFENSIF : Section introuvable ou déjà active
            console.error( `.../⚓❌.if-ed |showSection : Section déjà active ou introuvable. ` );
            return;
        }

        newSecData.element.style.transition = 'none';
        newSecData.element.style.transform = `translateX(${startPos})`;
        newSecData.element.style.display = 'block';
        newSecData.element.classList.add('active');                                              // Rend la nouvelle section active et visible
        updateSPA_Height_(parentPage.id, newSecIndx);                                            // Calcul de la nouvelle hauteur avant la transition
        
        const handleTransitionEnd = (event) => {                                                 // --- 4. Nettoyage après la transition de sortie ---
        if (event.target !== curSecData.element) return;                                         // S'assure que l'événement vient de l'élément qui sort
        curSecData.element.removeEventListener('transitionend', handleTransitionEnd);
        curSecData.element.style.transition = 'none';
        curSecData.element.style.transform = 'none';
        curSecData.element.style.display = 'none';
        curSecData.element.classList.remove('active');                                           // Nettoyage du flag actif
        parentPage.curSecIndx = newSecIndx;                                                      // Mise à jour après le nettoyage
        console.warn( `.../⚓✅.--End |showSection => Transition END. New section: ${nwSecID}` );
        
        updateBreadcrumbs(parentPage, nwSecID);                                                  // MISE À JOUR DU BREADCRUMB EN DERNIER
        };
        curSecData.element.addEventListener('transitionend', handleTransitionEnd, { once: true });
        
        requestAnimationFrame( () => {                                                           // 3. Lancement des Transitions (rAF garantit l'application des styles)
            requestAnimationFrame( () => {
                newSecData.element.style.transition = 'transform 0.3s ease-out';
                newSecData.element.style.transform = `translateX(0)`;
                newSecData.element.style.display = 'block';
                curSecData.element.style.transition = 'transform 0.3s ease-out';
                curSecData.element.style.transform = `translateX(${endPos})`;
                curSecData.element.style.display = 'block';
            });
        });
    } catch (error) {
        console.error( `⚓🚫.Catched |showSection : [error] : ${error}` );
    } 
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {actionDispatcher}
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ------------------------------------------ //
 * @function        scrollToSection
 * @description     GÈRE LE SCROLL VERS UNE ANCRE
 * ---------------- --------------- --------------- - ------------------------------------------ //
 * @param           {string}        nwSecID         - L'ID de la section vers laquelle on scrolle.
 * --------------------------------------------------------------------------------------------- */
function scrollToSection(nwSecID) {
    if (!nwSecID || nwSecID === '#') {
        console.error( "Erreur: L'attribut data-anchor est manquant ou invalide." );
        return;
    }

    const trgtElmnt = document.getElementById(nwSecID);               // Trouve Element destination
    if (!trgtElmnt) {
        console.error( `Erreur: Aucune section trouvée avec l'ID: ${trgtElmnt}` );
        return;
    }
    trgtElmnt.scrollIntoView( { behavior: 'smooth', block: 'start' } );// Défilement doux + Aligne haut élément sur haut fenêtre  
}

/* == FONCTIONS NAVIGATION SPA - DISPATCHER =================================================== */
/** ------------------------------------------------------------------------------------------- //
 * @instanceIn       {initNavigationListeners}  listeners sur <body>'click'
 * @instanceCount    1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function         actionDispatcher
 * @description      GESTIONNAIRE D'ACTIONS SEMI-CENTRALISÉ (FOCUS CLIC)
 *                   Fonction principale de délégation d'événements. 
 *                   Trouve l'action demandée (via data-action) 
 *                   et appelle la fonction correspondante.
 *                   <button type="button" data-action="une action" data-maintarget="une page" data-sectiontarget="une section (sous page)">
 *                   Suppression du logging pour alléger les logs à cause des rollover rollout
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {Event}         event           - L'objet événement.
 * -------------------------------------------------------------------------------------------- */
function actionDispatcher(event) {
    const eventType = event.type;
    try {
        if (!event || !event.target) {                                                          // Garde fou contre appels sans argument
            console.error( `❌.If-ed |actionDispatcher: Pas d'objet event ou event.target. Check les appels manuels.` );
            return;
        }
        let trgtElmnt   = null;
        let action      = '';                                                                   // const action = trgtElmnt.dataset.action ?? ''; <= Coalescence des nuls pour assurer bon traitement info
        
        if (eventType === 'mouseover' || eventType === 'mouseout' || (eventType === 'click' && event.target.closest('[data-handler-group="rating-selection"]') ) ) {  // 1. Cible Prio => Interactions Complexes => Cible conteneur groupe pour 'mouseover'/'mouseout'
            const hoveredLabel  = event.target.closest('.trmdvsr-radio-label');                 // Cible le label qui a l'action, PAS le conteneur <= quel *label* a été survolé. => Cherche le label cliquable, qui est l'élément visuel de l'étoile
            if (hoveredLabel && hoveredLabel.closest('[data-handler-group="rating-selection"]')) { // Si c'est un mouse event ET que nous avons survolé un label de notation
                trgtElmnt       = hoveredLabel;
                action          = 'handleRatingRollover';                                       // Force l'action sur le label
            }
        }

        if (!trgtElmnt && !action) {                                                            // 2. Cible Standard => Actions basées sur data-action (Click, Change, Input, etc.)
            trgtElmnt   = event.target.closest('[data-action]');                                // Trouve l'élément qui a l'attribut data-action, en remontant l'arbre DOM
            action      = trgtElmnt ? trgtElmnt.dataset.action ?? '' : '';
        }
           
        if (!trgtElmnt) return;                                                                 // Si aucun élément avec data-action n'est trouvé
        const pgTrgtID  = trgtElmnt.dataset.maintarget      ?? null;                            // Récupération des données communes <= Ex: page ID, section ID
        const scTrgtID  = trgtElmnt.dataset.sectiontarget   ?? null;                            // Uniquement pour 'evaluations'
        const param     = trgtElmnt.dataset.param           ?? null;                            // Ex: true/false pour isFrwrd, ou une autre valeur

        switch (action) {
            // -------------------------------------------------------------------------------- //
            case 'navBurger':
                menu.iconElmnts.forEach( burgerIconElement => { burgerIconElement.classList.toggle('active'); } );
                menu.navElmnts.classList.toggle('active');                                     // Bascule la classe 'active' pour afficher/masquer le menu
                const isExpanded = menu.navElmnts.classList.contains('active');          // Gère l'accessibilité (ARIA)
                loader.element.setAttribute('aria-expanded', isExpanded);
            break;
            // -------------------------------------------------------------------------------- //
            case 'navLinks':
                menu.navElmnts.classList.remove('active');
                loader.element.setAttribute('aria-expanded', 'false');
                console.log( `⚙️.Tested |actionDispatcher : navLinks => ${param} ` );
            break;
            // -------------------------------------------------------------------------------- //
            case 'temoignageScroll':
                if (param === 'next') {
                    pages.accueil.tstmnlCrslElmnt.scrollBy({ left: pages.accueil.tstmnlScrllAmnt, behavior: 'smooth' });
                } else {
                    pages.accueil.tstmnlCrslElmnt.scrollBy({ left: -pages.accueil.tstmnlScrllAmnt, behavior: 'smooth' });
                }
            break;
            // -------------------------------------------------------------------------------- //
            case 'validateHomepageSelection':                                                   // genre superSelect pour séparer sélection et validation
                const valueLieu = slctLxElmnt ? slctLxElmnt.value : null;                       // La valeur est l'ID du lieu
                if (valueLieu === 'undefined') {
                    showPage('creation-lieu_page');                                             // Si l'utilisateur a sélectionné 'Nouveau Lieu'
                    console.log( `./⚙️.Run-ng |actionDispatcher -> Création Lieu` );
                
                } else if (valueLieu && valueLieu !== '') {
                    showPage('evaluations_page', 0);                                            // 1. Affiche la page et la première section                
                    appData.lieuId = valueLieu;
                    console.log( `./✅.End-ng |actionDispatcher -> Evaluations (ID: ${valueLieu})` );
                    
                } else {
                    console.error( `❌.Elsed |actionDispatcher : Veuillez sélectionner un lieu.` );
                }
            break;
            // -------------------------------------------------------------------------------- //
            case 'navigateMain':                                                                // Nav vers : 'accueil' / 'creation-lieu' / 'evaluations'
                showPage(pgTrgtID, scTrgtID || null);
                console.log( `./⚙️.Run-ng |actionDispatcher : navigateMain: ${pgTrgtID} / ${scTrgtID}.` );
            break;
            // -------------------------------------------------------------------------------- //
            case 'navigateSection':                                                 // Gère la navigation entre les sections (doit valider avant)
                const currentSectionId = trgtElmnt.dataset.currentSection;
                const isFrwrd = param === 'true';

                if (isFrwrd && !checkSectionCompletion(currentSectionId)) {                     // Validation conditionnelle (uniquement si on va en avant)
                    trgtElmnt.textContent = 'Note requise !';
                    setTimeout(() => checkSectionCompletion(currentSectionId), 1000);
                    console.error(  `❌.If-ed |actionDispatcher : Validation section échouée.` );
                    return;
                }

                // Votre fonction showSection doit gérer le scroll du carrousel
                // showSection(scTrgtID, pgTrgtID, isFrwrd); 
                // Temporairement pour le HTML de démo, on utilise l'API de scroll
                const CAROUSEL_CONTAINER = document.getElementById('evaluations_page');
                const targetSection = document.getElementById(scTrgtID);
                if (targetSection && CAROUSEL_CONTAINER) {
                    CAROUSEL_CONTAINER.scroll( {
                        left: targetSection.offsetLeft,
                        behavior: 'smooth'
                    } );
                }
                  // console.log( `./⚙️.Run-ng |actionDispatcher : navigateSection: ${pgTrgtID} / ${scTrgtID} / ${isFrwrd}.` );
            break;
            // -------------------------------------------------------------------------------- //
            case 'handleRatingRollover':
                const targetSecIndx = getInfos(trgtElmnt);
                const targetLabel = pages.eval.sub[targetSecIndx].label;

                let selectedNote = appData[`note${targetLabel}`] || '0';
                console.log(`handleRatingRollover 1-> ${selectedNote} && `);
                
                if (eventType === 'mouseover') {                                                // Ici, trgtElmnt est le LABEL survolé ou cliqué.
                    
                    const valueToDisplay = getScoreFromLabel(trgtElmnt);
                    console.log(`handleRatingRollover 2-> ${valueToDisplay}`);
                    
                    if (valueToDisplay !== null) {
                        displayNote(valueToDisplay, targetSecIndx);
                    }

                } else if (eventType === 'mouseout') {
                    displayNote(selectedNote, targetSecIndx);                                      // Retire l'effet de survol en affichant la note sélectionnée
                    console.log(`handleRatingRollover 3-> ${selectedNote}`);

                } else if (eventType === 'click') {                                             // Gestion du clic (sélection de la note)
                    const clickedInput = document.getElementById(trgtElmnt.getAttribute('for'));
                    if (clickedInput) {
                        clickedInput.checked = true;                                            // Coche l'input
                        selectedNote = clickedInput.value;                                     // Met à jour l'état de la note
                        if (appData) appData[`note${targetLabel}`] = scoreFinal;                // 📘 
                        
                        displayNote(selectedNote, targetSecIndx);                                             // Met à jour l'affichage permanent
                        // handleRatingChange(clickedInput);                                    // Si vous avez un autre gestionnaire de change pour la BDD, appelez-le ici
                    }
                }
                break;
            // -------------------------------------------------------------------------------- //
            case 'handleRatingChange':
                if (eventType === 'change' && event.target.type === 'radio') handleRatingChange(event.target); // trgtElmnt est [data-action="handleRatingChange"] <= L'event CHANGE provient de l'input radio. event.target est l'input radio. => // Passe l'input radio à logique métier
            break;
            // -------------------------------------------------------------------------------- //
            case 'navigateAnchor':                                                              // Scroll vers l'ancre
                scrollToSection(scTrgtID);
                console.log( `./⚙️.Run-ng |actionDispatcher : navigateAnchor: ${scTrgtID}` );
            break;
            // -------------------------------------------------------------------------------- //
            case 'updateData':                                                                  // Mise à Jour/Formulaire (change/input) ---
                console.log( `actionDispatcher | updateData : key: ${key} / value: ${value} / trgtElmnt: ${trgtElmnt} ` );
                if (eventType === 'change' || event.type === 'input') {                         // On s'assure que l'événement correspond (pour clic, rien)
                    if (event.target.type === 'radio' && event.target.name.startsWith('eval-q')) return; // EXCLUSION : S'assure que les radios de notation ne passent pas par la gestion standard des formulaires
                    const key = param;
                    const value = event.target.value;                                             // on récupère la value d'un input ou d'un textarea
                    // updateData(key, value, event.target);                                      // Votre fonction d'update
                    // console.log( `actionDispatcher | updateData : key: ${key} / value: ${value}` );
                }
            break;
            // -------------------------------------------------------------------------------- //
            case 'guided_mode_toggle':
                const nwValue = event.target.value;                                             // OLD toggle true/false isGuided = event.target.value === 'guided'; 
                synchroniserModeGuide_(nwValue);                                                // Met à jour toutes les autres instances visibles sur la page
                appData.guideORexpert = nwValue;                                                // 📘✅ Engistrement de guideORexpert dans appData              
            break;
            // -------------------------------------------------------------------------------- //
            case 'saveSettings':
                console.log( `./⚙️.Run-ng |actionDispatcher : Sauvegarde... ` );                // event.type sera 'click' (provenant du bouton)
                saveAllSettings();
            break;
            // -------------------------------------------------------------------------------- //
            default:                                                                            // Cas où data-action est non-référencée
                console.warn( `⚠️.Defaulted |actionDispatcher : Action non gérée: ${action}.` );
            break;
        }
    
    } catch (error) {
        console.error( `🚫.Catched |actionDispatcher : ${error} ` );
    }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initNavigationListeners}  listeners sur <body>'submit'
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
 * @instanceIn      {initNavigationListeners}                        ../
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        handlePageData
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



 * Gère le changement de note (logique métier).
 * @param {HTMLElement} radioElement - L'input radio qui a déclenché l'événement.
 */
function handleRatingChange(radioElement) {
    const radioName = radioElement.name; // Ex: 'eval-q1'
    const score = radioElement.value;    // Ex: '5'
    
    // Extrait l'identifiant de la question (ex: q1)
    const questionId = radioName.split('-')[1]; // 'q1'
    const sectionId = `section_${questionId}`;   // 'section_q1'

    // 1. Mise à jour de l'affichage numérique de la note
    const scoreDisplay = document.getElementById(`result-${radioName}_accueil`);
    if (scoreDisplay) {
        scoreDisplay.value = `${score} /5`;
    }

    // 2. Vérification de la complétion pour activer le bouton de navigation
    checkSectionCompletion(sectionId);

    // 3. Enregistrement des données de notation (à faire dans appData)
    // Ex: appData.evaluations[questionId] = score;
    updateStatus({ log: `✅.End-ng |handleRatingChange : Note ${score}/5 enregistrée pour ${questionId}.` });
}

/**
 * Vérifie si une section d'évaluation est complétée et gère le bouton Suivant.
 * Cette fonction est réutilisée par actionDispatcher (via handleRatingChange) et navigateSection.
 * @param {string} sectionId - L'ID de la section (e.g., 'section_q1').
 * @returns {boolean} Vrai si la section est complétée.
 */
function checkSectionCompletion(sectionId) {
    // Détermine le nom du groupe radio à partir de l'ID de section (ex: section_q1 -> eval-q1)
    const radioGroupName = `eval-${sectionId.replace('section_', '')}`;
    // Si la radio a un 'name' différent, ajuster ici. Assumons 'q1' si section est 'section_q1'

    // Logique de validation... (à implémenter en utilisant votre structure DOM)
    // const isCompleted = document.querySelector(`input[name="${radioGroupName}"]:checked`) !== null;

    // ... (Logique d'activation du bouton) ...
    // return isCompleted;
    return true; // Placeholder pour le moment
}

/* == FONCTIONS D'INITIALISATION GLOBALE ====================================================== */
/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {loadPage}                        ../
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        handlePageData
 * @description     DISTRIBUTEUR
 *                  Reçoit l'objet de données complètes et distribue les valeurs aux éléments HTML ciblés (h1, p, select).
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {Object}        data            - L'objet contenant toutes les briques de données 
 * @example                                           {lieux: [...], types: [...], page_title: "..."}
 * -------------------------------------------------------------------------------------------- */
function handlePageData(data) {


    console.debug( `📝.Init handlePageData...[param]data: ${data} ` );
    updateStatus({ type: 'loading', isLdng: true, imgType: 'blanc', msg: `Traitement des datas...`});
    
    try {
        if (data.submissionID) {                                                                // Global - ID
            console.log( `📝⚙️.Run-ng |handlePageData | appData.submissionID:  ${data.submissionID} ` )
            updateStatus({ type: 'loading', isLdng: true, imgType: 'blanc', msg: `Récupération d'un numéro d'identification...` });
            appData.submissionID = data.submissionID;                                           // 📘✅ Engistrement de submissionID dans appData
        }
        
        initializeDOMElements();                                                                // <= Set up des éléments du DOM
        showPage('evaluations_page');                                                           // accueil_page
        /**
        if (!isInit.modeGuide) {                                                                // Global - Mode Guidé/Expert
            appData.guideORexpert ??= 'guided';                                                 // 📘✅ Engistrement de guideORexpert dans appData si undefined
            initModeGuide(appData.guideORexpert);
            isInit.modeGuide = true;
        }
        
        //if (data.dropdown_lieux)    populateDropdownOpt(pages.accueil.slctLxElmnt, data.dropdown_lieux, 'nom', 'id');   // ACCUEIL - DROPDOWN LIEUX
        //if (data.types)             populateDropdownOpt(pages.creation.typeElmnt, data.types);                          // CREATION - DROPDOWN TYPE
        
        if (!isInit.navGlobale) {                                                               // Init des listeners de navigation
            initNavigationListeners();
            isInit.navGlobale = true;
        }
        console.log( `📝✅.--End |handlePageData : Page entièrement chargée et peuplée. ` );
        updateStatus({ type: 'success', isLdng: false, imgType: 'blanc', msg:  `Affichage de l'app.` });
    */
    } catch (error) {
        console.error(`📝🚫.Catched |handlePageData [error] : ${error} `);
    }
}

/* == FONCTIONS HELPERS - PRIVATE ============================================= (UTILITAIRE) == */
/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {debouncedHandleResize} & {synchroniserModeGuide_} & {showPage} & {showSection} 
 * @instanceCount   4 (1 + 1+ 2  )
 * ---------------- --------------------- --------------- - ----------------------------------- //
 * @function        updateSPA_currentHeight
 * @description     FONCTION UTILITAIRE POUR GÉRER LA HAUTEUR DU CONTENEUR SPA
 * ---------------- --------------------- --------------- - ----------------------------------- //
 * @param           {string||null}        trgtPgID        - L'ID de la page cible. On force la détection des strings, car est aussi appelé par onResize
 * @param           {string||null}        trgtSecIndx     - L'Index de la section cible.
 * -------------------------------------------------------------------------------------------- */
function updateSPA_Height_(trgtPgID = null, trgtSecIndx = null) {
    try {
        let callStack = getCallStack_();                                                        // Enregistre la pile d'appels si erreur se produirait plus tard.
        trgtPgID = (typeof trgtPgID === 'string') ? trgtPgID : (curPgID ?? 'accueil_page');     // <= Certitude : trgtPgID est une string
        const trgtPg = Object.values(pages).find(p => p.ID === trgtPgID);                       // => Enregistre l'objet Page
        console.debug( `⚙️⬜️Init updateSPA_Height_${trgtPg.id} [param]trgtPgID: ${trgtPgID}${trgtSecIndx != null ? ` / trgtSecIndx:${trgtSecIndx}` : ''}` ); 
        
        if (!conteneurSPA || !trgtPg) return;                                                   // != Sécurité initiale (conteneur et page cible doivent exister)
        let trgtHght = trgtPg.element.offsetHeight;                                             // ?= Logique minimale => Page simple sans gestion relative/absolute
        if (trgtPg.hasSub) {                                                                    // <= Ajoute hauteur section active
            trgtSecIndx ??= trgtPg.curSecIndx;                                                  // ?= Gère récup par défaut de l'index en cours
            trgtHght += trgtPg.sub[trgtSecIndx].element?.offsetHeight ?? 0;                     // <= Ajoute hauteur section active à hauteur page simple
        }
        
        if (trgtHght <= 0) {                                                                    // => Réinitialise le style si hauteur invalide ou nulle 
            conteneurSPA.style.removeProperty('--hauteur-content');
            console.log( `⚙️.Run-ng |updateSPA_Height_ : Variable --hauteur-content supprimée (passage à hauteur auto).` );
            return;
        }
        conteneurSPA.style.setProperty('--hauteur-content', `${trgtHght}px`);                   // => Définit le CSS si hauteur valide
        console.log( `⚙️✅.--End |updateSPA_Height_ : Variable CSS --hauteur-content ajustée à: ${trgtHght}px` );
    
    } catch (error) { console.error( `🚫.Catched |updateSPA_Height_ : ${error} \n ${callStack}` ) };
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initNavigationListeners}                  ../
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        debounce_
 * @description     FONCTION UTILITAIRE DE DEBOUNCING (ANTI-REBOND)
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {function}      func            - La fonction à encapsuler.
 * @param           {number}        delay           - Le délai en millisecondes après lequel la fonction sera exécutée.
 * @returns         {function}                      > La nouvelle fonction "débouncée".
 * -------------------------------------------------------------------------------------------- */
function debounce_(func, delay) {
    let timeoutId;
    return function(...args) { 
        const context = this;
        clearTimeout(timeoutId);                                                                // Fn glob: Annule le timer précédent
        timeoutId = setTimeout( () => { func.apply(context, args); }, delay );                  // Exécute SEULEMENT après fin du délai
    };
}

/** ------------------------------------------------------------------------------------------- //
 * @version         25.11.03 (15:59)
 * @instanceIn      {initUpdateStatusDOM}
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        getLogoUrlsFromCSS_
 * @description     FONCTION UTILITAIRE POUR RÉCUPÉRER LES VALEURS CSS
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @returns         {function}      bleu/blanc      > Les URLs pour le logo bleu et le logo blanc.
 * -------------------------------------------------------------------------------------------- */
function getLogoUrlsFromCSS_() {
    try {
        const rootStyles    = getComputedStyle(document.documentElement);                           // document.documentElement => Cible l'élément racine
        const actifUrlCSS   = rootStyles.getPropertyValue('--url-logo-actif').trim();               // bleu
        const blancUrlCSS   = rootStyles.getPropertyValue('--url-logo-blanc').trim();
        
        const extractUrl = (cssValue) => {                                                          // FONCTION INTERNE
        if ( !cssValue || !cssValue.startsWith('url(') ) return '';
            return cssValue.slice(4, -1).replace(/["']/g, '');                                      // Retire 'url(', ')', et les guillemets/apostrophes éventuels.
        };
        return { bleu: extractUrl(actifUrlCSS), blanc: extractUrl(blancUrlCSS) };

    } catch (error) { console.error ( `📃🚫.Catched |getLogoUrlsFromCSS_ => error: ${error}` ); }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {handlePageData} & {updateSPA_Height_}               ../
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        getCallStack_
 * @description     FONCTION UTILITAIRE POUR OBTENIR LA PILE D'APPELS
 *                  Récupère et formate la pile d'appels d'où la fonction a été appelée.
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @returns         {string}                        > La pile d'appels, formatée pour être lisible.
 * -------------------------------------------------------------------------------------------- */
function getCallStack_() {
    const error = new Error();                                                                  // Créer une nouvelle erreur. L'objet Error contient la propriété 'stack'.
    let stack = error.stack || `Pile d'appels non disponible.`;                                // Le 'new Error()' est créé au moment où cette fonction est appelée.
    stack = stack.split('\n').slice(2).join('\n').trim();                                       // Garde les appels importants, retire la 1e ligne "Error" / appel à getCallStack lui-même. split('\n') => sépare les lignes, slice(2) => saute les 2 premières lignes inutiles.
    return `\n--- DÉBUT PILE D'APPELS ---\n${stack}\n--- FIN PILE D'APPELS ---`;                // Retourne un formatage plus clair
}

/** ------------------------------------------------------------------------------------------- //
 * @version         25.12.02 (13:30) -> with Gemini
 * @instanceIn      {handlePageData}                  ../
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initNavigationListeners
 * @description     ATTACHE LES LISTENERS
 *                  Crée des listeners au clic, au  sur l'ensemble du <body> en ciblant un '[data-action="navigate"]'
 * -------------------------------------------------------------------------------------------- */
function initNavigationListeners() {
    console.debug( `🎙️⬜️.Init initNavigationListeners...` );
    updateStatus({ refCSS: 'intro', type: 'loading',   isLdng: true, logoType:'blanc', msg: `🎙️ Mise sur écoute de l'app... Des boutons... Pas de vous.`});   
    try {
        document.body.addEventListener('click', actionDispatcher);                              // Clavier / actions [data-action]
        document.body.addEventListener('change', actionDispatcher);                             // Ajoutez l'écouteur 'change' pour les radios de notation
        //document.body.addEventListener('change', handleFieldUpdate);                          // Changement de valeur (select, checkbox, fin de saisie)
        // NOTE: Le 'change' est préférable au 'click' pour les radios,
        // mais votre architecture actuelle semble utiliser 'change' via 'handleFieldUpdate'.
        // Pour la notation, je vous recommande d'utiliser 'change' et de le dispatcher
        // dans actionDispatcher pour séparer la logique 'rating' des autres champs.
        document.body.addEventListener('mouseover', actionDispatcher);                          // Ajoutez les écouteurs pour le rollover/survol
        document.body.addEventListener('mouseout', actionDispatcher);
        
        document.body.addEventListener('submit', handleFormSubmit);                             // Soumissions de formulaires (avec preventDefault)
        document.body.addEventListener('input', handleFieldUpdate);                             // Saisie en temps réel (validation)
        document.body.addEventListener('keydown', handleKeyEvents);
        
        const debouncedHandleResize = debounce_(updateSPA_Height_, 200);                        // version anti-rebond de 200ms
        window.addEventListener('resize', debouncedHandleResize);                               // MàJ la hauteur au resize de la fenêtre avec anti-rebond

        // autocomplete.addListener('place_changed'                                             // <= gestion dans la function dédiée 
        console.warn( `🎙️✅.--End |initNavigationListeners OK. ` );
        updateStatus({ refCSS: 'intro', type: 'success', isLdng: true, imgType: 'blanc', msg: `🎙️ 1. 2. 1. 2. Les micros sont en place.` });
    
    } catch (error) {
        console.error( `🎙️🚫.Catched |initNavigationListeners [error] : ${error}.` );
        updateStatus({ refCSS: 'intro', type: 'error', isLdng: true, logoType: 'blanc', msg: `🎙️ Houston? Whitney Houston? We avons un problème...` });
    }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {handlePageData}
 * @instanceCount    1 - unique
 * ---------------- --------------------------------------------------------------------------- //
 * @function        initializeDOMElements
 * @description     INITIALISE LES RÉFÉRENCES DOM ET LES AJOUTE À L'OBJET 'PAGES'
 *                  Appelée après que le DOM soit chargé pour que document.getElementById() fonctionne
 *                  Intérêt pour éviter d'interroger le DOM à chaque resize.
 *                  Important pour gain de performance en enregistrant une fois les <HTMLElements> et ne plus faire de 
 *                  ref getElementById ou querySelector. La fonction initializeDOMElements n'a pas besoin d'enregistrer 
 *                  les éléments de notation car ils sont gérés par délégation d'événements et n'ont pas de besoin d'accès 
 *                  direct après le chargement, SAUF pour l'initialisation de leur état (score, bouton).
 * -------------------------------------------------------------------------------------------- */
function initializeDOMElements() {
    console.debug( `⚙️⬜️.Init initializeDOMElements...` );
    updateStatus({ type: 'loading', isLdng: true, imgType: 'blanc', msg: `Initialisation des pages...` });
    updateStatus({isLdng:false});
    
    try {
        //===================================================================================== // SPA
        conteneurSPA = document.querySelector('.conteneur-spa-global');                         // 🛟 Enregistre le conteneur
        if (!conteneurSPA) {
            console.error( `❌.Elsed |initializeDOMElements : Erreur fatale. L'app est indisponible...` );
            return;
        }
        //===================================================================================== // MENU GÉNÉRAL
        const burgerElmntTmp        = document.querySelector('.menu-toggle');                   // <= bouton
        const burgerIconElmntTmp    = document.querySelectorAll('.menu-icon');                  // Lignes x3
        const navElmntTmp           = document.querySelector('.nav-globale');                   // <= <ul> conteneur des <li>
        if (burgerElmntTmp)         menu.toggleElmnt  = burgerElmntTmp;                         // 🛟 Enregistre le bouton de nav burger
        if (burgerIconElmntTmp)     menu.iconElmnts = burgerIconElmntTmp;                       // 🛟 Enregistre le bouton de nav burger
        if (navElmntTmp)            menu.navElmnts   = navElmntTmp;                             // 🛟 Enregistre la nav
        
        if (!menu.navElmnts && !menu.iconElmnts && menu.toggleElmnt) console.error( `❌.Elsed |.initializeDOMElements : Erreur. Le menu n'est pas initialisé correctement...` );
        console.dirxml(menu);
        //===================================================================================== // PAGES
        Object.values(pages)?.forEach( p => {
            const pageElmntTmp = document.getElementById(p.ID);                                 // Récupération de l'élément du DOM avec cet id        
            
            if (pageElmntTmp) {
                p.element = pageElmntTmp;                                                       // 🛟 Enregistre DOM element <= Agit comme parent des sous-elements 
                //----------------------------------------------------------------------------- // ACCUEIL
                if (p.ID === "accueil_page") {
                    p.slctLxElmnt = p.element.querySelector('.trmdvsr-suprslct #selectLieux');  // 🛟 Enregistre le champ input principal
                    p.lxList = p.slctLxElmnt.querySelectorAll('option');                        //
                    p.tstmnlCrslElmnt = p.element.querySelector('.carousel-temoignage');        // 🛟 Enregistre le carousel témoignage <= page accueil
                    p.tstmnlCrtElmnt  = p.tstmnlCrslElmnt.querySelectorAll('.carte-temoignage');// 🛟 Enregistre une carte témoignage <= page accueil
                    p.tstmnlScrllAmnt = p.tstmnlCrtElmnt[0].offsetWidth + 24;                   // 🛟 Enregistre le scroll amount <= page accueil
                    console.dirxml (p);
                }
                
                //----------------------------------------------------------------------------- // CREATION LIEU
                if (p.ID === "creation-lieu_page") {
                    p.adressElmnt = p.element.querySelector('#adresseSalle');                   // 🛟 =>📘 Enregistre le champ adresse <= page création
                    p.adressErrorElmnt = p.element.querySelector('#adresseError');              //
                    p.nomElmnt = p.element.querySelector('#nomSalle');                          // 🛟 =>📘 Enregistre le champ nom <= page création
                    p.typeElmnt = p.element.querySelector('#typeEtablissement');                // 🛟 =>📘 Enregistre le champ type <= page création
                    p.typeList = p.typeElmnt.querySelectorAll('option');                        //
                    console.dirxml (p);
                }

                //----------------------------------------------------------------------------- // EVALUATIONS
                if (p.ID === "evaluations_page") {
                    //......................................................................... // GESTION DES SECTIONS => MENU ETC...
                    p.brdcrmbElmnts = document.querySelectorAll('.module-breadcrumb .breadcrumb-item');      //  <= cible <li> via .breadcrumb-item
                    if (p.brdcrmbElmnts.length === 0) console.error( `❌.Elsed |.initializeDOMElements : Erreur. La sous-nav n'a pas été chargée.` );

                    p.curSecIndx = 0;                                                           // 🛟 Définit l'index de la section active
                    p.sectionCount = p.sub.length;                                              // 🛟 Enregistre le nombre de sections
                    
                    p.crslvwprt = document.querySelector('.eval-carousel-viewport');
                    p.crsltrck = document.querySelector('form.eval-carousel-track');

                    //......................................................................... // SECTIONS
                    p.sub.forEach ( (section, index) => {
                        
                        //¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ // UTILE
                        const sectionElement = document.getElementById(section.ID);
                        if (sectionElement) {
                            section.element = sectionElement;                                   // 🛟 Enregistre DOM element <= Element Parent 
                            section.index = index;                                              // 🛟 Enregistre index
                        };

                        switch (section.type) {
                            case 'notation':
                                //¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ // NOTE ET COMMENTAIRE <= préparation
                                section.note = {
                                    tag: null,                                                          // 🛟 Enregistre le nom de la note
                                    amount: null                                                        // 🛟 Enregistre la note
                                };
                                section.comment = {
                                    trmdvsrKey: null,                                                   // 🛟 Enregistre ID du commentaire
                                    texte: null                                                         // 🛟 Enregistre le commentaire potentiellement modifié
                                };

                                const noteTemp = document.getElementById(`result-q${index + 1}`);       // compense l'index start 0
                                if (noteTemp) section.noteElmnt = noteTemp;                             // 🛟 Enregistre DOM element 
                                
                                const moduleNoteTemp = sectionElement.querySelector('[data-action].module-note');
                                if (moduleNoteTemp) section.noteModuleElmnt = moduleNoteTemp;
                                else console.warn(`Aucun élément interne trouvé correspondant à '[data-action].module-note' dans l'élément moduleNoteTemp. ${moduleNoteTemp}`);
                                
                                const displayNoteTemp = sectionElement.querySelector(`#result-q${index + 1}.module-note.trmdvsr-texte-h2`);
                                if (displayNoteTemp) section.noteDisplayElmnt = displayNoteTemp;
                                else console.warn(`Aucun élément interne trouvé correspondant à '#result-q${index + 1}.module-note.trmdvsr-texte-h2' dans l'élément moduleNoteTemp.. ${moduleNoteTemp}`);

                                checkSectionCompletion(section.ID);                                     // Désactive les boutons "Suivant" et initialise l'affichage du score
                            break;
                            case 'fileupload':
                                console.log('todo bientôt');
                            break;
                            default:
                                console.log(`si ça s'affiche y a un souci dans initializeDOMElements`)
                            break;
                        }
                        




                        //¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ // AVIS
                    } );
                    console.dirxml (p);
                }
            } else console.error( `❌.Elsed |initializeDOMElements : L'élément DOM avec l'ID ${p.ID} est introuvable.` );
        } );
        isInit.allDOMLoaded = true;                                                             // 🚩 Enregistre FLAG => DOM prêt, activation drapeau
        tryToInitAutocomplete();                                                                // Tentative d'initialisation (si Maps est déjà chargé)
        console.warn( `⚙️✅.--End |initializeDOMElements : Réfs DOM initialisées et attachées à {pages}.` );
    
    } catch (error) { console.error( `🚫.Catched |initializeDOMElements : ${error}` ); }
}
/* == GUIDEMODE ================================================================ (COMPOSANT) == */
/** ------------------------------------------------------------------------------------------- //
 * @version         25.10.09 (23:16)
 * @instanceIn      {handlePageData}
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initModeGuide
 * @description     LIT ET MET À JOUR LE MODE GUIDÉ/EXPERT
 *                  Trouve tous les éléments avec .composant-aide (crochet fonctionnel), lit l'état actuel (appData.guideORexpert) et coche la bonne option.
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {string}        initValue       - ['guided' || 'expert']
 * -------------------------------------------------------------------------------------------- */
function initModeGuide(initValue) {
    updateStatus({ isLdng: true, msg: `🔌.Init initModeGuide | Initialisation du mode guidé... `, logoType: 'blanc' });
    try {
        guideModeBTN = document.querySelectorAll('.composant-aide input[type="radio"]'); // 🛟 Enregistre les boutons radios
        if (!guideModeBTN) {
            console.error( `❌.Elsed |.initModeGuide : Les boutons guidé/expert sont introuvables.` );
            return;
        }
        synchroniserModeGuide_(initValue);                            // Lance synchronisation
        updateStatus({ type: 'success', imgType: 'blanc', msg: `🔌✅.--End |initModeGuide : Mode guidé mis en place`});
    
    } catch (error) { console.error(`🔌🚫.Catched |initModeGuide : [error] : ${error}` ); }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {actionDispatcher} & {initModeGuide}
 * @instanceCount   1 + 1
 * ---------------- --------------- --------------- - ---------------- ------------------------ //
 * @function        synchroniserModeGuide_
 * @description     SYNCHRONISE TOUTES LES INSTANCES DE MODE GUIDÉ/EXPERT
 *                  Parcourt toutes les instances et ajuste les btn-radios sur appData.guideORexpert
 * ---------------- --------------- --------------- - ---------------- ------------------------ //
 * @param           {string}        nwVal           - ['guided' || 'expert']
 * -------------------------------------------------------------------------------------------- */
function synchroniserModeGuide_(nwVal) {
    console.log( `🔌⬜️.Init synchroniserModeGuide_ ...[param]nwVal:${nwVal} ` );
    try {
        guideModeBTN.forEach ( rdio => { rdio.checked = (rdio.value === nwVal); });             // Update les btns => checked ou pas
        document.body.classList.toggle('guidedMode', nwVal === 'guided');                       // Ajoute/Retire la classe
        updateSPA_Height_();                                                                    // si déjà initialisé => UpdateSPA_Height_ 
        console.log( `🔌✅.--End |synchroniserModeGuide` );

    } catch (error) { console.log( `🔌🚫.Catched |synchroniserModeGuide_ [error] : ${error} `); }
}

/* == APP HELPER - UPDATESTATUS =============================================== (UTILITAIRE) == */
/** ------------------------------------------------------------------------------------------- //
 * @version         25.11.03 (15:59)
 * @instanceIn      {loadPage} & {loadTemp}
 * @instanceCount   2 (1 + 1)
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        init_updateStatus
 * @description     INITIALISE LE LOADER UNIFIÉ
 * -------------------------------------------------------------------------------------------- */
function initUpdateStatusDOM() {
    try {
        console.log('🚥⬜️.initUpdateStatusDOM...');
        conteneurBODY                       = document.querySelector('.trmdvsr-app-structure');
        loader.logoURLs                     = getLogoUrlsFromCSS_();
        loader.element                      = document.querySelector('.status-layer');
        if (loader.element) {
            loader.statusMessage            = document.querySelector('.status-message');
            loader.animImgElmnt             = document.querySelector('.spinner-image');
            loader.animSpnElmnt             = document.querySelector('.spinner');
            loader.progressContainerElmnt   = document.querySelector('.progress-container'); 
            loader.progressBarElmnt         = document.querySelector('.progress-bar');
            loader.progressTextElmnt        = document.querySelector('.progress-text');
        }
        if (!loader.logoURLs.bleu || !loader.logoURLs.blanc) console.warn(`Les variables CSS --url-logo-actif ou --url-logo-blanc n'ont pas pu être lues.`);
        console.log('🚥✅.--End |initUpdateStatusDOM...');

    } catch (error) { console.error (`🚥🚫.Catched |initUpdateStatusDOM => error: ${error}`); }
}

/** ------------------------------------------------------------------------------------------- //
 * @version         25.10.09 (23:16)
 * @instanceIn      partout
 * ---------------- --------------- ------------------- - ------------------------------------- //
 * @description     GERE LE LOADING
 *                  Gère l'affichage du statut, du spinner et de la barre de progression 
 *                  pour l'export et attache/détache le loader unique à un conteneur. 
 *                  Accepte un objet de configuration pour plus de flexibilité.
 *                  NÉCESSITE UNE INITIALISATION AVEC init_updateStatus()
 * ---------------- --------------- ------------------- - ------------------------------------- //
 * @param           {string}        [trgtElmntByClss]   - Classe du conteneur cible pour porter le loader
 * @param           {string}        [imgType]           - Type de logo à afficher ('blue' ou 'white'). Si null, le logo actuel est conservé.
 * @param           {string}        type=info           - Le type de message & anim (info / loading / success / error / warn / debug)
 * @param           {boolean}       isLdng=false        - Pour activer/désactiver les spinners et le bouton.
 * @param           {string}        [msg]               - Le texte à afficher.
 * @param           {number}        [current=0]         - Numérateur pour la progression.
 * @param           {number}        [total=0]           - Dénominateur pour la progression.
 * -------------------------------------------------------------------------------------------- */
function updateStatus( { trgtElmntByClss=null, imgType=null, type='info', isLdng=false, msg=null, current=null, total=null} ) {
    console.debug( `📃⬜️.init updateStatus[param] ${ trgtElmntByClss !== null ? `trgtElmntByClss:${trgtElmntByClss} --|&&|-- ` : '' } imgType:${imgType} -|&|- type:${type} -|&|- msg:${msg} -|&|- isLdng:${isLdng} ${ current !== null ? ` --|&&|-- current:${current}` : '' } ${ total !== null ? `-|&|- total:${total}` : '' }` );
    try {
        // ------------------------------------------------------------------------------------ // DÉFENSIF
        if (!loader.element)                { console.error( `Initialisez avant d'appeler.`             ); return; }
        if (!loader.progressContainerElmnt) { console.error( `loader.progressContainerElmnt manquant.`  ); return; }
        if (!loader.progressBarElmnt)       { console.error( `loader.progressBarElmnt manquant.`        ); return; }
        if (!loader.progressTextElmnt)      { console.error( `loader.progressTextElmnt manquant.`       ); return; }
        if (!loader.animImgElmnt)           { console.error( `loader.animImgElmnt manquant.`            ); return; }
        if (!loader.animSpnElmnt)           { console.error( `loader.animSpnElmnt manquant.`            ); return; }
        if (!loader.statusMessage)          { console.error( `loader.statusMessage manquant.`           ); return; }
        // ------------------------------------------------------------------------------------ // RESET CSS
        loader.element.className = 'status-layer';
        loader.progressContainerElmnt.className = 'progress-container';
        loader.progressBarElmnt.className = 'progress-bar';
        loader.progressTextElmnt.className = 'progress-text trmdvsr-label';
        loader.animImgElmnt.className = 'spinner-image';
        // ------------------------------------------------------------------------------------ // NETTOIE LES RÉCEPTEURS
        const clssNm = '.status-target';
        const elmnts2Cln = document.querySelectorAll(`${clssNm}`);                                  // Récup TOUS les éléments avec cette classe
        if (elmnts2Cln.length > 0) { 
            elmnts2Cln.forEach( e => {e.classList.remove(clssNm);} );                               // Si des éléments existent, retire classe pour chacun
            console.log(`${clssNm} supprimée de ${elmnts2Cln.length} élément(s).`); 
        } 
        trgtElmntByClss = document.querySelector(trgtElmntByClss) ?? conteneurBODY;                 // Si non spécifié => cible body
        trgtElmntByClss.classList.add(clssNm);                                                      // Prépare récepteur (assurance d'unicité)
        // ------------------------------------------------------------------------------------ // DÉFINIT CSS & ATTACHE DOM
        let refCSS = (imgType === 'blanc') ? 'fullBlue' : 'lightWhite';                             // Définit CSS si logo blanc fond bleu
        if (loader.element.parentNode !== trgtElmntByClss) trgtElmntByClss.appendChild(loader.element);  // Attache Element au récepteur (s'il a changé)
        loader.element.classList.add('attached', refCSS);
        // ------------------------------------------------------------------------------------ // LAUNCH
        loader.element.style.display = isLdng ? 'flex' : 'none';
        if (!isLdng) return;

        // ------------------------------------------------------------------------------------ // SPINNER IMAGE
        if (imgType) {
            const url = loader.logoURLs[imgType];
            if(url) loader.animImgElmnt.src = url;
            else console.warn(`Type de logo inconnu ou URL non trouvée pour ${imgType}.`);
            loader.animImgElmnt.classList.add( `logo-${type}` );                                    // info / loading / error
        }
        // ------------------------------------------------------------------------------------ // MESSAGE
        loader.statusMessage.classList.remove('info', 'loading', 'success', 'error', 'warn', 'debug');
        loader.statusMessage.textContent = msg; 
        loader.statusMessage.classList.add(type); 
        // ------------------------------------------------------------------------------------ // PROGRESS BAR
        if (current && total) {
            loader.progressContainerElmnt.classList.add(refCSS);
            loader.progressContainerElmnt.style.display = (total > 0) ? 'block' : 'none'; // Affiche barre progression si en charge et total sup à zéro
            loader.progressBarElmnt.classList.add(refCSS);
            loader.progressTextElmnt.classList.add(refCSS);
            if (total > 0 && current <= total) {
                const percent = Math.round((current / total) * 100);
                loader.progressBarElmnt.style.width = `${percent}%`;
                loader.progressTextElmnt.textContent = `${percent}% (${current}/${total} images enregistrées)`;
            } else {
                loader.progressBarElmnt.style.width = '0%';
                loader.progressTextElmnt.textContent = '0% (0/0 images enregistrées)';
            }
        }
        console.log( `📃✅.--End |updateStatus` );

    } catch (error) { console.error ( `📃🚫.Catched |updateStatus => error: ${error}` ); }
};

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {window.onLoad}                   ../
 * @instanceCount   1 - unique     
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initAPP
 * @description     INITIALISEUR DE L'APPLICATION
 *                  Lance l'appel unique à google.script.run et spécifie les clés de données (calledKeys).
 *                  Placement après son appel pour un souci de lisibilité, le hoisting se charge de remonter la fonction.
 * -------------------------------------------------------------------------------------------- */
function initAPP() {
    console.log (`🚀=====🚀 ${DATE} 🚀=====🚀\n`);
    try {
        if (!isInit.updateStatus) {
            initUpdateStatusDOM();                                                              // Initialise le composant de loading
            isInit.updateStatus = true;                                                         // 🏁 Active le flag
        }
        
        const result = { submissionID: 'test' }
        const calledKeys = ['submissionID', 'dropdown_lieux', 'dropdown_types'];                // Clés d'appel pour fetch côté serveur 
        console.debug ( `🚥⬜️.initAPP... [param]result.submissionID: ${result.submissionID} && calledKeys: ${calledKeys}` )
        updateStatus( { imgType: 'bleu', type: 'loading', isLdng: true, msg: `Réveil de l'IA...` } );
 
        /*google.script.run                                                                       // ☎️ APPEL SERVEUR
            .withSuccessHandler( (result) => {                                                  //SI SUCCESS CALLBACK
                */console.log(`🚥✅.--End |initAPP : ${result} `); 
                updateStatus({ imgType: 'bleu', type: 'loading', isLdng: true, msg: `IA réveillée, arrivée dans votre navigateur...` });
                handlePageData(result);/*                                                       // => FN client si succès : traite toutes les données reçues
            })
            .withFailureHandler((error) => {                                                    // SI FAILURE CALLBACK
                console.error( `🚥❌.Failed |initAPP : Échec critique : ${error}` );
                updateStatus({ refCSS: 'intro', type: 'fail', msg: `Erreur lors du chargement des données. Veuillez réessayer.` });
            })
            .getInitialPageData(calledKeys);                                                    // FN serveur
        
        console.log( `./🚥⚙️.Run-ng |initAPP : Server Request => getInitialPageData for [${calledKeys}]` );
        updateStatus({ refCSS: 'intro', type: 'loading', isLdng: true, imgType: 'blanc', message: `Allo l'IA?` });
        */
    } catch (error) {
        isInit.updateStatus = false;
        console.error( `🚥🚫.Catched |initAPP => Big error: ${error}` );
    }
}
/* ** APP LAUNCHER ******************************************************************** (🚀) ** */
window.addEventListener('load', initAPP);

/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */