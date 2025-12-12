/** ------------------------------------------------------------------------------------------- //
 * @version         25.10.09 (23:16)
 * @instanceIn      {initDatas}
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initModeGuide
 * @description     LIT ET MET À JOUR LE MODE GUIDÉ/EXPERT
 *                  Trouve tous les éléments avec .composant-aide (crochet fonctionnel), lit l'état actuel (appData.guideORexpert) et coche la bonne option.
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @param           {string}        initValue       - ['guided' || 'expert']
 * -------------------------------------------------------------------------------------------- */
function initDOM_modeGuide(initValue) {
    updateStatus({ isLdng: true, msg: `🔌.Init initModeGuide | Initialisation du mode guidé... `, logoType: 'blanc' });
    try {
        $guideModeBTN = document.querySelectorAll('.composant-aide input[type="radio"]');        // 🛟 Enregistre les boutons radios
        if (!$guideModeBTN) {
            console.error( `❌.Elsed |.initModeGuide : Les boutons guidé/expert sont introuvables.` );
            return;
        }
        synchroniserModeGuide_(initValue);                                                      // Lance synchronisation
        updateStatus({ type: 'success', logoType: 'blanc', msg: `🔌✅.--End |initModeGuide : Mode guidé mis en place`});
    
    } catch (error) { console.error(`🔌🚫.Catched |initModeGuide : [error] : ${error}` ); }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {actionDispatcher} & {initModeGuide}
 * @instanceCount   1 + 1
 * ---------------- --------------- --------------- - ---------------- ------------------------ //
 * @function        synchroniserModeGuide_
 * @description     SYNCHRONISE TOUTES LES INSTANCES DE MODE GUIDÉ/EXPERT
 *                  Parcourt toutes les instances et ajuste les btn-radios sur appData.guideORexpert
 * ---------------- --------------- --------------- - ---------------- ------------------------ //
 * @param           {string}        nwVal           - ['guided' || 'expert']
 * -------------------------------------------------------------------------------------------- */
function synchroniserModeGuide_(nwVal) {
    console.log( `🔌⬜️.Init synchroniserModeGuide_ ...[param]nwVal:${nwVal} ` );
    try {
        $guideModeBTN.forEach ( rdio => { rdio.checked = (rdio.value === nwVal); });             // Update les btns => checked ou pas
        document.body.classList.toggle('guidedMode', nwVal === 'guided');                       // Ajoute/Retire la classe
        updateSPA_Height_();                                                                    // si déjà initialisé => UpdateSPA_Height_ 
        console.log( `🔌✅.--End |synchroniserModeGuide` );

    } catch (error) { console.log( `🔌🚫.Catched |synchroniserModeGuide_ [error] : ${error} `); }
}

/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */