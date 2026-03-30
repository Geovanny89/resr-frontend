#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Limpiando build anterior y regenerando APK...\n');

try {
  // 1. Limpiar build anterior
  console.log('🗑️ Limpiando build anterior...');
  if (fs.existsSync(path.join(__dirname, '../dist'))) {
    fs.rmSync(path.join(__dirname, '../dist'), { recursive: true });
    console.log('✅ Carpeta dist eliminada');
  }

  if (fs.existsSync(path.join(__dirname, '../android/app/build'))) {
    fs.rmSync(path.join(__dirname, '../android/app/build'), { recursive: true });
    console.log('✅ Build de Android eliminado');
  }

  // 2. Build del frontend
  console.log('🔨 Build del frontend con cambios actualizados...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  // 3. Sync con Capacitor
  console.log('🔄 Sincronizando con Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  // 4. Generar APK
  console.log('📱 Generando APK con cambios actualizados...');
  
  // Para Windows, usar gradlew.bat directamente
  const gradlewPath = path.join(__dirname, '../android/gradlew.bat');
  
  if (fs.existsSync(gradlewPath)) {
    // Ejecutar gradlew.bat directamente
    execSync('gradlew.bat assembleDebug', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '../android'),
      shell: true
    });
  } else {
    // Para Linux/Mac, usar gradlew
    execSync('./gradlew assembleDebug', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '../android') 
    });
  }

  // 5. Copiar APK a carpeta pública
  const apkSource = path.join(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk');
  const apkDestination = path.join(__dirname, '../public/apk/kdice-reservas.apk');

  if (fs.existsSync(apkSource)) {
    // Asegurar que exista la carpeta de destino
    const apkDir = path.dirname(apkDestination);
    if (!fs.existsSync(apkDir)) {
      fs.mkdirSync(apkDir, { recursive: true });
    }

    fs.copyFileSync(apkSource, apkDestination);
    console.log('✅ APK actualizada copiada a:', apkDestination);
    
    // Mostrar información
    const stats = fs.statSync(apkDestination);
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`📊 Tamaño: ${sizeInMB} MB`);
    console.log(`📅 Fecha: ${stats.mtime.toLocaleString()}`);
    console.log('\n🎉 APK actualizada con:');
    console.log('✅ Logo: Calendario con mano');
    console.log('✅ Login: Redirección automática');
    console.log('✅ Nombre: KDice Reservas');
    console.log('✅ ID: com.kdice.reservas');
  } else {
    throw new Error('No se encontró el archivo APK generado');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
