# Third-party notices

Nava Player is proprietary software by Silenzio Morto. It includes or downloads the following
third-party components, each under its own license:

| Component | Use | License |
|---|---|---|
| [Electron](https://github.com/electron/electron) (with Chromium, Node.js, FFmpeg) | Application runtime | MIT (Chromium/FFmpeg notices ship in `LICENSES.chromium.html`) |
| [music-metadata](https://github.com/Borewit/music-metadata) and its dependencies | Reading tags and covers | MIT |
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | On-device speech recognition (downloaded on demand) | MIT |
| [OpenAI Whisper](https://github.com/openai/whisper) model weights (large-v3, large-v3-turbo, ggml conversion) | AI lyrics | MIT |
| [Silero VAD](https://github.com/snakers4/silero-vad) (ggml conversion) | Voice detection | MIT |
| NVIDIA CUDA runtime / cuBLAS (inside the whisper.cpp CUDA build) | GPU acceleration | NVIDIA CUDA EULA (redistributable) |
| [Vazirmatn](https://github.com/rastikerdar/vazirmatn) | Persian UI font | SIL Open Font License 1.1 |
| [Unbounded](https://github.com/googlefonts/unbounded) | Display font | SIL Open Font License 1.1 |
| [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) | Monospace font | SIL Open Font License 1.1 |

Spotify, SoundCloud and YouTube content is played only through those services' official embedded players
and remains subject to their terms. Nava does not download or store streamed content.
