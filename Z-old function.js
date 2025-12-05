function actionDispatcher(event) {
    //const eventType = event.type;

    // Déclaration de la fonction utilitaire nécessaire pour la correction
    function getScoreFromLabel(labelElement) {
        const radioId = labelElement.getAttribute('for');
        const associatedRadio = document.getElementById(radioId);
        return associatedRadio ? associatedRadio.value : null;
    }

    try {
        if (!event || !event.target) {
            console.error( `❌.If-ed |actionDispatcher: Pas d'objet event ou event.target. Check les appels manuels.` );
            return;
        }

        let trgtElmnt = null;
        let action = '';

        // 1. Cible Prio => Interactions Complexes (Rollover)
        // On cible le conteneur du groupe pour les événements 'mouseover'/'mouseout'
        if (eventType === 'mouseover' || eventType === 'mouseout' || (eventType === 'click' && event.target.closest('[data-handler-group="rating-selection"]'))) { 
            // ❗ CHANGEMENT : On cible l'élément visuel (le label) qui a l'action, PAS le conteneur.
            // On veut savoir quel *label* a été survolé.
            
            // On cherche le label cliquable, qui est l'élément visuel de l'étoile
            const hoveredLabel = event.target.closest('.trmdvsr-radio-label');
            
            // Si c'est un mouse event ET que nous avons survolé un label de notation
            if (hoveredLabel && hoveredLabel.closest('[data-handler-group="rating-selection"]')) {
                trgtElmnt = hoveredLabel;
                action = 'handleRatingRollover'; // Force l'action sur le label
            }
        }

        // 2. Cible Standard => Actions basées sur data-action (Click, Change, Input, etc.)
        if (!trgtElmnt && !action) { 
            trgtElmnt = event.target.closest('[data-action]');
            action = trgtElmnt ? trgtElmnt.dataset.action ?? '' : '';
        }
        
        if (!trgtElmnt) return; 

        // Récupération des données communes
        const pgTrgtID = trgtElmnt.dataset.maintarget ?? null;
        const scTrgtID = trgtElmnt.dataset.sectiontarget ?? null;
        const param = trgtElmnt.dataset.param ?? null; 
        
        // Simuler la variable globale de la note sélectionnée (doit exister dans votre portée globale)
        // REMPLACER `appData.selectedScore` par votre variable réelle si elle a un autre nom.
        let selectedScore = window.appData?.selectedScore || '0'; 
        const scoreDisplayElement = document.getElementById('score-display'); // Assurez-vous d'avoir cet ID sur l'élément d'affichage

        // Fonction pour mettre à jour l'affichage
        function updateDisplay(score) {
            if (scoreDisplayElement) {
                scoreDisplayElement.textContent = `${score}/5`;
            }
        }


        switch (action) {
            // ... autres cases (navBurger, navLinks, temoignageScroll, etc.) ...
            
            // -------------------------------------------------------------------------------- //
            case 'handleRatingRollover':
                
                // Ici, trgtElmnt est le LABEL survolé ou cliqué.
                
                if (eventType === 'mouseover') {
                    const valueToDisplay = getScoreFromLabel(trgtElmnt);
                    if (valueToDisplay !== null) {
                        updateDisplay(valueToDisplay);
                        // console.log(`Survol : ${valueToDisplay}`);
                    }
                } else if (eventType === 'mouseout') {
                    // Retire l'effet de survol en affichant la note sélectionnée
                    updateDisplay(selectedScore); 
                } else if (eventType === 'click') {
                    // Gestion du clic (sélection de la note)
                    const clickedInput = document.getElementById(trgtElmnt.getAttribute('for'));
                    if (clickedInput) {
                        clickedInput.checked = true; // Coche l'input
                        selectedScore = clickedInput.value; // Met à jour l'état de la note
                        if (window.appData) window.appData.selectedScore = selectedScore; // Mettre à jour l'objet de données si nécessaire
                        updateDisplay(selectedScore); // Met à jour l'affichage permanent
                        // Si vous avez un autre gestionnaire de change pour la BDD, appelez-le ici
                        // handleRatingChange(clickedInput);
                    }
                }
                break;
            // -------------------------------------------------------------------------------- //
            
            // ... autres cases (handleRatingChange, navigateAnchor, updateData, etc.) ...
            
            default:
                console.warn( `⚠️.Defaulted |actionDispatcher : Action non gérée: ${action}.` );
                break;
        }
    
    } catch (error) {
        console.error( `🚫.Catched |actionDispatcher : ${error} ` );
    }
}

/**
 * Met à jour l'affichage de la note en utilisant la référence DOM pré-stockée 
 * dans pages.eval.sub, recherchée par l'index de la question (q1, q2, ...).
 * * @param {number|null|undefined} score - Le score numérique à afficher (entre 0 et 5).
 * @param {HTMLElement} element - L'élément déclencheur du DOM (<label> ou <input> radio).
 */
function displayNote(score, element) {
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
    
    const sectionData = pages.eval.sub[targetIndex];
    const targetDisplayElmnt = sectionData.noteDisplayElmnt; 
    
    // --- 3. Mise à jour de la valeur via la référence DOM stockée ---
    if (!targetDisplayElmnt) {
        console.error(`Référence DOM (noteDisplayElmnt) manquante dans les données pour l'index : ${targetIndex}`);
        return;
    }
    
    let scoreFinal;
    const maxScore = 5;

    // Vérifie si le score est un nombre valide (y compris 0)
    if (typeof score === 'number' && !isNaN(score)) {
        // Optionnel: Utilisez toFixed(1) pour un formatage uniforme comme 3.0/5
        scoreFinal = `${score.toFixed(1)}/${maxScore}`; 
        
        // Optionnel: Mettre à jour la propriété 'sub.note' si vous la suivez
        if (sectionData.hasOwnProperty('note')) {
             sectionData.note = score;
        }
    } else {
        scoreFinal = `⏳/${maxScore}`; // Placeholder
    }
    
    // Si targetDisplayElmnt est un <span>/<div>, utilisez textContent. 
    // Si c'est un <input> ou <textarea>, utilisez .value.
    // Nous conservons votre choix (.textContent) :
    targetDisplayElmnt.textContent = scoreFinal;

    console.log(`Note (${scoreFinal}) mise à jour pour ${questionId} (Index ${targetIndex}) via référence DOM stockée.`);
}

// NOTE IMPORTANTE: 
// Si 'noteDisplayElmnt' est un champ de formulaire (<input type="text">), 
// il faudrait utiliser targetDisplayElmnt.value = scoreFinal; au lieu de .textContent.
// Vérifiez si vous utilisez un <input> ou un <span>/<div> pour l'affichage du score.