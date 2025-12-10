/**
 * Ce script est conçu pour corriger l'erreur de chargement de favicon en mode
 * "file:///" en s'assurant que le chemin est toujours relatif.
 *
 * Sur les systèmes locaux (file:///), les chemins qui commencent par '/'
 * sont interprétés comme la racine du disque dur, ce qui cause une erreur
 * de sécurité. Nous forçons l'utilisation du chemin relatif 'favicon.ico'.
 */
( function() {
    // 1. Définir le chemin correct pour le mode local
    const correctPath = 'favicon.ico';
    
    // 2. Tenter de trouver la balise link rel="icon" existante
    let linkIcon = document.querySelector('link[rel="icon"]');
    
    if (linkIcon) {
        // 3. Forcer le chemin de la balise existante
        linkIcon.href = correctPath;
    } else {
        // 4. Si la balise n'existe pas pour une raison ou une autre, la créer
        linkIcon = document.createElement('link');
        linkIcon.rel = 'icon';
        linkIcon.type = 'image/x-icon';
        linkIcon.href = correctPath;
        document.head.appendChild(linkIcon);
    }

    // 5. Répéter pour la balise 'shortcut icon' si elle existe, par sécurité
    let linkShortcut = document.querySelector('link[rel="shortcut icon"]');
    if (linkShortcut) {
        linkShortcut.href = correctPath;
    }
    
    console.log(`[Favicon Fix] Le chemin du favicon a été forcé à : ${correctPath}`);
})();