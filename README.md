# Industrial Music Generator

A web-based industrial music generator that creates dynamic, procedurally generated music with customizable song structures, real-time audio synthesis, and vocal synthesis capabilities.

## Features

### Song Structure Editor
- **Drag-and-drop interface** for creating custom song structures
- **Preset structures**: Standard, Simple, Extended, and Industrial
- **Available sections**: Intro, Verse, Pre-Chorus, Chorus, Bridge, Instrumental, Breakdown, Outro
- Real-time structure visualization with color-coded sections
- Support for variable time signatures (4/4, 5/4, 7/8, 9/8, 6/8)

### Audio Engine
- **Real-time audio synthesis** using Web Audio API
- **Multi-layer composition**:
  - Bass synthesis with distortion effects
  - Lead synthesizer with delay and filtering
  - Drum track (kick, snare, hi-hat)
  - Atmospheric effects for breakdown sections
- **Dynamic parameters**:
  - Tempo: 26-140 BPM
  - Intensity: 1-10 (affects volume and pattern complexity)
  - Distortion: 0-100% (waveshaping distortion)
  - Song Length: 0.5x-2x multiplier

### Vocal Synthesizer
- **Phoneme-based vocal synthesis** with formant frequencies
- **Multiple vocal modes**:
  - Off: No vocals
  - Robotic: Square wave with bandpass filtering
  - Whisper: Sawtooth wave with highpass filtering
  - Distorted: Sawtooth wave with lowpass filtering and heavy effects
- **Smart vocalization timing** based on song sections
- Real-time vocal output display with:
  - Current section indicator
  - Synthesized text display
  - Vocal type indicator
  - Beat counter
  - Next vocal prediction

### Lyrics Generator
- **Procedural lyrics generation** with industrial/electronic themes
- **Context-aware generation** based on song sections
- **Themed word banks**: existential, emotional, abstract, industrial
- Live lyric highlighting during playback
- Export functionality (copy to clipboard or download as .txt)

### Visualizer
- **Real-time frequency analyzer** with three modes:
  - Bars: Frequency spectrum display
  - Waveform: Time-domain oscilloscope
  - Circle: Radial frequency visualization
- Section progress tracking
- Time display with total duration

### Playback Features
- **Full song playback** with accurate timing (no 30-second cutoff)
- **Continuous music mode** for endless variations
- **Pause/Resume** functionality (spacebar)
- Progress bar with time display
- Section highlighting during playback

### Export Options
- **MIDI export** for use in DAWs
- **Lyrics export** as text file

## Usage

1. **Open the application** in a web browser
2. **Create your song structure**:
   - Use preset buttons for quick setup
   - Drag sections from the palette to create custom structures
   - Remove sections by clicking the × button
3. **Adjust parameters**:
   - Set tempo, intensity, and distortion levels
   - Choose song length multiplier
   - Select vocal type
4. **Generate and play**:
   - Click "Generate Song" to create music and lyrics
   - Click "Play Full Song" for single playback
   - Click "Continuous music" for endless variations
   - Use spacebar to pause/resume

## Technical Details

- Pure JavaScript implementation (no external dependencies)
- Web Audio API for real-time synthesis
- Canvas-based visualization
- Responsive design with dark industrial theme
- MIDI file generation from scratch

## Recent Updates

- **Fixed audio playback** stopping after ~30 seconds
- **Enhanced Vocal Output section** with detailed real-time information
- **Improved progress tracking** with accurate beat counting
- **Added debug logging** for troubleshooting

## Browser Compatibility

Works best in modern browsers that support:
- Web Audio API
- ES6+ JavaScript features
- Canvas API
- Drag and Drop API

Tested on:
- Chrome/Chromium (recommended)
- Firefox
- Edge
- Safari (may have limited Web Audio features)

## Local Development

1. Clone the repository
2. Start a local web server:
   ```bash
   python3 -m http.server 8080
   ```
3. Open http://localhost:8080 in your browser

## License

This project is open source and available for educational and creative use.