/**
 * Script para optimizar assets antes del build de la APK
 * Elimina archivos innecesarios y comprime imágenes
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Archivos y carpetas a excluir del build de APK
const EXCLUDE_PATTERNS = [
  // Documentación
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  
  // Archivos de desarrollo
  '*.map',
  '*.test.js',
  '*.spec.js',
  
  // Archivos temporales
  '.DS_Store',
  'Thumbs.db',
  
  // Videos grandes (si no son esenciales)
  // '*.mp4',
  // '*.webm',
];

// Extensiones de imágenes a verificar
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function scanDirectory(dir, baseDir = dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (entry.isDirectory()) {
      files.push(...await scanDirectory(fullPath, baseDir));
    } else {
      const size = await getFileSize(fullPath);
      const ext = path.extname(entry.name).toLowerCase();
      
      files.push({
        path: fullPath,
        relativePath,
        size,
        extension: ext,
        isImage: IMAGE_EXTENSIONS.includes(ext),
      });
    }
  }
  
  return files;
}

async function optimizeAssets() {
  console.log('🔍 Analizando assets...\n');
  
  try {
    // Verificar si existe el directorio dist
    try {
      await fs.access(DIST_DIR);
    } catch {
      console.log('⚠️  No existe dist/. Ejecuta npm run build primero.');
      process.exit(1);
    }
    
    const files = await scanDirectory(DIST_DIR);
    
    // Análisis de tamaños
    let totalSize = 0;
    let imageSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    
    const largeFiles = [];
    
    for (const file of files) {
      totalSize += file.size;
      
      if (file.isImage) {
        imageSize += file.size;
        if (file.size > 500 * 1024) { // Imágenes mayores a 500KB
          largeFiles.push(file);
        }
      } else if (file.extension === '.js') {
        jsSize += file.size;
      } else if (file.extension === '.css') {
        cssSize += file.size;
      }
    }
    
    // Reporte
    console.log('📊 Resumen de tamaños:');
    console.log(`   Total: ${formatBytes(totalSize)}`);
    console.log(`   JavaScript: ${formatBytes(jsSize)}`);
    console.log(`   CSS: ${formatBytes(cssSize)}`);
    console.log(`   Imágenes: ${formatBytes(imageSize)}`);
    console.log(`   Otros: ${formatBytes(totalSize - imageSize - jsSize - cssSize)}`);
    
    if (largeFiles.length > 0) {
      console.log(`\n⚠️  Imágenes grandes encontradas (>500KB):`);
      largeFiles.forEach(f => {
        console.log(`   - ${f.relativePath}: ${formatBytes(f.size)}`);
      });
      console.log('💡 Considera comprimir estas imágenes antes del build.\n');
    }
    
    // Verificar archivos que pueden excluirse
    const excludedFiles = files.filter(f => 
      EXCLUDE_PATTERNS.some(pattern => {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(f.relativePath);
      })
    );
    
    if (excludedFiles.length > 0) {
      console.log(`🗑️  Archivos que se pueden excluir:`);
      excludedFiles.forEach(f => {
        console.log(`   - ${f.relativePath}: ${formatBytes(f.size)}`);
      });
    }
    
    console.log('\n✅ Análisis completado.');
    
    // Sugerencias
    if (totalSize > 10 * 1024 * 1024) {
      console.log('\n⚠️  El tamaño total es mayor a 10MB. Considera:');
      console.log('   1. Comprimir imágenes con herramientas como TinyPNG');
      console.log('   2. Usar formatos WebP para imágenes');
      console.log('   3. Lazy loading para imágenes no críticas');
      console.log('   4. Excluir assets no utilizados');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

optimizeAssets();
