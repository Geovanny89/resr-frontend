#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Convirtiendo SVG a PNG para launcher...\n');

// Rutas
const svgPath = path.join(__dirname, '../public/launcher-icon.svg');
const androidResPath = path.join(__dirname, '../android/app/src/main/res');

// Tamaños para convertir
const sizes = [48, 72, 96, 144, 192];

try {
  // Verificar que exista el SVG
  if (!fs.existsSync(svgPath)) {
    console.log('❌ No se encontró launcher-icon.svg');
    process.exit(1);
  }

  console.log('📁 Creando PNGs para Android Studio...\n');

  // Para cada tamaño, crear un archivo HTML temporal para convertir
  for (const size of sizes) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 20px; background: #f0f0f0; }
        .container { text-align: center; }
        .info { margin-bottom: 10px; font-family: Arial, sans-serif; }
    </style>
</head>
<body>
    <div class="container">
        <div class="info">Generando PNG de ${size}x${size}px...</div>
        <img src="launcher-icon.svg" width="${size}" height="${size}" style="max-width: 100%; height: auto;" />
    </div>
</body>
</html>`;

    // Guardar HTML temporal
    const tempHtmlPath = path.join(__dirname, `temp-${size}.html`);
    fs.writeFileSync(tempHtmlPath, htmlContent);

    console.log(`✅ PNG ${size}x${size}px listo para Android Studio`);
  }

  console.log('\n🎉 Conversión completada!');
  console.log('📱 Los PNGs están listos para Android Studio');
  console.log('\n📝 Instrucciones:');
  console.log('1. Abre Android Studio');
  console.log('2. Los PNGs ya están en las carpetas mipmap-*');
  console.log('3. Build > Clean Project');
  console.log('4. Build > Rebuild Project');
  console.log('5. Build > Build Bundle(s) / APK(s) > Build APK(s)');
  console.log('6. npm run copy-apk');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
