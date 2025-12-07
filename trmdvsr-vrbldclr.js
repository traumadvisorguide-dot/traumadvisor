/** == DÉCLARATION DES VARIABLES ============================================================== */
let appData         = {                                               // 📘 Objet global qui récupère toutes les données du formulaire
    submissionID      : null,                                         // au lancement par handlePageData()
    submissionDate    : null,	                                      // submit eval-2-Form si pas null
    guideORexpert     : 'guided',                                     // submit indexForm 
    lieuID            : null,                                         // submit indexForm
    listeSalle        : null,                                         // pas nécessaire (lieuID prévaut)
    adresseSalle      : null,                                         // submit creationForm
    nomSalle          : null,                                         // submit creationForm
    typeEtablissement : null,                                         // submit creationForm
    noteAccessibilite : null,                                         // trmdvsr-3-eval-js/handleRatingChange | submit eval-1-Form
    noteApparence     : null,                                         // trmdvsr-3-eval-js/handleRatingChange | submit eval-1-Form
    noteAssise        : null,                                         // trmdvsr-3-eval-js/handleRatingChange | submit eval-1-Form
    noteAttention     : null,                                         // trmdvsr-3-eval-js/handleRatingChange | submit eval-1-Form
    noteAttente       : null,                                         // trmdvsr-3-eval-js/handleRatingChange | submit eval-1-Form
    bonus             : null,                                         // submit eval-1-Form
    notePure          : null,                                         // submit eval-1-Form
    dateRenvoyee      : null,
    comments          : {},                                           // NOUVEAU pour stocker les commentaires de chaque notes
    phraseAccroche    : null,                                         // submit eval-2-Form
    photoPrincipale   : null,                                         // submit eval-2-Form
    autresPhotos      : null,                                         // submit eval-2-Form
    userInstagram     : null,                                         // submit eval-2-Form
    userEmail         : null,                                         // submit eval-2-Form
    nouveauFormulaire : 'oui',                                        // passer constante à 'oui'
    submissionIP      : null,                                         // impossible via Apps Script (sandbox et droits)
    submissionURL     : null,                                         // non pertinent
    submissionEditURL : null,                                         // non pertinent
    lastUpdateDate    : null,                                         // submit eval-2-Form à chaque fois
};
/** == DÉCLARATION DES INFOS DANS LES PAGES =================================================== */ 
let pages                       = {                                                             // 'key':   {value}
    'accueil'                   : { 
        index                     : 0,                      //
        ID                        : 'accueil_page',         //
        element:                    null,                   // {element} 🛟 Ref DOM                                             /page <= initializeDOMElements()
        height:                     null,                   // {number} - Hauteur de la page de base (hors absolute)            /page <= initializeDOMElements()
        totalHeight:                null,                   // {number} - Hauteur de la page avec les sélections                /page <= calculatePageHeights()
        hasSub:                     false,                  // {boolean}
        sub:                        null,                   // {array}
        slctLxElmnt:                null,                   // {element} 🛟 Ref DOM                                             /page <= initializeDOMElements()
        tstmnlCrslElmnt:            null,                   // {element} 🛟 Ref DOM - Témoignage Carousel                       /page <= initializeDOMElements()
        tstmnlCrtElmnt:             null,                   // {element} 🛟 Ref DOM - Témoignage Carte                          /page <= initializeDOMElements()
        tstmnlScrllAmnt:            null                    // {number} - Valeur du scroll                                      /page <= initializeDOMElements()
    },
    'creation': { 
        index:                      1,                      //
        ID:                         'creation-lieu_page',   //
        element:                    null,                   //                                                                  /page <= initializeDOMElements()
        height:                     null,                   // {number} - Hauteur de la page de base (hors absolute)            /page <= initializeDOMElements()
        totalHeight:                null,                   // {number} - Hauteur de la page avec les sélections                /page <= calculatePageHeights()
        hasSub:                     false,                  // {boolean}
        sub:                        null,                   // {array}
        adressElmnt:                null                    // {string}                
    },
    'eval': {
        index: 2,                                           //
        ID:                         'evaluations_page',     //
        element:                    null,                   // {element} 🛟 Ref DOM                                             /page <= initializeDOMElements()
        height:                     null,                   // {number} - Hauteur de la page de base (hors absolute)            /page <= initializeDOMElements()
        totalHeight:                null,                   // {number} - Hauteur de la page avec les sélections                /page <= calculatePageHeights()
        currntSctnIndx:             null,                   // {integer} - Index de la section active
        sectionCount:               null,                   //
        hasSub:                     true,                   // {boolean} 
        sub: [ 
            {   ID:                 'section_q1',           // {string}                                             /section/page <= initializeDOMElements()
                type:               'notation',             // {string}
                element:            null,                   // {element} 🛟 Ref DOM SECTION                         /section/page <= initializeDOMElements()
                noteModuleElmnt:    null,                   // {element} 🛟 Ref DOM module de notation              /section/page <= initializeDOMElements()
                noteDisplayElmnt:   null,                   // {element} 🛟 Ref DOM module d'affichage              /section/page <= initializeDOMElements()
                note: { // ---------------------------- // {object} - fonctionnel ------------ //
                    key:            'noteAccessibilite',    // {string}
                    value:          null                    // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    key:            null,                   // {string} 📘 combo[xN,yO,zP]                          /section/page <= ???
                    texte:          null                    // {string} 📘 finalText peut-être modifié              /section/page <= ???
                }
            },
            {   ID:                 'section_q2',           // {string}  
                type:               'notation',             // {string}
                element:            null,                   // {element} 🛟 Ref DOM SECTION                         /section/page <= initializeDOMElements()
                noteModuleElmnt:    null,                   // {element} 🛟 Ref DOM module de notation              /section/page <= initializeDOMElements()
                noteDisplayElmnt:   null,                   // {element} 🛟 Ref DOM module d'affichage              /section/page <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    key:            'noteApparence',        // {string}
                    value:          null                    // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    key:            null,                   // {string} 📘 combo[xN,yO,zP]                          /section/page <= ???
                    texte:          null                    // {string} 📘 finalText peut-être modifié              /section/page <= ???
                }
            },
            {   ID:                 'section_q3',           // {string}  
                type:               'notation',             // {string}
                element:            null,                   // {element} 🛟 Ref DOM SECTION                         /section/page <= initializeDOMElements()
                noteModuleElmnt:    null,                   // {element} 🛟 Ref DOM module de notation              /section/page <= initializeDOMElements()
                noteDisplayElmnt:   null,                   // {element} 🛟 Ref DOM module d'affichage              /section/page <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    key:            'noteAssise',           // {string}
                    value:          null                    // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    key:            null,                   // {string} 📘 combo[xN,yO,zP]                          /section/page <= ???
                    texte:          null                    // {string} 📘 finalText peut-être modifié              /section/page <= ???
                } 
            },
            {   ID:                 'section_q4',           // {string}
                type:               'notation',             // {string}
                element:            null,                   // {element} 🛟 Ref DOM SECTION                         /section/page <= initializeDOMElements()
                noteModuleElmnt:    null,                   // {element} 🛟 Ref DOM module de notation              /section/page <= initializeDOMElements()
                noteDisplayElmnt:   null,                   // {element} 🛟 Ref DOM module d'affichage              /section/page <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    key:            'noteAttention',        // {string}
                    value:          null                    // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    key:            null,                   // {string} 📘 combo[xN,yO,zP]                          /section/page <= ???
                    texte:          null                    // {string} 📘 finalText peut-être modifié              /section/page <= ???
                }
            },
            {   ID:                 'section_q5',           // {string}       
                type:               'notation',             // {string}
                element:            null,                   // {element} 🛟 Ref DOM SECTION                         /section/page <= initializeDOMElements()
                noteModuleElmnt:    null,                   // {element} 🛟 Ref DOM module de notation              /section/page <= initializeDOMElements()
                noteDisplayElmnt:   null,                   // {element} 🛟 Ref DOM module d'affichage              /section/page <= initializeDOMElements()
                note : { // ---------------------------- // {object} - fonctionnel ------------ //
                    key:            'noteAttente',          // {string}
                    value:          null                    // {number} 📘 NOTEACCESSIBILITE
                },
                comment: { // -------------------------- // {object} - fonctionnel ------------ //
                    key:            null,                   // {string} 📘 combo[xN,yO,zP]                          /section/page <= ???
                    texte:          null                    // {string} 📘 finalText peut-être modifié              /section/page <= ???
                }
            },
            {   ID:                 'section_photo',        // {string}
                type:               'fileupload',           // {string}
                element:            null,                   // {element} 🛟 Ref DOM SECTION                         /section/page <= initializeDOMElements()

            } 
        ]    
    }
};
let loader = {
    ID                            : 'loader',               // {string}
    type                          : 'status',               // {string}
    element                       : null,                   // {element} 🛟 Ref DOM -> ./status-layer
    // ------------------------------------------------------------------------------------ //
    logoURLs                      : null,                   // {element} <= getLogoUrlsFromCSS_() pour init_updateStatus()
    // ------------------------------------------------------------------------------------ //
    animImgElmnt                  : null,                   // {element} 🛟 Ref DOM -> ./status-layer/status-box/spinner-image
    animSpnElmnt                  : null,                   // {element} 🛟 Ref DOM -> ./status-layer/status-box/spinner
    // ------------------------------------------------------------------------------------ //
    progressContainerElmnt        : null,                   // {element} 🛟 Ref DOM -> ./status-layer/status-box/progress-container
    progressBarElmnt              : null,                   // {element} 🛟 Ref DOM -> ./status-layer/status-box/progress-container/progress-bar
    progressTextElmnt             : null,                   // {element} 🛟 Ref DOM -> ./status-layer/status-box/progress-container/progress-text
    // ------------------------------------------------------------------------------------ //
    statusMessage                 : null,                   // {element} 🛟 Ref DOM -> ./status-layer/status-message (trmdvsr-sstexte)        
};
let menu                        = {
    toggleElmnt                     : null,                   // {element} 🛟 Ref DOM -> ./status-layer                        /page <= initializeDOMElements()
    iconElmnts                      : null,                   // {element} 🛟 Ref DOM -> ./status-layer                        /page <= initializeDOMElements()
    navElmnts                       : null,                   // {element} 🛟 Ref DOM -> ./status-layer                        /page <= initializeDOMElements()
};

