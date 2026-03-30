#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Configurando icono launcher para KDice Reservas...\n');

const androidResPath = path.join(__dirname, '../android/app/src/main/res');
const sourceImage = path.join(__dirname, '../public/kdice-launcher.png');

// Carpetas mipmap
const mipmapFolders = [
  'mipmap-mdpi',
  'mipmap-hdpi', 
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi'
];

try {
  // Verificar imagen fuente
  if (!fs.existsSync(sourceImage)) {
    console.error('❌ No se encontró:', sourceImage);
    process.exit(1);
  }

  console.log('📁 Fuente:', sourceImage);
  console.log('🗑️  Borrando iconos .webp antiguos...\n');

  // Borrar archivos .webp antiguos
  for (const folder of mipmapFolders) {
    const folderPath = path.join(androidResPath, folder);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        if (file.endsWith('.webp')) {
          fs.unlinkSync(path.join(folderPath, file));
          console.log(`  🗑️  Borrado: ${folder}/${file}`);
        }
      }
    }
  }

  console.log('\n📋 Creando ic_launcher.xml simple (sin foreground/background separados)...');

  // Crear carpeta anydpi-v26 si no existe
  const anydpiPath = path.join(androidResPath, 'mipmap-anydpi-v26');
  if (!fs.existsSync(anydpiPath)) {
    fs.mkdirSync(anydpiPath, { recursive: true });
  }

  // Escribir ic_launcher.xml simple que usa el icono directamente
  const launcherXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

  fs.writeFileSync(path.join(anydpiPath, 'ic_launcher.xml'), launcherXml);
  console.log('  ✅ ic_launcher.xml creado');

  // También crear ic_launcher_round.xml
  const roundXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

  fs.writeFileSync(path.join(anydpiPath, 'ic_launcher_round.xml'), roundXml);
  console.log('  ✅ ic_launcher_round.xml creado');

  console.log('\n🎉 Configuración completada!');
  console.log('\n⚠️  IMPORTANTE: Ahora debes usar Image Asset Studio:');
  console.log('1. Click derecho en carpeta "app" > New > Image Asset');
  console.log('2. Icon Type: Launcher Icons (Adaptive and Legacy)');
  console.log('3. Asset Type: Image');
  console.log('4. Path: Selecciona public/kdice-launcher.png');
  console.log('5. Background: @color/ic_launcher_background (o tu color)');
  console.log('6. Next > Finish');
  console.log('\n7. Build > Clean Project > Build APK(s)');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
