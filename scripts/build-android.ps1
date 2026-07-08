# Build STQC Canteen debug APK (or run on device with -RunOnDevice)
param(
    [switch]$RunOnDevice,
    [switch]$Release
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$AndroidDir = Join-Path $ProjectRoot "android"
$SdkDefault = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$LocalProps = Join-Path $AndroidDir "local.properties"

function Find-Node {
    if (Get-Command node -ErrorAction SilentlyContinue) {
        return (Get-Command node).Source
    }
    $cursorNode = Join-Path $env:LOCALAPPDATA "Programs\cursor\resources\app\resources\helpers\node.exe"
    if (Test-Path $cursorNode) { return $cursorNode }
    throw "Node.js not found. Install from https://nodejs.org"
}

function Ensure-SdkPath {
    if (Test-Path $LocalProps) { return }
    if (-not (Test-Path $SdkDefault)) {
        Write-Host "Android SDK not found at: $SdkDefault"
        Write-Host "Install Android Studio, then copy android\local.properties.example to android\local.properties"
        Write-Host "and set sdk.dir to your SDK path."
        exit 1
    }
    $escaped = ($SdkDefault -replace '\\', '\\')
    "sdk.dir=$escaped" | Set-Content -Path $LocalProps -Encoding ASCII
    Write-Host "Created local.properties -> $SdkDefault"
}

Set-Location $ProjectRoot
$node = Find-Node
Ensure-SdkPath

Write-Host "Exporting Android JS bundle..."
& $node (Join-Path $ProjectRoot "node_modules\expo\bin\cli") export --platform android
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Set-Location $AndroidDir
$task = if ($Release) { "assembleRelease" } else { "assembleDebug" }
if ($RunOnDevice) {
    Write-Host "Installing debug build on device/emulator..."
    .\gradlew.bat installDebug
} else {
    Write-Host "Building APK ($task)..."
    .\gradlew.bat $task
    if ($LASTEXITCODE -eq 0) {
        if ($Release) {
            $apk = "app\build\outputs\apk\release\app-release.apk"
        } else {
            $apk = "app\build\outputs\apk\debug\app-debug.apk"
        }
        Write-Host ""
        Write-Host "APK ready:" (Join-Path $AndroidDir $apk)
    }
}
exit $LASTEXITCODE
