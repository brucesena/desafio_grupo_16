#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Gerando APK..."
cd "$PROJECT_DIR"
npx ng build --configuration production
npx cap sync android
cd "$PROJECT_DIR/android"
./gradlew assembleDebug
APK_PATH="$PROJECT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"

echo "APK gerado com sucesso!"
echo "Caminho: $APK_PATH"

