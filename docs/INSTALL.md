# Installing Nava Player

## 1. Download
Go to the [Releases page](../../../releases) and download **`NavaPlayer-Setup-2.0.0-beta.3.exe`** (about 120 MB).

## 2. Run the installer
1. Double-click the file.
2. **SmartScreen:** because this beta is not code-signed yet, Windows may show *"Windows protected your PC"*. Click **More info**, then **Run anyway**.
3. **Language:** choose English or Persian for the installer.
4. **Welcome → License:** read and accept the license agreement.
5. **Install for:** choose *Only for me* (recommended, no admin needed) or *Anyone who uses this computer*.
6. **Folder:** keep the default or pick another one.
7. **Installation options:**
   - ☑ **Create Desktop Shortcut** — on by default; untick it if you don't want an icon on your desktop.
   - ☑ **Register Nava as a music player** — adds Nava to *Open with* and to Windows *Default apps*.
8. Click **Install**, then **Finish** to launch Nava.

## 3. First launch
Nava opens with a short setup:
1. **Language** — English or فارسی (you can change it later in *Settings → General*).
2. **Theme** — pick one of the six built-in themes.
3. **Lyrics folder** — where AI-generated lyrics are saved as `.lrc` files: a default folder (`Documents\Nava Lyrics`), next to each song, or a folder you choose.
4. **AI engine** — download it now or later.

A guided tour then shows you around. You can replay it any time from *Settings → About*.

## 4. Turn on AI lyrics (optional)
Open **Settings (⚙) → AI lyrics → Download & install the AI engine**.

| Download | Size | When |
|---|---|---|
| GPU engine (CUDA) | ~680 MB | Only on PCs with an NVIDIA graphics card |
| CPU engine | ~9 MB | Always |
| Whisper large-v3-turbo | ~550 MB | Always |
| Voice detection (VAD) | ~1 MB | Always |
| Whisper large-v3 *(optional)* | ~1 GB | Recommended for Persian songs |

Downloads continue in the background, and lyrics start appearing as soon as they finish.

## 5. Make Nava your default music player
Windows doesn't let apps set themselves as the default, so do it once:

- **Option A:** right-click any `.mp3` → **Open with → Choose another app → Nava Player** → tick **Always use this app**.
- **Option B:** **Settings → Apps → Default apps → Nava Player**, then choose it for `.mp3`, `.flac`, `.wav`, `.m4a`, `.ogg` and the other types.

## Updating
Run the newer installer over the existing one. Your settings, library and lyrics are kept.

## Uninstalling
**Settings → Apps → Installed apps → Nava Player → Uninstall.** The uninstaller asks why you're leaving and can also delete your settings, lyrics cache and AI models (about 1.6 GB).

## Troubleshooting
| Problem | Fix |
|---|---|
| Visuals stutter | Apply the **Light & Efficient** preset, or lower *Render quality* in *Sound & scene → Visuals*. |
| Lyrics never appear | Check *Settings → AI lyrics* — every row should say *Installed*. |
| Wrong lyrics language | Click the *Lyrics ready* badge above the visual and choose the right language. |
| Spotify plays only 30 s | Log in to Spotify inside the embedded player. |
| Too many tiny sound files in the library | Turn off *Scan all drives* in *Settings → Library*, or remove a folder from the list. |