const evaluations = {                                                  // Mappage des valeurs aux descriptions complètes        
    '5': `N'en rajoutez plus (5/5)`,
    '4': `C'est super (4/5)`,
    '3': 'Ça va (3/5)',
    '2': 'On en attend plus (2/5)',
    '1': `C'est pas top (1/5)`,
    '0': `On ne recommande pas (0/5)`,
};
/** -- GLOBAL - Variables de navigation ------------------------------------------------------- */
let curPgID           = null;                                         // ID Page affichée         
/** == DOM Element ---------------------------------------------------------------------------- */
let conteneurBODY     = null;                                                         // {element} 🛟 Ref DOM
let conteneurSPA      = null;                                         // DOMElement                             <= initializeDOMElements()
let guideModeBTN      = null;
let isInit = {                                                        // FLAGS
        updateStatus        : false,                                      //                                        <= loadPage()
        eval                : false,                                      //                                        <= initPageEval() voir si suppime
        modeGuide           : false,                                      //                                        <= initModeGuide()voir si supp
        navGlobale          : false,                                      // Listeners sur <body>                   <= initNavigationListeners()  
        allDOMLoaded        : false,                                      //                                        <= initializeDOMElements()
        mapsScriptLoaded    : false 
    };
let isTrnstng         = false;                                        // Flag de transition en cours

/**--------------------------------------------------------------------------------------------- //
 * @description   PAGE CREATION LIEU 
 * @var           {Element}    creaPgElmnts.adressElmnt   - Element du DOM pour l'adresse du nouveau lieu
 * --------------------------------------------------------------------------------------------- */
let creaPgElmnts      = {};                                           // Objet d'objets                         <= 
/**--------------------------------------------------------------------------------------------- //
 * @description   PAGE EVALUATION 
 * @var           {Element}    xxx                        - xxxx
 * --------------------------------------------------------------------------------------------- */
let humourLevel       = 4;    // (min:0; max:6)                       // Générateur Avis                        <= ?()
let draggedItem       = null;                                         // Photos Flag Drag&Drop                  <= ?()
let uploadedFiles     = [];                                           // Tableau => stocke objets File rognés   <= ?()
let previewContainer;
let fileInput;
let limitMessage;
let exportBtn;
let cropModule;                                                       // Module Crop                            <= ?()
let imageToCrop;
let cropperInstance   = null;
let currentFile       = null; 
const MAX_FILES       = 10;                                           // Nb max de fichiers à uploader
const EXPORT_SIZE     = 1080;                                         // => 1080x1080px

const DATE            = new Date();                                   //                                        <= Logger
/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================= */