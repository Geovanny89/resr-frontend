#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando generación de APK Global KDice Reservas...\n');

// Configuración
const APP_NAME = 'KDice Reservas';
const APP_ID = 'com.kdice.reservas';
const OUTPUT_DIR = path.join(__dirname, '../../apks');
const APK_NAME = 'kdice-reservas.apk';

try {
  // 1. Crear carpeta de salida si no existe
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('📁 Carpeta de salida creada:', OUTPUT_DIR);
  }

  // 2. Build del frontend
  console.log('🔨 Build del frontend...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  // 3. Sync con Capacitor
  console.log('🔄 Sincronizando con Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  // 4. Generar APK Debug
  console.log('📱 Generando APK Debug...');
  execSync('cd android && ./gradlew assembleDebug', { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '../android') 
  });

  // 5. Copiar APK a carpeta de salida
  const apkSource = path.join(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk');
  const apkDestination = path.join(OUTPUT_DIR, APK_NAME);

  if (fs.existsSync(apkSource)) {
    fs.copyFileSync(apkSource, apkDestination);
    console.log('✅ APK copiada a:', apkDestination);
    
    // Mostrar información del archivo
    const stats = fs.statSync(apkDestination);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`📊 Tamaño: ${sizeInMB} MB`);
    console.log(`📅 Fecha: ${stats.mtime.toLocaleString()}`);
  } else {
    throw new Error('No se encontró el archivo APK generado');
  }

  // 6. También copiar a uploads del backend
  const backendUploads = path.join(__dirname, '../../backend/uploads');
  if (!fs.existsSync(backendUploads)) {
    fs.mkdirSync(backendUploads, { recursive: true });
  }
  
  const backendApk = path.join(backendUploads, 'kdice-app.apk');
  fs.copyFileSync(apkSource, backendApk);
  console.log('✅ APK también copiada a backend/uploads:', backendApk);

  console.log('\n🎉 APK Global KDice Reservas generada exitosamente!');
  console.log(`📱 Nombre: ${APP_NAME}`);
  console.log(`🆔 ID: ${APP_ID}`);
  console.log(`📂 Ubicación: ${apkDestination}`);
  console.log(`🌐 Backend: ${backendApk}`);
  console.log('\n🔧 Para instalar en tu dispositivo:');
  console.log(`1. Copia el archivo: ${apkDestination}`);
  console.log('2. Transfiérelo a tu teléfono Android');
  console.log('3. Habilita "Fuentes desconocidas" en Ajustes > Seguridad');
  console.log('4. Instala el APK');

} catch (error) {
  console.error('❌ Error durante la generación de APK:', error.message);
  process.exit(1);
}
