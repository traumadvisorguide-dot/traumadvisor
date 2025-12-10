/** == 📘 OBJET ATTENDU PAR LE SERVER 📘 ====================================================== */
let appData = {
    submissionID:                   null,                                                       // au lancement par handlePageData()
    submissionDate:                 null,	                                                    // submit eval-2-Form si pas null
    guideORexpert:                  'guided',                                                   // submit indexForm 
    lieuID:                         null,                                                       // submit indexForm
    listeSalle:                     null,                                                       // pas nécessaire (lieuID prévaut)
    adresseSalle:                   null,                                                       // => extractAddressComponents
    nomSalle:                       null,                                                       // submit creationForm
    typeEtablissement:              null,                                                       // submit creationForm
    noteAccessibilite:              null,                                                       // trmdvsr-3-eval-js/handleRatingChange | submit eval-1-Form
    noteApparence:                  null,                                                       // trmdvsr-3-eval-js/handleRatingChange | submit eval-1-Form
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
/** == OBJET LOADER =========================================================================== */
let loader = {
    ID:                             'loader',                                                   // {string}
    typ:                            'status',                                                   // {string}
    element:                        null,                                                       // {element} 🛟 Ref DOM -> ./status-layer
    // ---------------------------------------------------------------------------------------- //
    logoURLs:                       null,                                                       // {element} <= getLogoUrlsFromCSS_() pour init_updateStatus()
    // ---------------------------------------------------------------------------------------- //
    animImgElmnt:                   null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-box/spinner-image
    animSpnElmnt:                   null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-box/spinner
    // ---------------------------------------------------------------------------------------- //
    progressContainerElmnt:         null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-box/progress-container
    progressBarElmnt:               null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-box/progress-container/progress-bar
    progressTextElmnt:              null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-box/progress-container/progress-text
    // ---------------------------------------------------------------------------------------- //
    statusMessage                 : null,                                                       // {element} 🛟 Ref DOM -> ./status-layer/status-message (trmdvsr-sstexte)        
};
/** == OBJET MENU ============================================================================= */
let menu = {
    toggleElmnt:                    null,                                                       // {element} 🛟 Ref DOM -> ./status-layer               /page   <= initializeDOMElements()
    iconElmnts:                     null,                                                       // {element} 🛟 Ref DOM -> ./status-layer               /page   <= initializeDOMElements()
    navElmnts:                      null,                                                       // {element} 🛟 Ref DOM -> ./status-layer               /page   <= initializeDOMElements()
};
/** == OBJET PAGES ============================================================================ */
let pages = {
    'accueil': { 
        index:                      0,
        ID:                         'accueil_page',
        element:                    null,                                                       // {element} 🛟 Ref DOM                                 /page   <= initializeDOMElements()
        height:                     null,                                                       // {number} - Hauteur page hors <section>               /page   <= initializeDOMElements()
        totalHeight:                null,                                                       // {number} - Hauteur page avec <section>               /page   <= calculatePageHeights()
        hasSub:                     false,                                                      // {boolean}
        sub:                        null,                                                       // {array}
        //
        slctLxElmnt:                null,                                                       // {element} 🛟 Ref DOM                                 /page   <= initializeDOMElements()
        lxList:                     null,                                                       // {NodeList}                                                   <= initializeDOMElements()
        tstmnlCrslElmnt:            null,                                                       // {element} 🛟 Ref DOM - Témoignage Carousel           /page   <= initializeDOMElements()
        tstmnlCrtElmnt:             null,                                                       // {element} 🛟 Ref DOM - Témoignage Carte              /page   <= initializeDOMElements()
        tstmnlScrllAmnt:            null                                                        // {number} - Valeur du scroll                          /page   <= initializeDOMElements()
    },
    /** -- OBJETS PAGES ----------------------------------------------------------------------- */
    'creation': {
        index:                      1,
        ID:                         'creation-lieu_page',
        element:                    null,                                                       // {element} 🛟 Ref DOM                                 /page   <= initializeDOMElements()
        height:                     null,                                                       // {number} - Hauteur page hors <section>               /page   <= initializeDOMElements()
        totalHeight:                null,                                                       // {number} - Hauteur page avec <section>               /page   <= calculatePageHeights()
        hasSub:                     false,                                                      // {boolean}
        sub:                        null,                                                       // {array}
        //
        adressElmnt:                null,                                                       // {element} 🛟 Ref DOM                                         <= initializeDOMElements()
        adressErrorElmnt:           null,                                                       // {element} 🛟 Ref DOM
        nomElmnt:                   null,                                                       // {element} 🛟 Ref DOM                                         <= initializeDOMElements()
        typeElmnt:                  null,                                                       // {element} 🛟 Ref DOM                                         <= initializeDOMElements()
        typeList:                   null                                                        // {NodeList}                                                   <= initializeDOMElements()
    },
    'eval': {
        index:                      2,                                                          //
        ID:                         'evaluations_page',                                         //
        element:                    null,                                                       // {element} 🛟 Ref DOM                                 /page   <= initializeDOMElements()
        height:                     null,                                                       // {number} - Hauteur page hors <section>               /page   <= initializeDOMElements()
        totalHeight:                null,                                                       // {number} - Hauteur page avec <section>               /page   <= calculatePageHeights()
        //
        brdcrmbElmnts:              null,                                                       // {nodelist} - menu des sections
        crslvwprt:                  null,                                                       // {element} - carousel viewport
        crsltrck:                   null,                                                       // {element} - carousel track avec les sub alignées
        curSecIndx:                 null,                                                       // {integer} - Index de la section active
        sectionCount:               null,                                                       //
        hasSub:                     true,                                                       // {boolean} 
        sub: [ 
            {   ID:                 'section_q1',                                               // {string}                                     /section/page   <= initializeDOMElements()
                type:               'notation',                                                 // {string}
                element:            null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()
                noteModuleElmnt:    null,                                                       // {element} 🛟 Ref DOM module de notation      /section/page   <= initializeDOMElements()
                noteDisplayElmnt:   null,                                                       // {element} 🛟 Ref DOM module d'affichage      /section/page   <= initializeDOMElements()
                note: { // ----------------------------- // {object} - fonctionnel ------------ //
                    tag:            'noteAccessibilite',                                        // {string}
                    amount:         null                                                        // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    trmdvsrKey:     null,                                                       // {string} 📘 combo[xN,yO,zP]                  /section/page   <= ???
                    texte:          null                                                        // {string} 📘 finalText peut-être modifié      /section/page   <= ???
                }
            },
            {   ID:                 'section_q2',                                               // {string}  
                type:               'notation',                                                 // {string}
                element:            null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()
                noteModuleElmnt:    null,                                                       // {element} 🛟 Ref DOM module de notation      /section/page   <= initializeDOMElements()
                noteDisplayElmnt:   null,                                                       // {element} 🛟 Ref DOM module d'affichage      /section/page   <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    tag:            'noteApparence',                                            // {string}
                    amount:         null                                                        // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    trmdvsrKey:     null,                                                       // {string} 📘 combo[xN,yO,zP]                  /section/page   <= ???
                    texte:          null                                                        // {string} 📘 finalText peut-être modifié      /section/page   <= ???
                }
            },
            {   ID:                 'section_q3',                                               // {string}  
                type:               'notation',                                                 // {string}
                element:            null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()
                noteModuleElmnt:    null,                                                       // {element} 🛟 Ref DOM module de notation      /section/page   <= initializeDOMElements()
                noteDisplayElmnt:   null,                                                       // {element} 🛟 Ref DOM module d'affichage      /section/page   <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    tag:            'noteAssise',                                               // {string}
                    amount:         null                                                        // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    trmdvsrKey:     null,                                                       // {string} 📘 combo[xN,yO,zP]                  /section/page   <= ???
                    texte:          null                                                        // {string} 📘 finalText peut-être modifié      /section/page   <= ???
                } 
            },
            {   ID:                 'section_q4',                                               // {string}
                type:               'notation',                                                 // {string}
                element:            null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()
                noteModuleElmnt:    null,                                                       // {element} 🛟 Ref DOM module de notation      /section/page   <= initializeDOMElements()
                noteDisplayElmnt:   null,                                                       // {element} 🛟 Ref DOM module d'affichage      /section/page   <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    tag:            'noteAttention',                                            // {string}
                    amount:         null                                                        // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    trmdvsrKey:     null,                                                       // {string} 📘 combo[xN,yO,zP]                  /section/page   <= ???
                    texte:          null                                                        // {string} 📘 finalText peut-être modifié      /section/page   <= ???
                }
            },
            {   ID:                 'section_q5',                                               // {string}       
                type:               'notation',                                                 // {string}
                element:            null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()
                noteModuleElmnt:    null,                                                       // {element} 🛟 Ref DOM module de notation      /section/page   <= initializeDOMElements()
                noteDisplayElmnt:   null,                                                       // {element} 🛟 Ref DOM module d'affichage      /section/page   <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    tag:            'noteAttente',                                              // {string}
                    amount:         null                                                        // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    trmdvsrKey:     null,                                                       // {string} 📘 combo[xN,yO,zP]                  /section/page   <= ???
                    texte:          null                                                        // {string} 📘 finalText peut-être modifié      /section/page   <= ???
                }
            },
            {   ID:                 'section_photo',                                            // {string}
                type:               'fileupload',                                               // {string}
                element:            null,                                                       // {element} 🛟 Ref DOM SECTION                 /section/page   <= initializeDOMElements()

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
/** == DOM Element ---------------------------------------------------------------------------- */
let conteneurBODY =                 null;                                                       // {element} Conteneur global
let conteneurSPA =                  null;                                                       // {element} Conteneur principal                                <= initializeDOMElements()
let guideModeBTN =                  null;                                                       // {element} Composant
/** == FLAGS ---------------------------------------------------------------------------------- */
let isInit = {
    updateStatus:                   false,                                                      // Assure unicité                                               <= initAPP()
    modeGuide:                      false,                                                      // Assure unicité                                               <= handlePageData()
    navGlobale:                     false,                                                      // Assure unicité - Listeners sur <body>                        <= handlePageData()  
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

/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */