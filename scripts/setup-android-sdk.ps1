# Install Android SDK components into project android-sdk folder
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$env:JAVA_HOME = "C:\Users\Acer\AppData\Local\Programs\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
if (-not (Test-Path $env:JAVA_HOME)) {
  $bundled = Join-Path $root "jdk17\jdk-17.0.18+8"
  if (Test-Path $bundled) { $env:JAVA_HOME = $bundled }
}
$sdkRoot = Join-Path $root "android-sdk"
$sdkman = Join-Path $sdkRoot "cmdline-tools\latest\bin\sdkmanager.bat"
if (-not (Test-Path $sdkman)) {
  Write-Host "Missing cmdline-tools in android-sdk. Extract Google command-line tools first."
  exit 1
}
$yes = ("y`n" * 50) -join ""
$yes | & $sdkman --sdk_root=$sdkRoot "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"
Write-Host "SDK install finished."
