/* == FONCTIONS ENREGISTREMENT DATABASE 📘 ========================== */
/**-------------------------------------------------------------------//
* @instanceIn      {actionDispatcher}
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - -----------------//
* @function        updateData
* @description     TRAITE LES DONNÉES SAISIES (simule une mise à jour de données).
*                  C'est ici que vous traiteriez les événements 'change' ou 'input' pour les formulaires.
* ---------------- --------------- --------------- - -----------------//
* @param           {string}        key             - La clé de donnée à mettre à jour
* @param           {string}        value           - La nouvelle valeur.
* @param           {HTMLElement}   element         - L'élément déclencheur 
* ------------------------------------------------------------------- */

function updateData(key, value, element) {
    console.log(`Donnée mise à jour: ${key} = ${value} `);            // Logique métier : MàJ état global ou appeler une API (ex: Firestore)

    const feedback = document.getElementById('feedback-message');     // Exemple de feedback pour le 'change'
    if (feedback) {
        feedback.textContent = `Nom saisi: ${value || 'Non défini' } `;
    }
}

/**-------------------------------------------------------------------//
* @instanceIn      {actionDispatcher}
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - -----------------//
* @function        saveAllSettings
* @description     ENREGISTRE (simule une mise à jour de données).
* ------------------------------------------------------------------- */
function saveAllSettings() {
    // Logique de validation et sauvegarde ici...
}

/* == FONCTIONS NAVIGATION SPA - PRIVATE FN =================================================== */
/**------------------------------------------------------------------ //
* @version         25.10.09 (23:16)
* @instanceIn      {actionDispatcher} & {handlePageData}   ../
* @instanceCount   4 (3 + 1)
* ---------------- --------------- --------------------- - ---------- //
* @function        showPage
* @description     GESTION DE L'AFFICHAGE PAR PAGE
*                  Anime la transition de l'ancienne page vers la nouvelle
*                  Gère la transition latérale entre les pages principales.
*                  Affiche une page spécifique en utilisant la déstructuration. 
* ---------------- --------------- --------------------- - ---------- //
* @param           {string}        nwPgID                - L'ID de la page à afficher.
* @param           {string|null}   nwSecIndx             - L'ID de la section à afficher dans la nouvelle page (si applicable).
* ---------------- --------------- --------------------- - ---------- //
* @src             {object}        rubriques         
*                    {string}      id,                   - String identifiant html
*                    {string}      nom,                  - String nom d'affichage
*                    {boolean}     hasSub,                - Boolean true/false sur la présence d'un objet de sub-rubriques
*                    {object}      sub                   - Facultatif, objet contenant les sous rubriques
*                      {string}    id,                   - String identifiant html
*                      {string}    nom,                  - String nom d'affichage
*                      {boolean}   needsAsyncValidation  - Boolean true/false sur le besoin de validation asynchrone
* ------------------------------------------------------------------- */
function showPage(nwPgID = '', nwSecIndx = null) {
    if (!nwPgID) return;                                              // CAS DÉFENSIF: pas de pgID => kill
    if (isTrnstng) return;                                            // CAS ANTI-REBOND : transition en cours => kill
    isTrnstng = true;                                                 // 🚩 Active le flag ANTI-REBOND
    console.log( `📄.Init showPage... [param]nwPgID: ${nwPgID} ${nwSecIndx != null ? ` / nwSecIndx:${nwSecIndx}` : '' }` );
    
    try {
        const nwPg = Object.values(pages).find(p => p.id === nwPgID); // Charge l'objet page à afficher <= nwPgID existe (if initial)
        if (!nwPg || !nwPg.element) {                                 // CAS DÉFENSIF: Erreur si pas Element
            isTrnstng = false;                                        // 🚩
            console.error( `📄❌.if-ed |showPage : nwPg '${nwPgID}' introuvable.` );
            return;
        }
        console.log( `./📄⚙️.Run-ng |showPage: nwPg.id: ${nwPg.id} & nwPg.hasSub: ${nwPg.hasSub}` );
        const targetSecIndx = nwSecIndx ?? nwPg.curSecIndx ?? 0;      // =nwSecIndx sinon =curSecIndx sinon =0 
        nwPg.curSecIndx = targetSecIndx;                              // 🛟 Attribue le curSecIndx
        
        const activateSectionIfNeeded = () => {
            let secIndx2Dspl = nwPg.curSecIndx;                       // Utilise l'index que nous venons d'initialiser/mettre à jour
            if (nwPg.hasSub && nwPg.sub[secIndx2Dspl]) {              // S'il y a des sous-sections et que l'index est valide
                const nwSecID = nwPg.sub[secIndx2Dspl].id;
                console.log( `./📄⚙️.Run-ng |showPage => nwSecIndx: ${secIndx2Dspl} / nwSecID: ${nwSecID}` );
                showSection(nwSecID, nwPgID);                         // Affiche la section (isAfterTransition => désactive le flag en interne ou non)
            }
            updateSPA_Height_(nwPg.id, nwSecIndx);                    // Met à jour la hauteur du SPA après le changement de page/section
        };
        
        const completeTransition = (event) => {                       // <= appelé à la fin de l'apparition de la Nouvelle Page
            console.log(`./📄⚙️.Run-ng |showPage : completeTransition`);
            if (event.target !== nwPg.element) return;
            nwPg.element.removeEventListener('transitionend', completeTransition);
            curPgID = nwPgID;                                         // 🛟 Enregistre la nouvelle page active
            activateSectionIfNeeded();                                // Active la section si besoin
            isTrnstng = false;                                        // 🚩 Désactive le flag (centralisé)
            console.log( `.../📄✅.--End |showPage => Transition complete: ${curPgID}` );
        };
        
        const curPg = Object.values(pages).find(p => p.id === curPgID);
        if (!curPg) {                                                // A. => Cas Initialisation
            console.log( `./📄⚙️.Run-ng |showPage : Pas de page en cours => Init page: nwPg.id=${nwPg.id}` );
            nwPg.element.addEventListener('transitionend', completeTransition, { once: true });
            nwPg.element.style.transition = 'none';                  // Désactive temporairement pour éviter flickering
            nwPg.element.style.transform = `translateX(100%)`;       // Position de DÉPART (hors écran)
            nwPg.element.style.display = 'block';                    // Rend la nouvelle page visible
            nwPg.element.classList.add('active');                    // => classe contient nouvelle position > lance anim
            updateSPA_Height_(nwPg.id);                              // Lance MaJ hauteur en meme temps
            
            requestAnimationFrame(() => {                                 // 2. Lancement des transitions après repaint
                requestAnimationFrame(() => {
                    console.log(`./📄⚙️.Run-ng |showPage : requestAnimationFrame 1 - Lancement transitions`);
                    nwPg.element.style.transition = 'transform 0.5s ease-out';
                    nwPg.element.style.transform = 'translateX(0)';
                    console.log(`./📄⚙️.Run-ng |showPage : requestAnimationFrame 2 - Styles appliqués`);
                });
            });
            return;
        }
        updateStatus({ log:`./📄⚙️.Run-ng |showPage: curPg.id:${curPg.id} ` });
        if (!curPg.element) {                                         // Gère les ERREURS sur la page COURANTE (flux d'arrêt)
            isTrnstng = false;                                        // 🚩
            console.error( `📄❌.if-ed |showPage : Current Page '${curPgID}' introuvable.` );
            return;
        }
        
        const handleTransOutEnd = (event) => {                        // <= appelé à la fin de la sortie de la page actuelle
            console.log(`./📄⚙️.Run-ng |showPage : handleTransOutEnd => ${event.target} : ${event.tagName} : ${event.propertyName}`)
            if (event.target !== curPg.element) return;
            curPg.element.removeEventListener('transitionend', handleTransOutEnd);
            curPg.element.className = 'page';                         // remove tout en réécrivant 'page'
            curPg.element.style.transform = '';
            curPg.element.scrollTop = 0;
            curPg.element.display = 'none';
            curPg.element.style.opacity = '1';                        // Réinitialisation de l'opacité pour le retour
            console.log (`.../📄✅.--End ||showPage => handleTransOutEnd (OUT complete)`);
            //updateStatus({ log: `.../📄✅.--End ||showPage => handleTransOutEnd (OUT complete)` });
        };
        
        if (nwPgID === curPgID) {                                     // B. => Cas Même page
            activateSectionIfNeeded();                                // Fait le travail sans attendre de transition
            isTrnstng = false;                                        // 🚩 Désactive le flag immédiatement
            console.log( `.../📄✅.--End |showPage : Même page: [${curPgID}] / section=${nwSecIndx}. ` );
            return;
        }
        
        const isFrwrd = (nwPg.index > curPg.index);                   // C. => Cas Transition Normale
        console.log( `./📄⚙️.Run-ng |showPage : ${nwPg.index} > ${curPg.index} => ${isFrwrd} ` );
        const [startPos, endPos] = isFrwrd ? ['100%', '-20%'] : ['-100%', '20%'];   // Définition des positions : [Pos départ newPage, Pos fin oldPage]
        
        curPg.element.addEventListener('transitionend', handleTransOutEnd, { once: true });
        nwPg.element.addEventListener('transitionend', completeTransition, { once: true });
        
        nwPg.element.style.transition = 'none';                       // Désactive temporairement pour éviter flickering
        nwPg.element.style.transform = `translateX(${startPos})`;     // Position de DÉPART (hors écran)
        nwPg.element.style.display = 'block';                         // Rend la nouvelle page visible
        nwPg.element.classList.add('active');                         // Applique la classe .active (z-index, opacité, etc.)
        
        requestAnimationFrame(() => {                                 // 2. Lancement des transitions après repaint
            requestAnimationFrame(() => {
                console.log(`./📄⚙️.Run-ng |showPage : requestAnimationFrame 1 - Lancement transitions`);
                nwPg.element.style.transition = 'transform 0.5s ease-out';
                nwPg.element.style.transform = 'translateX(0)';
                
                curPg.element.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out';
                curPg.element.classList.add('transition-out');        // 2. Préparation et Lancement de l'OUT (Page Courante)
                curPg.element.style.transform = `translateX(${endPos})`;
                curPg.element.style.opacity = '0';                    // Opacité à zéro pour la faire disparaître
                console.log(`./📄⚙️.Run-ng |showPage : requestAnimationFrame 2 - Styles appliqués`);
            });
        });
        
        console.log( `.../📄✅.--End |showPage : Transition de ${curPgID} vers ${nwPgID} effectuée.` );
    
    } catch (error) {
        isTrnstng = false;                                            // Sécurité en cas d'erreur
        console.error( `📄🚫.Catched |showPage : ${error} ` );
    }
}

/**------------------------------------------------------------------ //
* @instanceIn      {showPage} & {actionDispatcher}
* @instanceCount   2 (1 + 1)
* ---------------- --------------- --------------- - ---------------- //
* @function        showSection
* @description     GÈRE L'AFFICHAGE DES SECTIONS INTERNES AVEC TRANSITION LATÉRALE
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}        nwSecID         - L'ID de la section à afficher.
* @param           {string}        pgID            - L'ID de la page parente.
* @param           {boolean}       isFrwrd         - Si Vrai, glissement de Droit à Gauche (Suivant). Si Faux, glissement de Gauche à Droite (Précédent).
* ------------------------------------------------------------------- */

function showSection(nwSecID, pgID) {
    updateStatus({ log: `📄.Init showSection... [param]nwSecID: ${nwSecID} / pgID: ${pgID} ` });
    
    try {
        const parentPage = Object.values(pages).find(p => p.id === pgID);           // Récupère element DOM dans l'objet pages
        if (!parentPage?.hasSub) return;                              // Sécurité et chaînage optionnel
        
        const curSecData = parentPage.sub[parentPage.curSecIndx];     // Cherche la section active dans ce main
        const newSecData = parentPage.sub.find(s => s.id === nwSecID);
        
        const newSecIndx = parentPage.sub.findIndex(s => s.id === nwSecID);         // Récup index cible
        const curSecIndx = parentPage.curSecIndx;                     // Récup index actuel
        const dirFrwrd = newSecIndx > curSecIndx;                     // Détermination de la direction (pour corriger si le breadcrumb est cliqué)
        const [startPos, endPos] = dirFrwrd ? ['100%', '-100%'] : ['-100%', '100%'];// Définition des positions <= Déstructure pour concision
        if (!newSecData?.element || newSecData.id === curSecData.id) {// 1. CAS DÉFENSIF : Section introuvable ou déjà active
            updateStatus({ log: `.../📄--End |showSection : Section déjà active ou introuvable. ` });
            return;
        }
        const curElmnt = curSecData.element;
        const newElmnt = newSecData.element;
        
        newElmnt.style.cssText = `
            transition: none; 
            transform: translateX(${startPos});
            display: block;
        `;
        newElmnt.classList.add('active');                             // Rend la nouvelle section active et visible
        updateSPA_Height_(parentPage.id, newSecIndx);                 // Calcul de la nouvelle hauteur avant la transition
        
        const handleTransitionEnd = (event) => {                      // --- 4. Nettoyage après la transition de sortie ---
        if (event.target !== curElmnt) return;                        // S'assure que l'événement vient de l'élément qui sort (curElmnt)
        curElmnt.removeEventListener('transitionend', handleTransitionEnd);
        curElmnt.style.cssText = `
            display: none;
            transform: none;
            transition: none;
        `;
        curElmnt.classList.remove('active');                          // Nettoyage du flag actif
        parentPage.curSecIndx = newSecIndx;                           // Mise à jour après le nettoyage
        updateStatus({ log: `./📄⚙️.Run-ng |showSection => Transition END. New section: ${nwSecID}` });
        
        updateBreadcrumbs(parentPage, nwSecID);                       // MISE À JOUR DU BREADCRUMB EN DERNIER
        };
        curElmnt.addEventListener('transitionend', handleTransitionEnd, { once: true });
        
        requestAnimationFrame( () => {                                // 3. Lancement des Transitions (rAF garantit l'application des styles)
            requestAnimationFrame( () => {
                newElmnt.style.cssText = `
                    transition: transform 0.3s ease-out;
                    transform: translateX(0);
                    display: block;
                `;
                curElmnt.style.cssText = `
                    transition: transform 0.3s ease-out;
                    transform: translateX(${endPos});
                    display: block;
                `;
            });
        });
    } catch (error) {
        updateStatus({ log: `🚫.Catched |showSection : [error] : ${error}`, type: 'error' });
    } 
}

/**------------------------------------------------------------------ //
* @instanceIn      {actionDispatcher}
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        scrollToSection
* @description     GÈRE LE SCROLL VERS UNE SECTION CIBLE
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}        nwSecID         - L'ID de la section vers laquelle on scrolle.
* ------------------------------------------------------------------- */

function scrollToSection(nwSecID) {                                   // Logique spécifique pour la navigation par ancre
    if (!nwSecID || nwSecID === '#') {
        updateStatus({log:"Erreur: L'attribut data-anchor est manquant ou invalide.", type:'error'});
        return;
    }
    
    const trgtElmnt = document.getElementById(nwSecID);               // 1. Trouver l'élément cible
    if (!trgtElmnt) {
        updateStatus({log:`Erreur: Aucune section trouvée avec l'ID: ${trgtElmnt}`, type:'error'});
        return;
    }
    
    trgtElmnt.scrollIntoView({                                        // 2. Défilement vers l'élément cible
        behavior: 'smooth',                                           // Active le défilement doux
        block: 'start'                                                // Aligne le haut de l'élément au haut de la fenêtre
    });
}

/* == FONCTIONS NAVIGATION SPA - DISPATCHER ========================= */
/**------------------------------------------------------------------ //
* @instanceIn      {initNavigationListeners}  listeners sur <body>'click'
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        actionDispatcher
* @description     GESTIONNAIRE D'ACTIONS SEMI-CENTRALISÉ (FOCUS CLIC)
*                  Fonction principale de délégation d'événements. 
*                  Trouve l'action demandée (via data-action) 
*                  et appelle la fonction correspondante.
*                  <button type="button" data-action="une action" data-maintarget="une page" data-sectiontarget="une section (sous page)">
* ---------------- --------------- --------------- - ---------------- //
* @param           {Event}         event           - L'objet événement.
* ------------------------------------------------------------------- */
function actionDispatcher(event) {
    updateStatus({ log: `⚙️.Init actionDispatcher CLICK...[param]event: ${event}` });  // Gère uniquement les actions basées sur data-action <= via clics
    
    try {
        if (!event || !event.target) {                                // Garde fou contre appels sans argument
            updateStatus({log: `❌.If-ed |actionDispatcher : Pas d'objet event ou event.target. Check les appels manuels.`, type: 'error' });
            return;
        }
        
        const trgtElmnt = event.target.closest('[data-action]');      // Trouve l'élément qui a l'attribut data-action, en remontant l'arbre DOM
        if (!trgtElmnt) return;                                       // Si aucun élément avec data-action n'est trouvé
        
        const action = trgtElmnt.dataset.action ?? '';                // Coalescence des nuls pour assurer bon traitement info
        const pgTrgtID = trgtElmnt.dataset.maintarget ?? null;        // Ex: page ID, section ID
        const scTrgtID = trgtElmnt.dataset.sectiontarget ?? null;     // Uniquement pour 'evaluations'
        const param = trgtElmnt.dataset.param ?? null;                // Ex: true/false pour isFrwrd, ou une autre valeur
        
        switch (action) {
            case 'navBurger':
                menuElements.burgerIconElements.forEach(burgerIconElement => { burgerIconElement.classList.toggle('active'); });
                menuElements.navElement.classList.toggle('active');   // Bascule la classe 'active' pour afficher/masquer le menu
                const isExpanded = menuElements.navElement.classList.contains('active');// Gère l'accessibilité (ARIA)
                menuElements.burgerElement.setAttribute('aria-expanded', isExpanded);
            break;
            
            case 'navLinks':
                menuElements.navElement.classList.remove('active');
                menuElements.burgerElement.setAttribute('aria-expanded', 'false');
                updateStatus({ log: `⚙️.Tested |actionDispatcher : navLinks => ${param} ` });
            break;
            
            case 'temoignageScroll':
                if (param === 'next') {
                    tstmnlCrslElmnt.scrollBy({ left: tstmnlScrllAmnt, behavior: 'smooth' });
                } else {
                    tstmnlCrslElmnt.scrollBy({ left: -tstmnlScrllAmnt, behavior: 'smooth' });
                }
            break;
            
            case 'validateHomepageSelection':                         // genre superSelect pour séparer sélection et validation
                const selectLieux = document.getElementById('selectLieux');
                const valueLieu = selectLieux ? selectLieux.value : null;// La valeur est l'ID du lieu
                
                if (valueLieu === 'undefined') {
                    showPage('creation-lieu_page');                   // Si l'utilisateur a sélectionné 'Nouveau Lieu'
                    updateStatus({ log: `./⚙️.Run-ng |actionDispatcher -> Création Lieu` });
                
                } else if (valueLieu && valueLieu !== '') {
                    showPage('evaluations_page', 0);                  // 1. Affiche la page et la première section                
                    appData.lieuId = valueLieu;
                    updateStatus({ log: `./✅.End-ng |actionDispatcher -> Evaluations (ID: ${valueLieu})` });
                    
                } else {
                    updateStatus({ log: `❌.Elsed |actionDispatcher : Veuillez sélectionner un lieu.`, type: 'error' });
                }
            break;
            
            case 'navigateMain':                                      // Nav vers : 'accueil' / 'creation-lieu' / 'evaluations'
                showPage(pgTrgtID, scTrgtID || null);
                updateStatus({log: `./⚙️.Run-ng |actionDispatcher : navigateMain: ${pgTrgtID} / ${scTrgtID}.`});
            break;
            
            case 'navigateSection':                                   // Nav vers sous page 'evaluations'
                const isFrwrd = param === 'true';                     // Convertit la chaîne 'true'/'false' en booléen
                showSection(scTrgtID, pgTrgtID, isFrwrd);
                updateStatus({log: `./⚙️.Run-ng |actionDispatcher : navigateSection: ${pgTrgtID} / ${scTrgtID} / ${isFrwrd}.`});
            break;
            
            case 'navigateAnchor':                                    // Scroll vers l'ancre
                scrollToSection(scTrgtID);
                updateStatus({log: `./⚙️.Run-ng |actionDispatcher : navigateAnchor: ${scTrgtID}`});
            break;
            
            case 'updateData':                                        // Mise à Jour/Formulaire (change/input) ---
                if (event.type === 'change' || event.type === 'input') {// On s'assure que l'événement correspond (pour clic, rien)
                    const key = param;
                    const value = trgtElmnt.value;                    // on récupère la value d'un input ou d'un textarea
                    updateData(key, value, trgtElmnt);
                    updateStatus({log: `actionDispatcher | updateData : key: ${key} / value: ${value} / trgtElmnt: ${trgtElmnt} `});
                }
            break;
            
            case 'guided_mode_toggle':
                const nwValue = event.target.value;                   // OLD toggle true/false isGuided = event.target.value === 'guided'; 
                synchroniserModeGuide_(nwValue);                      // Met à jour toutes les autres instances visibles sur la page
                appData.guideORexpert = nwValue;                      // 📘✅ Engistrement de guideORexpert dans appData              
            break;
            
            case 'saveSettings':                                      // Soumission/Actions Complexes (typiquement déclenché par 'click')
                updateStatus({log: `./⚙️.Run-ng |actionDispatcher : Déclenchement de la sauvegarde... `});  // event.type sera 'click' (provenant du bouton)
                saveAllSettings();
            break;
            
            default:                                                  // Cas où data-action est non-référencée
                updateStatus({log: `⚠️.Defaulted |actionDispatcher : Action non gérée: ${action}.`, type: 'warn' });
            break;
        }
    
    } catch (error) {
        updateStatus({ log: `🚫.Catched |actionDispatcher : ${error} `, type: 'error' });
    }
}
/**------------------------------------------------------------------ //
* @instanceIn      {initNavigationListeners}  listeners sur <body>'submit'
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        handleFormSubmit
* @description     GESTIONNAIRE DÉDIÉ AUX SOUMISSIONS DE FORMULAIRES
* ---------------- --------------- --------------- - ---------------- //
* @param           {Event}         event           - L'objet événement.
* ------------------------------------------------------------------- */
function handleFormSubmit(event) {
    updateStatus({ log: `⚙️.Init handleFormSubmit...` });
    event.preventDefault();                                           // Essentiel : Bloquer la soumission native du navigateur
    
    const formElmnt = event.target.closest('form[data-action]');      // Trouve l'élément qui a l'attribut data-action, en remontant l'arbre DOM
    if (!formElmnt) {                                                 // Si aucun élément avec data-action n'est trouvé
        updateStatus({ log: `❌.Form |handleFormSubmit : Pas de data-action sur le formulaire soumis.`, type: 'error' });
        return;
    }
    const action = trgtElmnt.dataset.action ?? '';                    // Coalescence des nuls pour assurer bon traitement info
    
    switch (action) {
        case 'submitLieuCreation':                                    // Logique de validation et d'envoi des données du formulaire
            processLieuCreationSubmission(formElmnt); 
        break;
        
        case 'submitEvaluation':
            // Logique de sauvegarde des évaluations
            updateStatus({ log: `✅.Form |handleFormSubmit : Soumission gérée pour Évaluation.` });
        break;
        
        default:
            updateStatus({ log: `❌.Form |handleFormSubmit : Action de formulaire non gérée: ${action}` });
        break;
    }
}

/**------------------------------------------------------------------ //
* C. GESTIONNAIRE DÉDIÉ AUX MISES À JOUR DE CHAMPS (CHANGE/INPUT)
* ------------------------------------------------------------------- */
function handleFieldUpdate(event) {
    const field = event.target;
    if (!field.matches('input, select, textarea')) return;            // Cibler uniquement les champs qui nous intéressent
    
    const eventType = event.type;
    const value = field.value;
    const fieldId = field.id || field.name;
    updateStatus({ log: `⚙️.Init handleFieldUpdate [${eventType}] - Champ: ${fieldId}` });
    
    if (eventType === 'input') {                                      // Logique de validation ou de mise à jour de l'état en temps réel
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
/**------------------------------------------------------------------ //
* D. GESTIONNAIRE DÉDIÉ AUX TOUCHES CLAVIER (KEYUP/KEYDOWN)
* Utilisé pour intercepter des touches spécifiques avant le submit du formulaire
* ------------------------------------------------------------------- */
function handleKeyEvents(event) {
    const field = event.target;        
    if (field.id === 'adressSalle' || field.id === 'autreChampAvecAutoComplete') { // Cibler spécifiquement le champ d'adresse pour bloquer 'Enter'
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();                                   // Empêche la soumission accidentelle par Entrée lors de l'autocomplétion
            updateStatus({ log: `⚠️.Keydown |handleKeyEvents : Touche Entrée interceptée sur le champ ${field.id}.` });
        }
    }
    // Ajoutez ici d'autres logiques clavier si nécessaire
}

/* == FONCTIONS D'INITIALISATION GLOBALE ============================ */
/**------------------------------------------------------------------ //
* @instanceIn      {loadPage}                        ../
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        handlePageData
* @description     DISTRIBUTEUR
*                  Reçoit l'objet de données complètes et distribue les valeurs aux éléments HTML ciblés (h1, p, select).
* ---------------- --------------- --------------- - ---------------- //
* @param           {Object}      data              - L'objet contenant toutes les briques de données 
* @example                                           {lieux: [...], types: [...], page_title: "..."}
* ------------------------------------------------------------------- */
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

/**------------------------------------------------------------------ //
* @version         25.10.09 (23:16)
* @instanceIn      {handlePageData}                  ../
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        initNavigationListeners
* @description     ATTACHE LES LISTENERS
*                  Crée des listeners au clic, au  sur l'ensemble du <body> en ciblant un '[data-action="navigate"]'
* ------------------------------------------------------------------- */

function initNavigationListeners() {
    updateStatus({ refCSS: 'intro', type: 'loading',   isLdng: true,  log: `🎙️.Init initNavigationListeners... `, logoType:'blanc',
        msg: `🎙️ Mise sur écoute de l'app... Des boutons... Pas de vous. `
    });
    
    try {
        document.body.addEventListener('click', actionDispatcher);    // Clavier / actions [data-action]
        document.body.addEventListener('submit', handleFormSubmit);   // Soumissions de formulaires (avec preventDefault)
        document.body.addEventListener('change', handleFieldUpdate);  // Changement de valeur (select, checkbox, fin de saisie)
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
/**------------------------------------------------------------------ //
* @instanceIn      {handlePageData}
* @instanceCount   1 - unique
* ---------------- --------------------- --------------- - ---------- //
* @function        initializeDOMElements
* @description     INITIALISE LES RÉFÉRENCES DOM ET LES AJOUTE À L'OBJET 'PAGES'
*                  Appelée après que le DOM soit chargé pour que document.getElementById() fonctionne
*                  Intérêt pour éviter d'interroger le DOM à chaque resize.
*                  Important pour gain de performance en enregistrant une fois les <HTMLElements> et ne plus faire de ref getElementById ou querySelector
* ------------------------------------------------------------------- */

function initializeDOMElements() {
    updateStatus({ conteneurID: 'intro', type: 'loading', isLdng: true, log: `⚙️.Init initializeDOMElements...`, imgType: 'blanc',  
        msg: `Initialisation des pages...` 
    });
    
    try {
        //----------------------------------------------------------- // MENU
        const burgerElementTemp = document.querySelector('.menu-toggle');
        if (burgerElementTemp) {
            menuElements.burgerElement = burgerElementTemp;           // 🛟 Enregistre le bouton de nav burger
        }
        
        const burgerIconElementTemp = document.querySelectorAll('.menu-icon');
        if (burgerIconElementTemp) {
            menuElements.burgerIconElements = burgerIconElementTemp;  // 🛟 Enregistre le bouton de nav burger
        }
        
        const navElementsTemp = document.querySelector('.nav-globale');
        if (navElementsTemp) {
            menuElements.navElement = navElementsTemp;                // 🛟 Enregistre la nav
        }
        
        if (!menuElements.burgerElement || !menuElements.navElement) {
            updateStatus({ type: 'error', log: `❌.Elsed |.initializeDOMElements : Erreur. Le menu n'est pas initialisé correctement...` });
        }
        
        //----------------------------------------------------------- // SPA
        conteneurSPA = document.querySelector('.conteneur-spa-global');// 🛟 Enregistre le conteneur
        if (!conteneurSPA) {
            updateStatus({ type: 'error', log: `❌.Elsed |.initializeDOMElements : Erreur fatale. L'app est indisponible...` });
            return;
        }
        
        //----------------------------------------------------------- // PAGES
        Object.values(pages).forEach(page => {
            const pageElementTemp = document.getElementById(page.id); // Récupération de l'élément du DOM avec cet id        
            if (pageElementTemp) {
                page.element = pageElementTemp;                       // 🛟 Enregistre DOM element 
            
                if (page.hasSub) {                                    // Si section
                    page.curSecIndx = 0;                              // 🛟 Définit l'index de la section active
                    page.sectionCount = page.sub.length;              // 🛟 Enregistre le nombre de sections
                    page.sub.forEach ((section, index) => {
                        const sectionElement = document.getElementById(section.id);
                        if (sectionElement) {
                            section.element = sectionElement;         // 🛟 Enregistre DOM element 
                            section.index = index;                    // 🛟 Enregistre index
                            //section.element.style.display = index === 0 ? 'block' : 'none';  // <= Affiche la première section
                        };
                    });
                    page.brdcrmbElmnts = document.querySelectorAll('.module-breadcrumb .breadcrumb-item'); // Cibler <li> avec classe .breadcrumb-item
                    if (page.brdcrmbElmnts.length === 0) updateStatus({ log:`❌.Elsed |.initializeDOMElements : Erreur. La sous-nav n'a pas été chargée.` });
                }
            } else {
                updateStatus({ type: 'error', log: `❌.Elsed |initializeDOMElements : L'élément DOM avec l'ID ${page.id} est introuvable.` });
            }
        });
        
        tstmnlCrslElmnt = document.querySelector('.carousel-temoignage');// 🛟 Enregistre le carousel témoignage <= page accueil
        tstmnlCrtElmnt = tstmnlCrslElmnt.querySelector('.carte-temoignage');// 🛟 Enregistre une carte témoignage <= page accueil
        tstmnlScrllAmnt = tstmnlCrtElmnt.offsetWidth + 24;            // 🛟 Enregistre le scroll amount <= page accueil
        
        creaPgElmnts.adressElmnt = document.getElementById('adresseSalle');// 🛟📘 Enregistre le champ adresse <= page création
        
        isInit.allDOMLoaded = true;                                   // 🛟 Enregistre FLAG => DOM prêt, activation drapeau
        tryToInitAutocomplete();                                      // Tentative d'initialisation (si Maps est déjà chargé)
        
        updateStatus({ refCSS: 'intro', type: 'success', log: `.../⚙️✅.--End |initializeDOMElements : Réfs DOM initialisées et attachées à {pages}.` });
    
    } catch (error) {
        updateStatus({ refCSS: 'intro', type: 'error', log: `🚫.Catched |initializeDOMElements : ${error}` });
    }
}

/* == GUIDEMODE ====================================== (COMPOSANT) == */
/**------------------------------------------------------------------ //
* @version         25.10.09 (23:16)
* @instanceIn      {handlePageData}
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        initModeGuide
* @description     LIT ET MET À JOUR LE MODE GUIDÉ/EXPERT
*                  Trouve tous les éléments avec .composant-aide (crochet fonctionnel), lit l'état actuel (appData.guideORexpert) et coche la bonne option.
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}        initValue       - ['guided' || 'expert']
* ------------------------------------------------------------------- */
function initModeGuide(initValue) {
    updateStatus({ refCSS: 'intro', isLdng: true, msg: `🔌.Init initModeGuide | Initialisation du mode guidé... `, logoType: 'blanc' });
    
    try {
        guideModeBTN = document.querySelectorAll('.composant-aide input[type="radio"]'); // 🛟 Enregistre les boutons radios
        if (!guideModeBTN) {
            updateStatus({type: 'error', log: `❌.Elsed |.initModeGuide : Les boutons guidé/expert sont introuvables.`});
            return;
        }
        synchroniserModeGuide_(initValue);                            // Lance synchronisation
        updateStatus({ refCSS: 'intro', type: 'success', isLdng: true, imgType: 'blanc', msg: `.../🔌✅.--End |initModeGuide : Mode guidé mis en place`});
    
    } catch (error) {  
        updateStatus({ refCSS: 'intro', type: 'error', isLdng: false, msg: `🚫.Catched |initModeGuide : [error] : ${error}` });
    }
}

/**------------------------------------------------------------------ //
* @instanceIn      {initialiserModeGuide}, {actionDispatcher}
* @instanceCount   2
* 
* @function        synchroniserModeGuide_
* @description     SYNCHRONISE TOUTES LES INSTANCES DE MODE GUIDÉ/EXPERT
*                  Parcourt toutes les instances et ajuste les btn-radios sur appData.guideORexpert 
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}        nwVal           - ['guided' || 'expert']
* ------------------------------------------------------------------- */
function synchroniserModeGuide_(nwVal) {
    updateStatus({ refCSS: 'intro', isLdng: true, log: `🔌.Init synchroniserModeGuide_ ...[param]nwVal:${nwVal} `, imgType:'blanc' });
    try {
        guideModeBTN.forEach ( rdio => { rdio.checked = (rdio.value === nwVal); }); // Update les btns => checked ou pas
        document.body.classList.toggle('guidedMode', nwVal === 'guided'); // Ajoute/Retire la classe
        updateSPA_Height_();                                          // si déjà initialisé => UpdateSPA_Height_ 
        updateStatus({type: 'success', log: `.../⚙️✅.--End |synchroniserModeGuide`});
        
    } catch (error) {
        updateStatus({type: 'error', isLdng: false, log: `🚫.Catched |synchroniserModeGuide_ [error] : ${error} `, logoType:'blanc' });
    }
}

/* == APP HELPER - UPDATESTATUS ===================== (UTILITAIRE) == */
/**------------------------------------------------------------------ //
* @version         25.11.03 (15:59)
* @instanceIn      {loadPage}
* ---------------- --------------- --------------- - ---------------- //
* @description     INITIALISE LE LOADER UNIFIÉ
* ------------------------------------------------------------------- */
function init_updateStatus() {
    LOGO_URLS              = getLogoUrlsFromCSS_();
    snglLgElmnt            = document.getElementById('status_layer_single');        
    if (snglLgElmnt) {
        lggrElmnt          = snglLgElmnt.querySelector('.status-message');
        imgLgElmnt         = snglLgElmnt.querySelector('.spinner-image');
        spnrLgElmnt        = snglLgElmnt.querySelector('.spinner');
        prgrssGrpLgElmnt   = snglLgElmnt.querySelector('.progress-container');
        prgrssBrLgElmnt    = snglLgElmnt.querySelector('.progress-bar');
        prgrssTxtLgElmnt   = snglLgElmnt.querySelector('.progress-text');
    }
    if (!LOGO_URLS.bleu || !LOGO_URLS.blanc) { console.warn(`Les variables CSS --url-logo-actif ou --url-logo-blanc n'ont pas pu être lues.`) };
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
* ---------------- --------------- ------------------------- - ------ //
* @param           {object}        config                    - L'objet de configuration.
*    @param        {string}        [config.refCSS]           - ID du conteneur cible
*    @param        {string}        [config.msg]              - Le texte à afficher.
*    @param        {string}        [config.type='log']       - Type de message ('info', 'loading', 'success', 'error', 'warn', 'debug').
*    @param        {boolean}       [config.isLdng=false]     - Pour activer/désactiver les spinners et le bouton.
*    @param        {number}        [config.current=0]        - V2-SPÉCIFIQUE : Numérateur pour la progression.
*    @param        {number}        [config.total=0]          - V2-SPÉCIFIQUE : Dénominateur pour la progression.
*    @param        {string}        config.imgType            - V3-UNIQUE Type de logo à afficher ('blue' ou 'white'). Si null, le logo actuel est conservé.
* ------------------------------------------------------------------- */
function updateStatus({ refCSS=null, log=null, msg=null, type='log', isLdng=false, current=null, total=null, imgType=null}) {
    if (!snglLgElmnt) {                                               // Défensif si init_updateStatus() a merdé qq part
        console.error( `Initialisez la fonction avant de pouvoir l'appeler. \nPour cela, lancez la fonction ini_updateStatus()` );
        return;
    }
    
    if (log) {                                                        // LOGGING
        switch (type) {
            case 'fail': case 'error':  console.error (`[${refCSS}] ERROR: ${log}  `); break;
            case 'warn':                console.warn  (`[${refCSS}] WARN:  ${log}  `); break;
            case 'debug':               console.debug (`[${refCSS}] DEBUG: ${log}  `); break;
            case 'info':                console.info  (`[${refCSS}] INFO:  ${log}  `); break;
            default:                    console.log   (`[${refCSS}] LOG:   ${log}  `);
        }                                                 
    }
    
    if (!isLdng) {                                                    // LOADER => isLdng = FALSE
        snglLgElmnt.style.display = 'none';                           // Fin de Chargement : Masque et DÉTACHE le loader
        if (curLgElmnt) {                                             // Si conteneur
            curLgElmnt.classList.remove('loading-target');            // Détache CSS
            curLgElmnt = null;                                        // 🛟 Enregistre DOM Element
        }
        snglLgElmnt.classList.remove('is-attached');                  // Détache CSS
        return;
    }
    
    const lgElmnt = refCSS ? document.getElementById(refCSS) : null;
    if (lgElmnt) {                                                    // CAS 1. => nouveau conteneur cible ✅
        if (curLgElmnt && curLgElmnt !== lgElmnt) {
            curLgElmnt.classList.remove('loading-target');            // new conteneur différent de current => Détache CSS
        }
        lgElmnt.classList.add('loading-target');                      // Attache CSS
        
        if (snglLgElmnt.parentNode !== lgElmnt) {                     // => DOM parent différent
            lgElmnt.appendChild(snglLgElmnt);                         // Attache DOM
            snglLgElmnt.classList.add('is-attached');                 // Attache CSS
        }
        curLgElmnt = lgElmnt;                                         // 🛟 Enregistre new => current
    
    } else if (refCSS === null) {                                     // CAS 2. => nouveau conteneur cible ❌
    
    snglLgElmnt.classList.remove('is-attached');                      // Détache CSS
    curLgElmnt = null;                                                // Mode FIXED global
    }
    
    snglLgElmnt.style.display = 'flex';                               // Avec/Sans conteneur => Affiche
    if (imgLgElmnt && imgType) {                                      // LOGO ANIMÉ
        const url = LOGO_URLS[imgType];
        
        if (url) {
            imgLgElmnt.src = url;
    
        } else {
            console.warn(`Type de logo inconnu ou URL non trouvée pour ${imgType}.`);
        }
        
        imgLgElmnt.className = 'spinner-image';                       // Reset CSS (évite remove et de lister tous les cas de fig.)
        imgLgElmnt.classList.add( `logo-${type}` );
    }
    
    if (lggrElmnt) {                                                  // MESSAGE TEXTE
        lggrElmnt.textContent = msg; 
        lggrElmnt.className = 'trmdvsr-sstexte status-message';       // Reset CSS (évite remove et de lister tous les cas de fig.)
        lggrElmnt.classList.add(type);
    }
    
    if (spnrLgElmnt) {                                                // SPINNER ANIMÉ
        spnrLgElmnt.style.display = isLdng ? 'flex' : 'none';
    }
    
    if (current && total) {                                           // BARRE DE PROGRESSION
        if (prgrssGrpLgElmnt && prgrssBrLgElmnt && prgrssTxtLgElmnt) {
            prgrssGrpLgElmnt.style.display = (isLdng && total > 0) ? 'block' : 'none';
        
            if (total > 0 && current <= total) {
                const percent = Math.round((current / total) * 100);
                prgrssBrLgElmnt.style.width = `${percent}%`;
                prgrssTxtLgElmnt.textContent = `${percent}% (${current}/${total} images enregistrées)`;
            
            } else {
                prgrssBrLgElmnt.style.width = '0%';
                prgrssTxtLgElmnt.textContent = '0% (0/0 images enregistrées)';
            }
        }
    }
}

/* == FONCTIONS HELPERS - PRIVATE =================== (UTILITAIRE) == */
/**------------------------------------------------------------------ //
* @instanceIn      {debouncedHandleResize} {synchroniserModeGuide_} {showPage} {showSection} 
* @instanceCount   4
* ---------------- --------------------- --------------- - ---------- //
* @function        updateSPA_currentHeight
* @description     FONCTION UTILITAIRE POUR GÉRER LA HAUTEUR DU CONTENEUR SPA
* ---------------- --------------------- --------------- - ---------- //
* @param           {string||null}        trgtPgID        - L'ID de la page cible. On force la détection des strings, car est aussi appelé par onResize
* @param           {string||null}        trgtSecIndx     - L'Index de la section cible.
* ------------------------------------------------------------------- */
function updateSPA_Height_(trgtPgID = null, trgtSecIndx = null) {
    let callStack;
    try {
        callStack = getCallStack_();                                  // Enregistre la pile d'appels si erreur se produirait plus tard.
        trgtPgID = (typeof trgtPgID === 'string') ? trgtPgID : (curPgID ?? 'accueil_page');     // <= Certitude : trgtPgID est une string
        const trgtPg = Object.values(pages).find(p => p.id === trgtPgID);           // => Enregistre l'objet Page
        updateStatus({ log: `Init updateSPA_Height_ [param]trgtPgID: ${trgtPgID}${trgtSecIndx != null ? ` / trgtSecIndx:${trgtSecIndx}` : ''}` }); 
        updateStatus({ log: `Init updateSPA_Height_ [param] => ${trgtPg.id} ` }); 
        
        if (!conteneurSPA || !trgtPg) return;                         // != Sécurité initiale (conteneur et page cible doivent exister)
        let trgtHght = trgtPg.element.offsetHeight;                   // ?= Logique minimale => Page simple sans gestion relative/absolute
        if (trgtPg.hasSub) {                                          // <= Ajoute hauteur section active
            trgtSecIndx ??= trgtPg.curSecIndx;                        // ?= Gère récup par défaut de l'index en cours
            trgtHght += trgtPg.sub[trgtSecIndx].element?.offsetHeight ?? 0;           // <= Ajoute hauteur section active à hauteur page simple
        }
        
        if (trgtHght <= 0) {                                          // => Réinitialise le style si hauteur invalide ou nulle 
            conteneurSPA.style.removeProperty('--hauteur-content');
            updateStatus({ log: `./⚙️.Run-ng |updateSPA_Height_ : Variable --hauteur-content supprimée (passage à hauteur auto).` });
            return;
        }
        conteneurSPA.style.setProperty('--hauteur-content', `${trgtHght}px`);       // => Définit le CSS si hauteur valide
        updateStatus({ log: `./⚙️.Run-ng |updateSPA_Height_ : Variable CSS --hauteur-content ajustée à: ${trgtHght}px` });
    
    } catch (error) {
        updateStatus({ log: `🚫.Catched |updateSPA_Height_ [erreur] : ${error}`, type: 'error' });
        console.error("Erreur updateSPA_Height_, l'appel vient de:", callStack);    // Affiche la pile d'appels dans la console pour l'erreur
    }
}

/**------------------------------------------------------------------ //
* @version         25.11.03 (15:59)
* @instanceIn      {init_updateStatus}
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        getLogoUrlsFromCSS_
* @description     FONCTION UTILITAIRE POUR RÉCUPÉRER LES VALEURS CSS
* ---------------- --------------- --------------- - ---------------- //
* @returns         {function}      bleu/blanc      > Les URLs pour le logo bleu et le logo blanc.
* ------------------------------------------------------------------- */
function getLogoUrlsFromCSS_() {
    const rootStyles = getComputedStyle(document.documentElement);    // Cible l'élément racine
    const actifUrlCSS = rootStyles.getPropertyValue('--url-logo-actif').trim();
    const blancUrlCSS = rootStyles.getPropertyValue('--url-logo-blanc').trim();
    
    const extractUrl = (cssValue) => {                                // Fonction locale interne
    if ( !cssValue || !cssValue.startsWith('url(') ) return '';
        return cssValue.slice(4, -1).replace(/["']/g, '');            // Retire 'url(', ')', et les guillemets/apostrophes éventuels.
    };
    
    return {
        bleu: extractUrl(actifUrlCSS),
        blanc: extractUrl(blancUrlCSS)
    };
}

/**------------------------------------------------------------------ //
* @instanceIn      {handlePageData}                  ../
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        debounce_
* @description     FONCTION UTILITAIRE DE DEBOUNCING (ANTI-REBOND)
* ---------------- --------------- --------------- - ---------------- //
* @param           {function}      func            - La fonction à encapsuler.
* @param           {number}        delay           - Le délai en millisecondes après lequel la fonction sera exécutée.
* @returns         {function}                      > La nouvelle fonction "débouncée".
* ------------------------------------------------------------------- */
function debounce_(func, delay) {
    let timeoutId;
    return function(...args) {
        const context = this;
        clearTimeout(timeoutId);                                      // Fn glob: Annule le timer précédent
        timeoutId = setTimeout( () => { func.apply(context, args); }, delay );      // Fn Glob: Exécute fonction SEULEMENT après fin du délai
    };
}

/**------------------------------------------------------------------ //
* @instanceIn      {handlePageData}                  ../
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        getCallStack_
* @description     FONCTION UTILITAIRE POUR OBTENIR LA PILE D'APPELS
*                  Récupère et formate la pile d'appels d'où la fonction a été appelée.
* ---------------- --------------- --------------- - ---------------- //
* @returns         {string}                        > La pile d'appels, formatée pour être lisible.
* ------------------------------------------------------------------- */
function getCallStack_() {
    const error = new Error();                                        // Créer une nouvelle erreur. L'objet Error contient la propriété 'stack'.
    let stack = error.stack || 'Pile d\'appels non disponible.';      // Le 'new Error()' est créé au moment où cette fonction est appelée.
    stack = stack.split('\n').slice(2).join('\n').trim();             // Garde les appels importants, retire la 1e ligne "Error" / appel à getCallStack lui-même. split('\n') => sépare les lignes, slice(2) => saute les 2 premières lignes inutiles.
    return `\n--- DÉBUT PILE D'APPELS ---\n${stack}\n--- FIN PILE D'APPELS ---`;  // Retourne un formatage plus clair
}

/* == APP LAUNCHER ========================================== (🚀) == */
console.log (` \n\n🚀=============================================🚀 ${DATE} 🚀=============================================🚀\n\n🏁 C'est parti.` );
//window.addEventListener('load', loadPage);                          // ✅🟩♻️🟢 À RÉACTIVER POUR LAUNCH
loadTemp();                                                           // 🚨🎱🧰‼️ À SUPPRIMER POUR LAUNCH
function loadTemp() {                                                 // 🚨🎱🧰‼️ À SUPPRIMER POUR LAUNCH
    try {
        if (!isInit.updateStatus) {
            init_updateStatus();                                      // Initialise le composant de loading
            isInit.updateStatus = true;                               // 🏁 Active le flag
        }
        handlePageData({ submissionID: 'text' });
        
    } catch (error) {
        updateStatus({ type: 'error', isLdng: false, log: `📡🚫.Catched |loadTemp : Big error: ${error}` });
    }
}

/**------------------------------------------------------------------ //
* @instanceIn      {window.onLoad}                   ../
* @instanceCount   1 - unique     
* ---------------- --------------- --------------- - ---------------- //
* @function        loadPage
* @description     L'INITIALISEUR DE LA PAGE
*                  Lance l'appel unique à google.script.run et spécifie les clés de données (calledKeys).
*                  Placement après son appel pour un souci de lisibilité, le hoisting se charge de remonter la fonction.
* ------------------------------------------------------------------- */
function loadPage() {
    try {
        if (!isInit.updateStatus) {
            init_updateStatus();                                      // Initialise le composant de loading
            isInit.updateStatus = true;                               // 🏁 Active le flag
        }
        
        const calledKeys = ['submissionID', 'dropdown_lieux', 'dropdown_types'];    // Clés d'appel pour fetch côté serveur 
        updateStatus({ refCSS: 'intro', type: 'loading', isLdng: true, imgType: 'blanc', msg: `Réveil de l'IA...` });
        
        google.script.run                                             // ☎️ APPEL SERVEUR
        .withSuccessHandler( (result) => {                            // => SUCCESS CALLBACK
            updateStatus({ refCSS: 'intro', type: 'loading', isLdng: true, log: `.../📡✅.Ended |loadPage : ${result} `, imgType: 'blanc',
                msg: `IA réveillée, arrivée dans votre navigateur...`
            });
            console.dir(result);
            handlePageData(result);                                   // => Fonction côté client si succès : traite toutes les données reçues
        })
        .withFailureHandler((error) => {                              // => FAILURE CALLBACK
            updateStatus({ refCSS: 'intro', type: 'fail', log: `📡❌.Failed |loadPage : Échec critique : ${error}`,       
                msg: `Une erreur est survenue lors du chargement des données. Veuillez réessayer.` 
            });
        })
        .getInitialPageData(calledKeys);                              // Fonction côté serveur
        
        updateStatus({ refCSS: 'intro', type: 'loading', isLdng: true, imgType: 'blanc', log: `./📡⚙️.Run-ng |loadPage : Server Request => getInitialPageData for [${calledKeys}]`, message:  `Allo l'IA?` });
        
    } catch (error) {
        updateStatus({ refCSS: 'intro', type: 'error', log: `📡🚫.Catched |loadPage : Big error: ${error}` });
    }
}
/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */
