#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Copiando APK generada a frontend...\n');

// Rutas
const androidApkPath = path.join(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk');
const frontendApkPath = path.join(__dirname, '../public/apk/kdice-reservas.apk');

try {
  // Verificar si existe la APK generada por Android Studio
  if (!fs.existsSync(androidApkPath)) {
    console.log('❌ No se encontró la APK generada por Android Studio');
    console.log('📱 Primero genera la APK en Android Studio:');
    console.log('   1. Abre el proyecto en Android Studio');
    console.log('   2. Ve a Build > Build Bundle(s) / APK(s) > Build APK(s)');
    console.log('   3. Espera a que termine la compilación');
    console.log('   4. Luego ejecuta este script nuevamente');
    process.exit(1);
  }

  // Verificar si existe la carpeta de destino
  const apkDir = path.dirname(frontendApkPath);
  if (!fs.existsSync(apkDir)) {
    fs.mkdirSync(apkDir, { recursive: true });
    console.log('📁 Carpeta de destino creada:', apkDir);
  }

  // Eliminar el placeholder si existe
  if (fs.existsSync(frontendApkPath)) {
    fs.unlinkSync(frontendApkPath);
  }

  // Copiar la APK
  fs.copyFileSync(androidApkPath, frontendApkPath);
  
  // Obtener información del archivo
  const stats = fs.statSync(frontendApkPath);
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  const lastModified = stats.mtime.toLocaleString();

  console.log('✅ APK copiada exitosamente:');
  console.log(`📂 Origen: ${androidApkPath}`);
  console.log(`📂 Destino: ${frontendApkPath}`);
  console.log(`📊 Tamaño: ${sizeInMB} MB`);
  console.log(`📅 Fecha: ${lastModified}`);
  
  console.log('\n🎉 APK lista para descargar desde el panel de admin!');
  console.log('📱 Los usuarios pueden descargarla desde /admin/download-apk');
  console.log('🌐 También disponible públicamente en /apk/kdice-reservas.apk');

} catch (error) {
  console.error('❌ Error al copiar la APK:', error.message);
  process.exit(1);
}
