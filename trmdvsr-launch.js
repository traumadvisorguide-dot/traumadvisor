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
/**-------------------------------------------------------------------------------------------- //
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
    if (!nwPgID) return;                                                                        // CAS DÉFENSIF: pas de pgID => kill
    if (isTrnstng) return;                                                                      // CAS ANTI-REBOND : transition en cours => kill
    isTrnstng = true;                                                                           // 🚩 Active le flag ANTI-REBOND
    console.debug( `📄.Init showPage... [param]newPageID: ${nwPgID} ${nwSecIndx != null ? ` / newSectionIndex:${nwSecIndx}` : '' }` );
    try {
        const nwPg = Object.values(pages).find(p => p.ID === nwPgID);                           // Charge l'objet page à afficher <= nwPgID existe (if initial)
        if (!nwPg || !nwPg.element) {                                                           // CAS DÉFENSIF: Erreur si pas Element
            isTrnstng = false;                                                                  // 🚩
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
            isTrnstng = false;                                                                  // 🚩 Désactive le flag (centralisé)
            console.warn( `.../📄✅.--End |showPage => Transition complete: ${curPgID} <= ${event.target.tagName} (${event.propertyName}) && ${nwPg.element.id}` );
        };
        
        const curPg = Object.values(pages).find(p => p.ID === curPgID);
        if (!curPg) {                                                                           // A. => Cas Initialisation
            nwPg.element.addEventListener('transitionend', completeTransition);                 // Pas { once: true } car possible multi-bubbling
            updateSPA_Height_(newPg.ID);                                                         // Lance MaJ hauteur en meme temps
            
            requestAnimationFrame(() => {                                                       // 2. Lancement des transitions après repaint
                nwPg.element.classList.add('active');                                           // => classe contient nouvelle position > lance anim
                console.log( `./📄⚙️.Run-ng |showPage : Pas de page en cours => Init page: newPg.ID=${newPg.ID} / requestAnimationFrame OK` );
            });
            return;
        }
        if (!curPg.element) {                                                                   // Gère les ERREURS sur la page COURANTE (flux d'arrêt)
            isTrnstng = false;                                                                  // 🚩
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
            isTrnstng = false;                                                                  // 🚩 Désactive le flag immédiatement
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
        isTrnstng = false;                                                                      // Sécurité en cas d'erreur
        console.error( `📄🚫.Catched |showPage : ${error} ` );
    }
}

/**-------------------------------------------------------------------------------------------- //
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

/**------------------------------------------------------------------ //
* @instanceIn      {actionDispatcher}
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        scrollToSection
* @description     GÈRE LE SCROLL VERS UNE ANCRE
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}        nwSecID         - L'ID de la section vers laquelle on scrolle.
* ------------------------------------------------------------------- */
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
/**-------------------------------------------------------------------------------------------- //
* @instanceIn       {initNavigationListeners}  listeners sur <body>'click'
* @instanceCount    1 - unique
* ----------------- --------------- --------------- - ----------------------------------------- //
* @function         actionDispatcher
* @description      GESTIONNAIRE D'ACTIONS SEMI-CENTRALISÉ (FOCUS CLIC)
*                   Fonction principale de délégation d'événements. 
*                   Trouve l'action demandée (via data-action) 
*                   et appelle la fonction correspondante.
*                   <button type="button" data-action="une action" data-maintarget="une page" data-sectiontarget="une section (sous page)">
*                   Suppression du logging pour alléger les logs à cause des rollover rollout
* ----------------- --------------- --------------- - ----------------------------------------- //
* @param            {Event}         event           - L'objet événement.
* --------------------------------------------------------------------------------------------- */
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
                menu.iconElements.forEach( burgerIconElement => { burgerIconElement.classList.toggle('active'); } );
                menu.navElemens.classList.toggle('active');                                     // Bascule la classe 'active' pour afficher/masquer le menu
                const isExpanded = pages.menu.navElemens.classList.contains('active');          // Gère l'accessibilité (ARIA)
                pages.loader.element.setAttribute('aria-expanded', isExpanded);
            break;
            // -------------------------------------------------------------------------------- //
            case 'navLinks':
                pages.menu.navElemens.classList.remove('active');
                pages.loader.element.setAttribute('aria-expanded', 'false');
                console.log( `⚙️.Tested |actionDispatcher : navLinks => ${param} ` );
            break;
            // -------------------------------------------------------------------------------- //
            case 'temoignageScroll':
                if (param === 'next') {
                    tstmnlCrslElmnt.scrollBy({ left: tstmnlScrllAmnt, behavior: 'smooth' });
                } else {
                    tstmnlCrslElmnt.scrollBy({ left: -tstmnlScrllAmnt, behavior: 'smooth' });
                }
            break;
            // -------------------------------------------------------------------------------- //
            case 'validateHomepageSelection':                                                   // genre superSelect pour séparer sélection et validation
                const valueLieu = selectLieuxElmnt ? selectLieuxElmnt.value : null;             // La valeur est l'ID du lieu
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

/**------------------------------------------------------------------ //
* C. GESTIONNAIRE DÉDIÉ AUX MISES À JOUR DE CHAMPS (CHANGE/INPUT)
* Voir si on doit réintégrer ses propriétées
* ------------------------------------------------------------------- */
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
            updateStatus({ log: `⚙️.Change |handleFieldUpdate : Select lieux mis à jour (valeur: ${value}).` });
        }
    }
    updateStatus({ log: `⚙️.Run-ng |handleFieldUpdate [${eventType}] : Champ ${fieldId} mis à jour.` });
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
    updateStatus({ refCSS: 'intro', type: 'loading', isLdng: true, imgType: 'blanc', msg: `Traitement des datas...`, log: `📝.Init handlePageData...[param]data: ${data} `});
    
    try {
        if (data.submissionID) {                                      // GLOBAL - ID
            updateStatus({ conteneurID: 'intro', type: 'loading', isLdng: true, imgType: 'blanc',
                log: `./⚙️.Run-ng |handlePageData | appData.submissionID:  ${data.submissionID} `, 
                msg: `Récupération d'un numéro d'identification...` 
            });
            appData.submissionID = data.submissionID;                 // 📘✅ Engistrement de submissionID dans appData
        }
        
        initializeDOMElements();                                      // <= Set up des éléments du DOM
        showPage('evaluations_page');                                 // accueil_page
        
        if (!isInit.modeGuide) {                                      /** GLOBAL - MODE GUIDE/EXPERT */
            appData.guideORexpert ??= 'guided';                       // 📘✅ Engistrement de guideORexpert dans appData si undefined
            initModeGuide(appData.guideORexpert);
            isInit.modeGuide = true;
        }
        
        if (data.dropdown_lieux) {                                    /** ACCUEIL - DROPDOWN LIEUX */
            const selecteur_lieu = document.getElementById('selectLieux');
            //populateDropdown(selecteur_lieu, data.dropdown_lieux, 'nom', 'id');     // ⚠️ TO DO : populate uniquement si la liste à changer check côté serveur 
        }
        
        if (data.types) {                                             /** CREATION - DROPDOWN TYPE */
            //populateDropdown(document.getElementById('selectTypes'), data.types);   // ⚠️ TO DO : populate uniquement si la liste à changer check côté serveur
        }
        
        if (!isInit.navGlobale) {                                     /** INITIALISATION DES LISTENERS DE NAVIGATION **/
            initNavigationListeners();
            isInit.navGlobale = true;
        }
        
        updateStatus({ refCSS: 'intro', type: 'success', isLdng: false, log: `.../🎙️✅.--End |handlePageData : Page entièrement chargée et peuplée. `,
            imgType: 'blanc', msg:  `Affichage de l'app.`
        });
    
    } catch (error) {
        updateStatus({ refCSS: 'intro', type: 'error', isLdng: false, log: `🚫.Catched |handlePageData [error] : ${error} `, imgType:'blanc' });
    }
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
    updateStatus({ refCSS: 'intro', type: 'loading',   isLdng: true,  log: `🎙️.Init initNavigationListeners... `, logoType:'blanc',
        msg: `🎙️ Mise sur écoute de l'app... Des boutons... Pas de vous. `
    });
    
    try {
        document.body.addEventListener('click', actionDispatcher);    // Clavier / actions [data-action]
        document.body.addEventListener('change', actionDispatcher);     // Ajoutez l'écouteur 'change' pour les radios de notation
        //document.body.addEventListener('change', handleFieldUpdate);  // Changement de valeur (select, checkbox, fin de saisie)
        
        document.body.addEventListener('mouseover', actionDispatcher); // Ajoutez les écouteurs pour le rollover/survol
        document.body.addEventListener('mouseout', actionDispatcher);
        
        document.body.addEventListener('submit', handleFormSubmit);   // Soumissions de formulaires (avec preventDefault)
        document.body.addEventListener('input', handleFieldUpdate);   // Saisie en temps réel (validation)
        document.body.addEventListener('keydown', handleKeyEvents);
        
        const debouncedHandleResize = debounce_(updateSPA_Height_, 200);  // version anti-rebond de 200ms
        window.addEventListener('resize', debouncedHandleResize);     // MàJ la hauteur au resize de la fenêtre avec anti-rebond

        // autocomplete.addListener('place_changed'                       // <= gestion dans la function dédiée 
        
        updateStatus({ refCSS: 'intro', type: 'success', isLdng: true, log: `.../🎙️✅.--End |initNavigationListeners OK. `,imgType: 'blanc',
            msg: `🎙️ 1. 2. 1. 2. Les micros sont en place. `
        });
    
    } catch (error) {
        updateStatus({ refCSS: 'intro', type: 'error', isLdng: true, log: `🚫.Catched |initNavigationListeners [error] : ${error}. `, logoType: 'blanc',
            msg: `🎙️ Houston? Whitney Houston? We avons un problème... `
        });
    }
}

