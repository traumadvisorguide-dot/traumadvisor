/** ------------------------------------------------------------------------------------------- //
 * @version         25.11.03 (15:59)
 * @instanceIn      {initAPP}
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        init_updateStatus
 * @description     INITIALISE LE LOADER UNIFIÉ
 * -------------------------------------------------------------------------------------------- */
function initDOM_updateStatus() {
    try {
        console.debug('🚥⬜️.initUpdateStatusDOM...');
        $conteneurBODY              = document.querySelector('.trmdvsr-app-structure');
        loader.logoURLs             = getLogoUrlsFromCSS_();
        loader.$layer               = document.querySelector('.status-layer');
        if (loader.$layer) {
            loader.$statusMsg       = document.querySelector('.status-message');
            loader.$animImg         = document.querySelector('.spinner-image');
            loader.$animSpnnr       = document.querySelector('.spinner');
            loader.$progressCntnr   = document.querySelector('.progress-container'); 
            loader.$progressBar     = document.querySelector('.progress-bar');
            loader.$progressText    = document.querySelector('.progress-text');
        } else console.error(`🚥❌.initUpdateStatusDOM => Le DOM layer principal n'est pas chargé`);

        if (!loader.logoURLs.bleu || !loader.logoURLs.blanc) console.warn(`🚥⚠️.initUpdateStatusDOM => Les variables CSS --url-logo-actif ou --url-logo-blanc n'ont pas pu être lues.`);
        if (!loader.$statusMsg || !loader.$animImg || !loader.$animSpnnr || !loader.$progressCntnr || !loader.$progressBar || !loader.$progressText) console.error(`🚥❌.initUpdateStatusDOM => Les DOM updateStatus ne se sont pas chargés.`);
        console.log('🚥✅.--End |initUpdateStatusDOM...');

    } catch (error) { console.error (`🚥🚫.Catched |initUpdateStatusDOM => error: ${error}`); }
}

/** ------------------------------------------------------------------------------------------- //
 * @version         25.10.09 (23:16)
 * @instanceIn      partout
 * ---------------- --------------- ------------------- - ------------------------------------- //
 * @description     GERE LE LOADING
 *                  Gère l'affichage du statut, du spinner et de la barre de progression 
 *                  pour l'export et attache/détache le loader unique à un conteneur. 
 *                  Accepte un objet de configuration pour plus de flexibilité.
 *                  NÉCESSITE UNE INITIALISATION AVEC init_updateStatus()
 * ---------------- --------------- ------------------- - ------------------------------------- //
 * @param           {string}        [trgtElmntByClss]   - Classe du conteneur cible pour porter le loader
 * @param           {string}        [logoType]           - Type de logo à afficher ('blue' ou 'white'). Si null, le logo actuel est conservé.
 * @param           {string}        type=info           - Le type de message & anim (info / loading / success / error / warn / debug)
 * @param           {boolean}       isLdng=false        - Pour activer/désactiver les spinners et le bouton.
 * @param           {string}        [msg]               - Le texte à afficher.
 * @param           {number}        [current=0]         - Numérateur pour la progression.
 * @param           {number}        [total=0]           - Dénominateur pour la progression.
 * -------------------------------------------------------------------------------------------- */
function updateStatus( { trgtElmntByClss=null, logoType=null, type='info', isLdng=false, msg=null, current=null, total=null} ) {
    //console.debug( `📃⬜️.init updateStatus[param] ${ trgtElmntByClss !== null ? `trgtElmntByClss:${trgtElmntByClss} --|&&|-- ` : '' } logoType:${logoType} -|&|- type:${type} -|&|- msg:${msg} -|&|- isLdng:${isLdng} ${ current !== null ? ` --|&&|-- current:${current}` : '' } ${ total !== null ? `-|&|- total:${total}` : '' }` );
    try {
        // DÉFENSIF --------------------------------------------------------------------------- //
        if (!loader.$layer)         { console.error( `Initialisez avant d'appeler.`     ); return; }
        if (!loader.$progressCntnr) { console.error( `loader.$progressCntnr manquant.`  ); return; }
        if (!loader.$progressBar)   { console.error( `loader.$progressBar manquant.`    ); return; }
        if (!loader.$progressText)  { console.error( `loader.$progressText manquant.`   ); return; }
        if (!loader.$animImg)       { console.error( `loader.$animImg manquant.`        ); return; }
        if (!loader.$animSpnnr)     { console.error( `loader.$animSpnnr manquant.`      ); return; }
        if (!loader.$statusMsg)     { console.error( `loader.$statusMsg manquant.`      ); return; }
        // RESET CSS -------------------------------------------------------------------------- //
        loader.$layer.className         = 'status-layer';
        loader.$progressCntnr.className = 'progress-container';
        loader.$progressBar.className   = 'progress-bar';
        loader.$progressText.className  = 'progress-text trmdvsr-label';
        loader.$animImg.className       = 'spinner-image';
        // NETTOIE LES RÉCEPTEURS ------------------------------------------------------------- //
        const clssNm        = '.status-target';
        const elmnts2Cln    = document.querySelectorAll(`${clssNm}`);                           // Récup TOUS les éléments avec cette classe
        if (elmnts2Cln.length > 0) { 
            elmnts2Cln.forEach( e => {e.classList.remove(clssNm);} );                               // Si des éléments existent, retire classe pour chacun
            console.log(`${clssNm} supprimée de ${elmnts2Cln.length} élément(s).`); 
        } 
        trgtElmntByClss = document.querySelector(trgtElmntByClss) ?? $conteneurBODY;             // Si non spécifié => cible body
        trgtElmntByClss.classList.add(clssNm);                                                  // Prépare récepteur (assurance d'unicité)
        // DÉFINIT CSS & ATTACHE DOM ---------------------------------------------------------- //
        let refCSS      = (logoType === 'blanc') ? 'fullBlue' : 'lightWhite';                         // Définit CSS si logo blanc fond bleu
        if (loader.$layer.parentNode !== trgtElmntByClss) trgtElmntByClss.appendChild(loader.$layer);  // Attache Element au récepteur (s'il a changé)
        loader.$layer.classList.add('attached', refCSS);
        
        // LAUNCH------------------------------------------------------------------------------ //
        loader.$layer.style.display = isLdng ? 'flex' : 'none';
        if (!isLdng) return;

        // SPINNER IMAGE ---------------------------------------------------------------------- //
        if (logoType) {
            const url = loader.logoURLs[logoType];
            if(url) loader.$animImg.src = url;
            else console.warn(`Type de logo inconnu ou URL non trouvée pour ${logoType}.`);
            loader.$animImg.classList.add( `logo-${type}` );                                    // info / loading / error
        }

        // MESSAGE ---------------------------------------------------------------------------- //
        loader.$statusMsg.classList.remove('info', 'loading', 'success', 'error', 'warn', 'debug');
        loader.$statusMsg.textContent = msg; 
        loader.$statusMsg.classList.add(type); 

        // PROGRESS BAR ----------------------------------------------------------------------- // 
        if (current && total) {
            loader.$progressCntnr.classList.add(refCSS);
            loader.$progressCntnr.style.display = (total > 0) ? 'block' : 'none'; // Affiche barre progression si en charge et total sup à zéro
            loader.$progressBar.classList.add(refCSS);
            loader.$progressText.classList.add(refCSS);

            if (total > 0 && current <= total) {
                const percent = Math.round((current / total) * 100);
                loader.$progressBar.style.width = `${percent}%`;
                loader.$progressText.textContent = `${percent}% (${current}/${total} images enregistrées)`;

            } else {
                loader.$progressBar.style.width = '0%';
                loader.$progressText.textContent = '0% (0/0 images enregistrées)';
            }
        }
        //console.log( `📃✅.--End |updateStatus` );

    } catch (error) { console.error ( `📃🚫.Catched |updateStatus => error: ${error}` ); }
};

/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */