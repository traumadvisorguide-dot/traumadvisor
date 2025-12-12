/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {debouncedHandleResize} & {synchroniserModeGuide_} & {showPage} & {showSection} 
 * @instanceCount   4 (1 + 1+ 2  )
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
        console.debug( `⚙️⬜️Init updateSPA_Height_${trgtPg.id} [param]trgtPgID: ${trgtPgID}${trgtSecIndx != null ? ` / trgtSecIndx:${trgtSecIndx}` : ''}` ); 
        
        if (!$conteneurSPA || !trgtPg) return;                                                   // != Sécurité initiale (conteneur et page cible doivent exister)
        let trgtHght = trgtPg.$elmnt.offsetHeight;                                             // ?= Logique minimale => Page simple sans gestion relative/absolute
        
        if (trgtHght <= 0) {                                                                    // => Réinitialise le style si hauteur invalide ou nulle 
            $conteneurSPA.style.removeProperty('--hauteur-content');
            console.log( `⚙️.Run-ng |updateSPA_Height_ : Variable --hauteur-content supprimée (passage à hauteur auto).` );
            return;
        }
        $conteneurSPA.style.setProperty('--hauteur-content', `${trgtHght}px`);                   // => Définit le CSS si hauteur valide
        console.log( `⚙️✅.--End |updateSPA_Height_ : Variable CSS --hauteur-content ajustée à: ${trgtHght}px` );
    
    } catch (error) { console.error( `🚫.Catched |updateSPA_Height_ : ${error} \n ${callStack}` ) };
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initLIS_navigation}                  ../
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
        clearTimeout(timeoutId);                                                                // Fn glob: Annule le timer précédent
        timeoutId = setTimeout( () => { func.apply(context, args); }, delay );                  // Exécute SEULEMENT après fin du délai
    };
}

/** ------------------------------------------------------------------------------------------- //
 * @version         25.11.03 (15:59)
 * @instanceIn      {initUpdateStatusDOM}
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        getLogoUrlsFromCSS_
 * @description     FONCTION UTILITAIRE POUR RÉCUPÉRER LES VALEURS CSS
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @returns         {function}      bleu/blanc      > Les URLs pour le logo bleu et le logo blanc.
 * -------------------------------------------------------------------------------------------- */
function getLogoUrlsFromCSS_() {
    try {
        const rootStyles    = getComputedStyle(document.documentElement);                           // document.documentElement => Cible l'élément racine
        const actifUrlCSS   = rootStyles.getPropertyValue('--url-logo-actif').trim();               // bleu
        const blancUrlCSS   = rootStyles.getPropertyValue('--url-logo-blanc').trim();
        
        const extractUrl = (cssValue) => {                                                          // FONCTION INTERNE
        if ( !cssValue || !cssValue.startsWith('url(') ) return '';
            return cssValue.slice(4, -1).replace(/["']/g, '');                                      // Retire 'url(', ')', et les guillemets/apostrophes éventuels.
        };
        return { bleu: extractUrl(actifUrlCSS), blanc: extractUrl(blancUrlCSS) };

    } catch (error) { console.error ( `📃🚫.Catched |getLogoUrlsFromCSS_ => error: ${error}` ); }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {initDatas} & {updateSPA_Height_}               ../
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