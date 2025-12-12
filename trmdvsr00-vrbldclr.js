let appData = { /** == 📘 OBJET ATTENDU PAR LE SERVER 📘 ====================================== */
    submissionID:                   null,                                                       // au lancement par initDatas()
    submissionDate:                 null,	                                                    // submit eval-2-Form si pas null
    guideORexpert:                  'guided',                                                   // submit indexForm 
    lieuID:                         null,                                                       // submit indexForm
    listeSalle:                     null,                                                       // pas nécessaire (lieuID prévaut)
    adresseSalle:                   null,                                                       // => extractAddressComponents
    nomSalle:                       null,                                                       // submit creationForm
    typeEtablissement:              null,                                                       // submit creationForm
    noteAccessibilite:              null,                                                       // => handleRatingChange | submit eval-1-Form
    noteApparence:                  null,                                                       // => handleRatingChange | submit eval-1-Form
    noteAssise:                     null,                                                       // trmdvsr-3-eval-js/handleRatingChange | submit eval-1-Form
    noteAttention:                  null,                                                       // trmdvsr-3-eval-js/handleRatingChange | submit eval-1-Form
    noteAttente:                    null,                                                       // trmdvsr-3-eval-js/handleRatingChange | submit eval-1-Form
    bonus:                          null,                                                       // submit eval-1-Form
    notePure:                       null,                                                       // submit eval-1-Form
    dateRenvoyee:                   null,
    comments:                       {},                                                         // NOUVEAU pour stocker les commentaires de chaque notes
    phraseAccroche:                 null,                                                       // submit eval-2-Form
    photoPrincipale:                null,                                                       // submit eval-2-Form
    autresPhotos:                   null,                                                       // submit eval-2-Form
    userInstagram:                  null,                                                       // submit eval-2-Form
    userEmail:                      null,                                                       // submit eval-2-Form
    nouveauFormulaire:              'oui',                                                      // passer constante à 'oui'
    submissionIP:                   null,                                                       // impossible via Apps Script (sandbox et droits)
    submissionURL:                  null,                                                       // non pertinent
    submissionEditURL:              null,                                                       // non pertinent
    lastUpdateDate:                 null,                                                       // submit eval-2-Form à chaque fois
};
let loader = { /** == OBJET LOADER ============================================================ */
    $layer:                         null,                                                       // {element} 🛟 Ref DOM -> ./status-layer
    logoURLs:                       null,                                                       // {element} <= getLogoUrlsFromCSS_() pour init_updateStatus()
    $animImg:                       null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-box/spinner-image
    $animSpnnr:                     null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-box/spinner
    $progressCntnr:                 null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-box/progress-container
    $progressBar:                   null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-box/progress-container/progress-bar
    $progressText:                  null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-box/progress-container/progress-text
    $statusMsg:                     null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-message (trmdvsr-sstexte)        
};
let menu = { /** == OBJET MENU ================================================================ */
    $lineIcons:                     null,                                                       // {element} 🛟 Ref DOM -> ./status-layer               /page   <= initializeDOMElements()
    $navItems:                      null,                                                       // {element} 🛟 Ref DOM -> ./status-layer               /page   <= initializeDOMElements()
};

let pages = { /** == OBJET PAGES ============================================================== */
    'accueil': { 
        index:                      0,
        ID:                         'accueil_page',
        $elmnt:                     null,                                                       // {element} 🛟 Ref DOM                                 /page   <= initializeDOMElements()
        height:                     null,                                                       // {number} - Hauteur page hors <section>               /page   <= initializeDOMElements()
        totalHeight:                null,                                                       // {number} - Hauteur page avec <section>               /page   <= calculatePageHeights()
        hasSub:                     false,                                                      // {boolean}
        sub:                        null,                                                       // {array}
        //
        $slctLx:                    null,                                                       // {element} 🛟 Ref DOM                                 /page   <= initializeDOMElements()
        $tstmnlCrsl:                null,                                                       // {element} 🛟 Ref DOM - Témoignage Carousel           /page   <= initializeDOMElements()
        $tstmnlCrt:                 null,                                                       // {element} 🛟 Ref DOM - Témoignage Carte              /page   <= initializeDOMElements()
        tstmnlScrllAmnt:            null                                                        // {number} - Valeur du scroll                          /page   <= initializeDOMElements()
    },
    /** -- OBJETS PAGES ----------------------------------------------------------------------- */
    'creation': {
        index:                      1,
        ID:                         'creation-lieu_page',
        $elmnt:                     null,                                                       // {element} 🛟 Ref DOM                                 /page   <= initializeDOMElements()
        height:                     null,                                                       // {number} - Hauteur page hors <section>               /page   <= initializeDOMElements()
        totalHeight:                null,                                                       // {number} - Hauteur page avec <section>               /page   <= calculatePageHeights()
        hasSub:                     false,                                                      // {boolean}
        sub:                        null,                                                       // {array}
        //
        $adress:                    null,                                                       // {element} 🛟 Ref DOM                                         <= initializeDOMElements()
        $adressError:               null,                                                       // {element} 🛟 Ref DOM
        $nomLieu:                   null,                                                       // {element} 🛟 Ref DOM                                         <= initializeDOMElements()
        $typeLieu:                  null,                                                       // {element} 🛟 Ref DOM                                         <= initializeDOMElements()
    },
    'eval': {
        index:                      2,                                                          //
        ID:                         'evaluations_page',                                         //
        $elmnt:                     null,                                                       // {element} 🛟 Ref DOM                                 /page   <= initializeDOMElements()
        height:                     null,                                                       // {number} - Hauteur page hors <section>               /page   <= initializeDOMElements()
        totalHeight:                null,                                                       // {number} - Hauteur page avec <section>               /page   <= calculatePageHeights()
        //
        $brdcrmbs:                  null,                                                       // {nodelist} - menu des sections
        curSecIndx:                 null,                                                       // {integer} - Index de la section active
        sectionCount:               null,                                                       //
        hasSub:                     true,                                                       // {boolean} 
        sub: [ 
            {   ID:                 'section_q1',                                               // {string}                                     /section/page   <= initializeDOMElements()
                type:               'notation',                                                 // {string}
                $elmnt:             null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()
                note: { // ----------------------------- // {object} - fonctionnel ------------ //
                    tag:            'noteAccessibilite',                                        // {string}
                    amount:         null                                                        // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    trmdvsrKey:     null,                                                       // {string} 📘 combo[xN,yO,zP]                  /section/page   <= ???
                    texte:          null                                                        // {string} 📘 finalText peut-être modifié      /section/page   <= ???
                },
                $noteDisplay:       null,                                                       // {element} 🛟 Ref DOM module d'affichage      /section/page   <= initializeDOMElements()
                $convLog:           null,                                                       // {element} 🛟 Ref DOM conteneur conv log      /section/page   <= initializeDOMElements()
                $editArea:          null,                                                       // {element} 🛟 Ref DOM $editArea           /section/page   <= initializeDOMElements()
                $actMdCntnr:        null,                                                       // {element} 🛟 Ref DOM conteneur mode acti     /section/page   <= initializeDOMElements()
                $eMdCntnr:          null,                                                       // {element} 🛟 Ref DOM conteneur mode édit     /section/page   <= initializeDOMElements()
            },
            {   ID:                 'section_q2',                                               // {string}  
                type:               'notation',                                                 // {string}
                $elmnt:             null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    tag:            'noteApparence',                                            // {string}
                    amount:         null                                                        // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    trmdvsrKey:     null,                                                       // {string} 📘 combo[xN,yO,zP]                  /section/page   <= ???
                    texte:          null                                                        // {string} 📘 finalText peut-être modifié      /section/page   <= ???
                },
                $noteDisplay:       null,                                                       // {element} 🛟 Ref DOM module d'affichage      /section/page   <= initializeDOMElements()
                $convLog:           null,                                                       // {element} 🛟 Ref DOM conteneur conv log      /section/page   <= initializeDOMElements()
                $editArea:          null,                                                       // {element} 🛟 Ref DOM $editArea           /section/page   <= initializeDOMElements()
                $actMdCntnr:        null,                                                       // {element} 🛟 Ref DOM conteneur mode acti     /section/page   <= initializeDOMElements()
                $eMdCntnr:          null,                                                       // {element} 🛟 Ref DOM conteneur mode édit     /section/page   <= initializeDOMElements()
            },
            {   ID:                 'section_q3',                                               // {string}  
                type:               'notation',                                                 // {string}
                $elmnt:             null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    tag:            'noteAssise',                                               // {string}
                    amount:         null                                                        // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    trmdvsrKey:     null,                                                       // {string} 📘 combo[xN,yO,zP]                  /section/page   <= ???
                    texte:          null                                                        // {string} 📘 finalText peut-être modifié      /section/page   <= ???
                },
                $noteDisplay:       null,                                                       // {element} 🛟 Ref DOM module d'affichage      /section/page   <= initializeDOMElements()
                $convLog:           null,                                                       // {element} 🛟 Ref DOM conteneur conv log      /section/page   <= initializeDOMElements()
                $editArea:          null,                                                       // {element} 🛟 Ref DOM $editArea           /section/page   <= initializeDOMElements()
                $actMdCntnr:        null,                                                       // {element} 🛟 Ref DOM conteneur mode acti     /section/page   <= initializeDOMElements()
                $eMdCntnr:          null,                                                       // {element} 🛟 Ref DOM conteneur mode édit     /section/page   <= initializeDOMElements()
            },
            {   ID:                 'section_q4',                                               // {string}
                type:               'notation',                                                 // {string}
                $elmnt:             null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    tag:            'noteAttention',                                            // {string}
                    amount:         null                                                        // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    trmdvsrKey:     null,                                                       // {string} 📘 combo[xN,yO,zP]                  /section/page   <= ???
                    texte:          null                                                        // {string} 📘 finalText peut-être modifié      /section/page   <= ???
                },
                $noteDisplay:       null,                                                       // {element} 🛟 Ref DOM module d'affichage      /section/page   <= initializeDOMElements()
                $convLog:           null,                                                       // {element} 🛟 Ref DOM conteneur conv log      /section/page   <= initializeDOMElements()
                $editArea:          null,                                                       // {element} 🛟 Ref DOM $editArea           /section/page   <= initializeDOMElements()
                $actMdCntnr:        null,                                                       // {element} 🛟 Ref DOM conteneur mode acti     /section/page   <= initializeDOMElements()
                $eMdCntnr:          null,                                                       // {element} 🛟 Ref DOM conteneur mode édit     /section/page   <= initializeDOMElements()
            },
            {   ID:                 'section_q5',                                               // {string}       
                type:               'notation',                                                 // {string}
                $elmnt:             null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    tag:            'noteAttente',                                              // {string}
                    amount:         null                                                        // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    trmdvsrKey:     null,                                                       // {string} 📘 combo[xN,yO,zP]                  /section/page   <= ???
                    texte:          null                                                        // {string} 📘 finalText peut-être modifié      /section/page   <= ???
                },
                $noteDisplay:       null,                                                       // {element} 🛟 Ref DOM module d'affichage      /section/page   <= initializeDOMElements()
                $convLog:           null,                                                       // {element} 🛟 Ref DOM conteneur conv log      /section/page   <= initializeDOMElements()
                $editArea:          null,                                                       // {element} 🛟 Ref DOM $editArea           /section/page   <= initializeDOMElements()
                $actMdCntnr:        null,                                                       // {element} 🛟 Ref DOM conteneur mode acti     /section/page   <= initializeDOMElements()
                $eMdCntnr:          null,                                                       // {element} 🛟 Ref DOM conteneur mode édit     /section/page   <= initializeDOMElements()
            },
            {   ID:                 'section_photo',                                            // {string}
                type:               'fileupload',                                               // {string}
                $elmnt:             null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()

            } 
        ]    
    }
};
const evaluations = {                                                                           // Mappage des valeurs aux descriptions complètes        
    '5': `N'en rajoutez plus (5/5)`,
    '4': `C'est super (4/5)`,
    '3': 'Ça va (3/5)',
    '2': 'On en attend plus (2/5)',
    '1': `C'est pas top (1/5)`,
    '0': `On ne recommande pas (0/5)`,
};
/** -- GLOBAL - Variables de navigation ------------------------------------------------------- */
let curPgID =                       null;                                                       // ID Page affichée
let curScID =                       null;                                                       // ID Section affichée
/** == DOM Element ---------------------------------------------------------------------------- */
let $conteneurBODY =                 null;                                                       // {element} Conteneur global
let $conteneurSPA =                  null;                                                       // {element} Conteneur principal                                <= initializeDOMElements()
let $guideModeBTN =                  null;                                                       // {element} Composant
/** == FLAGS ---------------------------------------------------------------------------------- */
let isInit = {
    updateStatus:                   false,                                                      // Assure unicité                                               <= initAPP()
    modeGuide:                      false,                                                      // Assure unicité                                               <= initDatas()
    navGlobale:                     false,                                                      // Assure unicité - Listeners sur <body>                        <= initDatas()  
    allDOMLoaded:                   false,                                                      // 🚩 activé - flag croisé avec mapsScriptLoaded                <= initializeDOMElements()
    mapsScriptLoaded:               false,                                                      // 🚩 activé - flag croisé avec allDOMLoaded                    <= googleMapsCallback()
    trnstng:                        false                                                       // Flag de transition en cours
};                                             
/** == DRAG N DROP COMPOSANT ------------------------------------------------------------------ */
let draggedItem =                   null;                                                       // Photos Flag Drag&Drop                                        <= ?()
let uploadedFiles =                 [];                                                         // Tableau => stocke objets File rognés                         <= ?()
let previewContainer;
let fileInput;
let limitMessage;
let exportBtn;
let cropModule;                                                                                 // Module Crop                                                  <= ?()
let imageToCrop;
let cropperInstance =               null;
let currentFile =                   null; 
/** == CONFIG ================================================================================= */
const MAX_FILES =                   10;                                                         // Nb max de fichiers à uploader
const EXPORT_SIZE =                 1080;                                                       // => 1080x1080px
let humourLevel =                   4;                                                          // Générateur Avis (min:0; max:6)                               <= ?()
const DATE =                        new Date();                                                 //                                                              <= Logger
const APPS_SCRIPT_URL =             'https://script.google.com/macros/s/AKfycbyR99Aku6J8xXGWU_c5UHusdYP_--ZT0ndaLSf8PO0P_6b8cZvm1bh5vNUClcoDizdJTQ/exec';

/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */