/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {loadPage}                        ../
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        processLieuCreationSubmission
 * @description     TRAITEMENT DE LA SOUMISSION DE CRÉATION DE LIEU
 *                  Valider les données du formulaire, les collecter et naviguer.
 * -------------------------------------------------------------------------------------------- */
function processLieuCreationSubmission() {
    const adresseError = pages.creation.$adressError;										// Récupère l'Element
    if (adresseError) {                                                                         // Réinitialise l'état d'erreur
        adresseError.classList.add('hidden');
        adresseError.textContent = '';
    }

    const adresseValue = pages.creation.$adress ? pages.creation.$adress.value.trim() : '';
    if (adresseValue === '') {                                                                  // 2. Validation : Le champ adresseSalle est-il vide ?
        console.error("Validation échouée : Le champ adresseSalle est vide.");
        if (adresseError) {                                                                     // Afficher le message d'erreur si l'élément existe                          
            adresseError.textContent = "Veuillez sélectionner une adresse valide (champ requis).";
            adresseError.classList.remove('hidden');
        }
        if (pages.creation.$adress) {
            pages.creation.$adress.focus();                                                 // Activer le focus sur le champ vide (Objectif du client)
            pages.creation.$adress.reportValidity();
        }
        console.error( `❌.Form |submitLieuCreation : Validation échouée.` )
        return;   
    }

    appData.adresseSalle = adresseValue;                                                        // 📘✅ Collecte des données
    appData.nomSalle = pages.creation.$nomLieu?.value || '';                                    // 📘✅ Collecte des données
    appData.typeEtablissement = pages.creation.$typeLieu?.value || '';                          // 📘✅ Collecte des données
    console.log( `✅.Form |submitLieuCreation : OK. Validation réussie. Données collectées: ${appData}` );
    showPage('evaluations_page');                                   							// Passer à la page d'évaluation
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      <html> <head> callback
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        googleMapsCallback
 * @description     INITIALISE L'AUTOCOMPLETION GOOGLE MAPS
 *                  Appelée par le script Google Maps après son chargement, appelle en cascade tryToInitAutoComplete
 *                  qui lancera le initAutocomplete si tout est pret.
 * -------------------------------------------------------------------------------------------- */
function googleMapsCallback() {
    isInit.mapsScriptLoaded = true;                                                             // 🚩 Le script Maps est prêt, nous levons le deuxième drapeau
    tryToInitAutocomplete();                                                                    // Tentative d'initialisation (si le DOM est déjà prêt)
}

/** ------------------------------------------------------------------------------------------- //
 * @version         25.10.09 (23:16)
 * @instanceIn      {initializeDOMElements} {googleMapsCallback}       ../
 * @instanceCount   2
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        tryToInitAutocomplete
 * @description     VÉRIFIE SI TOUT EST PRÊT POUR LANCER L'AUTOCOMPLETION
 *                  Permet de démembrer la fonction initiale initAutocomplete, lancé par initalizeDOMElements et googleMapsCallback
 * -------------------------------------------------------------------------------------------- */
function tryToInitAutocomplete() {
    if (isInit.allDOMLoaded && isInit.mapsScriptLoaded) {
        console.log( `Synchronisation : DOM et Maps chargés. Initialisation de l'autocomplétion.` );
        initAutocomplete();
    } else {
        console.log( `Attente de chargement : DOM prêt=${isInit.allDOMLoaded}, Maps prêt=${isInit.mapsScriptLoaded}` );
    }
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      tryToInitAutocomplete
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        initAutocomplete
 * @description     INITIALISE L'AUTOCOMPLETION GOOGLE MAPS
 * -------------------------------------------------------------------------------------------- */
function initAutocomplete() {
    if (!pages.creation.$adress) {
        console.error("Erreur critique : Le champ d'adresse n'a pas été trouvé lors de l'initialisation Maps.");
        return;
    }

    const autocomplete = new google.maps.places.Autocomplete(pages.creation.$adress, {      // Initialiser service autocomplétion sur le champ d'entrée.
        types: ['geocode'],                                                                     // Restreindre recherche > 'geocode' suffisant pour adresses
        componentRestrictions: { country: ["fr", "be", "ch"] },                                 // Restreindre les pays
    });

    autocomplete.addListener( 'place_changed', () => {                                          // Seul listener indépendant => Écoute sélection de l'utilisateur
        const place = autocomplete.getPlace();                                                  // 'place_changed' <= quand utilisateur sélectionne une suggestion

        if (!place.geometry) {
            console.log(`Détails d'adresse non trouvés pour l'entrée: ${place.name}`);          // L'utilisateur a entré une adresse mais n'a pas sélectionné de suggestion
            return;
        }

        console.log(`Adresse complète: ${place.formatted_address}`);                            // Utiliser les données de l'adresse sélectionnée
        extractAddressComponents(place);                                                        // Extraire infos spécif. (rue, ville, CP) via place.address_components
    } );
} 

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      initAutocomplete
 * @instanceCount   1 - unique
 * ---------------- --------------- --------------- - ----------------------------------------- //
 * @function        extractAddressComponents
 * @description     EXTRAIT LES COMPOSANTS - Facultatif
 * -------------------------------------------------------------------------------------------- */
function extractAddressComponents(place) {
    let street = '';
    let city = '';
    let postalCode = '';

    for (const component of place.address_components) {
        const type = component.types[0];
        if (type === 'street_number') {
            street = component.long_name;

        } else if (type === 'route') {
            street = (street ? street + ' ' : '') + component.long_name;                        // Concaténer le numéro de rue et le nom de la rue

        } else if (type === 'locality') {
            city = component.long_name;

        } else if (type === 'postal_code') {
            postalCode = component.long_name;
        }
    }
    console.log(`--end.extractAddressComponents => Rue/Numéro: ${street} | Ville: ${city} | Code Postal: ${postalCode}`);
    const fullAddress = `${street}. ${city}. ${postalCode}`;
    appData.adresseSalle = fullAddress;                                                         // 📘✅
    // google.script.run.processAddress({ street: street, city: city, postalCode: postalCode }); <= envoie pas immédiat
}

/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.12.08 (15:29)
 * ============================================================================================ */