#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Generando iconos PNG de launcher para KDice Reservas...\n');

// Tamaños de iconos Android
const iconSizes = {
  'mipmap-mdpi': { launcher: 48, round: 48 },
  'mipmap-hdpi': { launcher: 72, round: 72 },
  'mipmap-xhdpi': { launcher: 96, round: 96 },
  'mipmap-xxhdpi': { launcher: 144, round: 144 },
  'mipmap-xxxhdpi': { launcher: 192, round: 192 },
  'mipmap-anydpi-v26': { launcher: 48, round: 48 }
};

// Rutas
const androidResPath = path.join(__dirname, '../android/app/src/main/res');
const svgPath = path.join(__dirname, '../public/launcher-icon.svg');

try {
  // Verificar que exista el SVG
  if (!fs.existsSync(svgPath)) {
    console.log('❌ No se encontró el archivo launcher-icon.svg');
    process.exit(1);
  }

  console.log('📁 Creando iconos PNG para cada resolución...\n');

  // Para cada tamaño de icono
  for (const [folder, sizes] of Object.entries(iconSizes)) {
    const folderPath = path.join(androidResPath, folder);
    
    // Crear carpeta si no existe
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    console.log(`📱 Generando iconos para ${folder}:`);

    // Icono principal (ic_launcher.png) - Copiar SVG como PNG temporal
    const launcherPath = path.join(folderPath, 'ic_launcher.png');
    if (fs.existsSync(launcherPath)) {
      console.log(`  🔄 Reemplazando ic_launcher.png (${sizes.launcher}px)`);
      fs.copyFileSync(svgPath, launcherPath);
    }

    // Icono redondo (ic_launcher_round.png) - Copiar SVG como PNG temporal
    const roundPath = path.join(folderPath, 'ic_launcher_round.png');
    if (fs.existsSync(roundPath)) {
      console.log(`  🔄 Reemplazando ic_launcher_round.png (${sizes.round}px)`);
      fs.copyFileSync(svgPath, roundPath);
    }

    // Para anydpi-v26, también crear ic_launcher_foreground
    if (folder === 'mipmap-anydpi-v26') {
      const foregroundPath = path.join(folderPath, 'ic_launcher_foreground.xml');
      const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FF6B00"
        android:pathData="M54,54m-54,0a54,54 0,1 1,108 0a54,54 0,1 1,-108 0"/>
    <path
        android:fillColor="#E6007E"
        android:pathData="M54,54m-48,0a48,48 0,1 1,96 0a48,48 0,1 1,-96 0"/>
    <path
        android:fillColor="#5E00B8"
        android:pathData="M54,54m-42,0a42,42 0,1 1,84 0a42,42 0,1 1,-84 0"/>
</vector>`;
      
      fs.writeFileSync(foregroundPath, xmlContent);
      console.log(`  ✅ Creando ic_launcher_foreground.xml`);
    }
  }

  console.log('\n🎉 Iconos PNG generados!');
  console.log('📱 Nota: Android Studio usará estos PNG para generar la APK');
  console.log('🔄 Ahora ve a Android Studio y genera la APK');
  console.log('\n📝 Pasos siguientes:');
  console.log('1. Android Studio > Build > Clean Project');
  console.log('2. Android Studio > Build > Rebuild Project');
  console.log('3. Android Studio > Build > Build Bundle(s) / APK(s) > Build APK(s)');
  console.log('4. npm run copy-apk');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
