<div align="center">

<img src="docs/assets/banner.png" alt="Nava Player — a visual music player for Windows" width="100%">

<br>

[![Version](https://img.shields.io/badge/version-2.0.0--beta.1-86EF6C?style=for-the-badge&labelColor=0A120C)](../../releases/latest)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-3EE5D0?style=for-the-badge&labelColor=0A120C&logo=windows&logoColor=white)](../../releases/latest)
[![Status](https://img.shields.io/badge/status-beta-FF7EB8?style=for-the-badge&labelColor=0A120C)](#-roadmap)
[![License](https://img.shields.io/badge/license-proprietary-A592FF?style=for-the-badge&labelColor=0A120C)](LICENSE)

**Nava turns your music library into a live light show.**<br>
16 GPU visuals that dance to the bass and the vocals, synced lyrics written on your own PC by AI,<br>
a studio-style sound lab, and a design you'll actually want to look at.

[**⬇ Download for Windows**](../../releases/latest) · [Installation guide](docs/INSTALL.md) · [What's new](CHANGELOG.md) · [Report a bug](../../issues/new/choose)

</div>

---

## ✨ Highlights

<table>
<tr>
<td width="50%"><img src="docs/screenshots/01-hero.png" alt="Halo visual with synced lyrics"></td>
<td width="50%"><img src="docs/screenshots/02-blackhole-3d-lyrics.png" alt="Black hole visual with 3D lyrics"></td>
</tr>
<tr>
<td align="center"><b>Halo</b> — a 128-bar ring that reacts to every kick, with the wheel lyrics style</td>
<td align="center"><b>Black hole</b> — accretion disk, gravitational ring and 3D extruded lyrics</td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/03-equalizer.png" alt="10-band equalizer"></td>
<td width="50%"><img src="docs/screenshots/08-stage-mode.png" alt="Stage mode"></td>
</tr>
<tr>
<td align="center"><b>10-band equalizer</b> — drag the curve, watch the live spectrum underneath</td>
<td align="center"><b>Stage mode</b> — every control disappears; only light and lyrics remain</td>
</tr>
</table>

## 🎧 Features

### Visuals
- **16 real-time GPU visuals**: Halo, Spectrum, Nebula, Liquid, Tunnel, Orbit, Scope, Skyline, Kaleido, Aurora, Warp, Ripple, Galaxy, Horizon, Black hole and Prism.
- Everything renders in **WebGL2 on your graphics card**: bloom, echo trails, warp zoom, beat flash, chromatic shift, film grain and particle systems — while the CPU stays nearly idle.
- Visuals react separately to **bass, mids, vocals and highs**, with automatic beat detection.
- **40 hand-tuned presets** (Night Club, Event Horizon, Sakura Dream, Synthwave, Crystal…), your own saved presets, and auto-switching every 30 s, every minute or every song.
- The album cover can spin like vinyl in the centre of the visual, and a large cover card sits beside the stage.

### AI lyrics — on your own PC
- Nava **writes synced lyrics while the song plays** using OpenAI's Whisper (large-v3 and large-v3-turbo) through whisper.cpp.
- Supports **Persian, English and Russian**, with automatic language detection and a one-click "regenerate as…" menu.
- **Persian gets special care**: the accurate large-v3 model is chosen automatically, instrumental parts are skipped with voice detection (VAD), and the text is cleaned up (Persian letter forms, half-spaces, punctuation).
- Runs on **NVIDIA GPUs with CUDA** (a 4-minute song takes about 15 seconds) or on the CPU.
- **No audio ever leaves your computer.** Lyrics are cached and saved as `.lrc` files — in a folder you choose, or next to each song.
- The next song in the queue is prepared in advance.

### Lyric animations
16 styles, including **four 3D styles**: Wheel · Smooth list · Karaoke · Slide · Soft blur · Word by word · Flying words · Bouncing word · Typewriter · Neon · Cinema subtitles · Page flip · **3D Extrude** · **3D Fly-in** · **3D Cube** · **3D Orbit**

### Sound lab
| | |
|---|---|
| **Equalizer** | 10 bands (31 Hz – 16 kHz), live response curve, preamp, 20 presets |
| **Pitch & speed** | ±12 semitones of pitch independent of tempo, 0.5×–2× speed, vinyl mode |
| **Space** | Reverb with Room / Hall / Cathedral / Plate / Cave / Studio presets |
| **Bass boost** | Up to +15 dB low shelf |
| **8D audio** | Sound circles around your head at an adjustable speed |
| **Stereo** | Width, balance, mono, loudness normalization |
| **Transitions** | Fade in / fade out, sleep timer (15–90 min or end of track) |
| **Volume booster** | Up to **300%** with a limiter, a clear warning before it turns on, and a reminder after 10 minutes above 100% |

### Library & playback
- Scans your Music, Downloads and Desktop folders (or any folder — or every drive), reading titles, artists, albums and cover art.
- Songs, albums, artists, folders, favorites and queue views, instant search, sorting by title, artist, newest, length or play count.
- **Skips tracks shorter than your limit** (30 s by default) during normal playback; they still play when you pick them yourself.
- Shuffle, repeat one/all, play counts, favorites and resume-where-you-left-off.

### Streaming links
- Paste a **Spotify, SoundCloud or YouTube** link and it plays through the service's official player inside Nava, with the visuals following your system audio.
- **Direct audio links and internet radio** play through Nava's full engine, with every effect and the equalizer.

### Made for Windows
- Proper installer with an optional desktop shortcut and registration as a music player, so you can **double-click any song** or pick Nava in *Open with* and *Default apps*.
- **System tray**: Nava asks whether to quit or keep playing in the tray (and can remember your choice). Can also start with Windows.
- **Hotkeys you can rebind**. They only work while Nava is the active window, so pressing keys in a game never affects it. Keyboard and headset media keys are supported too.

### Design
- **English and Persian** interface, with full right-to-left layout.
- **Six themes** — Nava Lime, Daylight, Midnight, **Sakura**, Ember, Glacier — plus a **theme builder** for your own colours.
- An animated loading screen, a short welcome message on launch (20 rotating messages per language), a goodbye message on exit, a first-run setup and a **guided tour** for new users.

<table>
<tr>
<td width="33%"><img src="docs/screenshots/06-themes-sakura.png" alt="Sakura theme and theme builder"></td>
<td width="33%"><img src="docs/screenshots/09-persian-ui.png" alt="Persian interface"></td>
<td width="33%"><img src="docs/screenshots/04-presets.png" alt="Presets"></td>
</tr>
<tr>
<td align="center"><b>Sakura theme</b> & theme builder</td>
<td align="center"><b>Persian</b> interface</td>
<td align="center"><b>40 presets</b></td>
</tr>
<tr>
<td width="33%"><img src="docs/screenshots/05-sound-lab.png" alt="Sound lab"></td>
<td width="33%"><img src="docs/screenshots/07-ai-settings.png" alt="AI lyrics settings"></td>
<td width="33%"><img src="docs/screenshots/10-onboarding.png" alt="First-run setup"></td>
</tr>
<tr>
<td align="center"><b>Sound lab</b></td>
<td align="center"><b>AI lyrics</b> settings</td>
<td align="center"><b>First-run</b> setup</td>
</tr>
</table>

## 📥 Installation

1. Download **`NavaPlayer-Setup-2.0.0-beta.1.exe`** from the [latest release](../../releases/latest).
2. Run it. If Windows SmartScreen shows *"Windows protected your PC"*, click **More info → Run anyway** (the beta isn't code-signed yet).
3. Pick your language, accept the license, choose a folder, and keep **Create Desktop Shortcut** ticked if you want one.
4. Launch Nava, choose your language and theme, and decide where AI lyrics should be saved.
5. *(Optional)* Open **Settings → AI lyrics** and click **Download & install the AI engine**.

The full step-by-step guide, including how to make Nava your default player, is in **[docs/INSTALL.md](docs/INSTALL.md)**.

### System requirements
| | Minimum | Recommended |
|---|---|---|
| OS | Windows 10 64-bit | Windows 11 64-bit |
| GPU | Any GPU with WebGL2 | NVIDIA GTX 1060 or newer (for fast AI lyrics) |
| RAM | 4 GB | 8 GB+ |
| Disk | 400 MB | 3 GB (with both AI models) |

## ⌨️ Default hotkeys

| Action | Key | Action | Key |
|---|---|---|---|
| Play / pause | `Space` | Next / previous song | `Shift` + `→` / `←` |
| Seek ±5 s | `→` / `←` | Volume | `↑` / `↓` |
| Next visual | `V` · `1`–`9` | Next palette | `C` |
| Random preset | `R` | Lyrics on/off | `L` |
| Next lyrics style | `K` | Stage mode | `H` |
| Fullscreen | `F` | Library | `B` |
| Next theme | `T` | Mute | `M` |
| Favorite | `J` | Equalizer | `E` |
| Play a link | `Ctrl` + `L` | Search | `Ctrl` + `F` |

All of them can be changed in **Settings → Hotkeys**.

## ❓ FAQ

<details>
<summary><b>Does Nava upload my music anywhere?</b></summary>

No. Lyrics are generated locally by whisper.cpp. The only downloads are the AI engine and models (from GitHub and Hugging Face) when you choose to install them.
</details>

<details>
<summary><b>How accurate are the AI lyrics?</b></summary>

Usually very good on clear vocals. Accuracy drops on very busy mixes, heavy effects and very fast rap. If the language is detected wrongly, click the <i>Lyrics ready</i> badge and choose the right language to regenerate.
</details>

<details>
<summary><b>Why does Spotify only play 30-second previews?</b></summary>

Log in to your Spotify account inside the embedded player to hear full tracks. Nava uses Spotify's, SoundCloud's and YouTube's official players and never downloads their content.
</details>

<details>
<summary><b>Nava feels slow on my laptop.</b></summary>

Open <b>Sound & scene → Presets</b> and apply <b>Light & Efficient</b> (30 fps, lower render quality, no bloom).
</details>

<details>
<summary><b>How do I uninstall?</b></summary>

Windows Settings → Apps → Nava Player → Uninstall. The uninstaller asks why you're leaving and can also remove your settings, lyrics cache and AI models.
</details>

## 🗺 Roadmap
- [x] GPU visual engine, 40 presets
- [x] On-device AI lyrics (Persian, English, Russian)
- [x] Installer, tray, file associations
- [ ] Signed installer and automatic updates
- [ ] Playlists and smart mixes
- [ ] Lyrics editor and manual sync
- [ ] Android version

## 💚 Support

Nava is built and maintained by one person. If you enjoy it, **a ⭐ on this repository** helps a lot — and so does sharing it with a friend.

Found a bug or have an idea? [Open an issue](../../issues/new/choose).

## 📄 License

Nava Player is **proprietary software** — it is free to use, but it is not open source. See [LICENSE](LICENSE).
Third-party components are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

<div align="center">
<br>
<img src="docs/assets/logo-256.png" width="72" alt="Nava logo">
<br>
<sub>Made with ♥ by <a href="https://github.com/SilenzioMorto"><b>Silenzio Morto</b></a> · © 2026</sub>
</div>
