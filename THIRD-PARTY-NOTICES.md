# Third-party notices

The root MIT license applies to this project's original code, documentation, and artwork. It does not replace licenses on third-party material.

## Expo starter and dependencies

The Expo starter's MIT copyright notice is preserved in LICENSE. Installed dependencies retain the licenses provided by their respective packages; dependencies are specified in package.json and pnpm-lock.yaml, and node_modules is not distributed here.

## VSCO 2 Community Edition strings

The recorded violin, viola, and cello material is from VSCO 2 Community Edition by Versilian Studios, recorded by Sam Gossner and Simon Dalzell, with sample cutting by Elan Hickler / Soundemote. The source recordings are CC0 1.0.

- Source: https://github.com/sgossner/VSCO-2-CE
- License: [assets/audio/VSCO-LICENSE.txt](assets/audio/VSCO-LICENSE.txt)
- Credits and rebuilding: [assets/audio/STRINGS-CREDITS.md](assets/audio/STRINGS-CREDITS.md)
- Download script: scripts/fetch-strings.py

## TimGM6mb electric guitar

The room-*.wav tracks and the earlier score-electric.wav and victory-electric.wav recordings contain guitar sample material from TimGM6mb by Tim Brechbill, with contributions by David Bolton. This material is supplied under GPL-2.0, and these recordings are distributed under GPL-2.0 rather than the root MIT license. Other original game code remains MIT.

- Original notices: [assets/audio/ELECTRIC-GUITAR-CREDITS.txt](assets/audio/ELECTRIC-GUITAR-CREDITS.txt)
- Full license: [assets/audio/GPL-2.0.txt](assets/audio/GPL-2.0.txt)
- Corresponding editable soundfont: [assets/audio/source/TimGM6mb.sf2](assets/audio/source/TimGM6mb.sf2)
- Arrangement and rendering source: scripts/render-rooms.py and scripts/render-electric.py
- Rebuild with Python, NumPy, FluidSynth, the VSCO samples, and TimGM6mb installed at /usr/share/sounds/sf2/TimGM6mb.sf2.

The included soundfont is source material for regenerating the music and is not referenced by or bundled into the native app. The CC0 VSCO sources can be fetched with scripts/fetch-strings.py. The soundfont's existing notices are preserved above; no third-party sample ownership is claimed.
