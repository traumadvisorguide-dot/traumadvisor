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