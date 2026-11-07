; Nava Player installer customisation
; Copyright (c) 2026 Silenzio Morto. All rights reserved. https://github.com/SilenzioMorto
!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

!define NAVA_GH "https://github.com/SilenzioMorto"
!define NAVA_REPO "https://github.com/SilenzioMorto/NavaPlayer"
!define NAVA_PROGID "NavaPlayer.Audio"

; dark welcome / finish pages and header to match the app
!define MUI_BGCOLOR "0A120C"
!define MUI_TEXTCOLOR "E9F6E8"
!define MUI_FINISHPAGE_LINK "$(NavaGhLink)"
!define MUI_FINISHPAGE_LINK_LOCATION "${NAVA_GH}"
!define MUI_FINISHPAGE_LINK_COLOR "86EF6C"
!ifndef BUILD_UNINSTALLER
  !define MUI_FINISHPAGE_TITLE "$(NavaFinishTitle)"
  !define MUI_FINISHPAGE_TEXT "$(NavaFinishText)"
!else
  !define MUI_UNFINISHPAGE_NOAUTOCLOSE
  !define MUI_FINISHPAGE_TITLE "$(NavaUnFinishTitle)"
  !define MUI_FINISHPAGE_TEXT "$(NavaUnFinishText)"
!endif

!macro customHeader
  !insertmacro MUI_LANGUAGE "Farsi"
  LangString NavaWelcomeTitle ${LANG_ENGLISH} "Welcome to Nava Player (Beta)"
  LangString NavaWelcomeTitle ${LANG_FARSI} "به نوا پلیر خوش آمدید (بتا)"
  LangString NavaWelcomeText ${LANG_ENGLISH} "Nava is a visual music player with GPU effects, AI-generated lyrics, a 10-band equalizer and 40 presets.$\r$\n$\r$\nMade with love by Silenzio Morto.$\r$\nIf you enjoy it, please support me with a star on GitHub:$\r$\ngithub.com/SilenzioMorto$\r$\n$\r$\nClick Next to continue."
  LangString NavaWelcomeText ${LANG_FARSI} "نوا یک موزیک پلیر تصویری است با افکت‌های کارت گرافیک، ساخت متن آهنگ با هوش مصنوعی، اکولایزر ۱۰ باندی و ۴۰ پریست.$\r$\n$\r$\nساخته‌شده با عشق توسط Silenzio Morto.$\r$\nاگر از نوا خوشتان آمد، با یک ستاره در گیت‌هاب از من حمایت کنید:$\r$\ngithub.com/SilenzioMorto$\r$\n$\r$\nبرای ادامه روی «بعدی» کلیک کنید."
  LangString NavaOptsTitle ${LANG_ENGLISH} "Installation options"
  LangString NavaOptsTitle ${LANG_FARSI} "گزینه‌های نصب"
  LangString NavaOptsSub ${LANG_ENGLISH} "Choose how Nava Player fits into Windows."
  LangString NavaOptsSub ${LANG_FARSI} "انتخاب کنید نوا چطور در ویندوز قرار بگیرد."
  LangString NavaDeskLbl ${LANG_ENGLISH} "Create Desktop Shortcut"
  LangString NavaDeskLbl ${LANG_FARSI} "ساخت میانبر روی دسکتاپ"
  LangString NavaAssocLbl ${LANG_ENGLISH} "Register Nava as a music player (Open with / Default apps)"
  LangString NavaAssocLbl ${LANG_FARSI} "ثبت نوا به‌عنوان موزیک پلیر ویندوز (Open with و برنامه‌های پیش‌فرض)"
  LangString NavaOptsNote ${LANG_ENGLISH} "To make Nava your default player, open Windows Settings > Apps > Default apps > Nava Player after installing, or right-click any song > Open with > Nava Player > Always."
  LangString NavaOptsNote ${LANG_FARSI} "برای اینکه نوا پلیر پیش‌فرض شود، بعد از نصب به Settings > Apps > Default apps > Nava Player بروید، یا روی یک آهنگ راست‌کلیک کنید > Open with > Nava Player > Always."
  LangString NavaGhLink ${LANG_ENGLISH} "Support Silenzio Morto on GitHub ♥"
  LangString NavaGhLink ${LANG_FARSI} "حمایت از Silenzio Morto در گیت‌هاب ♥"
  LangString NavaFinishTitle ${LANG_ENGLISH} "Nava Player is ready"
  LangString NavaFinishTitle ${LANG_FARSI} "نوا پلیر آماده است"
  LangString NavaFinishText ${LANG_ENGLISH} "Thanks for installing Nava Player Beta.$\r$\nThis is a beta release; the full version is still being built.$\r$\n$\r$\nCreated by Silenzio Morto."
  LangString NavaFinishText ${LANG_FARSI} "ممنون که نوا پلیر بتا را نصب کردید.$\r$\nاین یک نسخه‌ی بتاست و نسخه‌ی اصلی هنوز در حال ساخت است.$\r$\n$\r$\nساخته‌شده توسط Silenzio Morto."
  LangString NavaUnTitle ${LANG_ENGLISH} "Leaving so soon?"
  LangString NavaUnTitle ${LANG_FARSI} "به این زودی می‌روید؟"
  LangString NavaUnText ${LANG_ENGLISH} "This will remove Nava Player from your computer.$\r$\n$\r$\nBefore you go, the next page asks why you are uninstalling. Your answer helps make the next version better.$\r$\n$\r$\nClick Next to continue."
  LangString NavaUnText ${LANG_FARSI} "این کار نوا پلیر را از کامپیوتر شما حذف می‌کند.$\r$\n$\r$\nقبل از رفتن، صفحه‌ی بعد دلیل حذف را می‌پرسد. جواب شما کمک می‌کند نسخه‌ی بعدی بهتر شود.$\r$\n$\r$\nبرای ادامه روی «بعدی» کلیک کنید."
  LangString NavaWhyTitle ${LANG_ENGLISH} "Why are you uninstalling Nava?"
  LangString NavaWhyTitle ${LANG_FARSI} "چرا نوا را حذف می‌کنید؟"
  LangString NavaWhySub ${LANG_ENGLISH} "Pick the closest reason. It only takes a second."
  LangString NavaWhySub ${LANG_FARSI} "نزدیک‌ترین دلیل را انتخاب کنید. فقط یک ثانیه طول می‌کشد."
  LangString NavaR1 ${LANG_ENGLISH} "It was slow or used too many resources"
  LangString NavaR1 ${LANG_FARSI} "کند بود یا منابع زیادی مصرف می‌کرد"
  LangString NavaR2 ${LANG_ENGLISH} "The AI lyrics were not accurate enough"
  LangString NavaR2 ${LANG_FARSI} "متن‌های هوش مصنوعی دقیق نبودند"
  LangString NavaR3 ${LANG_ENGLISH} "A feature I need is missing"
  LangString NavaR3 ${LANG_FARSI} "قابلیتی که لازم داشتم نبود"
  LangString NavaR4 ${LANG_ENGLISH} "I'm reinstalling or just trying it out"
  LangString NavaR4 ${LANG_FARSI} "دارم دوباره نصبش می‌کنم یا فقط امتحانش کردم"
  LangString NavaR5 ${LANG_ENGLISH} "Something else:"
  LangString NavaR5 ${LANG_FARSI} "دلیل دیگری:"
  LangString NavaDelData ${LANG_ENGLISH} "Also delete my settings, generated lyrics cache and AI models (frees about 1.6 GB)"
  LangString NavaDelData ${LANG_FARSI} "تنظیمات، حافظه‌ی متن‌ها و مدل‌های هوش مصنوعی هم پاک شوند (حدود ۱٫۶ گیگابایت آزاد می‌شود)"
  LangString NavaSendFb ${LANG_ENGLISH} "Send my reason as feedback on GitHub (opens your browser)"
  LangString NavaSendFb ${LANG_FARSI} "دلیلم را به‌عنوان بازخورد در گیت‌هاب بفرست (مرورگر باز می‌شود)"
  LangString NavaUnFinishTitle ${LANG_ENGLISH} "Goodbye, until we meet again"
  LangString NavaUnFinishTitle ${LANG_FARSI} "تا دیداری دیگر، بدرود"
  LangString NavaUnFinishText ${LANG_ENGLISH} "Nava Player has been removed. Thank you for giving it a try.$\r$\n$\r$\nThe door is always open — new versions land on GitHub."
  LangString NavaUnFinishText ${LANG_FARSI} "نوا پلیر حذف شد. ممنون که امتحانش کردید.$\r$\n$\r$\nدر همیشه باز است؛ نسخه‌های جدید در گیت‌هاب منتشر می‌شوند."
!macroend

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "$(NavaWelcomeTitle)"
  !define MUI_WELCOMEPAGE_TITLE_3LINES
  !define MUI_WELCOMEPAGE_TEXT "$(NavaWelcomeText)"
  !insertmacro MUI_PAGE_WELCOME
!macroend

!ifndef BUILD_UNINSTALLER
  Var NavaDesk
  Var NavaDeskState
  Var NavaAssoc
  Var NavaAssocState

  !macro customPageAfterChangeDir
    Page custom NavaOptsShow NavaOptsLeave
  !macroend

  Function NavaOptsShow
    !insertmacro MUI_HEADER_TEXT "$(NavaOptsTitle)" "$(NavaOptsSub)"
    nsDialogs::Create 1018
    Pop $0
    ${NSD_CreateCheckbox} 0 6u 100% 14u "$(NavaDeskLbl)"
    Pop $NavaDesk
    ${If} $NavaDeskState == ""
      StrCpy $NavaDeskState ${BST_CHECKED}
    ${EndIf}
    ${NSD_SetState} $NavaDesk $NavaDeskState
    ${NSD_CreateCheckbox} 0 26u 100% 14u "$(NavaAssocLbl)"
    Pop $NavaAssoc
    ${If} $NavaAssocState == ""
      StrCpy $NavaAssocState ${BST_CHECKED}
    ${EndIf}
    ${NSD_SetState} $NavaAssoc $NavaAssocState
    ${NSD_CreateLabel} 12u 46u 95% 40u "$(NavaOptsNote)"
    Pop $0
    ${NSD_CreateLink} 0 100u 100% 12u "$(NavaGhLink)"
    Pop $0
    ${NSD_OnClick} $0 NavaOpenGh
    nsDialogs::Show
  FunctionEnd

  Function NavaOptsLeave
    ${NSD_GetState} $NavaDesk $NavaDeskState
    ${NSD_GetState} $NavaAssoc $NavaAssocState
  FunctionEnd

  Function NavaOpenGh
    ExecShell "open" "${NAVA_GH}"
  FunctionEnd

  !macro NavaExt EXT
    WriteRegStr SHCTX "Software\Classes\.${EXT}\OpenWithProgids" "${NAVA_PROGID}" ""
    WriteRegStr SHCTX "Software\Nava Player\Capabilities\FileAssociations" ".${EXT}" "${NAVA_PROGID}"
    WriteRegStr SHCTX "Software\Classes\Applications\Nava Player.exe\SupportedTypes" ".${EXT}" ""
  !macroend

  !macro customInstall
    ${If} $NavaDeskState == ""
      ${IfNot} ${isUpdated}
        StrCpy $NavaDeskState ${BST_CHECKED}
      ${EndIf}
      StrCpy $NavaAssocState ${BST_CHECKED}
    ${EndIf}
    ${If} $NavaDeskState == ${BST_CHECKED}
      CreateShortCut "$DESKTOP\Nava Player.lnk" "$INSTDIR\Nava Player.exe" "" "$INSTDIR\Nava Player.exe" 0 SW_SHOWNORMAL "" "Nava Player"
    ${EndIf}
    ${If} $NavaAssocState == ${BST_CHECKED}
      WriteRegStr SHCTX "Software\Classes\${NAVA_PROGID}" "" "Audio file (Nava Player)"
      WriteRegStr SHCTX "Software\Classes\${NAVA_PROGID}\DefaultIcon" "" "$INSTDIR\Nava Player.exe,0"
      WriteRegStr SHCTX "Software\Classes\${NAVA_PROGID}\shell\open" "FriendlyAppName" "Nava Player"
      WriteRegStr SHCTX "Software\Classes\${NAVA_PROGID}\shell\open\command" "" '"$INSTDIR\Nava Player.exe" "%1"'
      WriteRegStr SHCTX "Software\Classes\Applications\Nava Player.exe" "FriendlyAppName" "Nava Player"
      WriteRegStr SHCTX "Software\Classes\Applications\Nava Player.exe\DefaultIcon" "" "$INSTDIR\Nava Player.exe,0"
      WriteRegStr SHCTX "Software\Classes\Applications\Nava Player.exe\shell\open\command" "" '"$INSTDIR\Nava Player.exe" "%1"'
      WriteRegStr SHCTX "Software\Nava Player\Capabilities" "ApplicationName" "Nava Player"
      WriteRegStr SHCTX "Software\Nava Player\Capabilities" "ApplicationDescription" "Visual music player with AI lyrics — by Silenzio Morto"
      WriteRegStr SHCTX "Software\Nava Player\Capabilities" "ApplicationIcon" "$INSTDIR\Nava Player.exe,0"
      !insertmacro NavaExt "mp3"
      !insertmacro NavaExt "flac"
      !insertmacro NavaExt "wav"
      !insertmacro NavaExt "ogg"
      !insertmacro NavaExt "oga"
      !insertmacro NavaExt "opus"
      !insertmacro NavaExt "m4a"
      !insertmacro NavaExt "aac"
      !insertmacro NavaExt "weba"
      WriteRegStr SHCTX "Software\RegisteredApplications" "Nava Player" "Software\Nava Player\Capabilities"
      System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
    ${EndIf}
  !macroend
