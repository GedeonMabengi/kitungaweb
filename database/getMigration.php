<?php
// index.php - Extracteur de contenu de fichiers
// À exécuter avec : php -S localhost:5000

$folderPath = $_POST['folder'] ?? '';
$log = [];
$outputFile = '';
$totalFiles = 0;
$totalSize = 0;

if (!empty($folderPath)) {
    $folderPath = rtrim($folderPath, '/');
    
    // Vérifier que le dossier existe
    if (!is_dir($folderPath)) {
        $log[] = "❌ Erreur : Le dossier '$folderPath' n'existe pas.";
    } else {
        $outputFile = $folderPath . '_contenu.txt';
        $handle = fopen($outputFile, 'w');
        
        // Fonction récursive pour parcourir les fichiers
        function scanDirectory($dir, $basePath, &$handle, &$log, &$totalFiles, &$totalSize) {
            $files = scandir($dir);
            
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                
                $path = $dir . '/' . $file;
                $relativePath = str_replace($basePath . '/', '', $path);
                
                if (is_dir($path)) {
                    // C'est un dossier, on descend dedans
                    fwrite($handle, "\n" . str_repeat("=", 80) . "\n");
                    fwrite($handle, "📁 DOSSIER : $relativePath\n");
                    fwrite($handle, str_repeat("=", 80) . "\n");
                    $log[] = "📁 Parcours : $relativePath/";
                    scanDirectory($path, $basePath, $handle, $log, $totalFiles, $totalSize);
                } else {
                    // C'est un fichier
                    $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    $size = filesize($path);
                    $totalSize += $size;
                    $totalFiles++;
                    
                    // Extensions à inclure (modifiable selon besoins)
                    $allowedExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'css', 'scss', 'html', 'php', 'txt', 'md', 'xml', 'yml', 'yaml', 'sql', 'env', 'gitignore'];
                    
                    // Toujours inclure les fichiers sans extension ou avec des noms spéciaux
                    $specialFiles = ['.env', '.gitignore', '.htaccess', 'README', 'LICENSE'];
                    $isSpecial = in_array($file, $specialFiles) || strpos($file, '.') === 0;
                    
                    if (in_array($extension, $allowedExtensions) || $isSpecial || empty($extension)) {
                        $content = file_get_contents($path);
                        
                        fwrite($handle, "\n" . str_repeat("-", 80) . "\n");
                        fwrite($handle, "📄 FICHIER : $relativePath\n");
                        fwrite($handle, "📏 Taille : " . formatSize($size) . "\n");
                        fwrite($handle, str_repeat("-", 80) . "\n\n");
                        fwrite($handle, $content . "\n");
                        
                        $log[] = "✅ Extrait : $relativePath (" . formatSize($size) . ")";
                    } else {
                        $log[] = "⏭️  Ignoré : $relativePath (type non pris en charge)";
                    }
                }
            }
        }
        
        function formatSize($bytes) {
            if ($bytes >= 1048576) return round($bytes / 1048576, 2) . ' MB';
            if ($bytes >= 1024) return round($bytes / 1024, 2) . ' KB';
            return $bytes . ' B';
        }
        
        // En-tête du fichier
        fwrite($handle, str_repeat("=", 80) . "\n");
        fwrite($handle, "EXTRACTION DU CONTENU DU DOSSIER : $folderPath\n");
        fwrite($handle, "Date : " . date('Y-m-d H:i:s') . "\n");
        fwrite($handle, str_repeat("=", 80) . "\n");
        
        $log[] = "🚀 Début de l'extraction...";
        
        // Lancer le scan
        scanDirectory($folderPath, $folderPath, $handle, $log, $totalFiles, $totalSize);
        
        // Pied de page
        fwrite($handle, "\n" . str_repeat("=", 80) . "\n");
        fwrite($handle, "FIN DE L'EXTRACTION\n");
        fwrite($handle, "Total : $totalFiles fichiers traités\n");
        fwrite($handle, "Taille totale : " . formatSize($totalSize) . "\n");
        fwrite($handle, str_repeat("=", 80) . "\n");
        
        fclose($handle);
        
        $log[] = "✅ Fichier généré : $outputFile";
        $log[] = "📊 Statistiques : $totalFiles fichiers, " . formatSize($totalSize);
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Extracteur de contenu de fichiers</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 30px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; margin-bottom: 20px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; color: #374151; }
        input[type="text"] { width: 100%; padding: 12px 15px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px; }
        input[type="text"]:focus { outline: none; border-color: #2563eb; }
        button { background: #2563eb; color: white; padding: 12px 30px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600; }
        button:hover { background: #1d4ed8; }
        .log { background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 13px; max-height: 500px; overflow-y: auto; white-space: pre-wrap; margin-top: 20px; }
        .success { color: #10b981; font-weight: bold; margin: 20px 0; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981; }
        .error { color: #ef4444; font-weight: bold; margin: 20px 0; padding: 15px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444; }
        .info { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: #1e40af; font-size: 14px; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
        .download { margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 2px dashed #2563eb; text-align: center; }
        .download a { color: #2563eb; font-weight: 600; text-decoration: none; font-size: 16px; }
        .download a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📁 Extracteur de contenu de fichiers</h1>
        
        <div class="info">
            💡 <strong>Utilisation :</strong> Entrez le chemin d'un dossier (relatif ou absolu) et le script créera un fichier <code>.txt</code> contenant tout le contenu des fichiers trouvés.
            <br><br>
            <strong>Extensions supportées :</strong> ts, tsx, js, jsx, json, css, scss, html, php, txt, md, xml, yml, yaml, sql, env, gitignore
        </div>
        
        <form method="POST">
            <div class="form-group">
                <label for="folder">Chemin du dossier :</label>
                <input type="text" name="folder" id="folder" placeholder="pos-mobile" value="<?php echo htmlspecialchars($folderPath); ?>" required>
            </div>
            
            <button type="submit">🚀 Extraire le contenu</button>
        </form>
        
        <?php if (!empty($log)): ?>
            <?php if (file_exists($outputFile)): ?>
                <div class="success">
                    ✅ Extraction terminée avec succès !
                </div>
                
                <div class="download">
                    📥 <a href="<?php echo basename($outputFile); ?>" download>Télécharger le fichier <?php echo basename($outputFile); ?></a>
                </div>
            <?php else: ?>
                <div class="error">
                    ❌ Une erreur est survenue
                </div>
            <?php endif; ?>
            
            <div class="log"><?php echo implode("\n", $log); ?></div>
        <?php endif; ?>
    </div>
</body>
</html>