; ============================================================
; POPCORN PAWS — NSIS-инсталлятор
; Кошачий попкорнный Беспредел
; (c) 2025–2026 Raido Pert Studio
; Версия 0.0.72
; ============================================================

Unicode true
SetCompressor /SOLID lzma

!include "MUI2.nsh"

; --- Брендинг MUI2 ---
!define MUI_ICON            "/home/z/my-project/branding/icon.ico"
!define MUI_UNICON          "/home/z/my-project/branding/icon.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "/home/z/my-project/branding/nsis-welcome.bmp"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP       "/home/z/my-project/branding/nsis-header.bmp"
!define MUI_ABORTWARNING

Name "POPCORN PAWS"
OutFile "/home/z/my-project/desktop-build/POPCORN-PAWS-Setup-0.0.72.exe"
InstallDir "$PROGRAMFILES64\Raido Pert Studio\POPCORN PAWS"
InstallDirRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\POPCORNPAWS" "InstallLocation"
RequestExecutionLevel admin

; --- Версия и метаданные установщика ---
VIProductVersion "0.0.72.0"
VIAddVersionKey "ProductName"     "POPCORN PAWS"
VIAddVersionKey "CompanyName"     "Raido Pert Studio"
VIAddVersionKey "LegalCopyright"  "© 2025–2026 Raido Pert Studio"
VIAddVersionKey "FileDescription" "POPCORN PAWS — Кошачий попкорнный Беспредел"
VIAddVersionKey "FileVersion"     "0.0.72.0"
VIAddVersionKey "ProductVersion"  "0.0.72.0"

; --- Страницы установщика ---
!define MUI_FINISHPAGE_RUN "$INSTDIR\PopcornPaws.exe"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "/home/z/my-project/branding/license-notice.txt"

; Дисклеймер — отдельная страница (в MUI2 нет MUI_PAGE_README,
; используем вторую страницу лицензии с собственным заголовком).
!define MUI_PAGE_CUSTOMFUNCTION_PRE "PreDisclaimerPage"
!define MUI_LICENSEPAGE_TEXT_TOP "Прочтите дисклеймер перед продолжением установки."
!insertmacro MUI_PAGE_LICENSE "/home/z/my-project/branding/disclaimer.txt"

!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; --- Страницы деинсталлятора ---
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Russian"

Function PreDisclaimerPage
  !insertmacro MUI_HEADER_TEXT "Дисклеймер" "Важная информация об использовании игры POPCORN PAWS"
FunctionEnd

; ============================================================
; Установка
; ============================================================
Section "Install"

  SetOutPath "$INSTDIR"

  ; Все файлы приложения (Electron + статика игры)
  File /r "/home/z/my-project/desktop-build/win-unpacked/PopcornPaws/*.*"

  ; Ярлыки
  CreateDirectory "$SMPROGRAMS\Raido Pert Studio"
  CreateShortCut  "$SMPROGRAMS\Raido Pert Studio\POPCORN PAWS.lnk" "$INSTDIR\PopcornPaws.exe"
  CreateShortCut  "$DESKTOP\POPCORN PAWS.lnk" "$INSTDIR\PopcornPaws.exe"

  ; Деинсталлятор
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  ; Регистрация в «Установка и удаление программ»
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\POPCORNPAWS" "DisplayName"     "POPCORN PAWS (Кошачий попкорнный Беспредел)"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\POPCORNPAWS" "DisplayVersion"  "0.0.72"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\POPCORNPAWS" "Publisher"       "Raido Pert Studio"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\POPCORNPAWS" "DisplayIcon"     "$INSTDIR\PopcornPaws.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\POPCORNPAWS" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\POPCORNPAWS" "InstallLocation" "$INSTDIR"

SectionEnd

; ============================================================
; Удаление
; ============================================================
Section "Uninstall"

  RMDir /r "$INSTDIR"

  Delete "$SMPROGRAMS\Raido Pert Studio\POPCORN PAWS.lnk"
  Delete "$DESKTOP\POPCORN PAWS.lnk"
  RMDir  "$SMPROGRAMS\Raido Pert Studio"

  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\POPCORNPAWS"

SectionEnd