!endif

!ifdef BUILD_UNINSTALLER
  Var NavaR1
  Var NavaR2
  Var NavaR3
  Var NavaR4
  Var NavaR5
  Var NavaOther
  Var NavaDelChk
  Var NavaDelState
  Var NavaFbChk
  Var NavaFbState
  Var NavaReason

  !macro customUnWelcomePage
    !define MUI_WELCOMEPAGE_TITLE "$(NavaUnTitle)"
    !define MUI_WELCOMEPAGE_TEXT "$(NavaUnText)"
    !insertmacro MUI_UNPAGE_WELCOME
    UninstPage custom un.NavaWhyShow un.NavaWhyLeave
  !macroend

  Function un.NavaWhyShow
    !insertmacro MUI_HEADER_TEXT "$(NavaWhyTitle)" "$(NavaWhySub)"
    nsDialogs::Create 1018
    Pop $0
    ${NSD_CreateRadioButton} 0 0 100% 12u "$(NavaR1)"
    Pop $NavaR1
    ${NSD_CreateRadioButton} 0 14u 100% 12u "$(NavaR2)"
    Pop $NavaR2
    ${NSD_CreateRadioButton} 0 28u 100% 12u "$(NavaR3)"
    Pop $NavaR3
    ${NSD_CreateRadioButton} 0 42u 100% 12u "$(NavaR4)"
    Pop $NavaR4
    ${NSD_Check} $NavaR4
    ${NSD_CreateRadioButton} 0 56u 30% 12u "$(NavaR5)"
    Pop $NavaR5
    ${NSD_CreateText} 31% 55u 68% 13u ""
    Pop $NavaOther
    ${NSD_CreateCheckbox} 0 80u 100% 14u "$(NavaDelData)"
    Pop $NavaDelChk
    ${NSD_CreateCheckbox} 0 98u 100% 14u "$(NavaSendFb)"
    Pop $NavaFbChk
    nsDialogs::Show
  FunctionEnd

  Function un.NavaWhyLeave
    ${NSD_GetState} $NavaDelChk $NavaDelState
    ${NSD_GetState} $NavaFbChk $NavaFbState
    StrCpy $NavaReason "just-trying"
    ${NSD_GetState} $NavaR1 $0
    ${If} $0 == ${BST_CHECKED}
      StrCpy $NavaReason "slow-or-heavy"
    ${EndIf}
    ${NSD_GetState} $NavaR2 $0
    ${If} $0 == ${BST_CHECKED}
      StrCpy $NavaReason "lyrics-accuracy"
    ${EndIf}
    ${NSD_GetState} $NavaR3 $0
    ${If} $0 == ${BST_CHECKED}
      StrCpy $NavaReason "missing-feature"
    ${EndIf}
    ${NSD_GetState} $NavaR5 $0
    ${If} $0 == ${BST_CHECKED}
      StrCpy $NavaReason "other"
    ${EndIf}
  FunctionEnd

  !macro customUnInstall
    Delete "$DESKTOP\Nava Player.lnk"
    DeleteRegValue SHCTX "Software\RegisteredApplications" "Nava Player"
    DeleteRegKey SHCTX "Software\Nava Player"
    DeleteRegKey SHCTX "Software\Classes\${NAVA_PROGID}"
    DeleteRegKey SHCTX "Software\Classes\Applications\Nava Player.exe"
    !insertmacro NavaUnExt "mp3"
    !insertmacro NavaUnExt "flac"
    !insertmacro NavaUnExt "wav"
    !insertmacro NavaUnExt "ogg"
    !insertmacro NavaUnExt "oga"
    !insertmacro NavaUnExt "opus"
    !insertmacro NavaUnExt "m4a"
    !insertmacro NavaUnExt "aac"
    !insertmacro NavaUnExt "weba"
    System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
    ${If} $NavaDelState == ${BST_CHECKED}
      RMDir /r "$APPDATA\Nava Player"
    ${EndIf}
    ${If} $NavaFbState == ${BST_CHECKED}
      ExecShell "open" "${NAVA_REPO}/issues/new?title=Uninstall%20feedback&labels=feedback&body=Reason:%20$NavaReason"
    ${EndIf}
  !macroend

  !macro NavaUnExt EXT
    DeleteRegValue SHCTX "Software\Classes\.${EXT}\OpenWithProgids" "${NAVA_PROGID}"
  !macroend
!endif
