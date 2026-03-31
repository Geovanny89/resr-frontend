/**
 * Script simple para analizar APK usando 7-Zip (Windows) o unzip (Linux/Mac)
 * Alternativa más robusta para Windows
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_APK_PATH = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function find7Zip() {
  const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  
  const possiblePaths = [
    path.join(programFiles, '7-Zip', '7z.exe'),
    path.join(programFilesX86, '7-Zip', '7z.exe'),
    'C:\\Program Files\\7-Zip\\7z.exe',
    'C:\\Program Files (x86)\\7-Zip\\7z.exe',
    '7z', // Si está en PATH
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  
  return null;
}

function extractApk(apkPath, outputDir) {
  // Crear directorio temporal en sistema
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apk-analysis-'));
  
  try {
    // Intentar con 7-Zip primero (Windows)
    const sevenZip = find7Zip();
    if (sevenZip) {
      console.log(`   Usando 7-Zip: ${sevenZip}`);
      execSync(`"${sevenZip}" x "${apkPath}" -o"${tempDir}" -y`, { stdio: 'ignore' });
      return tempDir;
    }
    
    // Intentar con PowerShell (Windows 10+)
    if (process.platform === 'win32') {
      console.log('   Usando PowerShell Expand-Archive...');
      execSync(
        `powershell -Command "Expand-Archive -Path '${apkPath}' -DestinationPath '${tempDir}' -Force"`,
        { stdio: 'ignore' }
      );
      return tempDir;
    }
    
    // Linux/Mac: usar unzip
    execSync(`unzip -q "${apkPath}" -d "${tempDir}"`, { stdio: 'ignore' });
    return tempDir;
    
  } catch (error) {
    // Limpiar en caso de error
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
    throw error;
  }
}

function analyzeApk(apkPath) {
  if (!fs.existsSync(apkPath)) {
    console.error(`\n❌ No se encontró la APK: ${apkPath}`);
    console.log('\n💡 Asegúrate de haber generado la APK primero:');
    console.log('   1. npm run build');
    console.log('   2. npx cap sync android');
    console.log('   3. Abrir Android Studio → Build → Build APK(s)');
    console.log('\n📍 Rutas comunes:');
    console.log('   Debug:  android/app/build/outputs/apk/debug/app-debug.apk');
    console.log('   Release: android/app/build/outputs/apk/release/app-release-unsigned.apk');
    process.exit(1);
  }

  const apkSize = fs.statSync(apkPath).size;
  console.log(`\n📱 Analizando APK: ${path.basename(apkPath)}`);
  console.log(`📊 Tamaño total: ${formatBytes(apkSize)}\n`);

  let tempDir = null;
  
  try {
    // Extraer APK
    console.log('🔧 Extrayendo contenido...');
    tempDir = extractApk(apkPath, tempDir);
    console.log(`   Extraído a: ${tempDir}\n`);

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
        const relativePath = path.posix.join(basePath.replace(/\\/g, '/'), entry.name);
        
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
          } else if (relativePath.startsWith('classes') && relativePath.endsWith('.dex')) {
            analysis['classes.dex'].size += size;
          } else if (relativePath === 'AndroidManifest.xml') {
            analysis['AndroidManifest.xml'].size = size;
          } else if (relativePath === 'resources.arsc') {
            analysis['resources.arsc'].size = size;
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
    console.log('┌──────────────────────────────────────────────────────────────┐');
    console.log('│ Componente           │ Tamaño    │ % Total │ Descripción   │');
    console.log('├──────────────────────────────────────────────────────────────┤');

    const sorted = Object.entries(analysis)
      .filter(([_, data]) => data.size > 0)
      .sort((a, b) => b[1].size - a[1].size);

    let totalAnalyzed = 0;
    for (const [name, data] of sorted) {
      const percentage = ((data.size / apkSize) * 100).toFixed(1);
      const sizeStr = formatBytes(data.size).padStart(9);
      const desc = data.desc.substring(0, 13).padStart(13);
      
      console.log(`│ ${name.padEnd(20)} │ ${sizeStr} │ ${percentage.padStart(6)}% │ ${desc} │`);
      totalAnalyzed += data.size;
    }

    console.log('├──────────────────────────────────────────────────────────────┤');
    console.log(`│ ${'TOTAL'.padEnd(20)} │ ${formatBytes(totalAnalyzed).padStart(9)} │ ${'100.0'.padStart(6)}% │               │`);
    console.log('└──────────────────────────────────────────────────────────────┘');

    // Análisis detallado de assets
    const assetsDir = path.join(tempDir, 'assets', 'public');
    if (fs.existsSync(assetsDir)) {
      console.log('\n\n📱 Análisis de assets/ (Web App):\n');
      
      const assetTypes = {};
      
      function scanAssets(dir, basePath = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.join(basePath, entry.name);
          
          if (entry.isDirectory()) {
            scanAssets(fullPath, relativePath);
          } else {
            const ext = path.extname(entry.name).toLowerCase() || 'sin-ext';
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
      
      const sortedAssets = Object.entries(assetTypes)
        .sort((a, b) => b[1].size - a[1].size);

      console.log('┌──────────────────────────────────────────────────────────────┐');
      console.log('│ Tipo        │ Tamaño    │ Cantidad │ Grandes (>500KB)      │');
      console.log('├──────────────────────────────────────────────────────────────┤');
      
      for (const [ext, data] of sortedAssets) {
        const sizeStr = formatBytes(data.size).padStart(9);
        const countStr = String(data.count).padStart(8);
        const largeFiles = data.files.length > 0 ? `${data.files.length} ⚠️` : '0';
        
        console.log(`│ ${ext.padEnd(11)} │ ${sizeStr} │ ${countStr} │ ${largeFiles.padStart(21)} │`);
      }
      
      console.log('└──────────────────────────────────────────────────────────────┘');
      
      // Mostrar archivos grandes
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
        console.log('  ✅ No hay archivos grandes individuales');
      }
    }

    // Análisis de librerías nativas
    const libDir = path.join(tempDir, 'lib');
    if (fs.existsSync(libDir)) {
      console.log('\n\n🔧 Librerías nativas (lib/):\n');
      
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
          
          console.log(`  ${arch.padEnd(15)}: ${formatBytes(archSize).padStart(10)} (${libs.length} libs)`);
        }
      }
    }

    // Recomendaciones
    console.log('\n\n💡 Recomendaciones:\n');
    
    const recs = [];
    
    if (analysis['lib/'].size > 5 * 1024 * 1024) {
      recs.push('1. Solo usar arm64-v8a: reduce ~40% de librerías nativas');
    }
    
    if (analysis['assets/'].size > 5 * 1024 * 1024) {
      recs.push('2. Comprimir imágenes: usa TinyPNG.com o convierte a WebP');
      recs.push('3. Lazy loading: carga imágenes solo cuando se necesiten');
    }
    
    if (analysis['classes.dex'].size > 2 * 1024 * 1024) {
      recs.push('4. ProGuard/R8: habilita minifyEnabled y shrinkResources');
    }
    
    if (recs.length === 0) {
      console.log('  ✅ La APK tiene un tamaño razonable');
    } else {
      recs.forEach(r => console.log(`  ${r}`));
    }

    console.log('\n✅ Análisis completado.\n');
    
  } catch (error) {
    console.error('\n❌ Error al analizar:', error.message);
    if (error.message.includes('7-Zip') || error.message.includes('unzip')) {
      console.log('\n💡 Instala 7-Zip desde: https://www.7-zip.org/');
    }
  } finally {
    // Limpieza segura
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true, maxRetries: 3 });
      } catch (e) {
        console.log(`   ⚠️  No se pudo eliminar temp: ${tempDir}`);
      }
    }
  }
}

// Obtener ruta de APK desde argumentos
const apkPath = process.argv[2] || DEFAULT_APK_PATH;
analyzeApk(apkPath);
