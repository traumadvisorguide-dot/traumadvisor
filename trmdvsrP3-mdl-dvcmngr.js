// Texte initial (simulant la réponse de votre serveur/API)
const initialProposal = "Ceci est la première proposition de texte générée par l'application. Elle est conçue pour être concise et professionnelle. Vous pouvez maintenant choisir de la modifier pour lui ajouter de l'humour, l'enlever, ou réécrire le contenu entier.";
let currentText = initialProposal;

/**-------------------------------------------------------------------------------------------- //
 * @instanceIn    {initRatings}     ../trmdvsr-03-launch-js
 * -------------- ----------------- ----------------- - --------------------------------------- //
 * @function      regenerateComment
 * @description   LANCE UNE NOUVELLE GÉNÉRATION D'AVIS
 *                Fonction globale appelée par les boutons "Regénérer". Elle relance la génération du commentaire pour une question spécifique. 
 *                Les boutons ne doivent être activés qu'après la génération d'un premier commentaire
 * -------------- ----------------- ----------------- - --------------------------------------- //
 * @param         {string}          questionKey       - L'ID court de la question (ex: 'q1').
 * @param         {string}          humorAction       - L'action à effectuer: humorAdd / humorRed
 * @param         {string}          dataKey           - La clé à utiliser dans appData.evaluation.ratings (Ex: 'noteAccessibilite').
 * -------------------------------------------------------------------------------------------- */
function regenerateComment(questionKey, humorAction, dataKey) {
      const radioGroupName = `eval-${questionKey}`;                   // Le nom du groupe radio est construit (ex: 'eval-q1')
      const selectedRadio = document.querySelector(`input[name="${radioGroupName}"]:checked`);
      
      adjustHumorLevel(humorAction, questionKey);                     // Demande l'ajustement du niveau d'humour (pas besoin de var. car var. glob.)
      
      if (!selectedRadio) {
            updateStatus({ conteneurID: questionKey, type: 'warn', isLoading: false, questionID: questionKey, log: `Impossible de régénérer : aucune note n'est sélectionnée pour ${questionKey}.`,
                  message:    `Houston, we avons eu un problème.`
            });
            return;
      }
      
      const noteRef = parseInt(selectedRadio.value, 10);
      updateStatus({ conteneurID: questionKey, type: 'loading', isLoading: true, questionID: questionKey, log: `regenerateComment : questionKey: ${questionKey} / noteRef: ${noteRef}`,
            message:    `L'IA réfléchit... Elle n'a pas l'habitude. Ça peut être long...`, 
      });
      askForAvis(questionKey, noteRef, dataKey);                      // 3. Appel au serveur pour générer l'avis
}

/** ------------------------------------------------------------------------------------------- //
 * @instanceIn      {regenerateComment} ../
 * ---------------- ----------------------------------- ----------------------- - ------------- //
 * @function        adjustHumorLevel
 * @description     AJUSTE LE NIVEAU D'HUMOUR
 *                  Fonction globale appelée dans regenerateComment. 
 *                  Elle s'occupe de savoir si on est toujours entre 0 et 6 car Traumadvisor_IA_Agent.generateToneKey 
 *                  va générer une clé de tonalité [n1, n2, n3] où chaque n va de 0 à 2 pour choisir parmi un des 
 *                  3 niveaux d'humeur BONNE, NEUTRE, MAUVAISE.
 * ---------------- ----------------------------------- ----------------------- - ------------- //
 * @param           {string}{'humorRed'|'humorAdd'}     action                  - L'action à effectuer. Augmenter ou diminuer.
 * @param           {string}                            qID_4RefOnly            - L'ID de la question (ex: 'q1').
 * @returns         {string}                            humourLevel             > Le niveau de 0 à 6. Mais c'est une variable globale donc ce n'était pas nécessaire
 * -------------------------------------------------------------------------------------------- */
function adjustHumorLevel(action, qID_4RefOnly) {    
      if (action === 'humorAdd' && humourLevel < 6) humourLevel++; 
      if (action === 'humorRed' && humourLevel > 0) humourLevel--;

      console.log(`adjustHumorLevel : humourLevel: ${humourLevel}`);
      updateStatus({ conteneurID: qID_4RefOnly, type: 'info', isLoading: false, questionID: qID_4RefOnly, 
            message:    `L'IA revoit son niveau d'humour`,       
      });
      return humourLevel;
}

/**-------------------------------------------------------------------------------------------- //
 * @instanceIn      {askForAvis} ../
 * -------------- ----------------- ----------------- - --------------------------------------- //
 * @function      updateAvis
 * @description   AFFICHE L'AVIS
 *                Met à jour l'avis dans le champ de texte dédié.
 * -------------- ----------------- ----------------- - --------------------------------------- //
 * @param           {string}      questionID    - L'ID de la question (ex: 'q1').
 * @param           {string}      commentText   - Le nouveau texte.
 * @param           {string}      dataKey       - La clé à utiliser dans appData.evaluation.ratings (Ex: 'noteAccessibilite').
 * -------------------------------------------------------------------------------------------- */
function updateAvis(questionID, commentText, dataKey) {               // Fonction qui met à jour le champ (elle a besoin de questionKey)

      const textAreaId = 'avis-zone-creation_' + questionID;
      const textArea = document.getElementById(textAreaId);
      
      if (textArea) {      
            textArea.value = commentText;
            appData.comments[dataKey] = commentText;                  // Enregistre toute modif du texte dans l'objet global
            
      } else {
            updateStatus({ conteneurID: questionID, type: 'error', isLoading: false, questionID: questionID, log: `Le champ de commentaire avec l'ID ${textAreaId} n'a pas été trouvé.`,
                  message:    'Il me faut un champ pour écrire mon avis...',
            });
      }
}

/**-------------------------------------------------------------------------------------------- //
 * @instanceIn      {regenerateComment} & {initLIS_sections}
 * @instanceTotal   2
 * -------------- ----------------- ----------------- - --------------------------------------- //
 * @function      askForAvis
 * @description   GÉNÉRE UN AVIS (DÉCOMP)
 *                Générateur d'avis décomposé en 2 étapes pour avoir un feedback visuel du processus possiblement long. 
 *                Étape 1 : Charger les datas de cette question avec un appel côté serveur de requestAvisAgent🛠️ (./traumadvisor_APP/2 - Evaluation.gs/)
 *                Étape 2 : Générer un avis construit en 3 parties  avec un appel côté serveur de receiveAvisAgent🛠️ (./traumadvisor_APP/2 - Evaluation.gs/)
 * -------------- ----------------- ----------------- - --------------------------------------- //
 * @param           {string}      questionID    - L'ID de la question (ex: 'q1').
 * @param           {string}      noteRef       - La note sélectionnée par l'utilisateur.
 * @param           {string}      dataKey       - La clé à utiliser dans appData.evaluation.ratings (Ex: 'noteAccessibilite').
 * -------------------------------------------------------------------------------------------- */
function askForAvis(questionID, noteRef, dataKey) {

      document.body.classList.toggle('is-loading', true);             // DÉBUT du processus : Désactiver les boutons
      
      const conteneurName = `boutons-humour-${questionID}`;      
      const conteneur = document.getElementById(conteneurName);
      const boutons = conteneur.querySelectorAll('button');           // Sélectionne TOUS les boutons à l'intérieur
      
      boutons.forEach(btn => btn.disabled = true);                    // Désactiver
      
      // Au début de l'appel
      updateStatus({ conteneurID: questionID, type: 'loading', isLoading: true, questionID: questionID, log: `askForAvis...[param]questionID:${questionID} , 
            noteref: ${noteRef}`,
            message: 'Appel de l\'IA pour générer l\'avis...',
      });
                                                              
      google.script.run                                               // ÉTAPE 1 : Chargement
            .withSuccessHandler( (result) => {
            
                  // si startAgentProcessing revient du serveur avec succès
                  updateStatus({ conteneurID: result.questionID, type: 'loading', isLoading: true, questionID: result.questionID, message: result.message, 
                                log: `askForAvis | 1.startAgentProcessing[success]...` });
            
                  google.script.run                                   // ÉTAPE 2 : Finalisation
                        .withSuccessHandler( (result) => {
                        
                              updateStatus({ conteneurID: result.questionID, type: 'success', isLoading: false, questionID: result.questionID, message: 'Terminé!', 
                                            log: `askForAvis | 2.receiveAvisAgent[success] : result.questionID:${result.questionID} | 
                                            result.commentText:${result.commentText} | humourLevel:${humourLevel} | dataKey:${result.dataKey}` });
                              
                              updateAvis(result.questionID, result.commentText, result.dataKey); // Mettre à jour le champ de commentaire
                              document.body.classList.toggle('is-loading', false); // Réactiver les boutons
                              boutons.forEach(btn => btn.disabled = false);
                              if(document.getElementById(conteneurName).style.display === 'none') {
                                    document.getElementById(conteneurName).style.display = 'flex';
                              }
                        
                        })
                        .withFailureHandler( (error) => {
                              updateStatus({ conteneurID: error.questionID, type: 'error', isLoading: false, questionID: error.questionID, 
                                            log:        `askForAvis | 2.receiveAvisAgent : Erreur AI:${error}`,
                                            message:    'Erreur lors de la génération. Veuillez réessayer.' });
                              document.body.classList.toggle('is-loading', false); // Réactiver les boutons (après échec étape 2)
                              boutons.forEach(btn => btn.disabled = false);
                        })
                        .receiveAvisAgent(result.data, result.questionID, result.noteRef, humourLevel, result.dataKey); // < Lance cette function côté serveur
            })
            .withFailureHandler( (error) => {
                  updateStatus({ conteneurID: error.questionID, type: 'fail', isLoading: false, questionID: error.questionID, 
                                message: `Erreur de chargement: ${error.message}`, log: `askForAvis | 1.requestAvisAgent : Fail AI:${error}` });
                  document.body.classList.toggle('is-loading', false);// Réactiver les boutons (après échec étape 1)
                  boutons.forEach(btn => btn.disabled = false);
            })
            .requestAvisAgent(questionID, noteRef, dataKey);          // < Lance cette function côté serveur
}



/**-------------------------------------------------------------------- //
 * @instanceIn      {??} ../
 * ---------------- --------------- --------------- - ----------------- //
 * @function        createMessageElement
 * @description     ACTIVE LE MODE CHOIX POUR LES AVIS
 * ---------------- --------------- --------------- - ----------------- //
 * @param           {string}        text            - Le texte à afficher
 * @param           {string}        sender          - [user|app] Identifie l'émetteur         
 *--------------------------------------------------------------------- */
function createMessageElement(text, sender) {                                                                       /** Crée un message de conversation dans l'interface */
    console.log(`createMessageElement => text:${text} / sender:${sender}`);
    const isUser = sender === 'user';                                                                               // 'user'=> true || 'app' => false
    
    const messageWrapper = document.createElement('div');                                                           // Créé le wrapper ferré à gauche ou à droite
    messageWrapper.className = `message-wrapper ${isUser ? 'message-user-wrapper' : 'message-app-wrapper'}`;        // Utiliser le même wrapper pour les messages de l'app et de l'utilisateur pour le style
    const messageBubble = document.createElement('div');                                                            // Crée le message en lui-même
    messageBubble.className = `message-bubble ${isUser ? 'message-user' : 'message-app'}`;
    messageBubble.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;

    messageWrapper.appendChild(messageBubble);
    conversationLog.appendChild(messageWrapper);
    
    conversationLog.scrollTop = conversationLog.scrollHeight;           // S'assurer que le dernier message est visible en scrollant jusqu'en bas
    
    return messageWrapper;                                              // Retourne l'élément créé
}

/**-------------------------------------------------------------------- //
 * @instanceIn      {??} ../
 * ---------------- --------------- --------------- - ----------------- //
 * @function        showActionMode
 * @description     ACTIVE LE MODE CHOIX POUR LES AVIS
 *--------------------------------------------------------------------- */
function showActionMode() {                                             /** Bascule vers le mode 3-Boutons (Action Mode) */
    console.log(`showEditMode`);
    actionModeContainer.style.display = 'flex';
    editModeContainer.style.display = 'none';
}

/**-------------------------------------------------------------------- //
 * @instanceIn      {??} ../
 * ---------------- --------------- --------------- - ----------------- //
 * @function        showEditMode
 * @description     ACTIVE LE MODE EDITION D'AVIS
 *--------------------------------------------------------------------- */
function showEditMode() {                                               /** Bascule vers le mode Édition */
    console.log(`showEditMode`);
    actionModeContainer.style.display = 'none';
    editModeContainer.style.display = 'flex';
}

/**-------------------------------------------------------------------- //
 * @function        placeholder
 *--------------------------------------------------------------------- */
function tempInitApp() {                                              /** Initialise l'interface avec la proposition initiale */
    console.log('ini');
    createMessageElement(initialProposal, 'app');
    showActionMode(); 
}
/*window.onload = tempInitApp;   */
/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */                                                               // Initialisation au chargement