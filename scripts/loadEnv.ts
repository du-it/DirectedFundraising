import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Projekt-Root ermitteln (2–4 Ebenen über dem Skript)
const rootCandidates = [
  path.resolve(__dirname, "../../../../.env"),
  path.resolve(__dirname, "../../../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../.env"),
];

// Erste existierende .env-Datei laden
const envPath = rootCandidates.find((p) => fs.existsSync(p));

if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`✅ .env geladen von: ${envPath}`);
} else {
  console.warn("⚠️  Keine .env-Datei gefunden – Umgebungsvariablen fehlen!");
}