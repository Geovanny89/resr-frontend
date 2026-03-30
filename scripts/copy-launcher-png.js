#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Copiando icono launcher PNG a mipmap folders...\n');

const androidResPath = path.join(__dirname, '../android/app/src/main/res');
const sourceImage = path.join(__dirname, '../public/kdice-launcher.png');

// Carpetas mipmap con tamaños de icono
const mipmapFolders = [
  { folder: 'mipmap-mdpi', size: '48x48' },
  { folder: 'mipmap-hdpi', size: '72x72' },
  { folder: 'mipmap-xhdpi', size: '96x96' },
  { folder: 'mipmap-xxhdpi', size: '144x144' },
  { folder: 'mipmap-xxxhdpi', size: '192x192' }
];

try {
  if (!fs.existsSync(sourceImage)) {
    console.error('❌ No se encontró:', sourceImage);
    process.exit(1);
  }

  // Leer la imagen fuente
  const imageBuffer = fs.readFileSync(sourceImage);

  for (const { folder } of mipmapFolders) {
    const folderPath = path.join(androidResPath, folder);
    
    // Crear carpeta si no existe
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Copiar como ic_launcher.png
    const launcherPath = path.join(folderPath, 'ic_launcher.png');
    fs.writeFileSync(launcherPath, imageBuffer);
    console.log(`  ✅ ${folder}/ic_launcher.png`);

    // Copiar como ic_launcher_round.png
    const roundPath = path.join(folderPath, 'ic_launcher_round.png');
    fs.writeFileSync(roundPath, imageBuffer);
    console.log(`  ✅ ${folder}/ic_launcher_round.png`);

    // Copiar como ic_launcher_foreground.png (para uso en adaptive icons)
    const foregroundPath = path.join(folderPath, 'ic_launcher_foreground.png');
    fs.writeFileSync(foregroundPath, imageBuffer);
    console.log(`  ✅ ${folder}/ic_launcher_foreground.png`);
  }

  console.log('\n🎉 Iconos PNG copiados a todas las carpetas mipmap!');
  console.log('\n⚠️  AHORA ve a Android Studio y ejecuta:');
  console.log('Build > Clean Project');
  console.log('Build > Build Bundle(s) / APK(s) > Build APK(s)');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
