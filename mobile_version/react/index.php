<?php
// index.php - Générateur d'arborescence POS Mobile
// À exécuter avec : php -S localhost:5000

$rootDir = __DIR__ . '/pos-mobile';

// Structure complète de l'arborescence
$structure = [
    'App.tsx' => '',
    'app.json' => '',
    'babel.config.js' => '',
    'metro.config.js' => '',
    'tsconfig.json' => '',
    'package.json' => '',
    
    'assets' => [],
    
    'src' => [
        'data' => [
            'db' => [
                'client.ts' => "// ouverture SQLite + migrations\n",
                'migrations.ts' => "// CREATE TABLE...\n",
                'seed.ts' => "// données de démo (catégories, articles…)\n",
            ],
            'repositories' => [
                'articles.repo.ts' => '',
                'categories.repo.ts' => '',
                'sales.repo.ts' => '',
                'saleItems.repo.ts' => '',
                'cash.repo.ts' => '',
                'stockMovements.repo.ts' => '',
                'users.repo.ts' => '',
                'settings.repo.ts' => '',
            ],
            'types' => [
                'article.ts' => '',
                'category.ts' => '',
                'sale.ts' => '',
                'cash.ts' => '',
                'index.ts' => '',
            ],
        ],
        
        'store' => [
            'cart.store.ts' => "// panier POS\n",
            'session.store.ts' => "// utilisateur courant (mock)\n",
            'ui.store.ts' => "// thème, préférences\n",
        ],
        
        'components' => [
            'ui' => [
                'Button.tsx' => '',
                'Input.tsx' => '',
                'Card.tsx' => '',
                'Badge.tsx' => '',
                'Avatar.tsx' => '',
                'Spinner.tsx' => '',
                'Modal.tsx' => '',
                'BottomSheet.tsx' => '',
                'Checkbox.tsx' => '',
                'Select.tsx' => '',
                'Separator.tsx' => '',
                'Skeleton.tsx' => '',
                'Text.tsx' => '',
                'Heading.tsx' => '',
                'Label.tsx' => '',
            ],
            'forms' => [
                'FormField.tsx' => '',
                'InputError.tsx' => '',
                'AlertError.tsx' => '',
            ],
            'layout' => [
                'Screen.tsx' => '',
                'AppHeader.tsx' => '',
                'AppTabBar.tsx' => '',
            ],
            'domain' => [
                'articles' => [],
                'sales' => [],
                'cash' => [],
                'stock' => [],
            ],
        ],
        
        'screens' => [
            'dashboard' => [
                'DashboardScreen.tsx' => '',
            ],
            'articles' => [
                'ArticlesListScreen.tsx' => '',
                'ArticleShowScreen.tsx' => '',
                'ArticleCreateScreen.tsx' => '',
                'ArticleEditScreen.tsx' => '',
            ],
            'categories' => [
                'CategoriesListScreen.tsx' => '',
                'CategoryShowScreen.tsx' => '',
                'CategoryCreateScreen.tsx' => '',
                'CategoryEditScreen.tsx' => '',
            ],
            'sales' => [
                'SalesListScreen.tsx' => '',
                'SaleShowScreen.tsx' => '',
                'PosScreen.tsx' => "// cœur de l'app\n",
            ],
            'cash' => [
                'CashDashboardScreen.tsx' => '',
                'CashListScreen.tsx' => '',
                'CashShowScreen.tsx' => '',
            ],
            'stock' => [
                'movements' => [
                    'StockMovementsListScreen.tsx' => '',
                    'StockMovementCreateScreen.tsx' => '',
                ],
            ],
            'reports' => [
                'ReportsIndexScreen.tsx' => '',
                'ReportsCashScreen.tsx' => '',
                'ReportsSalesScreen.tsx' => '',
                'ReportsStockScreen.tsx' => '',
            ],
            'settings' => [
                'ProfileScreen.tsx' => '',
                'AppearanceScreen.tsx' => '',
                'PrinterScreen.tsx' => "// config imprimante\n",
            ],
        ],
        
        'navigation' => [
            'RootNavigator.tsx' => '',
            'MainTabs.tsx' => '',
            'linking.ts' => '',
            'types.ts' => '',
        ],
        
        'hooks' => [
            'useArticles.ts' => '',
            'useCategories.ts' => '',
            'useSales.ts' => '',
            'useCash.ts' => '',
            'useAppearance.ts' => '',
            'useToast.ts' => '',
        ],
        
        'lib' => [
            'currency.ts' => "// ✅ copié tel quel du web\n",
            'authorization.ts' => "// ✅ copié tel quel\n",
            'utils.ts' => '',
            'format.ts' => '',
            'printer.ts' => "// abstraction imprimante\n",
        ],
        
        'theme' => [
            'colors.ts' => '',
            'spacing.ts' => '',
            'typography.ts' => '',
            'index.ts' => '',
        ],
        
        'constants' => [
            'config.ts' => '',
        ],
    ],
];

// Fonction récursive pour créer l'arborescence
function createStructure($basePath, $structure, &$log) {
    foreach ($structure as $name => $content) {
        $path = $basePath . '/' . $name;
        
        if (is_array($content)) {
            // C'est un dossier
            if (!is_dir($path)) {
                mkdir($path, 0777, true);
                $log[] = "📁 Créé : $path/";
            }
            if (!empty($content)) {
                createStructure($path, $content, $log);
            }
        } else {
            // C'est un fichier
            if (!file_exists($path)) {
                file_put_contents($path, $content);
                $log[] = "📄 Créé : $path";
            }
        }
    }
}

// Exécution
$log = [];
createStructure($rootDir, $structure, $log);

// Affichage du résultat
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POS Mobile - Structure créée</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; margin-bottom: 10px; }
        .success { color: #10b981; font-weight: bold; margin-bottom: 20px; }
        .log { background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 13px; max-height: 500px; overflow-y: auto; white-space: pre-wrap; }
        .count { margin-top: 15px; padding: 15px; background: #eff6ff; border-radius: 8px; color: #1e40af; }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ Structure POS Mobile créée</h1>
        <p class="success">L'arborescence complète a été générée avec succès !</p>
        
        <div class="log"><?php echo implode("\n", $log); ?></div>
        
        <div class="count">
            <strong><?php echo count($log); ?></strong> éléments créés dans le dossier <code><?php echo $rootDir; ?></code>
        </div>
        
        <p style="margin-top: 20px; color: #666;">
            💡 Tu peux maintenant supprimer ce fichier <code>index.php</code> et commencer à développer dans le dossier <code>pos-mobile/</code>
        </p>
    </div>
</body>
</html>