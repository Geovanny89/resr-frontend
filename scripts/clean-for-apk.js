import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para limpiar archivos que no deben ir en la APK
 * Se ejecuta ANTES de cap sync para excluir videos pesados
 */

const distPath = path.join(__dirname, '..', 'dist');
const androidAssetsPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'public');

console.log('🧹 Preparando build para APK (excluyendo videos pesados)...\n');

// Verificar si dist existe
if (!fs.existsSync(distPath)) {
  console.log('⚠️  No existe carpeta dist, saltando limpieza');
  process.exit(0);
}

// Buscar y eliminar videos de la carpeta dist (para que no vayan a la APK)
function cleanVideosFromDir(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  const items = fs.readdirSync(dirPath);
  let removedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursivamente limpiar subcarpetas
      const removed = cleanVideosFromDir(fullPath);
      removedCount += removed;
    } else if (stat.isFile() && item.match(/\.(mp4|mov|avi|mkv)$/i)) {
      // Es un video, eliminarlo
      const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
      fs.unlinkSync(fullPath);
      console.log(`  ✅ Eliminado: ${item} (${sizeMB} MB)`);
      removedCount++;
    }
  }
  
  return removedCount;
}

try {
  // Limpiar videos de dist
  const removedFromDist = cleanVideosFromDir(distPath);
  
  // Limpiar videos de assets de Android (después de cap sync)
  const removedFromAndroid = cleanVideosFromDir(androidAssetsPath);
  
  const totalRemoved = removedFromDist + removedFromAndroid;
  
  if (totalRemoved > 0) {
    console.log(`\n✅ ${totalRemoved} video(s) eliminado(s)`);
    console.log('📱 La APK no incluirá videos pesados\n');
  } else {
    console.log('✅ No se encontraron videos\n');
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error al limpiar videos:', error.message);
  process.exit(1);
}