// NOTE: Le 'change' est préférable au 'click' pour les radios,
// mais votre architecture actuelle semble utiliser 'change' via 'handleFieldUpdate'.
// Pour la notation, je vous recommande d'utiliser 'change' et de le dispatcher
// dans actionDispatcher pour séparer la logique 'rating' des autres champs.

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
    console.debug( `⚙️.Init initializeDOMElements...` );
    updateStatus({ conteneurID: 'intro', type: 'loading', isLdng: true, imgType: 'blanc', msg: `Initialisation des pages...` });
    
    try {
        //===================================================================================== // SPA
        conteneurSPA = document.querySelector('.conteneur-spa-global');                         // 🛟 Enregistre le conteneur
        if (!conteneurSPA) {
            console.error( `❌.Elsed |.initializeDOMElements : Erreur fatale. L'app est indisponible...` );
            return;
        }
        //===================================================================================== // MENU GÉNÉRAL
        const burgerElmntTmp        = document.querySelector('.menu-toggle');                   // <= bouton
        const burgerIconElmntTmp    = document.querySelectorAll('.menu-icon');            // Lignes x3
        const navElmntTmp           = document.querySelector('.nav-globale');                   // <= <ul> conteneur des <li>
        if (burgerElmntTmp)         menu.toggleElmnt  = burgerElmntTmp;                         // 🛟 Enregistre le bouton de nav burger
        if (burgerIconElmntTmp)     menu.iconElements = burgerIconElmntTmp;                     // 🛟 Enregistre le bouton de nav burger
        if (navElmntTmp)            menu.navElemens   = navElmntTmp;                            // 🛟 Enregistre la nav
        
        if (!pages.loader.element || !pages.menu.navElemens) console.error( `❌.Elsed |.initializeDOMElements : Erreur. Le menu n'est pas initialisé correctement...` );
        
        //===================================================================================== // PAGES
        Object.values(pages)?.forEach( p => {
            const pageElmntTmp = document.getElementById(p.ID);                           // Récupération de l'élément du DOM avec cet id        
            
            if (pageElmntTmp) {
                p.element = pageElmntTmp;                                                 // 🛟 Enregistre DOM element <= Agit comme parent des sous-elements 

                //----------------------------------------------------------------------------- // ACCUEIL
                if (p.ID === "accueil_page") {
                    selectLieuxElmnt= p.element.querySelector('.trmdvsr-superselect #selectLieux');                  // 🛟 Enregistre le champ input principal
                    tstmnlCrslElmnt = p.element.querySelector('.carousel-temoignage');           // 🛟 Enregistre le carousel témoignage <= page accueil
                    tstmnlCrtElmnt  = tstmnlCrslElmnt.querySelector('.carte-temoignage');        // 🛟 Enregistre une carte témoignage <= page accueil
                    tstmnlScrllAmnt = tstmnlCrtElmnt.offsetWidth + 24;                          // 🛟 Enregistre le scroll amount <= page accueil
                }
                
                //----------------------------------------------------------------------------- // CREATION LIEU
                if (p.ID === "creation-lieu_page") {
                    creaPgElmnts.adressElmnt = document.getElementById('adresseSalle');         // 🛟📘 Enregistre le champ adresse <= page création
                }

                //----------------------------------------------------------------------------- // EVALUATIONS
                if (p.ID === "evaluations_page") {
                    
                    //......................................................................... // GESTION DES SECTIONS => MENU ETC...
                    p.brdcrmbElmnts = document.querySelectorAll('.module-breadcrumb .breadcrumb-item');      //  <= cible <li> via .breadcrumb-item
                    if (p.brdcrmbElmnts.length === 0) console.error( `❌.Elsed |.initializeDOMElements : Erreur. La sous-nav n'a pas été chargée.` );

                    p.curSecIndx = 0;                                                        // 🛟 Définit l'index de la section active
                    p.sectionCount = p.sub.length;                                        // 🛟 Enregistre le nombre de sections
                    
                    //......................................................................... // SECTIONS
                    p.sub.forEach ( (section, index) => {
                        
                        //¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ // UTILE
                        const sectionElement = document.getElementById(section.ID);
                        if (sectionElement) {
                            section.element = sectionElement;                                   // 🛟 Enregistre DOM element <= Element Parent 
                            section.index = index;                                              // 🛟 Enregistre index
                        };

                        //¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ // NOTE ET COMMENTAIRE <= préparation
                        section.note = null;                                                    // 🛟 Enregistre note
                        section.comment = {
                            ID: null,                                                           // 🛟 Enregistre ID du commentaire
                            texte: null                                                         // 🛟 Enregistre le commentaire potentiellement modifié
                        };

                        const noteTemp = document.getElementById(`result-q${index + 1}`);       // compense l'index start 0
                        if (noteTemp) section.noteElmnt = noteTemp;                             // 🛟 Enregistre DOM element 
                        
                        checkSectionCompletion(section.ID);                                     // Désactive les boutons "Suivant" et initialise l'affichage du score
                        

                        const selecteurModuleNote = '[data-action].module-note';                // Ciblage
                        const moduleNoteTemp = sectionElement.querySelector(selecteurModuleNote);
                        
                        if (moduleNoteTemp) section.noteModuleElmnt = moduleNoteTemp;
                        else console.warn(`Aucun élément interne trouvé correspondant à ${selecteurModuleNote} dans l'élément moduleNoteTemp. ${moduleNoteTemp}`);
                        
                        const selecteurDisplayNote = `#result-q${index + 1}.module-note.trmdvsr-texte-h2`; // Ciblage
                        const displayNoteTemp = sectionElement.querySelector(selecteurDisplayNote);
                        
                        if (displayNoteTemp) section.noteDisplayElmnt = displayNoteTemp;
                        else console.warn(`Aucun élément interne trouvé correspondant à ${selecteurDisplayNote} dans l'élément moduleNoteTemp.. ${moduleNoteTemp}`);





                        //¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ // AVIS
                    } );        
                }
            } else {
                console.error( `❌.Elsed |initializeDOMElements : L'élément DOM avec l'ID ${p.ID} est introuvable.` );
            }
        } );
        isInit.allDOMLoaded = true;                                                             // 🛟 Enregistre FLAG => DOM prêt, activation drapeau
        tryToInitAutocomplete();                                                                // Tentative d'initialisation (si Maps est déjà chargé)
        console.warn( `.../⚙️✅.--End |initializeDOMElements : Réfs DOM initialisées et attachées à {pages}.` );
    
    } catch (error) {
        console.error( `🚫.Catched |initializeDOMElements : ${error}` );
    }
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
    updateStatus({ refCSS: 'intro', isLdng: true, msg: `🔌.Init initModeGuide | Initialisation du mode guidé... `, logoType: 'blanc' });
    
    try {
        guideModeBTN = document.querySelectorAll('.composant-aide input[type="radio"]'); // 🛟 Enregistre les boutons radios
        if (!guideModeBTN) {
            console.error( `❌.Elsed |.initModeGuide : Les boutons guidé/expert sont introuvables.` );
            return;
        }
        synchroniserModeGuide_(initValue);                            // Lance synchronisation
        updateStatus({ refCSS: 'intro', type: 'success', isLdng: true, imgType: 'blanc', msg: `.../🔌✅.--End |initModeGuide : Mode guidé mis en place`});
    
    } catch (error) {  
        console.error(`🚫.Catched |initModeGuide : [error] : ${error}` );
    }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {actionDispatcher} & {updateSPA_Height_}
 * @instanceCount   1 + 1
 * ---------------- --------------- --------------- - ---------------- ------------------------ //
 * @function        synchroniserModeGuide_
 * @description     SYNCHRONISE TOUTES LES INSTANCES DE MODE GUIDÉ/EXPERT
 *                  Parcourt toutes les instances et ajuste les btn-radios sur appData.guideORexpert
 * ---------------- --------------- --------------- - ---------------- ------------------------ //
 * @param           {string}        nwVal           - ['guided' || 'expert']
 * -------------------------------------------------------------------------------------------- */
