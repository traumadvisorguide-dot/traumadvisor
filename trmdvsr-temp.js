/* == FONCTIONS NAVIGATION SPA - PRIVATE FN =================================================== */
/** ------------------------------------------------------------------------------------------- //
 * @version         25.10.09 (23:16)
 * @instanceIn      {actionDispatcher} & {initDatas}   ../
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
        const nwPg = Object.values(pages).find( p => p.ID === nwPgID );                         // Charge l'objet page à afficher <= nwPgID existe (if initial)
        if (!nwPg || !nwPg.$elmnt) {                                                             // CAS DÉFENSIF: Erreur si pas Element
            isInit.trnstng = false;                                                             // 🚩
            console.error( `📄❌.if-ed |showPage : nwPg '${nwPgID}' introuvable.` );
            return;
        }
        console.log( `./📄⚙️.Run-ng |showPage: nwPg.ID: ${nwPg.ID} & nwPg.hasSub: ${nwPg.hasSub}` );
        const targetSecIndx = nwSecIndx ?? nwPg.curSecIndx ?? 0;                                // =nwSecIndx sinon =curSecIndx sinon =0 
        nwPg.curSecIndx = targetSecIndx;                                                        // 🛟 Attribue le curSecIndx
        
        const activateSectionIfNeeded = () => {
            let secIndx2Dspl = nwPg.curSecIndx;                                                 // Utilise l'index que nous venons d'initialiser/mettre à jour
            if (nwPg.hasSub && nwPg.sub[secIndx2Dspl]) {                                        // S'il y a des sous-sections et que l'index est valide
                const nwSecID = nwPg.sub[secIndx2Dspl].id;
                console.log ( `./📄⚙️.Run-ng |showPage => activateSectionIfNeeded : nwSecIndx: ${secIndx2Dspl} / nwSecID: ${nwSecID}` );
                showSection(nwSecID, nwPgID);                                                   // Affiche la section (isAfterTransition => désactive le flag en interne ou non)
            }
            updateSPA_Height_(nwPg.ID, nwSecIndx);                                              // Met à jour la hauteur du SPA après le changement de page/section
            console.log(`./📄⚙️.Run-ng |showPage : activateSectionIfNeeded OK`);
        };
        
        const completeTransition = (event) => {                                                 // <= appelé à la fin de l'apparition de la Nouvelle Page
            if (event.target !== nwPg.$elmnt) return;                                          // --- FILTRES ESSENTIELS CONTRE LE BUBBLING ---
            if (event.propertyName !== 'transform' && event.propertyName !== 'opacity') return; // Assure => 'transform' (ou 'opacity') qui se termine, et pas transition d'un enfant (bouton, etc.).
            nwPg.$elmnt.removeEventListener('transitionend', completeTransition);
            curPgID = nwPgID;                                                                   // 🛟 Enregistre la nouvelle page active
            activateSectionIfNeeded();                                                          // Active la section si besoin
            isInit.trnstng = false;                                                                  // 🚩 Désactive le flag (centralisé)
            console.log( `.../📄✅.--End |showPage => Transition complete: ${curPgID} <= ${event.target.tagName} (${event.propertyName}) && ${nwPg.$elmnt.id}` );
        };
        
        const curPg = Object.values(pages).find(p => p.ID === curPgID);
        if (!curPg) {                                                                           // A. => Cas Initialisation
            nwPg.$elmnt.addEventListener('transitionend', completeTransition);                 // Pas { once: true } car possible multi-bubbling
            updateSPA_Height_(nwPg.ID);                                                         // Lance MaJ hauteur en meme temps
            
            requestAnimationFrame(() => {                                                       // 2. Lancement des transitions après repaint
                nwPg.$elmnt.classList.add('active');                                           // => classe contient nouvelle position > lance anim
                console.log( `./📄⚙️.Run-ng |showPage : Pas de page en cours => Init page: nwPg.ID=${nwPg.ID} / requestAnimationFrame OK` );
            });
            return;
        }
        if (!curPg.$elmnt) {                                                                   // Gère les ERREURS sur la page COURANTE (flux d'arrêt)
            isInit.trnstng = false;                                                             // 🚩
            console.error( `📄❌.if-ed |showPage : Current Page '${curPgID}' introuvable.` );
            return;
        }
        
        const handleTransOutEnd = (event) => {                                                  // <= appelé à la fin de la sortie de la page actuelle
            if (event.target !== curPg.$elmnt) return;                                         // --- FILTRE ESSENTIEL CONTRE LE BUBBLING ---
            if (event.propertyName !== 'transform' && event.propertyName !== 'opacity') return;
            curPg.$elmnt.removeEventListener('transitionend', handleTransOutEnd);
            curPg.$elmnt.className = 'page';                                                   // remove tout en réécrivant 'page'
            curPg.$elmnt.style.transform = '';
            curPg.$elmnt.scrollTop = 0;
            curPg.$elmnt.display = 'none';
            curPg.$elmnt.style.opacity = '0';                                                  // Réinitialisation de l'opacité pour le retour
            console.log ( `.../📄✅.--End ||showPage => handleTransOutEnd => ${event.target.tagName} : ${event.propertyName} COMPLETE` );
        };
        
        if (nwPgID === curPgID) {                                                               // B. => Cas Même page
            activateSectionIfNeeded();                                                          // Fait le travail sans attendre de transition
            isInit.trnstng = false;                                                                  // 🚩 Désactive le flag immédiatement
            console.warn( `.../📄✅.--End |showPage : Même page: [${curPgID}] / section=${nwSecIndx}. ` );
            return;
        }
        
        const isFrwrd = (nwPg.index > curPg.index);                                             // C. => Cas Transition Normale
        const [startPos, endPos] = isFrwrd ? ['100%', '-20%'] : ['-100%', '20%'];               // Définition des positions : [Pos départ newPage, Pos fin oldPage]
        
        curPg.$elmnt.addEventListener('transitionend', handleTransOutEnd, { once: true });
        nwPg.$elmnt.addEventListener('transitionend', completeTransition, { once: true });
        nwPg.$elmnt.style.transition = 'none';                                                 // Désactive temporairement pour éviter flickering
        nwPg.$elmnt.style.transform = `translateX(${startPos})`;                               // Position de DÉPART (hors écran)
        nwPg.$elmnt.style.display = 'block';                                                   // Rend la nouvelle page visible
        nwPg.$elmnt.classList.add('active');                                                   // Applique la classe .active (z-index, opacité, etc.)
        
        requestAnimationFrame( () => {                                                          // 2. Lancement des transitions après repaint
            nwPg.$elmnt.style.transition = 'transform 0.5s ease-out';
            nwPg.$elmnt.style.transform = 'translateX(0)';
            curPg.$elmnt.style.transition = `transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out`;
            curPg.$elmnt.classList.add('transition-out');                                      // 2. Préparation et Lancement de l'OUT (Page Courante)
            curPg.$elmnt.style.transform = `translateX(${endPos})`;
            curPg.$elmnt.style.opacity = '0';                                                  // Opacité à zéro pour la faire disparaître
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
 * @version         25.11.17 (17:52)                - 25.10.09 (23:16)
 * @instanceIn      {showSection}
 * @instanceCount   1 - unique
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

        refElmnt.$brdcrmbs.forEach( (item, index) => {
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
 * @instanceIn       {initLIS_navigation}  listeners sur <body>'click'
 * @instanceCount    1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        actionDispatcher
 * @description     GESTIONNAIRE D'ACTIONS SEMI-CENTRALISÉ (FOCUS CLIC)
 *                  Fonction principale de délégation d'événements pour les INPUTS
 *                  Trouve l'action demandée (via data-action) et appelle la fonction correspondante. Exemple : <button type="button" data-action="une action" data-maintarget="une page" data-sectiontarget="une section (sous page)">
 *                  Suppression du logging pour alléger les logs à cause des rollover rollout
 *                  NE PAS ENREGISTRER LES DOM ELEMENTS INPUTS CAR LE BUBBLING EST SUFFISANT
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {Event}         event           - L'objet événement.
 * -------------------------------------------------------------------------------------------- */
function actionDispatcher(event) {
    const eventType = event.type;
    console.log(`actionDispatcher| event:${event} / event.target:${event.target} / eventType:${eventType}`);

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
                menu.$lineIcons.forEach( burgerIconElement => { burgerIconElement.classList.toggle('active'); } );
                menu.$navItems.classList.toggle('active');                                     // Bascule la classe 'active' pour afficher/masquer le menu
                const isExpanded = menu.$navItems.classList.contains('active');          // Gère l'accessibilité (ARIA)
                loader.$layer.setAttribute('aria-expanded', isExpanded);
            break;
            // -------------------------------------------------------------------------------- //
            case 'navLinks':
                menu.$navItems.classList.remove('active');
                loader.$layer.setAttribute('aria-expanded', 'false');
                console.log( `⚙️.Tested |actionDispatcher : navLinks => ${param} ` );
            break;
            // -------------------------------------------------------------------------------- //
            case 'temoignageScroll':
                if (param === 'next') {
                    pages.accueil.$tstmnlCrsl.scrollBy({ left: pages.accueil.tstmnlScrllAmnt, behavior: 'smooth' });
                } else {
                    pages.accueil.$tstmnlCrsl.scrollBy({ left: -pages.accueil.tstmnlScrllAmnt, behavior: 'smooth' });
                }
            break;
            // -------------------------------------------------------------------------------- //
            case 'validateHomepageSelection':                                                   // genre superSelect pour séparer sélection et validation
                const valueLieu = $slctLx ? $slctLx.value : null;                       // La valeur est l'ID du lieu
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
            case 'changeHumourLevel':
                const questionKeyTemp = 'q1';
                const dataKeyTemp = 'noteAccessibilite';
                regenerateComment(questionKeyTemp, param, dataKeyTemp);
            break;
            // -------------------------------------------------------------------------------- //
            case 'moduleAvis-openEdit': handleOpenEdit(); break;
            // -------------------------------------------------------------------------------- //
            case 'moduleAvis-sendEdit': handleSendEdit(); break;
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
            case 'savethennavigate':
                console.log(`bouton validation de la section photo`);
                saveThenNavigate();
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

/**-------------------------------------------------------------------------------------------- //
 * @version        25.12.01 (16:34)
 * @instanceIn      {initDOM_pages} {actionDispatcher (via handleRatingChange)} {navigateSection}
 * @instanceCount   
 * --------------- ----------------- ----------------- - -------------------------------------- //
 * @function       checkSectionCompletion
 * @description    VÉRIFIE SI UNE SECTION D'ÉVALUATION EST COMPLÉTÉE
 *                 Et gère l'état du bouton Suivant.
 *                 Cette fonction est réutilisée pour la validation avant la navigation
 * --------------- ----------------- ----------------- - -------------------------------------- //
 * @param          {string}          sectionId         - L'ID de la section (e.g., 'section_q1').
 * @returns        {boolean}                           > Vrai si la section est complétée.
 * -------------------------------------------------------------------------------------------- */
function checkSectionCompletion(sectionID) {
    const questionPrefix = sectionID.replace('section_', '');                                   // 'q1'
    const radioGroupName = `eval-${questionPrefix}`;                                            // Détermine le nom du groupe radio à partir de l'ID de section (ex: section_q1 -> eval-q1)
    console.log(`checkSectionCompletion: ${checkSectionCompletion} / radioGroupName: ${radioGroupName}`);

    const FORM = document.getElementById('evaluationForm');                                     // !!!!!!! => VOIR SI ON UTILISE FORM Ou document

    const $section = Object.values(pages.eval.sub).find( s => s.ID === sectionID );
    const isCompleted = $section.querySelector(`input[name="${radioGroupName}"]:checked`) !== null; // Vérifie si un radio button de ce groupe est coché
    const nextButtonId = `btn-next-${questionPrefix}`;                                          // Détermine l'ID du bouton "Suivant" (ex: section_q1 -> btn-next-q1)
    const nextButton = document.getElementById(nextButtonId);

    if (nextButton) {
        nextButton.disabled = !isCompleted;
        nextButton.textContent = isCompleted ? 'Suivant' : 'Sélectionnez une note...';          // .textContent <= <span/div> || .value <= <input>
    }
return isCompleted;
}

/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */