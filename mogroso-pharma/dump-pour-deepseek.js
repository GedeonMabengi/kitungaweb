#!/usr/bin/env node
/**
 * Script de dump : concatène plusieurs fichiers du projet
 * dans un seul fichier texte, prêt à coller pour analyse.
 *
 * Usage : node dump-pour-deepseek.js
 * Sortie : dump-pour-deepseek.txt (à la racine de mogroso-pharma)
 */

const fs = require("fs");
const path = require("path");

// ---- Configuration ----
const ROOT = process.cwd(); // doit être exécuté depuis mogroso-pharma/
const OUTPUT = "dump-pour-deepseek.txt";

// Liste des fichiers à dumper (chemins relatifs à mogroso-pharma/)
const FILES = [
  // --- Bug du montant payé ---
  "src/screens/sales/PosScreen.tsx",
  "src/screens/sales/SaleShowScreen.tsx",
  "src/screens/sales/SalesListScreen.tsx",
  "src/hooks/useSales.ts",
  "src/data/repositories/sales.repo.ts",
  "src/data/repositories/saleItems.repo.ts",
  "src/data/types/sale.ts",
  "src/store/cart.store.ts",

  // --- Contexte i18n ---
  "package.json",
  "app.json",
  "app.config.js", // optionnel, sera ignoré si absent
  "tsconfig.json",

  // --- Contexte général utile ---
  "src/types/index.ts",
  "src/data/types/index.ts",
  "src/navigation/routes.ts",
  "src/navigation/types.ts",
];

// Fichiers optionnels : on ne fait pas planter le script s'ils sont absents
const OPTIONAL = new Set([
  "app.config.js",
  "src/navigation/linking.ts",
]);

// ---- Utilitaires ----
function line(char = "=", len = 80) {
  return char.repeat(len);
}

function readFileSafe(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) {
    if (OPTIONAL.has(relPath)) {
      return `[FICHIER ABSENT — ignoré] ${relPath}\n`;
    }
    return `[ERREUR] Fichier introuvable : ${relPath}\n`;
  }
  try {
    return fs.readFileSync(abs, "utf8");
  } catch (err) {
    return `[ERREUR] Impossible de lire ${relPath} : ${err.message}\n`;
  }
}

// ---- Construction du dump ----
let out = "";
out += `${line()}\n`;
out += `DUMP DU PROJET mogroso-pharma\n`;
out += `Généré le : ${new Date().toISOString()}\n`;
out += `Dossier racine : ${ROOT}\n`;
out += `Nombre de fichiers : ${FILES.length}\n`;
out += `${line()}\n\n`;

let countOk = 0;
let countKo = 0;

for (const rel of FILES) {
  const content = readFileSafe(rel);

  out += `\n${line("#")}\n`;
  out += `# FICHIER : ${rel}\n`;
  out += `${line("#")}\n\n`;
  out += content;
  if (!content.endsWith("\n")) out += "\n";

  if (content.startsWith("[ERREUR]")) countKo++;
  else countOk++;
}

out += `\n${line()}\n`;
out += `FIN DU DUMP — ${countOk} OK / ${countKo} erreur(s)\n`;
out += `${line()}\n`;

fs.writeFileSync(path.join(ROOT, OUTPUT), out, "utf8");

console.log(`✅ Dump généré : ${OUTPUT}`);
console.log(`   ${countOk} fichier(s) OK, ${countKo} erreur(s).`);
console.log(`   Taille : ${(out.length / 1024).toFixed(1)} Ko`);