function synchroniserModeGuide_(nwVal) {
    console.log( `🔌.Init synchroniserModeGuide_ ...[param]nwVal:${nwVal} ` );
    updateStatus({ refCSS: 'intro', isLdng: true, imgType:'blanc' });
    try {
        guideModeBTN.forEach ( rdio => { rdio.checked = (rdio.value === nwVal); });             // Update les btns => checked ou pas
        document.body.classList.toggle('guidedMode', nwVal === 'guided');                       // Ajoute/Retire la classe
        updateSPA_Height_();                                                                    // si déjà initialisé => UpdateSPA_Height_ 
        console.log( `.../⚙️✅.--End |synchroniserModeGuide` );
        
    } catch (error) { console.log( `🚫.Catched |synchroniserModeGuide_ [error] : ${error} `) };
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
function init_updateStatus() {
    console.debug(`Init init_updateStatus...`)
    loader.logoURLs                     = getLogoUrlsFromCSS_();
    console.log(loader.logoURLs);
    loader.element                      = document.getElementById('status_layer');
    console.log(loader.element);
    if (loader.element) {
        loader.statusMessage            = loader.element.querySelector('.status-message');
        loader.animImgElmnt             = loader.element.querySelector('.spinner-image');
        loader.animSpinnerElmnt         = loader.element.querySelector('.spinner');
        loader.progressContainerElmnt   = loader.element.querySelector('.progress-container'); 
        loader.progressBarElmnt         = loader.element.querySelector('.progress-bar');
        loader.progressTextElmnt        = loader.element.querySelector('.progress-text');
    }
    if (!loader.logoURLs.bleu || !loader.logoURLs.blanc) { console.warn(`Les variables CSS --url-logo-actif ou --url-logo-blanc n'ont pas pu être lues.`) };
    console.warn(`init_updateStatus OK`)
}

/**------------------------------------------------------------------ //
 * @version         25.10.09 (23:16)
 * @instanceIn      partout
 * ---------------- --------------- ------------------------- - ------ //
 * @description     GERE LE LOADING
 *                  Gère l'affichage du statut, du spinner et de la barre de progression 
 *                  pour l'export et attache/détache le loader unique à un conteneur. 
 *                  Accepte un objet de configuration pour plus de flexibilité.
 *                  NÉCESSITE UNE INITIALISATION AVEC init_updateStatus()
 * ---------------- --------------- ----------------- - --------------- //
 * @param           {string}        refCSS]           - ID du conteneur cible
 * @param           {string}        msg]              - Le texte à afficher.
 * @param           {string}        type='log']       - Type de message ('info', 'loading', 'success', 'error', 'warn', 'debug').
 * @param           {boolean}       isLdng=false]     - Pour activer/désactiver les spinners et le bouton.
 * @param           {number}        current=0]        - V2-SPÉCIFIQUE : Numérateur pour la progression.
 * @param           {number}        total=0]          - V2-SPÉCIFIQUE : Dénominateur pour la progression.
 * @param           {string}        imgType            - V3-UNIQUE Type de logo à afficher ('blue' ou 'white'). Si null, le logo actuel est conservé.
 * ------------------------------------------------------------------- */
function updateStatus({ refCSS=null, log=null, msg=null, isLdng=false, current=null, total=null, imgType=null}) {
    if (!loader.element) {                                             // Défensif si init_updateStatus() a merdé qq part
        console.error( `Initialisez la fonction avant de pouvoir l'appeler. \nPour cela, lancez la fonction ini_updateStatus()` );
        return;
    }
    const lgElmnt = refCSS ? pages.loader.element.querySelector(refCSS) : null;// CAS 1. => nouveau conteneur cible ✅
                                                                                                                
    if (lgElmnt) {                                                    
        console.log(`updateStatus > lgElmnt => ${lgElmnt}`);
        if (curLgElmnt && curLgElmnt !== lgElmnt) curLgElmnt.classList.remove('loading-target');  // new conteneur différent de current => Détache CSS
        lgElmnt.classList.add('loading-target');                       // Attache CSS    
        if (loader.element.parentNode !== lgElmnt) {                   // => DOM parent différent
            lgElmnt.appendChild(loader.element);                       // Attache DOM
            loader.element.classList.add('is-attached');               // Attache CSS
        }
        curLgElmnt = lgElmnt;                                          // 🛟 Enregistre new => current
    
    } else if (refCSS === null) {                                      // CAS 2. => nouveau conteneur cible ❌
    
        loader.element.classList.remove('is-attached');                // Détache CSS
        curLgElmnt = null;                                             // Mode FIXED global
    }

    if (!isLdng) {                                                     // LOADER => isLdng = FALSE
        loader.element.style.display = 'none';                         // Fin de Chargement : Masque et DÉTACHE le loader
        if (curLgElmnt) {                                              // Si conteneur
            curLgElmnt.classList.remove('loading-target');             // Détache CSS
            curLgElmnt = null;                                         // 🛟 Enregistre DOM Element
        }
        loader.element.classList.remove('is-attached');                // Détache CSS
        return;
    }
    
    
    loader.element.style.display = 'flex';                               // Avec/Sans conteneur => Affiche
    if (loader.animImgElmnt && imgType) {                             // loader.element ANIMÉ
        const url = LOGO_URLS[imgType];
        if(url)    loader.animImgElmnt.src = url;
        else        console.warn(`Type de logo inconnu ou URL non trouvée pour ${imgType}.`);
        
        loader.animImgElmnt.className = 'spinner-image';              // Reset CSS (évite remove et de lister tous les cas de fig.)
        loader.animImgElmnt.classList.add( `logo-${type}` );
    }
    
    if (loader.statusMessage) {                                       // MESSAGE TEXTE
        loader.statusMessage.textContent = msg; 
        loader.statusMessage.className = 'trmdvsr-sstexte status-message';       // Reset CSS (évite remove et de lister tous les cas de fig.)
        loader.statusMessage.classList.add(type);
    }
    
    if (loader.animSpinnerElmnt) loader.animSpinnerElmnt.style.display = isLdng ? 'flex' : 'none'; // SPINNER ANIMÉ
    
    if (current && total) {                                           // BARRE DE PROGRESSION
        if (loader.progressContainerElmnt && loader.progressBarElmnt && loader.progressTextElmnt) {
            loader.progressContainerElmnt.style.display = (isLdng && total > 0) ? 'block' : 'none';
        
            if (total > 0 && current <= total) {
                const percent = Math.round((current / total) * 100);
                loader.progressBarElmnt.style.width = `${percent}%`;
                loader.progressTextElmnt.textContent = `${percent}% (${current}/${total} images enregistrées)`;
            
            } else {
                loader.progressBarElmnt.style.width = '0%';
                loader.progressTextElmnt.textContent = '0% (0/0 images enregistrées)';
            }
        }
    }
};
/* == FONCTIONS HELPERS - PRIVATE ============================================= (UTILITAIRE) == */
/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {debouncedHandleResize} & {synchroniserModeGuide_} & {showPage} & {showSection} 
 * @instanceCount   4 (1 + 1+ 2 / )
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
        console.info( `Init updateSPA_Height_ pour ${trgtPg.id} [param]trgtPgID: ${trgtPgID}${trgtSecIndx != null ? ` / trgtSecIndx:${trgtSecIndx}` : ''}` ); 
        
        if (!conteneurSPA || !trgtPg) return;                                                   // != Sécurité initiale (conteneur et page cible doivent exister)
        let trgtHght = trgtPg.element.offsetHeight;                                             // ?= Logique minimale => Page simple sans gestion relative/absolute
        if (trgtPg.hasSub) {                                                                    // <= Ajoute hauteur section active
            trgtSecIndx ??= trgtPg.curSecIndx;                                                  // ?= Gère récup par défaut de l'index en cours
            trgtHght += trgtPg.sub[trgtSecIndx].element?.offsetHeight ?? 0;                     // <= Ajoute hauteur section active à hauteur page simple
        }
        
        if (trgtHght <= 0) {                                                                    // => Réinitialise le style si hauteur invalide ou nulle 
            conteneurSPA.style.removeProperty('--hauteur-content');
            console.log( `./⚙️.Run-ng |updateSPA_Height_ : Variable --hauteur-content supprimée (passage à hauteur auto).` );
            return;
        }
        conteneurSPA.style.setProperty('--hauteur-content', `${trgtHght}px`);                   // => Définit le CSS si hauteur valide
        console.log( `./⚙️.Run-ng |updateSPA_Height_ : Variable CSS --hauteur-content ajustée à: ${trgtHght}px` );
    
    } catch (error) { console.error( `🚫.Catched |updateSPA_Height_ : ${error} \n ${callStack}` ) };
}

/** ------------------------------------------------------------------------------------------- //
 * @version         25.11.03 (15:59)
 * @instanceIn      {init_updateStatus}
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        getLogoUrlsFromCSS_
 * @description     FONCTION UTILITAIRE POUR RÉCUPÉRER LES VALEURS CSS
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @returns         {function}      bleu/blanc      > Les URLs pour le logo bleu et le logo blanc.
 * -------------------------------------------------------------------------------------------- */
function getLogoUrlsFromCSS_() {
    const rootStyles    = getComputedStyle(document.documentElement);                           // document.documentElement => Cible l'élément racine
    const actifUrlCSS   = rootStyles.getPropertyValue('--url-logo-actif').trim();
    const blancUrlCSS   = rootStyles.getPropertyValue('--url-logo-blanc').trim();
    console.log(`getLogoUrlsFromCSS_ => actifUrlCSS:${actifUrlCSS} && blancUrlCSS:${blancUrlCSS}`)
    const extractUrl = (cssValue) => {                                                          // Fonction locale interne
    if ( !cssValue || !cssValue.startsWith('url(') ) return '';
        return cssValue.slice(4, -1).replace(/["']/g, '');                                      // Retire 'url(', ')', et les guillemets/apostrophes éventuels.
    };
    
    return { bleu: extractUrl(actifUrlCSS), blanc: extractUrl(blancUrlCSS) };
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
                clearTimeout(timeoutId);                                                        // Fn glob: Annule le timer précédent
                timeoutId = setTimeout( () => { func.apply(context, args); }, delay );          // Exécute SEULEMENT après fin du délai
    };
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
 * @instanceIn      {window.onLoad}                   ../
 * @instanceCount   1 - unique     
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        loadPage
 * @description     L'INITIALISEUR DE LA PAGE
 *                  Lance l'appel unique à google.script.run et spécifie les clés de données (calledKeys).
 *                  Placement après son appel pour un souci de lisibilité, le hoisting se charge de remonter la fonction.
 * -------------------------------------------------------------------------------------------- */
function loadPage() {
    console.log (` \n\n🚀=====🚀 ${DATE} 🚀=====🚀\n\n🏁=====🏁 C'est parti.🏁=====🏁` );
    try {
        if (!isInit.updateStatus) {
            init_updateStatus();                                                                // Initialise le composant de loading
            isInit.updateStatus = true;                                                         // 🏁 Active le flag
        }

        const result = { submissionID: 'test' }
        const calledKeys = ['submissionID', 'dropdown_lieux', 'dropdown_types'];                // Clés d'appel pour fetch côté serveur 
        console.log (`loadPage =>  ${result.submissionID} && ${calledKeys}`)
        updateStatus({ refCSS: 'intro', type: 'loading', isLdng: true, imgType: 'blanc', msg: `Réveil de l'IA...` });
        /*
        google.script.run                                                                       // ☎️ APPEL SERVEUR
            .withSuccessHandler( (result) => {                                                  //SI SUCCESS CALLBACK
                console.dir(`.../📡✅.Ended |loadPage : ${result} `); */
                updateStatus({ refCSS: 'intro', type: 'loading', isLdng: true, imgType: 'bleu', msg: `IA réveillée, arrivée dans votre navigateur...` });
                handlePageData(result);  /*                                                       // => FN client si succès : traite toutes les données reçues
            })
            .withFailureHandler((error) => {                                                    // SI FAILURE CALLBACK
                console.error( `📡❌.Failed |loadPage : Échec critique : ${error}` );
                updateStatus({ refCSS: 'intro', type: 'fail', msg: `Erreur lors du chargement des données. Veuillez réessayer.` });
            })
            .getInitialPageData(calledKeys);                                                    // FN serveur
        */
        console.log( `./📡⚙️.Run-ng |loadPage : Server Request => getInitialPageData for [${calledKeys}]` );
        updateStatus({ refCSS: 'intro', type: 'loading', isLdng: true, imgType: 'blanc', message: `Allo l'IA?` });
        
    } catch (error) {
        isInit.updateStatus = false;
        console.error( `📡🚫.Catched |loadPage : Big error: ${error}` );
    }
}
/* ** APP LAUNCHER ******************************************************************** (🚀) ** */
window.addEventListener('load', loadPage);

/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */