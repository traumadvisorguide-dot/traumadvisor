/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initAPP}    ⚠️                    ../
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initDatas
 * @description     DISTRIBUTEUR
 *                  Reçoit l'objet de données complètes et distribue les valeurs aux éléments HTML ciblés (h1, p, select).
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {Object}        data            - L'objet contenant toutes les briques de données 
 * @example                                           {lieux: [...], types: [...], page_title: "..."}
 * -------------------------------------------------------------------------------------------- */
function initDatas(data) {
    
    console.debug( `📝.Init initDatas...[param]data: ${data} ` );
    updateStatus({ logoType: 'blanc', type: 'loading', isLdng: true, msg: `Traitement des datas...`});
    try {
        
        updateStatus({ logoType: 'blanc', type: 'loading', isLdng: true, msg: `Récupération d'un numéro d'identification...` });
        if (data.submissionID) appData.submissionID = data.submissionID;                        // 📘✅ Engistrement de submissionID dans appData
        console.log( `📝⚙️.Run-ng |initDatas | appData.submissionID:  ${appData.submissionID} ` )
        initDOM_transverse();                                                                   // <= Set up des éléments du DOM
        initDOM_pages();
        showPage('accueil_page');                                                               // accueil_page evaluations_page
        
        if (!isInit.modeGuide) {                                                                // Global - Mode Guidé/Expert
            appData.guideORexpert ??= 'guided';                                                 // 📘✅ Engistrement de guideORexpert dans appData si undefined
            initDOM_modeGuide(appData.guideORexpert);
            isInit.modeGuide = true;
        }
        
        if (data.dropdown_lieux)    ppltDrpdwn(pages.accueil.$slctLx, data.dropdown_lieux, 'nom', 'id');   // ACCUEIL - DROPDOWN LIEUX
        if (data.types)             ppltDrpdwn(pages.creation.$typeLieu, data.types);                      // CREATION - DROPDOWN TYPE
        
        if (!isInit.navGlobale) {                                                               // Init des listeners de navigation
            initLIS_navigation();
            isInit.navGlobale = true;
        }
        console.log( `📝✅.--End |initDatas : Page entièrement chargée et peuplée. ` );
        updateStatus({ logoType: 'blanc', type: 'success', isLdng: false, msg:  `Affichage de l'app.` });
    } catch (error) {
        console.error(`📝🚫.Catched |initDatas [error] : ${error} `);
    }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initDatas}
 * @instanceCount    1 - unique
 * ---------------- --------------------------------------------------------------------------- //
 * @function        initDOM
 * @description     INITIALISE LES RÉFÉRENCES DOM ET LES AJOUTE À L'OBJET 'PAGES'
 *                  Appelée après que le DOM soit chargé pour que document.getElementById() fonctionne
 *                  Intérêt pour éviter d'interroger le DOM à chaque resize.
 *                  Important pour gain de performance en enregistrant une fois les <HTMLElements> et ne plus faire de 
 *                  ref getElementById ou querySelector. La fonction initializeDOMElements n'a pas besoin d'enregistrer 
 *                  les éléments de notation car ils sont gérés par délégation d'événements et n'ont pas de besoin d'accès 
 *                  direct après le chargement, SAUF pour l'initialisation de leur état (score, bouton).
 * -------------------------------------------------------------------------------------------- */
function initDOM_transverse() {
    console.debug( `⚙️⬜️.Init initDOM_transverse...` );
    updateStatus({ type: 'loading', isLdng: true, logoType: 'blanc', msg: `Initialisation des pages...` });
    
    try {
        //===================================================================================== // SPA
        $conteneurSPA = document.querySelector('.conteneur-spa-global');                         // 🛟 Enregistre le conteneur
        if (!$conteneurSPA) {
            console.error( `❌.Elsed |initDOM_transverse : Erreur fatale. L'app est indisponible...` );
            return;
        }
        //===================================================================================== // MENU GÉNÉRAL
        const burgerIconElmntTmp    = document.querySelectorAll('.menu-icon');                  // Lignes x3
        const navElmntTmp           = document.querySelector('.nav-globale');                   // <= <ul> conteneur des <li>
        if (burgerIconElmntTmp)     menu.$lineIcons = burgerIconElmntTmp;                       // 🛟 Enregistre le bouton de nav burger
        if (navElmntTmp)            menu.$navItems   = navElmntTmp;                             // 🛟 Enregistre la nav
        
        if (!menu.$navItems && !menu.$lineIcons) console.error( `❌.Elsed |.initDOM_transverse : Erreur. Le menu n'est pas initialisé correctement...` );
        console.dirxml(menu);
        //===================================================================================== // PAGES
        isInit.allDOMLoaded = true;                                                             // 🚩 Enregistre FLAG => DOM prêt, activation drapeau
        tryToInitAutocomplete();                                                                // Tentative d'initialisation (si Maps est déjà chargé)
        console.log( `⚙️✅.--End |initDOM_transverse : Réfs DOM initialisées et attachées à {pages}.` );
    
    } catch (error) { console.error( `🚫.Catched |initDOM_transverse : ${error}` ); }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initDatas}
 * @instanceCount    1 - unique
 * ---------------- --------------------------------------------------------------------------- //
 * @function        initDOM
 * @description     INITIALISE LES RÉFÉRENCES DOM ET LES AJOUTE À L'OBJET 'PAGES'
 *                  Appelée après que le DOM soit chargé pour que document.getElementById() fonctionne
 *                  Intérêt pour éviter d'interroger le DOM à chaque resize.
 *                  Important pour gain de performance en enregistrant une fois les <HTMLElements> et ne plus faire de 
 *                  ref getElementById ou querySelector. La fonction initializeDOMElements n'a pas besoin d'enregistrer 
 *                  les éléments de notation car ils sont gérés par délégation d'événements et n'ont pas de besoin d'accès 
 *                  direct après le chargement, SAUF pour l'initialisation de leur état (score, bouton).
 * -------------------------------------------------------------------------------------------- */
function initDOM_pages() {
    console.debug( `⚙️⬜️.Init initDOM_pages...` );
    updateStatus({ type: 'loading', isLdng: true, logoType: 'blanc', msg: `Initialisation des pages...` });
    
    try {
        // PAGES ============================================================================== // 
        Object.values(pages)?.forEach( p => {
            const $pageElmntTmp = document.getElementById(p.ID);                                // Récupération de l'élément du DOM avec cet id        
            
            if ($pageElmntTmp) {
                p.$elmnt = $pageElmntTmp;                                                       // 🛟 Enregistre DOM element <= Agit comme parent des sous-elements 
                // ACCUEIL -------------------------------------------------------------------- // 
                if (p.ID === "accueil_page") {
                    p.$slctLx = p.$elmnt.querySelector('.trmdvsr-suprslct #selectLieux');       // 🛟 Enregistre le champ input principal                        //
                    p.$tstmnlCrsl = p.$elmnt.querySelector('.carousel-temoignage');             // 🛟 Enregistre le carousel témoignage <= page accueil
                    p.$tstmnlCrt  = p.$tstmnlCrsl.querySelectorAll('.carte-temoignage');        // 🛟 Enregistre une carte témoignage <= page accueil
                    p.tstmnlScrllAmnt = p.$tstmnlCrt[0].offsetWidth + 24;                       // 🛟 Enregistre le scroll amount <= page accueil
                    console.dirxml (p);
                }
                // CREATION LIEU -------------------------------------------------------------- // 
                if (p.ID === "creation-lieu_page") {
                    p.$adress = p.$elmnt.querySelector('#adresseSalle');                        // 🛟 =>📘 Enregistre le champ adresse <= page création
                    p.$adressError = p.$elmnt.querySelector('#adresseError'); 
                    p.$nomLieu = p.$elmnt.querySelector('#nomSalle');                           // 🛟 =>📘 Enregistre le champ nom <= page création
                    p.$typeLieu = p.$elmnt.querySelector('#typeEtablissement');                 // 🛟 =>📘 Enregistre le champ type <= page création
                    console.dirxml (p);
                }
                //----------------------------------------------------------------------------- // EVALUATIONS
                if (p.ID === "evaluations_page") {
                    //......................................................................... // GESTION DES SECTIONS => MENU ETC...
                    p.$brdcrmbs = document.querySelectorAll('.module-breadcrumb .breadcrumb-item');      //  <= cible <li> via .breadcrumb-item
                    if (p.$brdcrmbs.length === 0) console.error( `❌.Elsed |.initializeDOMElements : Erreur. La sous-nav n'a pas été chargée.` );

                    p.curSecIndx = 0;                                                           // 🛟 Définit l'index de la section active
                    p.sectionCount = p.sub.length;                                              // 🛟 Enregistre le nombre de sections
                    //......................................................................... // SECTIONS
                    p.sub.forEach ( (section, index) => {
                        
                        //¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ // UTILE
                        const $sectionElement = document.getElementById(section.ID);
                        if ($sectionElement) {
                            section.$elmnt = $sectionElement;                                   // 🛟 Enregistre DOM element <= Element Parent 
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

                                // DOM ELEMENTS => COMPOSANT NOTE
                                const noteTemp = document.getElementById(`result-q${index + 1}`);       // compense l'index start 0
                                if (noteTemp) section.noteElmnt = noteTemp;                             // 🛟 Enregistre DOM element 
                                                                
                                const displayNoteTemp = section.$elmnt.querySelector(`#result-q${index + 1}.module-note.trmdvsr-texte-h2`);
                                if (displayNoteTemp) section.$noteDisplay = displayNoteTemp;
                                else console.warn(`Aucun élément interne trouvé correspondant à '#result-q${index + 1}.module-note.trmdvsr-texte-h2' dans l'élément moduleNoteTemp.. ${moduleNoteTemp}`);

                                // DOM ELMENTS => COMPOSANT AVIS
                                const convLog = document.querySelector('.conteneur-avis .module-avis .conversation-log');
                                if (convLog) section.$convLog = convLog;

                                const editArea = document.querySelector('editArea');
                                if (editArea) section.$editArea = editArea;

                                const actionModeContainer = document.querySelector('mode-action-container');
                                if (actionModeContainer) section.$actMdCntnr = actionModeContainer;

                                const editModeContainer = document.querySelector('mode-edit-container');
                                if (editModeContainer) section.$eMdCntnr = editModeContainer;

                                checkSectionCompletion(section.ID);                                     // Désactive les boutons "Suivant" et initialise l'affichage du score
                            
                            break;
                            case 'fileupload':
                                console.log('todo bientôt');
                            break;
                            default:
                                console.log(`si ça s'affiche y a un souci dans initDOM_pages`)
                            break;
                        }

                        //¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨ // AVIS
                    } );
                    console.dirxml (p);
                }
            } else console.error( `❌.Elsed |initDOM_pages : L'élément DOM avec l'ID ${p.ID} est introuvable.` );
        } );
        isInit.allDOMLoaded = true;                                                             // 🚩 Enregistre FLAG => DOM prêt, activation drapeau
        tryToInitAutocomplete();                                                                // Tentative d'initialisation (si Maps est déjà chargé)
        console.log( `⚙️✅.--End |initDOM_pages : Réfs DOM initialisées et attachées à {pages}.` );
    
    } catch (error) { console.error( `🚫.Catched |initDOM_pages : ${error}` ); }
}


/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initDatas}      ../trmdvsr-03-launch-js
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initPageEval
 * @description     INITIALISE LA PAGE EVALUATION
 * -------------------------------------------------------------------------------------------- */
function initPageEval () {
    console.log( `Init Page Evaluation...` );   
    updateStatus({  type: 'loading', isLoading: true,  msg: `À vos évals... Prêt?` });

    initPageEvalPhotoUploader();                                    // Module d'Upload Photo
    updateBreadcrumb('section_q1');                                 // Affiche l'étape et met à jour l'URL

    console.log( `Page Evaluation chargée` );
    updateStatus({  conteneurID: 'eval', type: 'loading', isLoading: false, msg: `Feu! Partez!` });
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initRatings}     ../trmdvsr-03-launch-js
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initLIS_sections
 * @description     ATTACHE LES LISTENERS 
 *                  Attache les écouteurs d'événements (délégation) à la section principale pour gérer les sélections de notes et les boutons d'humeur.
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {string}        questionID      - L'ID de la question (ex: 'q1').
 * @param           {string}        dataKey         - La clé à utiliser dans appData.evaluation.ratings (Ex: 'noteAccessibilite').
 * -------------------------------------------------------------------------------------------- */
function initLIS_sections(questionID, dataKey) {
      const section = document.getElementById(`section_${questionID}`);             // Ciblage de la section parente
      const humourConteneur = document.getElementById(`boutons-humour-${questionID}`);
      
      if (humourConteneur) {
            humourConteneur.style.display = 'none';
      }
      
      if (!section) {
            updateStatus({  conteneurID: 'eval', type: 'warn', isLoading: false, log: `initLIS_sections | Section non trouvée pour l'ID:  ${section}.`,
                questionID:   questionID, msg:      "Veuillez relancer la page." });
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
                                msg:      "L'initialisation est ok" });
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
      
      updateStatus({  conteneurID: questionID, type: 'success', isLoading: false, log: `initLIS_sections | questionKey:${questionID}`, 
            questionID: questionID, msg:    "L'initialisation est ok" });
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initPageEval}        ../trmdvsr-03-launch-js
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initPageEvalPhotoUploader
 * @description     INITIALISE LES LISTENERS DE LA PARTIE PHOTO UPLOAD
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @returns         [ ||null]       null si erreur
 * -------------------------------------------------------------------------------------------- */
function initPageEvalPhotoUploader() {
    console.debug('Init Module Photo Uploader...');
    updateStatus({ type: 'loading', isLoading: true, msg: "Chargement du module d'export photo." });

    fileInput =           document.getElementById("input_photo_principale");
    previewContainer =    document.querySelector (".conteneur-image-preview");
    limitMessage =        document.getElementById("limit-message");

    cropModule =          document.getElementById("crop-module");         // Initialisation des éléments du module
    imageToCrop =         document.getElementById("image-to-crop");
    const cropAndAddBtn = document.getElementById("crop-btn-add");
    const cancelCropBtn = document.getElementById("crop-btn-cancel");

    if (!fileInput || !previewContainer || !limitMessage || !exportBtn || !cropModule || !imageToCrop) {
        console.error("Erreur d'initialisation : Éléments DOM critiques manquants.");
        updateStatus({ type: 'error', isLoading: true, msg: "Erreur critique." });
        return;
    }

    fileInput.style.opacity = 0;
    fileInput.addEventListener      ("change", handleFileSelection);      // Listener pour gérer la sélection d'image 
    initDragDropListeners();                                              // Initialisation Drag n Drop listeners
    cropAndAddBtn.addEventListener  ('click', handleCropAndAdd);
    cancelCropBtn.addEventListener  ('click', closecropModule);

    console.log('Module Photo Uploader prêt.');
    updateStatus({ type: 'loading', isLoading: false, msg: "Glissez, déposez et rognez vos images avant d'exporter." });
}


/** ------------------------------------------------------------------------------------------- //
 * @version         25.12.02 (13:30) -> with Gemini
 * @instanceIn      {initDatas}                  ../
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initLIS_navigation
 * @description     ATTACHE LES LISTENERS
 *                  Crée des listeners au clic, au  sur l'ensemble du <body> en ciblant un '[data-action="navigate"]'
 * -------------------------------------------------------------------------------------------- */
function initLIS_navigation() {
    console.debug( `🎙️⬜️.Init initLIS_navigation...` );
    updateStatus({ type: 'loading', isLdng: true, logoType:'blanc', msg: `🎙️ Mise sur écoute de l'app... Des boutons... Pas de vous.`});   
    try {
        document.body.addEventListener('click', actionDispatcher);                              // Clavier / actions [data-action]
        document.body.addEventListener('change', actionDispatcher);                             // Ajoutez l'écouteur 'change' pour les radios de notation
        //document.body.addEventListener('change', handleFieldUpdate);                          // Changement de valeur (select, checkbox, fin de saisie)
        // NOTE: Le 'change' est préférable au 'click' pour les radios, mais votre architecture actuelle semble utiliser 'change' via 'handleFieldUpdate'.
        // Pour la notation, je vous recommande d'utiliser 'change' et de le dispatcherdans actionDispatcher pour séparer la logique 'rating' des autres champs.
        document.body.addEventListener('mouseover', actionDispatcher);                          // Ajoutez les écouteurs pour le rollover/survol
        document.body.addEventListener('mouseout', actionDispatcher);
        
        document.body.addEventListener('submit', handleFormSubmit);                             // Soumissions de formulaires (avec preventDefault)
        document.body.addEventListener('input', handleFieldUpdate);                             // Saisie en temps réel (validation)
        document.body.addEventListener('keydown', handleKeyEvents);
        
        const debouncedHandleResize = debounce_(updateSPA_Height_, 200);                        // version anti-rebond de 200ms
        window.addEventListener('resize', debouncedHandleResize);                               // MàJ la hauteur au resize de la fenêtre avec anti-rebond

        // autocomplete.addListener('place_changed'                                             // <= gestion dans la function dédiée 
        console.log( `🎙️✅.--End |initLIS_navigation OK. ` );
        updateStatus({ type: 'success', isLdng: true, logoType: 'blanc', msg: `🎙️ 1. 2. 1. 2. Les micros sont en place.` });
    
    } catch (error) {
        console.error( `🎙️🚫.Catched |initLIS_navigation [error] : ${error}.` );
        updateStatus({ type: 'error', isLdng: true, logoType: 'blanc', msg: `🎙️ Houston? Whitney Houston? We avons un problème...` });
    }
}


/** ------------------------------------------------------------------------------------------- //
 * @instanceCount   1 - unique     
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        getInitialPageDataExternal
 * @description     APPELLE LA FONCTION APPS SCRIPT (doGet) 
 *                  via l'URL de déploiement en passant des paramètres en query string (remplace google.script.run).
 *                  Cette fonction contient la logique des "handlers" succès/échec.
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {string[]}      calledKeys      - Les clés (arguments) des datas à demander au serveur.
 * -------------------------------------------------------------------------------------------- */
async function getInitialPageDataExternal(calledKeys) {
    
    // --- Handlers de Succès et d'Échec, encapsulés pour imiter google.script.run ---
    const successCallback = (result) => {
        console.log(`🚥✅.--End |getInitialPageDataExternal: Succès de l'appel `);
        updateStatus({ logoType: 'blanc', type: 'loading', isLdng: true, msg: `IA réveillée, arrivée dans votre navigateur...` });
        initDatas(result.data); 
    };

    const failureCallback = (error) => {
        const errorMsg = error.message || 'Erreur inconnue.';
        console.error( `🚥❌.Failed |getInitialPageDataExternal : Échec critique : ${errorMsg}` );
        updateStatus({ type: 'fail', msg: `Erreur lors du chargement des données. Veuillez réessayer. (Détail: ${errorMsg})` });
    };
    // --- Fin des Handlers ---

    try {
        updateStatus({ logoType: 'blanc', type: 'loading', isLdng: true, msg: `Préparation de l'appel au serveur Apps Script avec les clés: ${calledKeys.join(', ')}...` });

        const params = new URLSearchParams();                                                   // 1. CONSTRUCTION DE L'URL AVEC LES PARAMÈTRES
        params.append('keys', calledKeys.join(','));                                            // 'keys' est le nom du paramètre que doGet(e) attend.
        const urlWithParams = `${APPS_SCRIPT_URL}?${params.toString()}`;

        const response = await fetch(urlWithParams);                                            // 2. APPEL FETCH

        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);

        const result = await response.json();                                                   // 3. VÉRIFICATION DU STATUT DE RÉPONSE DU SERVEUR (selon la convention de Code.gs)
        if (result && result.status === 'error') throw new Error(result.message || 'Erreur définie par le serveur Apps Script.');

        successCallback(result);                                                                // 4. Succès: Exécuter le Success Handler

    } catch (error) {
        failureCallback(error);                                                                 // 5. Échec: Exécuter le Failure Handler
    }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {window.onLoad}                   ../
 * @instanceCount   1 - unique     
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initAPP
 * @description     INITIALISEUR DE L'APPLICATION
 *                  Initialise l'application et charge les données initiales soit en mode debug, 
 *                  soit via l'appel externe Apps Script (fetch). Remplace la version google.script.run (2025.12.12) 
 * -------------------------------------------------------------------------------------------- */
async function initAPP() {
    try {
        if (!isInit.updateStatus) {
            initDOM_updateStatus();                                                 // Initialise le composant de loading
            isInit.updateStatus = true;                                             // 🏁 Active le flag
        }
        
        const resultPlaceholder = { submissionID: 'test' };                         // Valeur utilisée uniquement en debug
        const calledKeys = ['submissionID', 'dd_lieux', 'dd_types'];             // Clés d'appel pour fetch côté serveur
        
        console.debug ( `🚥⬜️.initAPP... [param]result.submissionID: ${resultPlaceholder.submissionID} && calledKeys: ${calledKeys}` )
        updateStatus( { logoType: 'blanc', type: 'loading', isLdng: true, msg: `Réveil de l'IA...` } );
        
        if(debugMode === true) {
            // Mode DEBUG (pas d'appel réseau)
            console.log(`🚥✅.--End |initAPP in debugMode : ${resultPlaceholder} `); 
            updateStatus({ logoType: 'blanc', type: 'loading', isLdng: true, msg: `IA réveillée, arrivée dans votre navigateur...` });
            initDatas(resultPlaceholder); 
        } else {
            // Mode LIVE: Appel EXTERNE (fetch)
            await getInitialPageDataExternal(calledKeys);
            /* remplacé par appel ci-dessus
            google.script.run                                                                   // ☎️ APPEL SERVEUR
            .withSuccessHandler( (result) => {                                                  //SI SUCCESS CALLBACK
                console.log(`🚥✅.--End |initAPP in liveMode : ${result} `); 
                updateStatus({ logoType: 'blanc', type: 'loading', isLdng: true, msg: `IA réveillée, arrivée dans votre navigateur...` });
                initDatas(result);                                                              // => FN client si succès : traite toutes les données reçues
            } )
            .withFailureHandler( (error) => {                                                   // SI FAILURE CALLBACK
                console.error( `🚥❌.Failed |initAPP : Échec critique : ${error}` );
                updateStatus({ type: 'fail', msg: `Erreur lors du chargement des données. Veuillez réessayer.` });
            } )
            .getInitialPageData(calledKeys);                                                    // FN serveur
            */
        }

    } catch (error) {
        isInit.updateStatus = false;
        console.error( `🚥🚫.Catched |initAPP => Big error: ${error}` );
    }
}


/* ** APP LAUNCHER ******************************************************************** (🚀) ** */
console.info (`🚀=====🚀 ${DATE} 🚀=====🚀\n`);
const debugMode = false;
window.addEventListener('load', initAPP);

/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */



