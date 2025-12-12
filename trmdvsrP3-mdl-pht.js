/* == PHOTOS > DRAG&DROP - FN PRIVATE ============== (EVALUATIONS) == */
/**------------------------------------------------------------------ //
* @instanceIn    {initPhotoUploader} on <fileInput id="input_photo_principale"> ../.
* ---------------- --------------- --------------- - ---------------- //
* @function      handleFileSelection
* @description   GERE LA SELECTION D'IMAGES
* Crée un tableau avec les images et lance opencropModule pour chacun d'entre elle dans la limite de MAX_FILES
*-------------------------------------------------------------------- */
function handleFileSelection() {
      const newFiles = Array.from(fileInput.files);
      const imageFiles = newFiles.filter(file => file.type.startsWith("image/"));
      
      fileInput.value = '';
      
      imageFiles.forEach( file => {
            const availableSlots = MAX_FILES - uploadedFiles.length;
            if (availableSlots > 0) {
                  opencropModule(file);
            
            } else {
                  updateStatus({  conteneurID: "export", type: 'warn', isLoading: false, current: 0, total: 0, message: `Attention: La limite maximale de ${MAX_FILES} photos est atteinte.` });
            }
      } );
}
/**------------------------------------------------------------------ //
* @instanceIn    {handleFileSelection}   ../.
* ---------------- --------------- --------------- - ---------------- //
* @function      handleFileSelection
* @description   OUVRE LE MODULE ET INSÈRE L'IMAGE
*-------------------------------------------------------------------- */
function opencropModule(file) {
      currentFile = file;
      cropModule.style.display = 'flex';                              // Affiche le module
      const imageUrl = URL.createObjectURL(file);
      imageToCrop.src = imageUrl;
      
      imageToCrop.onload = function() {
      
            if (cropperInstance) { cropperInstance.destroy(); }
            cropperInstance = new Cropper(imageToCrop, {
                  aspectRatio: 1, 
                  viewMode: 1,    
                  responsive: true,
                  autoCropArea: 0.8,
            });
      };
}

/**------------------------------------------------------------------ //
* @instanceIn    {??}   ../.
* ---------------- --------------- --------------- - ---------------- //
* @function      closecropModule
* @description   FERME LE MODULE
*-------------------------------------------------------------------- */
function closecropModule() {
      if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
      }
      if (imageToCrop.src) { URL.revokeObjectURL(imageToCrop.src); };
      
      imageToCrop.src = '';
      currentFile = null;
      cropModule.style.display = 'none';
}

/**------------------------------------------------------------------ //
* @instanceIn    {??}   ../.
* ---------------- --------------- --------------- - ---------------- //
* @function      handleCropAndAdd
* @description   www
*-------------------------------------------------------------------- */
function handleCropAndAdd() {
      if (!cropperInstance) return;
      
      const croppedCanvas = cropperInstance.getCroppedCanvas({        // 1. Obtenir le canvas rogné à la taille d'exportation souhaitée (1080x1080)
            width: EXPORT_SIZE,                                       // 1080
            height: EXPORT_SIZE,                                      // 1080
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
      });
      
      croppedCanvas.toBlob( (blob) => {                               // 2. Convertir le canvas en un objet File (Blob)
            if (blob) {
                  const originalName = currentFile.name.replace(/(\.[\w\d_-]+)$/i, ''); // Créer un nouvel objet File avec le nom du fichier d'origine et la taille d'export
                  const filename = originalName + `-${EXPORT_SIZE}x${EXPORT_SIZE}.png`;
                  const previewUrl = URL.createObjectURL(blob);       // Stocker l'URL d'objet du Blob pour la prévisualisation (pour éviter le re-rognage)
                  
                  uploadedFiles.push({                                // Stocker le Blob et le nom pour l'enregistrement Drive
                        name: filename,
                        blob: blob,
                        previewUrl: previewUrl,
                        size: blob.size                               // Taille du blob rogné
                  });
                  updateImageDisplay();
                  closecropModule();
                  
                  if (uploadedFiles.length < MAX_FILES) {
                        limitMessage.textContent = '';
                  }
            } else {
                  console.error("Échec de la création du Blob après rognage.");
            }
      }, 'image/png'); 
}

// ----------------------------------------------------
// FONCTIONS UTILITAIRES ET AFFICHAGE (Inchangées)
// ----------------------------------------------------

function removeFile(index) {
      if (index >= 0 && index < uploadedFiles.length) {
            // Libérer l'URL d'objet de prévisualisation avant de supprimer
            URL.revokeObjectURL(uploadedFiles[index].previewUrl);
            uploadedFiles.splice(index, 1);
            limitMessage.textContent = '';
            updateImageDisplay();
      }
}

/**------------------------------------------------------------------ //
* @instanceIn    {initDragDropListeners} on["drop"] & {handleCropAndAdd} & {removeFile}        ../trmdvsr-03-launch-js
* @instanceCount 3
* ---------------- --------------- --------------- - ---------------- //
* @function      updateImageDisplay
* @description   MET À JOUR LA LISTE DES PHOTOS
*-------------------------------------------------------------------- */
function updateImageDisplay() {

      while (previewContainer.firstChild) {
            previewContainer.removeChild(previewContainer.firstChild);// Nettoyer le conteneur et le statut
      }
      updateStatus({  conteneurID: "export", isLoading: false, message: '' });                // Nettoyer les messages précédents
      
      if (uploadedFiles.length === 0) {
            const para = document.createElement("p");
            para.classList.add('trmdvsr-sstexte'); 
            para.textContent = "Aucun fichier sélectionné pour le moment.";
            previewContainer.appendChild(para);
            exportBtn.disabled = true;
            return;
      } 
      
      exportBtn.disabled = false;
      
      const list = document.createElement("ul");
      list.id = "photo-list";                                         //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 2025-10-17 (01:38) : n'existe pas en id                              
      list.classList.add('photo-list-container');                     // Class ok 
      previewContainer.appendChild(list);
      
      uploadedFiles.forEach( (file, index) => {
            const listItem = document.createElement("li");
            listItem.setAttribute('draggable', 'true');
            listItem.dataset.index = index;
            listItem.classList.add('photo-item');                     // Class ok
            
            const image = document.createElement("img");
            image.src = file.previewUrl;                              // Utilisation de l'URL d'objet stockée
            image.alt = file.name;
            image.classList.add('photo-image');                       // Class ok
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener( 'click', (event) => {
                  event.stopPropagation(); 
                  removeFile(parseInt(listItem.dataset.index));
            } );
            listItem.appendChild(deleteBtn);
            
            if (index === 0) {
                  const badge = document.createElement('div');
                  badge.textContent = "Principale";
                  badge.classList.add('badge-principale');
                  listItem.appendChild(badge);
            }
            
            const info = document.createElement('div');
            info.textContent = `${file.name} (${returnFileSize(file.size)})`;
            info.classList.add('photo-info');                         // Class ok
            
            listItem.appendChild(image);
            listItem.appendChild(info);
            list.appendChild(listItem);
      });
}

/**------------------------------------------------------------------ //
* @instanceIn    ??
* @instanceCount ?
* ---------------- --------------- --------------- - ---------------- //
* @function      returnFileSize
* @description   ??
*-------------------------------------------------------------------- */
function returnFileSize(number) {
      if (number < 1024) return `${number} octets`;
      if (number >= 1024 && number < 1048576) return `${(number / 1024).toFixed(1)} Ko`;
      if (number >= 1048576) return `${(number / 1048576).toFixed(1)} Mo`;
}

/* == PHOTOS > DRAG&DROP - INIT ==================== (EVALUATIONS) == */
/**------------------------------------------------------------------ //
* @instanceIn    {initPageEvalPhotoUploader}        ../trmdvsr-03-launch-js
* ---------------- --------------- --------------- - ---------------- //
* @function      initDragDropListeners
* @description   INITIALISE LE DRAG & DROP
*                previewContainer cible la classe ".conteneur-image-preview". 
*                On pourrait spécifier cette classe dans un sous ensemble d'un conteneur spécifique.
*-------------------------------------------------------------------- */
function initDragDropListeners() {
      
      previewContainer.addEventListener( 'dragstart', (event) => {
            if (event.target.tagName === 'LI' && event.target.draggable) {
                  draggedItem = event.target;
                  setTimeout(() => {
                  event.target.classList.add('is-dragging');
                  }, 0);
                  event.dataTransfer.setData('text/plain', event.target.dataset.index);
            }
      } );
      
      previewContainer.addEventListener( 'dragend', (event) => {
            event.target.classList.remove('is-dragging');
            draggedItem = null;
      } );
      
      previewContainer.addEventListener( 'dragover', (event) => {
            event.preventDefault(); 
            const target = event.target.closest('li');
            if (target && target !== draggedItem) {
                  target.classList.add('is-drag-over');
            }
      } );
      
      previewContainer.addEventListener( 'dragleave', (event) => {
            if (event.target.tagName === 'LI') {
            event.target.classList.remove('is-drag-over');
            }
      } );
      
      previewContainer.addEventListener( 'drop', (event) => {
            event.preventDefault();
            const target = event.target.closest('li');
            if (draggedItem && target && draggedItem !== target) {
                  const fromIndex = parseInt(draggedItem.dataset.index);
                  const toIndex = parseInt(target.dataset.index);
                  target.classList.remove('is-drag-over');
                  const [movedFile] = uploadedFiles.splice(fromIndex, 1);
                  uploadedFiles.splice(toIndex, 0, movedFile);
                  
                  updateImageDisplay();                               // Finalité on update l'affichage
            
            } else if (target) {
                  target.classList.remove('is-drag-over');
            }
      } );
}

/* == PHOTOS > SAVE  =============================== (EVALUATIONS) == */
/**------------------------------------------------------------------ //
* @version         25.10.21 (14:14)
* ---------------- --------------- --------------- - ---------------- //
* @function        saveThenNavigate
* @description     GERE LA NAVIGATION CONDITIONNÉE À UN ENREGISTREMENT
*                  Logique centralisée de sauvegarde et de navigation. C'est le cœur de la solution.
*-------------------------------------------------------------------- */
async function saveThenNavigate() {        

      const estValide = await handleSaveToDrive();                    // 1. Attend le résultat de l'opération asynchrone
      
      if (estValide) {                                                // 2. Conditionne le passage à l'étape suivante
            updateStatus({  conteneurID: "export", type: 'success', isLoading: false,
            message:      "Enregistrement réussi. Passage à l'étape suivante.", 
            });
            
            navigateTo('accroche');                                   // 3. Appelle la fonction de navigation
            
      } else {
            updateStatus({  conteneurID: "export", type: 'success', isLoading: false,
            message:      "L'enregistrement a échoué.", 
            });  
      }
}

/**------------------------------------------------------------------ //
* 
* ---------------- --------------- --------------- - ---------------- //
* @function        handleSaveToDrive
* @description     ENREGISTRE LES PHOTOS SUR LE DRIVE
*                  Fonction clé pour enregistrer les photos sur le drive
*-------------------------------------------------------------------- */
async function handleSaveToDrive() {

      const totalFiles = uploadedFiles.length;                        // uploadedFiles : variable globale stockée dans trmdvsr-global-js
      
      if (totalFiles === 0) {                                                       
            updateStatus({  conteneurID: "export", type: 'error', isLoading: false,
            message:      "Veuillez ajouter au moins une photo avant d'enregistrer.", 
            });
            return false;
      }
      
      document.body.classList.toggle('is-loading', true);             // DÉBUT du processus : Désactiver les boutons
      
      updateStatus({  conteneurID: "export", type: 'info', isLoading: false,
            message:      `Démarrage de l'enregistrement de ${totalFiles} photo(s)...`,
            current:      0, 
            total:        totalFiles,
      });
      
      const progressBar   =   document.getElementById("progressBar"); // Éléments de la barre de progression
      const progressText  =   document.getElementById("progressText");
      updateProgressDisplay_(progressBar, progressText, successCount, 0, totalFiles);// Initialisation à 0%
      
      for (let i = 0; i < totalFiles; i++) {                          // Boucle d'enregistrement
            const file = uploadedFiles[i];
            
            updateStatus({  conteneurID: "export", type: 'info', isLoading: false,
            message:      `Enregistrement en cours: ${file.name} (${i + 1}/${totalFiles})...`,
            current:      i,
            total:        totalFiles,
            });
            
            try {
            
                  const base64Data = await blobToBase64_(file.blob);  // 1. Convertir le Blob en Base64 (fonction personnalisée)
                  
                  const result = await new Promise( (resolve, reject) => { // 2. Appel de la fonction Apps Script
                        google.script.run
                              .withSuccessHandler(resolve)
                              .withFailureHandler(reject)
                              .saveFileToDrive(base64Data, file.name);// Enregistre le fichier sur le drive avec saveFileToDrive() côté server
                        });
                  
                  if (result === true) {
                        successCount++;
                        updateProgressDisplay_(successCount, i + 1, totalFiles); // NOUVEAU : Mise à jour de la barre de progression après succès
                  
                  } else {
                        errorCount++;
                        
                        updateStatus({  conteneurID: "export", type: "error", isLoading: false,
                              message:      `Erreur d'enregistrement pour ${file.name}: ${result}`,
                              current:      i,
                              total:        totalFiles,
                        });
                  }
            } catch (error) {            
                  errorCount++;
                  
                  updateStatus({  conteneurID: "export", type: "error", isLoading: false,
                        message:      `Erreur critique lors de l'envoi de ${file.name} : ${error}`,
                        current:      i,
                        total:        totalFiles,
                  });
            }
      }
      // Fin de l'opération
      const finalMessage = `${successCount} photo(s) rognée(s) enregistrée(s) dans Google Drive. ${errorCount > 0 ? `(${errorCount} échec(s))` : ''}`;
      
      updateStatus({  conteneurID: "export", isLoading: false, message: finalMessage,
            type:         errorCount > 0 ? "error" : "success",       // Définition conditionnelle du type de message pour log
      });
      
      document.body.classList.toggle('is-loading', false);            // DÉBUT du processus : Désactiver les boutons
}

/**------------------------------------------------------------------ //
* @instanceIn      {initRatings}                     ../trmdvsr-03-launch-js
* ---------------- --------------- --------------- - ---------------- //
* @function        updateProgressDisplay_
* @description     MET À JOUR LA BARRE ET LE TEXTE DE PROGRESSION
* ---------------- --------------- --------------- - ---------------- //
* @param           {Element}       progressbar     - La barre de progression.
* @param           {Element}       progressText    - Le texte de progression.
* @param           {number}        successCount    - Le nombre de fichiers enregistrés avec succès.
* @param           {number}        currentTotal    - Le total des fichiers traités jusqu'à présent (succès + échecs).
* @param           {number}        totalFiles      - Le nombre total de fichiers à traiter.
*-------------------------------------------------------------------- */
function updateProgressDisplay_(progressbar, progressText, successCount, currentTotal, totalFiles) {

      const textOverview  =   `(${successCount}/${totalFiles} images enregistrées)`
      const percentage = totalFiles > 0 ? Math.round((successCount / totalFiles) * 100) : 100;
      
      progressBar.style.width = `${percentage}%`;                     // Mise à jour de la barre (utilise la largeur en CSS)
      progressText.textContent = `${percentage}% ${textOverview}`;    // Mise à jour du texte
}

/**------------------------------------------------------------------ //
* @instanceIn      {handleSaveToDrive}               ../trmdvsr-03-launch-js
* @instanceCount   1 - unique
* ---------------- --------------- --------------- - ---------------- //
* @function        blobToBase64_
* @description     Converti l'image
*                  Fonction utilitaire pour convertir un Blob en Base64
* ---------------- --------------- --------------- - ---------------- //
* @param           {string}        blob            - Le blob a convertir.
*-------------------------------------------------------------------- */
function blobToBase64_(blob) {

      return new Promise( (resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {  
                  const base64 = reader.result.split(',')[1];         // La chaîne commence par "data:image/png;base64,"
                  resolve(base64);                                    // on ne garde que le Base64 pur
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
      } );
}
/** =========================================================================================== //
 * @description 'Fin du fichier. with care.'
 * @author 'trmdvsr'
 * @version 25.10.09 (23:16)
 * ============================================================================================ */