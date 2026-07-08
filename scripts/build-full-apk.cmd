@echo off
setlocal EnableExtensions
set ROOT=%~dp0..
set BUILD=C:\p\canteen
set NODE=c:\Users\Acer\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe
set TEMP=C:\tmp
set TMP=C:\tmp
set GRADLE_USER_HOME=C:\gradle-cache
set JAVA_HOME=C:\Users\Acer\AppData\Local\Programs\Eclipse Adoptium\jdk-21.0.8.9-hotspot
set PATH=c:\Users\Acer\AppData\Local\Programs\cursor\resources\app\resources\helpers;%PATH%

if not exist "%BUILD%" mkdir "%BUILD%"
if not exist C:\tmp mkdir C:\tmp
if not exist C:\gradle-cache mkdir C:\gradle-cache

echo Syncing source to %BUILD% ...
robocopy "%ROOT%" "%BUILD%" /MIR /XD .git dist .vercel android\.gradle android\app\build android\build output /XF *.apk /NFL /NDL /NJH /NJS /nc /ns /np

echo Installing safe-area dependency...
cd /d "%BUILD%"
"%NODE%" "%BUILD%\node_modules\npm\bin\npm-cli.js" install react-native-safe-area-context@5.4.0 --no-save 2>nul
if errorlevel 1 (
  robocopy "%ROOT%\node_modules" "%BUILD%\node_modules" /E /NFL /NDL /NJH /NJS /nc /ns /np
  "%NODE%" "%BUILD%\node_modules\npm\bin\npm-cli.js" install 2>nul
)

echo Exporting Android bundle...
"%NODE%" "%BUILD%\node_modules\expo\bin\cli" export --platform android
if errorlevel 1 exit /b 1

if not exist "%BUILD%\android-sdk" (
  if exist "%ROOT%\android-sdk" robocopy "%ROOT%\android-sdk" "%BUILD%\android-sdk" /E /NFL /NDL /NJH /NJS /nc /ns /np
  if exist "C:\stqc-canteen\android-sdk" robocopy "C:\stqc-canteen\android-sdk" "%BUILD%\android-sdk" /E /NFL /NDL /NJH /NJS /nc /ns /np
)
echo sdk.dir=C:/p/canteen/android-sdk> "%BUILD%\android\local.properties"

cd /d "%BUILD%\android"
call gradlew.bat -Dorg.gradle.user.home=C:\gradle-cache assembleRelease --no-daemon
if errorlevel 1 exit /b 1

copy /Y app\build\outputs\apk\release\app-release.apk "%ROOT%\STQC-Canteen-release.apk"
if not exist "%ROOT%\output" mkdir "%ROOT%\output"
copy /Y app\build\outputs\apk\release\app-release.apk "%ROOT%\output\STQC-Canteen-release.apk"
echo.
echo SUCCESS: %ROOT%\STQC-Canteen-release.apk
exit /b 0
