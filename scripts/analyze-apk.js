/**
 * Script para analizar el contenido de la APK y encontrar qué ocupa espacio
 * Uso: node scripts/analyze-apk.js [ruta-a-la-apk]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_APK_PATH = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeApk(apkPath) {
  if (!fs.existsSync(apkPath)) {
    console.error(`❌ No se encontró la APK: ${apkPath}`);
    console.log('\n💡 Asegúrate de haber generado la APK primero:');
    console.log('   1. npm run build');
    console.log('   2. npx cap sync android');
    console.log('   3. Abrir Android Studio → Build → Build APK(s)');
    process.exit(1);
  }

  const apkSize = fs.statSync(apkPath).size;
  console.log(`📱 Analizando APK: ${apkPath}`);
  console.log(`📊 Tamaño total: ${formatBytes(apkSize)}\n`);

  // Crear directorio temporal
  const tempDir = path.join(__dirname, '..', 'temp-apk-analysis');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Extraer APK (es un ZIP)
    console.log('🔧 Extrayendo contenido de la APK...\n');
    execSync(`unzip -q "${apkPath}" -d "${tempDir}"`, { stdio: 'ignore' });

    // Analizar estructura
    const analysis = {
      'lib/': { size: 0, count: 0, desc: 'Librerías nativas (.so)' },
      'assets/': { size: 0, count: 0, desc: 'Assets web (React app)' },
      'res/': { size: 0, count: 0, desc: 'Recursos Android' },
      'classes.dex': { size: 0, count: 1, desc: 'Código compilado Java/Kotlin' },
      'AndroidManifest.xml': { size: 0, count: 1, desc: 'Manifiesto' },
      'resources.arsc': { size: 0, count: 1, desc: 'Recursos compilados' },
      'META-INF/': { size: 0, count: 0, desc: 'Metadatos y firma' },
      'kotlin/': { size: 0, count: 0, desc: 'Metadatos Kotlin' },
      'other': { size: 0, count: 0, desc: 'Otros archivos' },
    };

    // Calcular tamaños
    function scanDir(dir, basePath = '') {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);
        
        if (entry.isDirectory()) {
          scanDir(fullPath, relativePath);
        } else {
          const size = fs.statSync(fullPath).size;
          
          // Clasificar archivo
          if (relativePath.startsWith('lib/')) {
            analysis['lib/'].size += size;
            analysis['lib/'].count++;
          } else if (relativePath.startsWith('assets/')) {
            analysis['assets/'].size += size;
            analysis['assets/'].count++;
          } else if (relativePath.startsWith('res/')) {
            analysis['res/'].size += size;
            analysis['res/'].count++;
          } else if (relativePath === 'classes.dex' || relativePath.startsWith('classes')) {
            analysis['classes.dex'].size += size;
          } else if (relativePath === 'AndroidManifest.xml') {
            analysis['AndroidManifest.xml'].size += size;
          } else if (relativePath === 'resources.arsc') {
            analysis['resources.arsc'].size += size;
          } else if (relativePath.startsWith('META-INF/')) {
            analysis['META-INF/'].size += size;
            analysis['META-INF/'].count++;
          } else if (relativePath.startsWith('kotlin/')) {
            analysis['kotlin/'].size += size;
            analysis['kotlin/'].count++;
          } else {
            analysis['other'].size += size;
            analysis['other'].count++;
          }
        }
      }
    }

    scanDir(tempDir);

    // Mostrar resultados
    console.log('📦 Desglose por componente:\n');
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│ Componente           │ Tamaño    │ % Total │ Archivos         │');
    console.log('├─────────────────────────────────────────────────────────────────┤');

    const sorted = Object.entries(analysis)
      .filter(([_, data]) => data.size > 0)
      .sort((a, b) => b[1].size - a[1].size);

    let totalAnalyzed = 0;
    for (const [name, data] of sorted) {
      const percentage = ((data.size / apkSize) * 100).toFixed(1);
      const sizeStr = formatBytes(data.size).padStart(9);
      const countStr = data.count > 1 ? `${data.count} archivos`.padStart(17) : ''.padStart(17);
      
      console.log(`│ ${name.padEnd(20)} │ ${sizeStr} │ ${percentage.padStart(6)}% │ ${countStr} │`);
      totalAnalyzed += data.size;
    }

    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log(`│ ${'TOTAL'.padEnd(20)} │ ${formatBytes(totalAnalyzed).padStart(9)} │ ${'100.0'.padStart(6)}% │                    │`);
    console.log('└─────────────────────────────────────────────────────────────────┘');

    // Análisis detallado de assets (React app)
    console.log('\n\n📱 Análisis detallado de assets/ (Web App):\n');
    const assetsDir = path.join(tempDir, 'assets', 'public');
    
    if (fs.existsSync(assetsDir)) {
      const assetTypes = {};
      
      function scanAssets(dir, basePath = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.join(basePath, entry.name);
          
          if (entry.isDirectory()) {
            scanAssets(fullPath, relativePath);
          } else {
            const ext = path.extname(entry.name).toLowerCase() || 'sin-extension';
            const size = fs.statSync(fullPath).size;
            
            if (!assetTypes[ext]) {
              assetTypes[ext] = { size: 0, count: 0, files: [] };
            }
            assetTypes[ext].size += size;
            assetTypes[ext].count++;
            
            // Guardar archivos grandes (>500KB)
            if (size > 500 * 1024) {
              assetTypes[ext].files.push({ path: relativePath, size });
            }
          }
        }
      }
      
      scanAssets(assetsDir);
      
      // Ordenar por tamaño
      const sortedAssets = Object.entries(assetTypes)
        .sort((a, b) => b[1].size - a[1].size);

      console.log('┌─────────────────────────────────────────────────────────────────┐');
      console.log('│ Tipo        │ Tamaño    │ Cantidad │ Archivos grandes (>500KB) │');
      console.log('├─────────────────────────────────────────────────────────────────┤');
      
      for (const [ext, data] of sortedAssets) {
        const sizeStr = formatBytes(data.size).padStart(9);
        const countStr = String(data.count).padStart(8);
        const largeFiles = data.files.length > 0 ? `${data.files.length} ⚠️` : '0';
        
        console.log(`│ ${ext.padEnd(11)} │ ${sizeStr} │ ${countStr} │ ${largeFiles.padStart(25)} │`);
      }
      
      console.log('└─────────────────────────────────────────────────────────────────┘');
      
      // Mostrar archivos grandes específicos
      console.log('\n⚠️  Archivos grandes encontrados (>500KB):\n');
      let hasLargeFiles = false;
      for (const [ext, data] of sortedAssets) {
        if (data.files.length > 0) {
          hasLargeFiles = true;
          console.log(`  ${ext.toUpperCase()}:`);
          data.files.forEach(f => {
            console.log(`    - ${f.path}: ${formatBytes(f.size)}`);
          });
        }
      }
      
      if (!hasLargeFiles) {
        console.log('  ✅ No se encontraron archivos grandes individuales');
      }
    }

    // Análisis de librerías nativas
    console.log('\n\n🔧 Análisis de librerías nativas (lib/):\n');
    const libDir = path.join(tempDir, 'lib');
    
    if (fs.existsSync(libDir)) {
      const archs = fs.readdirSync(libDir);
      
      for (const arch of archs) {
        const archPath = path.join(libDir, arch);
        if (fs.statSync(archPath).isDirectory()) {
          const libs = fs.readdirSync(archPath);
          let archSize = 0;
          
          libs.forEach(lib => {
            const libPath = path.join(archPath, lib);
            archSize += fs.statSync(libPath).size;
          });
          
          console.log(`  ${arch}: ${formatBytes(archSize)} (${libs.length} librerías)`);
        }
      }
      
      console.log('\n💡 Si solo necesitas ARM64, modifica build.gradle:');
      console.log('   ndk { abiFilters \'arm64-v8a\' }');
    }

    // Recomendaciones
    console.log('\n\n💡 Recomendaciones para reducir tamaño:\n');
    
    const recommendations = [];
    
    if (analysis['lib/'].size > 5 * 1024 * 1024) {
      recommendations.push('1. Reducir arquitecturas nativas: Solo usa arm64-v8a en build.gradle');
    }
    
    if (analysis['assets/'].size > 5 * 1024 * 1024) {
      recommendations.push('2. Optimizar assets web: Comprime imágenes, usa WebP, lazy loading');
    }
    
    if (analysis['classes.dex'].size > 3 * 1024 * 1024) {
      recommendations.push('3. Habilitar ProGuard/R8: minifyEnabled true, shrinkResources true');
    }
    
    if (sortedAssets && sortedAssets.some(([ext]) => ['.png', '.jpg', '.jpeg'].includes(ext))) {
      recommendations.push('4. Convertir imágenes a WebP: Mejor compresión sin pérdida de calidad');
    }
    
    if (recommendations.length === 0) {
      console.log('  ✅ La APK tiene un tamaño razonable. No se detectaron optimizaciones críticas.');
    } else {
      recommendations.forEach(r => console.log(`  ${r}`));
    }

    // Limpieza
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    console.log('\n✅ Análisis completado.\n');
    
  } catch (error) {
    console.error('❌ Error al analizar la APK:', error.message);
    
    // Limpieza en caso de error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    process.exit(1);
  }
}

// Obtener ruta de APK desde argumentos o usar default
const apkPath = process.argv[2] || DEFAULT_APK_PATH;
analyzeApk(apkPath);
