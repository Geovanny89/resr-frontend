#!/usr/bin/env bash

# Script para Linux/macOS:
# 1) compila frontend
# 2) sincroniza Capacitor
# 3) abre Android Studio para generar APK

set -e

echo "Compilando frontend..."
npm run build

echo "Sincronizando proyecto Android..."
npx cap sync android

echo "Abriendo Android Studio..."
npx cap open android

echo ""
echo "Listo. Genera la APK en Android Studio:"
echo "Build > Generate Signed Bundle / APK > APK"
echo "Salida esperada: android/app/build/outputs/apk/release/app-release.apk"
