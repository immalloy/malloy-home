@echo off
setlocal EnableExtensions
title Malloy Site Dev Server

cd /d "%~dp0"

set "ARG1=%~1"
set "REQUESTED_PORT=%~1"
set "PORT="
set "HOST=127.0.0.1"
set "MIN_PORT=3000"
set "MAX_PORT=3010"

echo Malloy Site
echo ===========
echo.

if /i "%ARG1%"=="--help" goto :usage
if /i "%ARG1%"=="-h" goto :usage
if /i "%ARG1%"=="/?" goto :usage

if not exist "package.json" (
  echo Could not find package.json.
  echo Run this script from the Malloy Site project folder.
  echo.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or is not on PATH.
  echo Install Node.js, then run this script again.
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is not installed or is not on PATH.
  echo Reinstall Node.js with npm enabled, then run this script again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo Dependency install failed.
    pause
    exit /b 1
  )
  echo.
)

if /i "%ARG1%"=="--check" goto :check

if defined REQUESTED_PORT (
  echo %REQUESTED_PORT%| findstr /r "^[0-9][0-9]*$" >nul
  if errorlevel 1 (
    echo Port must be a number. Example:
    echo   test-site.bat 3001
    echo.
    pause
    exit /b 1
  )
  echo Checking requested port %REQUESTED_PORT%...
) else (
  echo Finding a free port from %MIN_PORT% to %MAX_PORT%...
)

for /f "usebackq delims=" %%P in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$requested = '%REQUESTED_PORT%'; if ($requested) { $ports = @([int]$requested) } else { $ports = %MIN_PORT%..%MAX_PORT% }; foreach ($p in $ports) { $used = Get-NetTCPConnection -LocalAddress '%HOST%' -LocalPort $p -State Listen -ErrorAction SilentlyContinue; if (-not $used) { Write-Output $p; exit 0 } }; exit 1"`) do set "PORT=%%P"

if not defined PORT (
  if defined REQUESTED_PORT (
    echo Port %REQUESTED_PORT% is already in use.
  ) else (
    echo No free port found from %MIN_PORT% to %MAX_PORT%.
  )
  echo Close another local server or pass a free port, for example:
  echo   test-site.bat 3001
  echo.
  pause
  exit /b 1
)

set "URL=http://%HOST%:%PORT%"

echo.
echo Starting local site at %URL%
echo Press Ctrl+C to stop the server.
echo.

start "" "%URL%"

call npm run dev -- --hostname %HOST% --port %PORT%
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if "%EXIT_CODE%"=="0" (
  echo The dev server stopped.
) else (
  echo The dev server stopped with exit code %EXIT_CODE%.
)
echo.
pause
exit /b %EXIT_CODE%

:check
echo Running site checks...
echo.

call npm run typecheck
if errorlevel 1 goto :check_failed

call npm run lint
if errorlevel 1 goto :check_failed

call npm run build
if errorlevel 1 goto :check_failed

echo.
echo Site checks passed.
pause
exit /b 0

:check_failed
echo.
echo Site checks failed.
pause
exit /b 1

:usage
echo Usage:
echo   test-site.bat           Start the dev server on a free port from %MIN_PORT% to %MAX_PORT%.
echo   test-site.bat 3001      Start the dev server on a specific port.
echo   test-site.bat --check   Run typecheck, lint, and build.
echo.
pause
exit /b 0
