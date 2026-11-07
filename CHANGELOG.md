# Changelog

All notable changes to Nava Player are listed here.

## [2.0.0-beta.1] — 2026-11-07 · "Lights On"
### Added
- Native Windows app with installer (language picker, optional desktop shortcut, music-player registration), uninstaller with feedback page, system tray and start-with-Windows.
- WebGL2 visual engine with 16 visuals (new: Black hole, Prism), bloom, echo trails and particles; 40 hand-tuned presets, saving your own presets, and auto-switching.
- On-device AI lyrics (Whisper large-v3 / turbo via whisper.cpp) for Persian, English and Russian, with CUDA acceleration, voice detection, Persian text clean-up and `.lrc` export.
- 16 lyric animations including 3D Extrude, 3D Fly-in, 3D Cube and 3D Orbit.
- Sound lab: 10-band EQ with live curve and 20 presets, pitch, speed, vinyl mode, reverb, bass boost, 8D audio, stereo width, balance, mono, loudness normalization, fades, sleep timer.
- Volume booster up to 300% with limiter, warning and 10-minute loudness reminder.
- Spotify, SoundCloud and YouTube links via official players; direct audio and internet radio links.
- English and Persian interface, six themes (new: Sakura) and a custom theme builder.
- Rebindable in-app hotkeys, favorites, play counts, resume playback.
- Loading screen, welcome and goodbye messages, first-run setup and guided tour.

### Changed
- Short tracks (under 30 s by default, adjustable) are skipped during automatic playback.
- The library scanner ignores tiny sound files and common game and plugin folders.

### Fixed
- Stutter and high CPU usage from the previous browser-based version.
