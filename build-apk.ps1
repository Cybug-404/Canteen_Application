# Build STQC Canteen release APK (requires Android SDK)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$jdk = Join-Path $root "jdk17\jdk-17.0.18+8"
if (Test-Path $jdk) { $env:JAVA_HOME = $jdk }

$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = Join-Path $root "android-sdk" }
if (-not (Test-Path $sdk)) { $sdk = "$env:LOCALAPPDATA\Android\Sdk" }
if (-not (Test-Path $sdk)) {
  Write-Host "Android SDK not found. Run scripts\setup-android-sdk.ps1 or install Android Studio."
  exit 1
}
$env:JAVA_HOME = "C:\Users\Acer\AppData\Local\Programs\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
if (-not (Test-Path $env:JAVA_HOME)) {
  $bundled = Join-Path $root "jdk17\jdk-17.0.18+8"
  if (Test-Path $bundled) { $env:JAVA_HOME = $bundled }
}

$localProps = Join-Path $root "android\local.properties"
$sdkDir = $sdk -replace '\\', '/'
"sdk.dir=$sdkDir" | Set-Content -Path $localProps -Encoding ASCII

Set-Location (Join-Path $root "android")
.\gradlew.bat assembleRelease
$apk = Join-Path $root "android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apk) {
  $out = Join-Path $root "STQC-Canteen-release.apk"
  $outDir = Join-Path $root "output"
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  Copy-Item $apk $out -Force
  Copy-Item $apk (Join-Path $outDir "STQC-Canteen-release.apk") -Force
  Write-Host "APK ready: $out"
  Write-Host "APK copy:  $(Join-Path $outDir 'STQC-Canteen-release.apk')"
}
