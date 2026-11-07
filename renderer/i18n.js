'use strict';
/* Nava Player — UI strings. Copyright (c) 2026 Silenzio Morto. All rights reserved. */
(function () {
const S = {
  // general
  appName: ['نوا پلیر', 'Nava Player'], beta: ['بتا', 'Beta'],
  search: ['جستجو در آهنگ، خواننده، آلبوم', 'Search songs, artists, albums'],
  ok: ['باشه', 'OK'], cancel: ['انصراف', 'Cancel'], close: ['بستن', 'Close'], save: ['ذخیره', 'Save'], delete: ['حذف', 'Delete'], reset: ['بازگردانی', 'Reset'],
  next: ['بعدی', 'Next'], back: ['قبلی', 'Back'], skip: ['رد کردن', 'Skip'], done: ['تمام', 'Done'], later: ['بعداً', 'Later'], yes: ['بله', 'Yes'], no: ['نه', 'No'],
  sure: ['مطمئنی؟ دوباره بزن', 'Sure? Click again'], on: ['روشن', 'On'], off: ['خاموش', 'Off'], seconds: ['ثانیه', 's'], minutes: ['دقیقه', 'min'],
  unknownArtist: ['هنرمند نامشخص', 'Unknown artist'], untitled: ['بی‌نام', 'Untitled'], noAlbum: ['بدون آلبوم', 'No album'],
  songs: ['آهنگ', 'songs'], albums: ['آلبوم', 'albums'], artists: ['خواننده', 'artists'], folders: ['پوشه', 'folders'],
  // titlebar / tooltips
  tLibrary: ['کتابخانه (B)', 'Library (B)'], tTheme: ['تم بعدی', 'Next theme'], tStage: ['حالت نمایش (H)', 'Stage mode (H)'], tFull: ['تمام‌صفحه (F)', 'Fullscreen (F)'],
  tAppSettings: ['تنظیمات برنامه', 'App settings'], tPlaySettings: ['صدا و صحنه', 'Sound & scene'], tLink: ['پخش از لینک', 'Play from a link'],
  tLyrics: ['متن آهنگ (L)', 'Lyrics (L)'], tMute: ['بی‌صدا (M)', 'Mute (M)'], tShuffle: ['تصادفی', 'Shuffle'], tPrev: ['قبلی', 'Previous'], tNext: ['بعدی', 'Next'],
  tPlay: ['پخش / توقف (Space)', 'Play / Pause (Space)'], tRepeat: ['تکرار', 'Repeat'], tEq: ['اکولایزر', 'Equalizer'], tFav: ['علاقه‌مندی', 'Favorite'], tReveal: ['نمایش در پوشه', 'Show in folder'],
  tOpenFile: ['باز کردن فایل', 'Open files'], tAddFolder: ['افزودن پوشه', 'Add folder'], tRescan: ['اسکن دوباره', 'Rescan'], tBooster: ['تقویت صدا فعاله', 'Sound booster is on'],
  // library
  vSongs: ['آهنگ‌ها', 'Songs'], vAlbums: ['آلبوم‌ها', 'Albums'], vArtists: ['خواننده‌ها', 'Artists'], vFolders: ['پوشه‌ها', 'Folders'], vFavs: ['علاقه‌مندی‌ها', 'Favorites'], vQueue: ['صف پخش', 'Queue'],
  sortTitle: ['بر اساس نام', 'By title'], sortArtist: ['بر اساس خواننده', 'By artist'], sortAdded: ['تازه‌ترین', 'Newest'], sortDuration: ['طولانی‌ترین', 'Longest'], sortPlays: ['پرپخش‌ترین', 'Most played'],
  short: ['کوتاه', 'short'], shortTip: ['کوتاه‌تر از حد تعیین‌شده؛ فقط وقتی خودت انتخابش کنی پخش می‌شه', 'Shorter than your limit; plays only when you pick it'],
  scanWalk: ['در حال پیدا کردن آهنگ‌ها…', 'Finding your music…'], scanParse: ['خواندن اطلاعات {a} از {b}', 'Reading tags {a} of {b}'], scanDone: ['{n} آهنگ در کتابخانه', '{n} songs in library'], scanErr: ['خطا در اسکن: {m}', 'Scan error: {m}'],
  emptyTitle: ['کتابخانه‌ات <em>خالیه</em>', 'Your library is <em>empty</em>'], emptyScanning: ['دارم آهنگ‌های سیستمت رو پیدا می‌کنم…', 'Looking for music on your PC…'],
  emptyMsg: ['توی پوشه‌های Music، Downloads و Desktop آهنگی پیدا نشد. یه پوشه اضافه کن یا فایل‌ها رو بکش اینجا.', 'No music found in Music, Downloads or Desktop. Add a folder or drop files here.'],
  helloTitle: ['چی گوش بدیم؟', 'What are we playing?'], helloPlay: ['پخش', 'Play'], helloShuffle: ['پخش تصادفی همه', 'Shuffle everything'],
  noneSelected: ['آهنگی انتخاب نشده', 'Nothing playing'], pickOne: ['از کتابخانه یه آهنگ انتخاب کن', 'Pick a song from your library'], nothingHere: ['چیزی برای نمایش نیست.', 'Nothing to show.'],
  dropHere: ['رها کن تا اضافه و پخش بشه', 'Drop to add and play'], added: ['{n} آهنگ اضافه شد', '{n} songs added'], adding: ['در حال افزودن…', 'Adding…'], noAudio: ['فایل صوتی پیدا نشد', 'No audio files found'],
  folderAdded: ['پوشه اضافه شد؛ در حال اسکن…', 'Folder added, scanning…'], rescanning: ['اسکن دوباره شروع شد', 'Rescanning…'],
  // player
  shortPlay: ['این آهنگ زیر {n} ثانیه‌ست؛ چون خودت انتخابش کردی پخش می‌شه.', 'This track is under {n}s — playing because you picked it.'],
  skippedShort: ['{n} آهنگ کوتاه رد شد', 'Skipped {n} short tracks'], queueEnd: ['صف پخش تموم شد', 'End of queue'], playFail: ['پخش این فایل ممکن نشد', 'Could not play this file'],
  fileErr: ['این فایل پخش نشد؛ رفتیم سراغ بعدی', 'This file failed — skipping to the next'], shuffleOn: ['پخش تصادفی روشن', 'Shuffle on'], shuffleOff: ['پخش تصادفی خاموش', 'Shuffle off'],
  repOff: ['تکرار خاموش', 'Repeat off'], repAll: ['تکرار کل صف', 'Repeat all'], repOne: ['تکرار همین آهنگ', 'Repeat one'], vol: ['صدا {n}٪', 'Volume {n}%'],
  muted: ['بی‌صدا', 'Muted'], unmuted: ['صدا وصل شد', 'Sound on'], lyrOn: ['متن آهنگ روشن', 'Lyrics on'], lyrOff: ['متن آهنگ خاموش', 'Lyrics off'],
  favAdd: ['به علاقه‌مندی‌ها اضافه شد', 'Added to favorites'], favDel: ['از علاقه‌مندی‌ها حذف شد', 'Removed from favorites'],
  stageOn: ['حالت نمایش · خروج با H یا Esc', 'Stage mode · press H or Esc to exit'], stageHint: ['حالت نمایش · خروج با', 'Stage mode · exit with'], exit: ['خروج', 'Exit'],
  sleepDone: ['تایمر خواب: پخش متوقف شد. شب بخیر 🌙', 'Sleep timer: playback stopped. Good night 🌙'], sleepSet: ['تایمر خواب: {n}', 'Sleep timer: {n}'],
  // lyrics / AI
  aiWorking: ['هوش مصنوعی داره متن آهنگ رو می‌نویسه', 'AI is writing the lyrics'], aiPrep: ['آماده‌سازی صدا برای هوش مصنوعی…', 'Preparing audio for the AI…'], aiQueued: ['در صف هوش مصنوعی…', 'Queued for the AI…'],
  aiReady: ['متن آماده', 'Lyrics ready'], aiNone: ['متنی پیدا نشد؛ احتمالاً بی‌کلامه', 'No vocals found — probably instrumental'], aiSetupPill: ['برای متن خودکار، موتور هوش مصنوعی رو نصب کن', 'Install the AI engine for automatic lyrics'],
  install: ['نصب', 'Install'], aiErr: ['خطا در ساخت متن', 'Could not make lyrics'], aiReadErr: ['فایل صوتی برای هوش مصنوعی خونده نشد', 'Could not read this file for the AI'],
  aiNotReady: ['موتور هوش مصنوعی نصب نیست', 'The AI engine is not installed'], aiStream: ['متن خودکار فقط برای فایل‌های روی سیستم کار می‌کنه', 'Automatic lyrics work only for files on your PC'],
  relang: ['ساخت دوباره‌ی متن با زبان:', 'Regenerate lyrics as:'], langAuto: ['خودکار', 'Automatic'], langFa: ['فارسی', 'Persian'], langEn: ['انگلیسی', 'English'], langRu: ['روسی', 'Russian'],
  aiEngineGpu: ['موتور کارت گرافیک (CUDA، سریع)', 'GPU engine (CUDA, fast)'], aiEngineCpu: ['موتور پردازنده', 'CPU engine'], aiTurbo: ['مدل Turbo · سریع · {n} مگابایت', 'Turbo model · fast · {n} MB'],
  aiLarge: ['مدل Large-v3 · دقیق‌ترین برای فارسی · {n} مگابایت', 'Large-v3 model · most accurate for Persian · {n} MB'], aiVad: ['تشخیص صدای خواننده (VAD)', 'Voice detection (VAD)'],
  installed: ['نصب شده', 'Installed'], notInstalled: ['نصب نشده', 'Not installed'], noNvidia: ['کارت گرافیک NVIDIA پیدا نشد', 'No NVIDIA GPU found'],
  aiAllReady: ['همه‌چیز آماده‌ست. متن آهنگ‌ها کاملاً روی سیستم خودت ساخته می‌شه و هیچ صدایی به اینترنت فرستاده نمی‌شه.', 'All set. Lyrics are made entirely on your PC — no audio ever leaves your computer.'],
  aiInstallBtn: ['دانلود و نصب موتور هوش مصنوعی', 'Download & install the AI engine'], aiLargeBtn: ['دانلود مدل دقیق فارسی (Large-v3)', 'Download the accurate Persian model (Large-v3)'],
  aiDone: ['موتور هوش مصنوعی آماده شد', 'AI engine is ready'], aiUnpack: ['در حال باز کردن…', 'Unpacking…'], mb: ['مگابایت', 'MB'],
  aiStepCuda: ['موتور کارت گرافیک', 'GPU engine'], aiStepCpu: ['موتور پردازنده', 'CPU engine'], aiStepTurbo: ['مدل Turbo', 'Turbo model'], aiStepLarge: ['مدل Large-v3', 'Large-v3 model'], aiStepVad: ['مدل تشخیص صدا', 'Voice-detection model'],
  aiPersianNote: ['برای فارسی، مدل Large-v3 خیلی دقیق‌تر از Turbo کار می‌کنه. نوا برای آهنگ‌های فارسی خودش اون رو انتخاب می‌کنه. دقت روی موزیک‌های خیلی شلوغ یا رپ خیلی تند کمتره.', 'For Persian, Large-v3 is far more accurate than Turbo, and Nava picks it automatically for Persian songs. Accuracy drops on very busy mixes and very fast rap.'],
  // link
  linkTitle: ['پخش از لینک', 'Play from a link'], linkPh: ['لینک رو اینجا بچسبون…', 'Paste a link here…'], linkPlay: ['پخش', 'Play'],
  linkHelp: ['اسپاتیفای، ساندکلاد و یوتیوب با پلیر رسمی خودشون پخش می‌شن. لینک مستقیم فایل صوتی (mp3، ogg، …) و رادیوهای اینترنتی با همه‌ی افکت‌ها و اکولایزر نوا پخش می‌شن.', 'Spotify, SoundCloud and YouTube play through their official players. Direct audio links (mp3, ogg…) and internet radio play through Nava with every effect and the EQ.'],
  linkViz: ['افکت تصویری روی صدای سیستم (برای اسپاتیفای/ساندکلاد/یوتیوب)', 'Visualize system audio (for Spotify/SoundCloud/YouTube)'],
  linkBad: ['این لینک شناخته نشد', 'This link was not recognized'], linkChecking: ['در حال بررسی لینک…', 'Checking link…'], linkStream: ['استریم آنلاین', 'Online stream'],
  embedClose: ['بستن پلیر', 'Close player'], spotifyNote: ['برای پخش کامل، داخل پلیر وارد حساب اسپاتیفای شو.', 'Log in to Spotify inside the player for full tracks.'],
  // close / tray / outro / welcome
  closeTitle: ['بستن نوا؟', 'Close Nava?'], closeMsg: ['می‌خوای کاملاً ببندیش یا بره کنار ساعت و آهنگ پخش بشه؟', 'Quit completely, or keep playing from the system tray?'],
  closeTray: ['برو توی Tray', 'Minimize to tray'], closeQuit: ['بستن کامل', 'Quit'], remember: ['انتخابم رو یادت بمونه', 'Remember my choice'],
  trayShow: ['نمایش نوا', 'Show Nava'], trayHint: ['نوا توی سینی سیستم داره پخش می‌کنه.', 'Nava keeps playing in the system tray.'],
  // booster
  boostTitle: ['تقویت‌کننده‌ی صدا', 'Sound booster'], boostWarn: ['این گزینه اجازه می‌ده صدا رو تا ۳۰۰٪ ببری بالا. صدای بالای ۱۰۰٪ ممکنه باعث خش‌دار شدن صدا، آسیب به اسپیکر یا هدفون و در طولانی‌مدت آسیب به شنوایی بشه. نوا یه محدودکننده (Limiter) روی خروجی می‌ذاره تا تا جای ممکن جلوی خش رو بگیره.', 'This lets you raise the volume up to 300%. Anything above 100% can distort, can damage speakers or headphones, and over time can harm your hearing. Nava adds a limiter to the output to keep distortion down as much as possible.'],
  boostEnable: ['فهمیدم، فعالش کن', 'I understand, enable it'], boostOn: ['تقویت صدا فعال شد · تا ۳۰۰٪', 'Booster on · up to 300%'], boostOff: ['تقویت صدا خاموش شد · حداکثر ۱۰۰٪', 'Booster off · max 100%'],
  loudTitle: ['هنوز با این صدا گوش می‌دی؟', 'Still listening this loud?'], loudMsg: ['۱۰ دقیقه‌ست صدا بالای ۱۰۰٪ ـه. مطمئنی می‌خوای ادامه بدی؟ گوش‌هات ارزشمندن.', 'Volume has been above 100% for 10 minutes. Sure you want to keep going? Your ears matter.'],
  loudKeep: ['آره، ادامه بده', 'Yes, keep it'], loudLower: ['برگردون به ۱۰۰٪', 'Lower to 100%'],
  // modes / misc stage
  modeLabel: ['مدل نمایش', 'Visual mode'],
  // settings: shared
  appSettings: ['تنظیمات برنامه', 'App settings'], playSettings: ['صدا و صحنه', 'Sound & scene'],
  tabGeneral: ['عمومی', 'General'], tabThemes: ['تم‌ها', 'Themes'], tabLibrary: ['کتابخانه', 'Library'], tabAi: ['هوش مصنوعی', 'AI lyrics'], tabKeys: ['میانبرها', 'Hotkeys'], tabAbout: ['درباره', 'About'],
  tabVisual: ['نمایش', 'Visuals'], tabFx: ['افکت‌ها', 'Effects'], tabLyrics: ['متن آهنگ', 'Lyrics'], tabSound: ['صدا', 'Sound'], tabEq: ['اکولایزر', 'Equalizer'], tabPresets: ['پریست‌ها', 'Presets'],
  // general
  sLang: ['زبان برنامه', 'Language'], sCloseAction: ['وقتی ضربدر رو می‌زنم', 'When I click ✕'], caAsk: ['ازم بپرس', 'Ask me'], caTray: ['برو توی Tray', 'Go to tray'], caQuit: ['کاملاً ببند', 'Quit'],
  sAutostart: ['اجرا همراه ویندوز (در Tray)', 'Start with Windows (in tray)'], sWelcome: ['صفحه‌ی خوش‌آمد موقع باز شدن', 'Welcome screen on launch'], sOutro: ['پیام خداحافظی موقع بستن', 'Goodbye message on exit'],
  sMediaKeys: ['کلیدهای مدیای کیبورد و هدفون', 'Keyboard & headset media keys'], sAnim: ['انیمیشن‌های رابط کاربری', 'Interface animations'], sNotify: ['اعلان آهنگ جدید', 'New-song notifications'],
  sUiScale: ['اندازه‌ی رابط کاربری', 'Interface size'],
  // themes
  thTitle: ['تم‌های آماده', 'Built-in themes'], thCustom: ['تم‌های خودت', 'Your themes'], thBuild: ['ساخت تم جدید', 'Create a theme'], thName: ['اسم تم', 'Theme name'],
  thBase: ['پایه', 'Base'], thDark: ['تیره', 'Dark'], thLight: ['روشن', 'Light'], thBg: ['پس‌زمینه', 'Background'], thPanel: ['پنل‌ها', 'Panels'], thText: ['متن', 'Text'], thAccent: ['رنگ اصلی', 'Accent'], thAccent2: ['رنگ دوم', 'Second accent'],
  thSave: ['ذخیره و اعمال تم', 'Save & apply'], thSaved: ['تم «{n}» ذخیره شد', 'Theme “{n}” saved'], thPreview: ['پیش‌نمایش زنده', 'Live preview'],
  // library settings
  sFolders: ['پوشه‌های اسکن', 'Scanned folders'], sAllDrives: ['اسکن همه‌ی درایوها (کندتره)', 'Scan all drives (slower)'], sHideShort: ['آهنگ‌های کوتاه رو توی لیست نشون نده', 'Hide short tracks in lists'],
  noFolders: ['هیچ پوشه‌ای انتخاب نشده.', 'No folders selected.'], allDrivesOn: ['همه‌ی درایوها اسکن می‌شن', 'All drives will be scanned'], allDrivesOff: ['فقط پوشه‌های انتخابی اسکن می‌شن', 'Only the selected folders will be scanned'],
  // AI settings
  sEngine: ['موتور', 'Engine'], sAiAuto: ['ساخت خودکار متن موقع پخش', 'Generate lyrics automatically'], sAiPrefetch: ['ساخت متن آهنگ بعدی از قبل', 'Prepare the next song in advance'],
  sAiLang: ['زبان آهنگ‌ها', 'Song language'], sAiModel: ['مدل', 'Model'], mAuto: ['خودکار (بهترین برای هر زبان)', 'Automatic (best per language)'], sAiDevice: ['پردازش با', 'Run on'], dGpu: ['کارت گرافیک', 'GPU'], dCpu: ['پردازنده', 'CPU'],
  sAiVad: ['حذف بخش‌های بی‌کلام (دقت بیشتر)', 'Skip instrumental parts (more accurate)'],
  sLyrDir: ['محل ذخیره‌ی متن‌ها', 'Where lyrics are saved'], lyrDirFolder: ['یک پوشه', 'A folder'], lyrDirBeside: ['کنار خود آهنگ (.lrc)', 'Next to each song (.lrc)'],
  sWriteLrc: ['ذخیره به‌صورت فایل .lrc', 'Save as .lrc files'], lyrChoose: ['انتخاب پوشه', 'Choose folder'], lyrOpen: ['باز کردن پوشه', 'Open folder'], lyrClear: ['پاک کردن همه‌ی متن‌های ساخته‌شده', 'Delete all generated lyrics'], lyrCleared: ['همه‌ی متن‌ها پاک شد', 'All lyrics deleted'],
  // keys
  keysNote: ['میانبرها فقط وقتی نوا پنجره‌ی فعاله کار می‌کنن؛ پس توی بازی یا برنامه‌های دیگه کاری انجام نمی‌دن. برای تغییر، روی میانبر بزن و کلید جدید رو فشار بده.', 'Hotkeys only work while Nava is the active window, so they never fire inside games or other apps. Click a shortcut and press the new key to change it.'],
  keyPress: ['کلید رو بزن…', 'Press a key…'], keysReset: ['بازگردانی میانبرها', 'Reset hotkeys'], keyTaken: ['این کلید قبلاً برای «{n}» استفاده شده', 'That key is already used for “{n}”'],
  kToggle: ['پخش / توقف', 'Play / pause'], kNext: ['آهنگ بعدی', 'Next song'], kPrev: ['آهنگ قبلی', 'Previous song'], kFwd: ['۵ ثانیه جلو', 'Forward 5s'], kBack: ['۵ ثانیه عقب', 'Back 5s'],
  kVolUp: ['صدا بلندتر', 'Volume up'], kVolDown: ['صدا آهسته‌تر', 'Volume down'], kMute: ['بی‌صدا', 'Mute'], kMode: ['مدل نمایش بعدی', 'Next visual'], kPalette: ['پالت بعدی', 'Next palette'],
  kRandom: ['پریست شانسی', 'Random preset'], kLyrics: ['روشن/خاموش متن', 'Toggle lyrics'], kLyrStyle: ['انیمیشن متن بعدی', 'Next lyrics style'], kStage: ['حالت نمایش', 'Stage mode'],
  kFull: ['تمام‌صفحه', 'Fullscreen'], kSide: ['کتابخانه', 'Library'], kTheme: ['تم بعدی', 'Next theme'], kFav: ['علاقه‌مندی', 'Favorite'], kSearch: ['جستجو', 'Search'], kLink: ['پخش از لینک', 'Play a link'], kEq: ['اکولایزر', 'Equalizer'],
  // about
  aboutBuilt: ['ساخته‌شده توسط', 'Created by'], aboutSupport: ['اگه از نوا خوشت اومده، با یه ستاره توی گیت‌هاب ازم حمایت کن ♥', 'If you enjoy Nava, support me with a star on GitHub ♥'],
  aboutGh: ['صفحه‌ی گیت‌هاب من', 'My GitHub'], aboutBeta: ['این یه نسخه‌ی بتاست. نسخه‌ی اصلی هنوز در حال ساخته و ممکنه بعضی بخش‌ها تغییر کنن.', 'This is a beta build. The full release is still in the works and things may change.'],
  aboutTour: ['دوباره نمایش آموزش', 'Replay the tutorial'], aboutLicense: ['همه‌ی حقوق برای Silenzio Morto محفوظ است. این برنامه متن‌باز نیست.', 'All rights reserved by Silenzio Morto. This software is not open source.'],
  aboutThird: ['کتابخانه‌های جانبی: Electron، music-metadata، whisper.cpp و مدل Whisper (MIT)، فونت‌های Vazirmatn، Unbounded و JetBrains Mono (OFL).', 'Third-party: Electron, music-metadata, whisper.cpp and the Whisper model (MIT); Vazirmatn, Unbounded and JetBrains Mono fonts (OFL).'],
  aboutData: ['پوشه‌ی داده‌های برنامه', 'App data folder'],
  // visuals
  sMode: ['مدل نمایش', 'Visual mode'], sPalette: ['پالت رنگ', 'Color palette'], sBars: ['تعداد میله‌ها', 'Bar count'], sSens: ['حساسیت به صدا', 'Audio sensitivity'], sBeat: ['حساسیت به ضرب بیس', 'Beat sensitivity'],
  sRotate: ['سرعت چرخش', 'Rotation speed'], sMirror: ['نمایش قرینه', 'Mirror'], sShowCover: ['کاور آهنگ وسط افکت', 'Cover in the visual'], sSpin: ['چرخش کاور مثل گرامافون', 'Spin cover like vinyl'],
  sCard: ['کارت کاور آهنگ', 'Cover card'], left: ['چپ', 'Left'], right: ['راست', 'Right'], hidden: ['مخفی', 'Hidden'], sCardSize: ['اندازه‌ی کارت کاور', 'Cover card size'],
  sGlow: ['درخشش (Bloom)', 'Glow (bloom)'], sFlash: ['فلش نور روی ضرب', 'Beat flash'], sTrail: ['ردِ حرکت', 'Motion trails'], sWarp: ['اکوی زوم', 'Echo zoom'], sTwist: ['چرخش اکو', 'Echo twist'],
  sZoom: ['زوم با بیس', 'Bass zoom'], sShake: ['لرزش روی ضرب', 'Beat shake'], sShakeAmt: ['شدت لرزش', 'Shake amount'], sCa: ['شکست رنگ روی ضرب', 'Chromatic beat'], sParticles: ['تعداد ذرات', 'Particle amount'],
  sDust: ['ذرات معلق', 'Floating dust'], sBackdrop: ['پس‌زمینه از کاور', 'Cover backdrop'], sVignette: ['سایه‌ی لبه‌ها', 'Vignette'], sGrain: ['دانه‌ی فیلم', 'Film grain'],
  sFps: ['حداکثر فریم', 'Frame limit'], fpsSync: ['هم‌گام با مانیتور', 'Monitor sync'], sQuality: ['کیفیت رندر', 'Render quality'], sFft: ['دقت طیف (FFT)', 'Spectrum detail (FFT)'], sAutoHide: ['مخفی شدن کنترل‌ها در حالت نمایش', 'Auto-hide controls in stage mode'],
  perfNote: ['همه‌ی افکت‌ها روی کارت گرافیک اجرا می‌شن. اگه سیستمت ضعیفه، پریست «سبک و کم‌مصرف» رو بزن.', 'Every visual runs on the GPU. On a weaker PC, use the “Light & efficient” preset.'],
  secPerf: ['عملکرد', 'Performance'],
  // lyrics display
  sLyrOn: ['نمایش متن آهنگ', 'Show lyrics'], sLyrStyle: ['انیمیشن متن', 'Lyrics animation'], sLyrPos: ['جای متن', 'Position'], pBottom: ['پایین', 'Bottom'], pCenter: ['وسط', 'Center'], pTop: ['بالا', 'Top'],
  sLyrDir: ['جهت حرکت', 'Motion direction'], dDown: ['از بالا به پایین', 'Top to bottom'], dUp: ['از پایین به بالا', 'Bottom to top'], sLyrSize: ['اندازه‌ی متن', 'Text size'],
  sLyrOffset: ['تنظیم هم‌زمانی', 'Sync offset'], sLyrGlow: ['درخشش متن', 'Text glow'], sLyrColor: ['رنگ متن', 'Text color'], cAccent: ['رنگ تم', 'Theme'], cWhite: ['سفید', 'White'], cGrad: ['گرادیانت', 'Gradient'],
  sLyrFont: ['فونت متن', 'Font'], fDisplay: ['نمایشی', 'Display'], fBody: ['ساده', 'Clean'],
  secLyr3d: ['سه‌بعدی', '3D'],
  secFonts: ['فونت متن آهنگ', 'Lyrics fonts'], sLyrFontFa: ['فونت متن‌های فارسی', 'Font for Persian lyrics'], sLyrFontEn: ['فونت متن‌های انگلیسی و روسی', 'Font for English & Russian lyrics'],
  sLyrWeight: ['ضخامت فونت', 'Font weight'], fontPreview: ['پیش‌نمایش', 'Preview'], fontsYours: ['فونت‌های اضافه‌شده', 'Your imported fonts'],
  fontImport: ['افزودن فایل فونت', 'Import font files'], fontImported: ['{n} فایل فونت اضافه شد', '{n} font files imported'], fontNone: ['هنوز فونتی اضافه نکردی. فایل‌های ttf، otf، woff یا woff2 رو اضافه کن یا بکششون روی برنامه.', 'No imported fonts yet. Add .ttf, .otf, .woff or .woff2 files, or drop them onto the window.'],
  fontLicense: ['فونت‌هایی که اضافه می‌کنی فقط روی همین کامپیوتر استفاده می‌شن و جایی فرستاده نمی‌شن. مطمئن شو مجوز استفاده‌شون رو داری.', 'Imported fonts stay on this computer and are never shared. Make sure you are licensed to use them.'],
  // sound
  secPlayback: ['پخش', 'Playback'], sSpeed: ['سرعت پخش', 'Playback speed'], sPitch: ['زیر و بمی (Pitch)', 'Pitch'], semis: ['نیم‌پرده', 'semitones'], sVinyl: ['حالت گرامافون (سرعت روی Pitch هم اثر بذاره)', 'Vinyl mode (speed also changes pitch)'],
  sMinDur: ['رد شدن از آهنگ‌های کوتاه‌تر از', 'Skip tracks shorter than'], minDurOff: ['خاموش', 'Off'], sFadeIn: ['محو شدن ورودی آهنگ', 'Fade in'], sFadeOut: ['محو شدن انتهای آهنگ', 'Fade out'],
  sSleep: ['تایمر خواب', 'Sleep timer'], sleepEnd: ['آخر آهنگ', 'End of track'],
  secFx: ['افکت صوتی', 'Audio effects'], sBass: ['تقویت بیس', 'Bass boost'], sReverb: ['ریورب', 'Reverb'], sRoom: ['اندازه‌ی فضا', 'Room size'], sDamp: ['نرمی ریورب', 'Reverb damping'],
  s8d: ['صدای ۸ بعدی (چرخش دور سر)', '8D audio (around your head)'], s8dSpeed: ['سرعت چرخش ۸D', '8D speed'], sBalance: ['بالانس چپ و راست', 'Left / right balance'], sWidth: ['پهنای استریو', 'Stereo width'],
  sMono: ['صدای مونو', 'Mono'], sNormalize: ['یکسان‌سازی بلندی صدا', 'Loudness normalization'],
  secBoost: ['تقویت صدا', 'Volume booster'], sBooster: ['تقویت‌کننده‌ی صدا (تا ۳۰۰٪)', 'Sound booster (up to 300%)'], boosterNote: ['تا وقتی خاموشه، صدا حداکثر ۱۰۰٪ ـه.', 'While off, volume is capped at 100%.'],
  rPresetsReverb: ['فضای ریورب', 'Reverb space'],
  // eq
  eqPreamp: ['پری‌امپ', 'Preamp'], eqPresets: ['پریست‌های اکولایزر', 'EQ presets'], eqOn: ['اکولایزر فعال', 'Equalizer on'], eqHint: ['نقطه‌ها رو بالا و پایین بکش. دوبار کلیک = صفر', 'Drag the points up and down. Double-click = 0 dB'],
  // presets
  pSearch: ['جستجوی پریست', 'Search presets'], pRandom: ['شانسی', 'Random'], pCycle: ['عوض شدن خودکار پریست', 'Auto-change presets'], cyc30: ['هر ۳۰ ثانیه', 'Every 30s'], cyc60: ['هر دقیقه', 'Every minute'], cycTrack: ['هر آهنگ', 'Every song'],
  pName: ['اسم پریست خودت', 'Name your preset'], pSave: ['ذخیره‌ی تنظیمات فعلی', 'Save current settings'], pSaved: ['«{n}» ذخیره شد', '“{n}” saved'], pApplied: ['پریست «{n}»', 'Preset “{n}”'], pNone: ['پریستی پیدا نشد.', 'No presets found.'],
  pResetAll: ['همه‌ی تنظیمات صدا و صحنه به حالت اول', 'Reset all sound & scene settings'], pResetDone: ['تنظیمات برگشت به حالت اول', 'Settings restored'], perfPreset: ['تنظیمات عملکرد', 'Performance'],
  catAll: ['همه', 'All'], catEnergy: ['پرانرژی', 'Energetic'], catCalm: ['آرام', 'Calm'], catCover: ['کاور', 'Cover'], catRetro: ['رترو', 'Retro'], catMinimal: ['مینیمال', 'Minimal'], catPerf: ['عملکرد', 'Performance'], catMine: ['مال خودم', 'Mine'],
  palette: ['پالت: {n}', 'Palette: {n}'], lyrStyleT: ['انیمیشن متن: {n}', 'Lyrics style: {n}'], themeT: ['تم: {n}', 'Theme: {n}'],
  // onboarding
  obWelcome: ['به نوا خوش اومدی', 'Welcome to Nava'], obLangQ: ['زبان برنامه رو انتخاب کن', 'Choose your language'], obThemeQ: ['یه تم برای شروع انتخاب کن', 'Pick a theme to start with'], obThemeHint: ['بعداً هم می‌تونی عوضش کنی یا تم خودت رو بسازی.', 'You can change it any time, or build your own.'],
  obLyrQ: ['متن آهنگ‌هایی که هوش مصنوعی می‌نویسه کجا ذخیره بشه؟', 'Where should AI-generated lyrics be saved?'],
  obLyrDefault: ['پوشه‌ی پیش‌فرض', 'Default folder'], obLyrBeside: ['کنار خود آهنگ‌ها', 'Next to each song'], obLyrBesideD: ['یه فایل .lrc هم‌اسم آهنگ کنارش ساخته می‌شه', 'A .lrc file with the same name goes next to the song'],
  obLyrCustom: ['یه پوشه‌ی دلخواه', 'A folder I choose'], obLyrCustomD: ['هر جایی که خودت بخوای', 'Anywhere you like'],
  obAiQ: ['متن آهنگ خودکار با هوش مصنوعی', 'Automatic lyrics with AI'], obAiD: ['نوا می‌تونه متن آهنگ‌های فارسی، انگلیسی و روسی رو موقع پخش بنویسه. همه‌چیز روی سیستم خودت اجرا می‌شه. برای این کار موتور هوش مصنوعی باید یه بار دانلود بشه.', 'Nava can write lyrics for Persian, English and Russian songs while they play, entirely on your PC. The AI engine needs a one-time download.'],
  obAiNow: ['الان دانلود کن', 'Download now'], obAiLater: ['بعداً از تنظیمات', 'Later, from settings'], obAiReady: ['موتور هوش مصنوعی از قبل نصب شده ✓', 'The AI engine is already installed ✓'],
  obStart: ['بزن بریم', "Let's go"], obStep: ['مرحله‌ی {a} از {b}', 'Step {a} of {b}'],
  tourSkip: ['رد کردن آموزش', 'Skip tutorial'], tourOf: ['{a} از {b}', '{a} of {b}'],
  tour1T: ['کتابخانه‌ی تو', 'Your library'], tour1: ['همه‌ی آهنگ‌های سیستمت اینجاست. بین آهنگ‌ها، آلبوم‌ها، خواننده‌ها، پوشه‌ها و علاقه‌مندی‌ها جابه‌جا شو.', 'Every song on your PC lives here. Switch between songs, albums, artists, folders and favorites.'],
  tour2T: ['جستجوی سریع', 'Quick search'], tour2: ['اسم آهنگ، خواننده یا آلبوم رو بنویس. میانبرش Ctrl+F ـه.', 'Type a song, artist or album. Shortcut: Ctrl+F.'],
  tour3T: ['کنترل پخش', 'Playback'], tour3: ['پخش، قبلی، بعدی، تصادفی و تکرار. نوار زیرش رو بکش تا جلو و عقب بری.', 'Play, previous, next, shuffle and repeat. Drag the bar below to seek.'],
  tour4T: ['مدل‌های نمایش', 'Visual modes'], tour4: ['۱۶ افکت مختلف که به بیس و صدای خواننده واکنش نشون می‌دن. کلید V هم عوضشون می‌کنه.', '16 visuals that react to the bass and the vocals. Press V to cycle them.'],
  tour5T: ['متن آهنگ با هوش مصنوعی', 'AI lyrics'], tour5: ['متن آهنگ رو روشن و خاموش کن. هوش مصنوعی خودش متن رو می‌نویسه و با انیمیشن نشونش می‌ده.', 'Turn lyrics on or off. The AI writes them and animates them in sync.'],
  tour6T: ['صدا و صحنه', 'Sound & scene'], tour6: ['اکولایزر، Pitch، ریورب، تقویت بیس، صدای ۸ بعدی، تقویت صدا و ۴۰ پریست زیبا اینجاست.', 'Equalizer, pitch, reverb, bass boost, 8D audio, the volume booster and 40 presets live here.'],
  tour7T: ['پخش از لینک', 'Play from links'], tour7: ['لینک اسپاتیفای، ساندکلاد، یوتیوب یا یه فایل صوتی آنلاین رو اینجا بچسبون.', 'Paste a Spotify, SoundCloud, YouTube or direct audio link here.'],
  tour8T: ['تنظیمات برنامه', 'App settings'], tour8: ['زبان، تم‌ها، ساخت تم دلخواه، پوشه‌ها، هوش مصنوعی و میانبرها.', 'Language, themes, your own theme, folders, AI and hotkeys.'],
  tour9T: ['حالت نمایش', 'Stage mode'], tour9: ['همه‌ی کنترل‌ها مخفی می‌شن و فقط افکت و متن آهنگ می‌مونه. با H یا Esc برگرد.', 'Hides every control so only the visuals and lyrics remain. Press H or Esc to come back.'],
  tourDoneT: ['آماده‌ای!', "You're all set!"], tourDone: ['از نوا لذت ببر. اگه دوستش داشتی توی گیت‌هاب بهم ستاره بده ♥', 'Enjoy Nava. If you like it, give me a star on GitHub ♥'],
  madeBy: ['ساخته‌شده با ♥ توسط', 'Made with ♥ by'], supportGh: ['حمایت در گیت‌هاب', 'Support on GitHub'], tapToSkip: ['برای رد شدن کلیک کن', 'Click to skip']
};

const WELCOME = {
  fa: ['خوش اومدی! امروز صدای چی رو بلند کنیم؟', 'سلام دوباره! بلندگوها منتظرتن.', 'یه آهنگ خوب، یه حال خوب. شروع کنیم؟', 'به نوا خوش اومدی؛ اینجا هر نُت یه رنگ داره.', 'برگشتی! بیس‌ها دلشون برات تنگ شده بود.',
    'چایی‌ت رو بریز، موزیک با ما.', 'امروز یه روز خوبه برای یه پلی‌لیست تازه.', 'سلام! بذار صدا کارش رو بکنه.', 'نوا آماده‌ست. فقط یه کلیک تا موسیقی.', 'هدفون رو بذار، دنیا رو بی‌صدا کن.',
    'خوش اومدی! امروز حال کدوم آهنگ رو داری؟', 'باز هم سلام؛ صحنه آماده‌ی اجرای توئه.', 'یه نفس عمیق، یه آهنگ خوب.', 'موسیقی، نور، حرکت. بزن بریم!', 'سلام رفیق! ولوم رو آماده کن.',
    'اینجا جاییه که آهنگ‌ها جون می‌گیرن.', 'خوش برگشتی! امروز هم کلی آهنگ منتظرته.', 'یه روز بدون موسیقی؟ نه با نوا.', 'سلام! بیا یه حال خوب بسازیم.', 'نوا روشن شد؛ ریتم رو حس کن.'],
  en: ['Welcome back! What are we turning up today?', 'Hello again — the speakers missed you.', 'Good music, good mood. Shall we?', 'Welcome to Nava, where every note has a color.', "You're back! The bass has been waiting.",
    'Grab a drink — the music is on us.', 'A great day for a fresh playlist.', 'Hi there! Let the sound do its thing.', 'Nava is ready. One click to music.', 'Headphones on, world off.',
    "Welcome! What's the mood today?", 'Hello again — the stage is yours.', 'Deep breath, good song.', 'Music, light, motion. Let’s go!', 'Hey friend! Get that volume ready.',
    'This is where songs come alive.', 'Welcome back — a whole library is waiting.', 'A day without music? Not with Nava.', "Hi! Let's make a good mood.", 'Nava is on. Feel the rhythm.']
};
const OUTRO = {
  fa: ['تا دیداری دیگر، بدرود!', 'بدرود؛ موسیقی همیشه همین‌جاست.', 'به امید دیدار، رفیق!', 'خداحافظ؛ گوش‌هات رو بسپار به سکوت.', 'تا آهنگ بعدی، خدانگهدار!',
    'فعلاً خداحافظ؛ زود برگرد.', 'سکوت هم یه جور موسیقیه. بدرود!', 'ممنون که با نوا بودی. به امید دیدار!', 'خداحافظ؛ ریتم رو با خودت ببر.', 'تا بعد! بلندگوها منتظرت می‌مونن.',
    'روزت پر از نُت‌های خوب. بدرود!', 'شب خوش، یا روز خوش؛ هر کدوم که هست!', 'برو به سلامت؛ آهنگ‌ها جایی نمی‌رن.', 'خداحافظ؛ دلم برات تنگ می‌شه.', 'تا دفعه‌ی بعد، صدات همیشه بلند!',
    'ممنون برای این همه موسیقی. بدرود!', 'خدانگهدار؛ آهنگ آخر مال تو بود.', 'بدرود، تا کنسرت بعدی!', 'فعلاً؛ بیس‌ها رو خاموش کردم.', 'به امید دیدار؛ حال خوبت رو نگه دار.'],
  en: ['Until we meet again — farewell!', 'Goodbye — the music will be right here.', 'See you soon, friend!', 'Bye for now — enjoy the silence.', 'Until the next song, take care!',
    'Bye for now — come back soon.', 'Silence is music too. Farewell!', 'Thanks for listening with Nava. See you!', 'Goodbye — take the rhythm with you.', 'Later! The speakers will wait for you.',
    'May your day be full of good notes.', 'Good night — or good day, whichever it is!', 'Go well; the songs aren’t going anywhere.', 'Goodbye — I’ll miss you.', 'Until next time, stay loud!',
    'Thanks for all the music. Farewell!', 'Take care — that last song was yours.', 'Farewell, until the next concert!', 'Bye — I turned the bass off for you.', 'See you soon — keep the good vibes.']
};

let lang = 'fa';
function t(key, vars) {
  const e = S[key];
  if (!e) { console.warn('i18n missing: ' + key); return key; }
  let s = e[lang === 'fa' ? 0 : 1];
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(String(vars[k]));
  return s;
}
const fmtN = n => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 2 }).format(n);
function apply(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); el.setAttribute('aria-label', el.title); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
}
function setLang(l) {
  lang = l === 'en' ? 'en' : 'fa';
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  apply();
}
const pick = arr => arr[(Math.random() * arr.length) | 0];
const noStop = s => s.replace(/[.\u06D4]+$/, '');
window.I18N = { t, setLang, apply, fmtN, get lang() { return lang; }, welcome: () => noStop(pick(WELCOME[lang])), outro: () => noStop(pick(OUTRO[lang])), has: k => !!S[k] };
})();
