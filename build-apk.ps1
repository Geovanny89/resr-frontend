$ErrorActionPreference = "Stop"

Write-Host "Compilando frontend..."
npm run build

Write-Host "Sincronizando Android con Capacitor..."
npx cap sync android

Write-Host "Abriendo Android Studio..."
npx cap open android

Write-Host ""
Write-Host "Genera la APK desde Android Studio:"
Write-Host "Build > Generate Signed Bundle / APK > APK"
Write-Host "Salida esperada: android/app/build/outputs/apk/release/app-release.apk"
