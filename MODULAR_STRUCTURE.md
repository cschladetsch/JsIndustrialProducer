# Modular Structure Refactoring

## Overview
The monolithic `index.html` has been refactored into a clean modular architecture using ES6 modules.

## New Structure

```
JsIndustrialProducer/
├── index.html              # Original monolithic version (preserved)
├── index_modular.html      # New modular version
├── js/
│   ├── app.js             # Main entry point
│   └── modules/
│       ├── AudioEngine.js         # Core audio synthesis and playback
│       ├── SongStructure.js       # Song structure management and drag-drop
│       ├── Visualizer.js          # FFT frequency analyzer
│       ├── VocalSynthesizer.js    # Vocal synthesis engine
│       ├── LyricsGenerator.js     # AI lyrics generation
│       ├── MidiGenerator.js       # MIDI file generation
│       └── IndustrialMusicApp.js  # Main application class
└── css/
    └── styles.css         # Unchanged - all styles
```

## Module Descriptions

### AudioEngine.js
- Audio context management
- Oscillator-based synthesis for all instruments
- Pattern generation for bass, lead, and drums
- Tool/NIN-inspired variations
- Memory management for oscillators

### SongStructure.js
- Drag-and-drop song arrangement
- Preset structures (standard, simple, extended, industrial)
- Time signature management
- Section duration calculations

### Visualizer.js
- Real-time FFT analysis
- Three visualization modes (bars, waveform, circle)
- Canvas-based rendering
- Responsive to window resizing

### VocalSynthesizer.js
- Phoneme-based vocal synthesis
- Multiple vocal types (robotic, whisper, distorted)
- Formant synthesis with filters
- Timing synchronization with sections

### LyricsGenerator.js
- Industrial/electronic themed vocabulary
- Pattern-based generation
- Section-specific lyrics
- Real-time highlighting during playback

### MidiGenerator.js
- 6-track MIDI export
- Dynamic pattern integration from AudioEngine
- Proper MIDI encoding
- Channel assignments for all instruments

### IndustrialMusicApp.js
- Main application controller
- UI event handling
- Playback orchestration
- State management
- Continuous mode logic

## Benefits of Modular Architecture

1. **Maintainability**: Each module has a single responsibility
2. **Testability**: Modules can be tested independently
3. **Reusability**: Components can be reused in other projects
4. **Scalability**: Easy to add new features without affecting existing code
5. **Performance**: Modules load only when needed
6. **Debugging**: Easier to isolate and fix issues

## Usage

To use the modular version:
1. Open `index_modular.html` in a modern browser
2. Or serve it via a local server: `python3 -m http.server 8080`

The original `index.html` is preserved for compatibility.

## Browser Requirements

- ES6 module support (Chrome 61+, Firefox 60+, Safari 11+)
- Web Audio API support
- Modern JavaScript features (async/await, classes, etc.)

## Migration Notes

- All functionality from the original version is preserved
- No external dependencies added
- CSS remains unchanged
- Module imports use relative paths for compatibility