#!/usr/bin/env node
/**
 * Dump COMPLET du projet mogroso-pharma.
 * Parcourt récursivement src/ + fichiers racine (package.json, app.json, tsconfig.json, etc.)
 * Ignore : node_modules, .git, .expo, android/, ios/, assets/ (binaires), *.lock, *.png, *.jpg, *.svg, *.ttf, *.otf
 *
 * Usage : node dump-all.js
 * Sortie : dump-all.txt (à la racine)
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT = "dump-all.txt";

// Dossiers à ignorer complètement
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".expo",
  ".expo-shared",
  "android",
  "ios",
  "assets",
  "build",
  "dist",
  ".vscode",
  ".idea",
  "coverage",
]);

// Extensions à inclure (texte uniquement)
const INCLUDE_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".json", ".md", ".txt",
  ".css", ".scss",
  ".html",
  ".yml", ".yaml",
  ".env", // sauf .env local
  ".prettierrc", ".editorconfig", ".gitattributes",
]);

// Extensions binaires à ignorer explicitement
const IGNORE_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".icns",
  ".ttf", ".otf", ".woff", ".woff2",
  ".mp3", ".mp4", ".wav", ".mov", ".avi",
  ".zip", ".tar", ".gz", ".7z", ".rar",
  ".pdf", ".sqlite", ".db", ".db-journal",
  ".map",
]);

// Fichiers racine toujours inclus
const ROOT_FILES = [
  "package.json",
  "app.json",
  "app.config.js",
  "app.config.ts",
  "eas.json",
  "tsconfig.json",
  "babel.config.js",
  "metro.config.js",
  "index.ts",
  "index.js",
  "App.tsx",
  "App.js",
  ".prettierrc",
  ".editorconfig",
  "README.md",
  "AGENTS.md",
];

// Fichiers à NE JAMAIS inclure (secrets)
const FORBIDDEN = new Set([
  ".env.local",
  ".env.production",
  ".env.development",
  "google-services.json",
  "GoogleService-Info.plist",
]);

function line(char = "=", len = 80) {
  return char.repeat(len);
}

function shouldIncludeFile(filePath) {
  const name = path.basename(filePath);
  if (FORBIDDEN.has(name)) return false;

  const ext = path.extname(filePath).toLowerCase();
  if (IGNORE_EXT.has(ext)) return false;
  if (INCLUDE_EXT.has(ext)) return true;

  // Fichiers sans extension mais connus (prettierrc, editorconfig...)
  if (name.startsWith(".")) return true;

  return false;
}

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith(".") && entry.name !== ".env") continue;
      walk(full, files);
    } else if (entry.isFile()) {
      if (shouldIncludeFile(full)) files.push(full);
    }
  }
  return files;
}

// ---- Construction de la liste ----
const filesToDump = [];

// 1) Fichiers racine
for (const rel of ROOT_FILES) {
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
    filesToDump.push(abs);
  }
}

// 2) Tout src/ récursivement
const srcDir = path.join(ROOT, "src");
if (fs.existsSync(srcDir)) {
  walk(srcDir, filesToDump);
}

// 3) Dédupliquer + trier
const unique = [...new Set(filesToDump)].sort();

// ---- Génération du dump ----
let out = "";
out += `${line()}\n`;
out += `DUMP COMPLET DU PROJET mogroso-pharma\n`;
out += `Généré le : ${new Date().toISOString()}\n`;
out += `Racine   : ${ROOT}\n`;
out += `Fichiers : ${unique.length}\n`;
out += `${line()}\n\n`;

let ok = 0;
let ko = 0;
let totalBytes = 0;

for (const abs of unique) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  let content;
  try {
    content = fs.readFileSync(abs, "utf8");
    ok++;
    totalBytes += content.length;
  } catch (err) {
    content = `[ERREUR] ${err.message}\n`;
    ko++;
  }

  out += `\n${line("#")}\n`;
  out += `# FICHIER : ${rel}\n`;
  out += `${line("#")}\n\n`;
  out += content;
  if (!content.endsWith("\n")) out += "\n";
}

out += `\n${line()}\n`;
out += `FIN DU DUMP — ${ok} OK / ${ko} erreur(s) — ${(totalBytes / 1024).toFixed(1)} Ko\n`;
out += `${line()}\n`;

fs.writeFileSync(path.join(ROOT, OUTPUT), out, "utf8");

console.log(`✅ Dump généré : ${OUTPUT}`);
console.log(`   Fichiers  : ${unique.length}`);
console.log(`   OK / KO   : ${ok} / ${ko}`);
console.log(`   Taille    : ${(out.length / 1024).toFixed(1)} Ko`);
