#!/bin/bash
# Patch Expo/pnpm Android build issues
set -e
cd "$(dirname "$0")/../.."

echo "=== Patching expo-modules-core ExpoModulesCorePlugin.gradle ==="
CORE_GRADLE=$(find node_modules -path "*/expo-modules-core/android/ExpoModulesCorePlugin.gradle" 2>/dev/null | head -1)
if [ -n "$CORE_GRADLE" ] && grep -q "from components.release" "$CORE_GRADLE" && ! grep -q "findByName" "$CORE_GRADLE"; then
  sed -i 's/        release(MavenPublication) {/        if (components.findByName('\''release'\'')) {\n          release(MavenPublication) {/' "$CORE_GRADLE"
  sed -i '/from components.release/{n;s/        }/          }\n        }/}' "$CORE_GRADLE"
  echo "  Patched components.release guard"
fi

echo "=== Patching expo-module-gradle-plugin references ==="
for f in $(grep -rl "expo-module-gradle-plugin" node_modules/ 2>/dev/null | grep "build.gradle"); do
  NS=$(grep "namespace" "$f" | head -1 | sed 's/.*"\(.*\)".*/\1/')
  VER=$(grep "versionName" "$f" | head -1 | sed "s/.*'\(.*\)'.*/\1/")
  VCODE=$(grep "versionCode" "$f" | head -1 | sed 's/.*versionCode \([0-9]*\).*/\1/')
  DEPS=$(sed -n '/^dependencies {/,/^}/p' "$f" | grep -v "^dependencies" | grep -v "^}")

  echo "  Patching: $f (ns=$NS)"
  cat > "$f" << GRADLE
plugins {
  id 'com.android.library'
  id 'kotlin-android'
}

group = 'host.exp.exponent'

android {
  namespace "$NS"
  compileSdk safeExtGet("compileSdkVersion", 35)
  defaultConfig {
    minSdk safeExtGet("minSdkVersion", 24)
    targetSdk safeExtGet("targetSdkVersion", 34)
    versionCode ${VCODE:-1}
    versionName '${VER:-1.0.0}'
  }
}

def safeExtGet(prop, fallback) {
  rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

dependencies {
  implementation project(':expo-modules-core')
$DEPS
}
GRADLE
done

echo "=== Adding PackageList fix to app/build.gradle ==="
APP_GRADLE="apps/mobile/android/app/build.gradle"
if [ -f "$APP_GRADLE" ] && ! grep -q "generateAutolinkingPackageList" "$APP_GRADLE"; then
  # Insert after the react block closing brace
  PATCH='
// Fix pnpm autolinking: expo.core -> expo.modules
tasks.matching { it.name == '\''generateAutolinkingPackageList'\'' }.configureEach {
    doLast {
        def pkgList = new File(project.buildDir, '\''generated/autolinking/src/main/java/com/facebook/react/PackageList.java'\'')
        if (pkgList.exists()) {
            def content = pkgList.text
            if (content.contains('\''expo.core.ExpoModulesPackage'\'')) {
                pkgList.text = content.replace('\''expo.core.ExpoModulesPackage'\'', '\''expo.modules.ExpoModulesPackage'\'')
            }
        }
    }
}'
  # Find line number of autolinkLibrariesWithApp and its closing brace
  LINE=$(grep -n "autolinkLibrariesWithApp" "$APP_GRADLE" | head -1 | cut -d: -f1)
  BRACE_LINE=$((LINE + 1))
  sed -i "${BRACE_LINE}a\\${PATCH}" "$APP_GRADLE"
  echo "  Added PackageList fix"
fi

echo "=== All patches applied ==="
