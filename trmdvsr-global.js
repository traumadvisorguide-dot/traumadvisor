/* == DÉCLARATION DES VARIABLES =============================================================== */
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
/** @description     ARCHITECTURE D'INFOS POUR LES PAGES (celles enregistrées dynamiquement)
 * -------- ----------- ----------------------- - ------------------------------------------ //
 * @var     {element}   element                 - Élement du DOM                                            /page <= initializeDOMElements()
 * @var     {number}    height                  - Hauteur                                                   /page <= initializeDOMElements()
 * @var     {integer}   currentSectionIndex     - Index section active                                      /page <= initializeDOMElements()
 * @var     {integer}   sectionCount            - Nombre de sections                                        /page <= initializeDOMElements()
 * @var     {array}     sub                     - Tableau des sections                                      /page <= initializeDOMElements()
 * @var     {element}   sub.element             - Élement du DOM                                    /section/page <= initializeDOMElements()
 * @var     {array}     sub.index               - Index section                                     /section/page <= initializeDOMElements()
 * @var     {number}    sub.height              - Hauteur section                                   /section/page <= calculatePageHeights()
 * @var     {number}    totalHeight             - Hauteur maximale de page                                  /page <= calculatePageHeights()
 * @var     {number}    sub.note                - Note donnée                                       /section/page <= ???
 * @var     {element}   sub.noteModuleElmnt     - Élement du DOM                                    /section/page <= ???
 * @var     {element}   sub.noteDisplayElmnt    - Élement du DOM                                    /section/page <= ???
 * @var     {object}    sub.comment             - Objet commentaire                                 /section/page <= ???
 * @var     {number}    sub.comment.ID          - Identifiant du commentaire                        /section/page <= ???
 * @var     {string}    sub.comment.texte       - Commentaire en texte                              /section/page <= ???
 * --------------------------------------------------------------------------------------------- */
let pages = {                                                         // 'key':   {value}
    'accueil':  { index: 0,   id: 'accueil_page',       label: 'Accueil',       hasSub: false, sub: null }, 
    'creation': { index: 1,   id: 'creation-lieu_page', label: 'Création Lieu', hasSub: false, sub: null },
    'eval':     { index: 2,   id: 'evaluations_page',   label: 'eval',   hasSub: true,  sub: [ 
                            { id: 'section_q1',         label: 'Accessibilite', needsAsyncValidation: false }, //   <= 🛟DOM{ Elmnts } + 📘{ Note + Comment (init[x,y,z] + finalText) }
                            { id: 'section_q2',         label: 'Apparence',     needsAsyncValidation: false }, 
                            { id: 'section_q3',         label: 'Assise',        needsAsyncValidation: false },
                            { id: 'section_q4',         label: 'Attention',     needsAsyncValidation: false },
                            { id: 'section_q5',         label: 'Attente',       needsAsyncValidation: false },
                            { id: 'section_photo',      label: 'Photo',         needsAsyncValidation: true  }
                          ]}
};
const DOM_Elements = {
    'loader':   { container: null, currentContainer: null, animContainer: { Elmnt:null, animIMG: null, animSpinner: null }, progressContainer: null, progressText: null, progressBar: null},
    'accueil':  { index: null}
}
const evaluations = {                                                  // Mappage des valeurs aux descriptions complètes
    '5': `N'en rajoutez plus (5/5)`,
    '4': `C'est super (4/5)`,
    '3': 'Ça va (3/5)',
    '2': 'On en attend plus (2/5)',
    '1': `C'est pas top (1/5)`,
    '0': `On ne recommande pas (0/5)`,
};
/** GLOBAL - Variables de navigation ----------------------------------------------------------- */
let curPgID           = null;                                         // ID Page affichée                       <= showPage()
let conteneurSPA      = null;                                         // DOMElement                             <= initializeDOMElements()
let guideModeBTN      = null;
let menuElements = {                                                  //                                        <= initializeDOMElements()
    burgerElement       : null,
    burgerIconElements  : null, 
    navElement          : null 
};
let isInit = {                                                        // FLAGS
    updateStatus        : false,                                      //                                        <= loadPage()
    eval                : false,                                      //                                        <= initPageEval() voir si suppime
    modeGuide           : false,                                      //                                        <= initModeGuide()voir si supp
    navGlobale          : false,                                      // Listeners sur <body>                   <= initNavigationListeners()  
    allDOMLoaded        : false,                                      //                                        <= initializeDOMElements()
    mapsScriptLoaded    : false 
};
let isTrnstng         = false;                                        // Flag de transition en cours
/** GLOBAL - Variables du loader unique => évite les querySelector répétés --------------------- */
let snglLgElmnt       = null;                                         // LOADER                                 <= init_updateStatus()
let curLgElmnt        = null;                                         //                                        <= updateStatus()
let lggrElmnt         = null;                                         //                                        <= init_updateStatus()
let imgLgElmnt        = null;                                         //                                        <= init_updateStatus()
let spnrLgElmnt       = null;                                         //                                        <= init_updateStatus()
let prgrssGrpLgElmnt  = null;                                         //                                        <= init_updateStatus()
let prgrssBrLgElmnt   = null;                                         //                                        <= init_updateStatus()
let prgrssTxtLgElmnt  = null;                                         //                                        <= init_updateStatus()

let selectLieuxElmnt  = null;           
let tstmnlCrslElmnt   = null;                                         // Témoignage Carousel                    <= initializeDOMElements()
let tstmnlCrtElmnt    = null;                                         // Témoignage Carte                       <= initializeDOMElements()
let tstmnlScrllAmnt   = null;                                         // Valeur du scroll                       <= initializeDOMElements()

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
let   LOGO_URLS       = null;                                         //                                        <= getLogoUrlsFromCSS_()
const DATE            = new Date();                                   //                                        <= Logger
/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================= */
