const fs = require('fs');
const path = require('path');

// Script para generar APK con nombre personalizado según negocio
const businessSlug = process.argv[2] || 'kdice';
const businessName = process.argv[3] || 'KDice POS';

console.log(`🏢 Generando APK para: ${businessName} (${businessSlug})`);

// 1. Leer capacitor.config.json
const configPath = path.join(__dirname, '../capacitor.config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 2. Modificar configuración con datos del negocio
config.appId = `com.${businessSlug}.app`;
config.appName = businessName.toUpperCase();

// 3. Guardar configuración temporal
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log(`✅ Configuración actualizada:`);
console.log(`   - appId: ${config.appId}`);
console.log(`   - appName: ${config.appName}`);

// 4. Ejecutar build
const { exec } = require('child_process');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error en build:', error);
    process.exit(1);
  }
  
  console.log('✅ Frontend construido');
  
  // 5. Sincronizar con Capacitor
  exec('npx cap sync android', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error en sync:', error);
      process.exit(1);
    }
    
    console.log('✅ Sincronizado con Android');
    
    // 6. Generar APK
    exec('cd android && gradlew.bat assembleDebug', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error generando APK:', error);
        process.exit(1);
      }
      
      console.log('✅ APK generada exitosamente');
      console.log(`📱 APK lista: android/app/build/outputs/apk/debug/app-debug.apk`);
      console.log(`🎯 Nombre personalizado: ${businessSlug}-app.apk`);
      
      // 7. Copiar con nombre personalizado
      const sourceApk = path.join(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk');
      const targetApk = path.join(__dirname, `../${businessSlug}-app.apk`);
      
      fs.copyFileSync(sourceApk, targetApk);
      console.log(`✅ APK copiada como: ${businessSlug}-app.apk`);
      
      // 8. Restaurar configuración original
      const originalConfig = {
        appId: "com.kdice.app",
        appName: "KDice",
        webDir: "dist"
      };
      fs.writeFileSync(configPath, JSON.stringify(originalConfig, null, 2));
      console.log('🔄 Configuración original restaurada');
    });
  });
});
