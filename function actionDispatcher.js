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