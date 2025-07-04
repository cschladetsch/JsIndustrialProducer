# INDUSTRIELL KLANGMASCHINE - Industrial MIDI Song Creator

**Note:** For the full experience with parameter controls, song generation, and real-time playback, please download and run locally. 

## 🎸 NOW WITH MODULAR ARCHITECTURE! 🎸

The application has been refactored from a monolithic 2600+ line file into a clean modular structure using ES6 modules. Choose your version:

- **`./r`** - Launch the modern modular version with clean architecture
- **`./r-original`** - Launch the classic monolithic version (2600+ lines of raw power)

Both versions are fully functional with identical features.

## Demo Visual

![Demo3](Assets/Demo3.gif)

## Latest Features

### AI-Generated Lyrics
The application now generates industrial/electronic themed lyrics that sync with your music playback. Each song gets unique, thematically appropriate lyrics inspired by artists like Nine Inch Nails, Ministry, and KMFDM.

## Demo Track

[🎵 Play Song](https://github.com/cschladetsch/JsIndustrialProducer/raw/main/Assets/output.mp3)

## Overview

JsIndustrialProducer is a web-based application that generates industrial/techno MIDI songs with customizable parameters. This tool allows musicians and producers to quickly create industrial-style MIDI compositions that can be imported into digital audio workstations (DAWs) for further production. While designed for industrial music, the application can produce surprisingly calming ambient soundscapes at slower tempos (60-80 BPM), offering versatility beyond its industrial roots.

## Features

### Core Functionality
- **Real-time MIDI Generation**: Create complete MIDI songs with 6 tracks instantly
- **Full Song Playback**: Listen to the entire song directly in the browser using Web Audio API
- **Drag & Drop Song Builder**: Visually arrange song sections with intuitive drag-and-drop interface
- **Customizable Song Structure**: Choose presets or build completely custom arrangements
- **Parameter Control**: Adjust tempo, intensity, distortion, and song length
- **Multi-track Output**: 
  - Full drum kit with dynamic patterns
  - Bass track with sub-bass synthesis
  - Lead melodies with scale-based generation
  - Atmospheric pads and effects
- **Randomization**: Each generated song is unique with seed-based variations
- **AI Lyrics Generation**: Automatically creates industrial/electronic themed lyrics with real-time sync

### User Interface
- **Compact Dark Theme**: Space-efficient industrial aesthetic with 2-column control layout
- **Real-time Visual Feedback**: See the song structure and playback progress
- **Responsive Controls**: Sliders and dropdowns for intuitive parameter adjustment
- **Section Visualization**: Color-coded display of song sections (intro, verse, chorus, bridge, outro)
- **FFT Frequency Analyzer**: Real-time spectrum visualization with multiple display modes
- **Generated Lyrics Display**: Synced lyric highlighting with copy/export functionality
- **Drag & Drop Builder**: Visual song structure editor with palette of available sections

## Technical Details

### Technologies Used
- **Pure JavaScript**: No external dependencies or frameworks required
- **Web Audio API**: For real-time audio synthesis and playback
- **MIDI File Format**: Generates standard MIDI files compatible with all major DAWs
- **HTML5/CSS3**: Modern web standards for the interface
- **Canvas API**: For real-time frequency spectrum visualization
- **AnalyserNode**: Web Audio API's FFT analysis for frequency data

### MIDI Implementation
The application generates Type 1 MIDI files with 6 tracks:
- **Track 1**: Tempo and time signature information
- **Track 2**: Drums (Channel 10) - Kick, snare, hi-hats with dynamic patterns
- **Track 3**: Bass track (Channel 1) - Synth Bass 1 with variations
- **Track 4**: Lead track (Channel 2) - Synth Lead with melodic patterns
- **Track 5**: Pad track (Channel 3) - Warm Pad for atmospheric chords
- **Track 6**: Effects track (Channel 4) - Atmosphere FX for ambience

### Song Structure Options
1. **Standard**: Intro → Verse → Chorus → Verse → Chorus → Bridge → Chorus → Outro
2. **Simple**: Verse → Chorus → Verse → Chorus
3. **Extended**: Extended version with double choruses for longer compositions
4. **Industrial**: Atmospheric with extended intro/outro sections

### Audio Synthesis
The full song playback uses Web Audio API to create:
- **Multi-oscillator synthesis**:
  - Dual-oscillator bass with sub-bass layer
  - Variable waveforms (sawtooth, square, triangle)
  - Detuning and filter modulation
- **Dynamic drum patterns**:
  - Tool-inspired polyrhythmic patterns
  - Ghost notes and double kicks
  - Section-specific variations
- **Lead synthesis**:
  - Scale-based melodic generation
  - Chromatic passing tones
  - Delay effects and filtering
- **Effects processing**:
  - Waveshaping distortion
  - Dynamic filter envelopes
  - LFO modulation
  - NIN-style digital glitches
- **Real-time FFT analysis** with 2048-point resolution

### Frequency Analyzer
The built-in spectrum analyzer provides:
- **Three Visualization Modes**:
  - **Bars**: Color-coded frequency spectrum (purple to red gradient)
  - **Waveform**: Time-domain oscilloscope view
  - **Circle**: Radial frequency visualization
- **Song Progress Tracking**: Visual indicator shows current playback position
- **Section Information**: Displays current section name and position (e.g., "VERSE (3/18)")
- **Time Display**: Shows elapsed and total time
- **Frequency Range**: 20Hz to 20kHz with labeled markers
- **Responsive Design**: Auto-scales to window size with proper DPI handling

### AI Lyrics Generation
The integrated lyrics generator creates thematic content inspired by industrial/electronic artists:
- **Dynamic Generation**: Unique lyrics for each song based on seed values
- **Section-Specific Patterns**: Different structures for verses, choruses, bridges
- **Industrial Themes**: Words and phrases from existential, emotional, abstract, and industrial vocabularies
- **Real-time Sync**: Lyrics highlight in sync with music playback
- **Export Options**: Copy to clipboard or download as .txt file
- **Regeneration**: Create new variations with a single click

## File Structure

```
JsIndustrialProducer/
├── index.html          # Main application (self-contained)
├── css/
│   └── styles.css      # Application styling
├── Assets/
│   ├── Demo1.jpg       # Screenshot
│   ├── Demo3.gif       # Animated demo
│   ├── Song.mid        # Example MIDI output
│   └── output.mp3      # Example audio render
├── r                   # Quick browser launcher script
├── LICENSE             # MIT License
└── Readme.md           # This file
```

## Parameters

### Tempo (BPM)
- **Range**: 60-140 BPM
- **Default**: 70 BPM
- **Description**: Controls the speed of the song. Lower values (60-80 BPM) create slower, more atmospheric and surprisingly calming ambient tracks, while higher values create more energetic industrial compositions. Despite the industrial theme, slower tempos can produce meditative soundscapes.

### Intensity
- **Range**: 1-10
- **Default**: 7
- **Description**: Affects the velocity of MIDI notes and the volume/filtering of the preview. Higher intensity creates more aggressive, louder sounds.

### Distortion
- **Range**: 0-100
- **Default**: 60
- **Description**: Applies waveshaping distortion to the bass sounds during preview. Higher values create more industrial, gritty textures.

## Quick Start

### 🚀 Instant Launch (Recommended)

The easiest way to run INDUSTRIELL KLANGMASCHINE:

```bash
# Clone the repository
git clone https://github.com/cschladetsch/JsIndustrialProducer.git
cd JsIndustrialProducer

# Launch modular version (clean ES6 architecture)
./r

# OR launch the original monolithic version
./r-original
```

Both launchers will:
- ⚡ Kill any process on port 8083
- 🚀 Start a web server
- 🌐 Open your browser automatically
- 🎵 Keep running until you press Ctrl+C

### Manual Launch

If you prefer to open files directly:
```bash
# On Linux:
xdg-open index_modular.html
   
# On macOS:
open index_modular.html
   
# On Windows:
start index_modular.html
```

### Server Mode

For headless/server environments, start a web server:
```bash
python3 -m http.server 8080
```
Then access the application at `http://localhost:8080` in your browser.

### Using the Application

1. **Adjust Parameters**:
   - **Tempo (BPM)**: 60-140 (default: 85)
   - **Intensity**: 1-10 (default: 7) - Controls note velocity and filter cutoff
   - **Distortion**: 0-100 (default: 60) - Applies waveshaping to bass sounds
   - **Song Length**: 0.5x-2x (default: 1x) - Multiplier for ~5 minute base length

2. **Create Song Structure (NEW: Drag & Drop Interface)**:
   - **Preset Buttons**: Click Standard, Simple, Extended, or Industrial to load preset structures
   - **Drag Sections**: Drag sections from the palette to build custom song structures
   - **Reorder**: Drag sections within the structure editor to reorder them
   - **Remove**: Hover over a section and click the × button to remove it
   - **Available Sections**:
     - INTRO - Atmospheric opening
     - VERSE - Main melodic sections
     - PRE-CHORUS - Build-up sections
     - CHORUS - High-energy hooks
     - BRIDGE - Contrasting middle sections
     - INSTRUMENTAL - Instrumental breaks
     - BREAKDOWN - Heavy rhythmic sections
     - OUTRO - Closing sections

3. **Generate and Play**:
   - Click **"Generate Song"** to create the MIDI data
   - Click **"Play Full Song"** to hear the complete track in your browser
   - Click **"Stop"** to stop playback at any time
   - Click **"Download MIDI"** to save the .mid file
   
4. **Visualize with FFT Analyzer** (NEW):
   - Analyzer appears automatically when playing
   - Switch between Bars, Waveform, or Circle visualization modes
   - Watch frequency spectrum in real-time
   - Track song progress and current section

### NIN "The Day The World Went Away" Style Settings

For a Nine Inch Nails industrial sound:
- **Tempo**: 92 BPM
- **Intensity**: 8-9
- **Distortion**: 75-80
- **Structure**: Industrial

## File Structure

```
JsIndustrialProducer/
├── Assets/                       # Demo assets
│   ├── Demo1.jpg                # Screenshot
│   ├── Demo3.gif                # Animated demo  
│   ├── Song.mid                 # Example MIDI output
│   └── output.mp3               # Example audio render
├── index.html                    # Original monolithic version (2600+ lines)
├── index_modular.html            # New modular version
├── js/                           # JavaScript modules
│   ├── app.js                   # Main entry point
│   └── modules/                 # ES6 modules
│       ├── AudioEngine.js       # Core audio synthesis
│       ├── SongStructure.js     # Drag & drop song builder
│       ├── Visualizer.js        # FFT frequency analyzer
│       ├── VocalSynthesizer.js  # Vocal synthesis engine
│       ├── LyricsGenerator.js   # AI lyrics generation
│       ├── MidiGenerator.js     # MIDI file export
│       └── IndustrialMusicApp.js # Main application controller
├── css/                          # Styling
│   └── styles.css               # Application styles
├── test-midi-export.js          # MIDI export tests
├── LICENSE                       # MIT License
├── Readme.md                     # This documentation
├── MODULAR_STRUCTURE.md         # Detailed modular architecture docs
├── r                            # Launch modular version on port 8083
└── r-original                   # Launch monolithic version on port 8083
```

## Playing MIDI Files

### Option 1: Web Browser (Built-in)
The application includes full Web Audio synthesis. Just click "Play Full Song" after generating.

### Option 2: VLC Media Player
VLC requires a soundfont to play MIDI files:
```bash
# Install FluidSynth and soundfont
sudo apt install fluidsynth fluid-soundfont-gm

# Then open the MIDI file in VLC
vlc industrial_song.mid
```

### Option 3: TiMidity++ (Recommended for Linux)
```bash
# Install TiMidity++
sudo apt install timidity timidity-interfaces-extra

# Play the MIDI file
timidity industrial_song.mid
```

### Option 4: Digital Audio Workstation (Best Quality)
Import the MIDI into a DAW for professional results:

**Free DAWs:**
- **LMMS**: `sudo apt install lmms`
- **Ardour**: `sudo apt install ardour`
- **Tracktion Waveform**: Free version available

**Commercial DAWs:**
- Ableton Live
- FL Studio
- Logic Pro (Mac)
- Reaper (60-day trial)

## Browser Compatibility

The application requires a modern web browser with support for:
- Web Audio API
- Blob API
- ES6 JavaScript features

Tested and confirmed working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### No Sound During Playback
1. Check your system volume
2. Ensure your browser allows audio playback (click elsewhere on the page first)
3. Try a different browser

### MIDI File Won't Play in Media Player
- Install a soundfont (see "Playing MIDI Files" section above)
- Use a dedicated MIDI player or DAW
- Try the built-in web playback instead

### Browser Issues
- Clear browser cache
- Disable ad blockers for local files
- Make sure JavaScript is enabled

## Musical Theory

### Scale and Harmony
The generator uses minor pentatonic scales and power chord progressions typical of industrial music:
- Root notes centered around E (82.41 Hz)
- Harmonics at perfect fifths and octaves
- Chromatic passing tones in bridge sections

### Rhythm Patterns
- **Verse**: Steady eighth-note patterns with syncopated accents
- **Chorus**: More aggressive sixteenth-note patterns
- **Bridge**: Slower, atmospheric whole notes
- **Intro/Outro**: Sparse patterns for tension building/release

## Testing

The project now includes comprehensive unit tests for all core functionality:

```bash
# Run tests
node test-industrial-midi.js
```

Test coverage includes:
- **Utility Functions**: Random number generation, MIDI encoding, frequency conversion
- **Pattern Generation**: Pitch variation, pattern generation, bass/lead patterns for all sections
- **MIDI File Creation**: Header generation, track creation, complete file assembly
- **Lyrics Generation**: Line generation, vocabulary usage, section-specific lyrics
- **Edge Cases**: Extreme values, empty inputs, boundary conditions

## Recent Updates

### Version 2.6 - Enhanced MIDI Export (Latest)
- **6-Track MIDI Export** (previously only 2 tracks):
  - Track 1: Tempo and time signature information
  - Track 2: Full drum kit (kick, snare, hi-hats) with dynamic patterns
  - Track 3: Bass track with all variations and effects
  - Track 4: Lead synthesizer with scale-based melodies
  - Track 5: Pad track with atmospheric chord progressions
  - Track 6: Effects track for atmospheric elements
- **MIDI Improvements**:
  - All tracks use the same dynamic pattern generation as live playback
  - Proper MIDI channel assignments (drums on channel 10)
  - Velocity variations and humanization
  - Tool-inspired polyrhythmic drum patterns in MIDI
  - Accurate representation of the audio preview

### Version 2.5 - Tool/NIN-Inspired Variation & Stability
- **Major Audio Engine Improvements**:
  - Added Tool/Nine Inch Nails-inspired variation and instability
  - Dynamic pattern generation prevents repetitive music
  - Fixed audio crumpling/failing after extended playback
  - Resolved memory leaks from untracked oscillators
  - Added oscillator limiting to prevent audio overload
- **Enhanced Music Generation**:
  - Polyrhythmic drum patterns with ghost notes and double kicks
  - Scale-based lead generation with chromatic passing tones
  - Dual-oscillator bass synthesis with sub-bass layer
  - Dynamic filter envelopes and LFO modulation
  - NIN-style digital glitch effects
- **Improved Continuous Mode**:
  - True randomization using multiple entropy sources
  - 50% chance of structure changes between loops
  - Automatic tempo/intensity variations (±10 BPM, ±2 intensity)
  - Section shuffling for unpredictable arrangements
  - Error handling to prevent crashes
- **Stability Fixes**:
  - Periodic oscillator cleanup every 16 beats
  - Maximum 80 concurrent oscillators limit
  - Better error handling in playback loop
  - Debug logging for troubleshooting

### Version 2.4 - Playback Fixes & Project Cleanup
- Fixed audio playback stopping after ~30 seconds
- Enhanced Vocal Output section with detailed real-time information
- Improved progress bar accuracy with proper beat counting
- Cleaned up project structure - removed all unused files
- Changed default vocal type from "Whisper" to "Robotic"

### Version 2.3 - Code Refactoring & Testing
- Code organization and refactoring for better maintainability
- Added human-like timing variations and organic playback
- Real-time parameter updates during playback
- Enhanced sound synthesis with Tool-like complexity

### Version 2.2 - Enhanced Lyrics & Compact UI
- Enhanced AI-generated lyrics with industrial/electronic themes
- Real-time lyric highlighting perfectly synced with song sections
- One-click copy to clipboard and .txt export
- Regenerate button for endless lyric variations
- Compact 2-column control layout for better space efficiency
- Reduced analyzer height while maintaining functionality
- Optimized for smaller screens and windows

### Version 2.0 - FFT Analyzer
- Added real-time frequency spectrum analyzer
- Three visualization modes (bars, waveform, circle)
- Song progress tracking with section labels
- Time display showing elapsed/total duration
- Responsive canvas with DPI scaling

### Version 1.5 - Drag & Drop Builder
- Visual drag-and-drop song structure editor
- Custom arrangement capabilities
- Section reordering and removal
- Multiple preset structures

### Version 1.0 - Initial Release
- Core MIDI generation
- Web Audio synthesis
- Parameter controls
- MIDI file export

## Future Enhancements

Potential improvements for future versions:
- Additional instrument tracks (drums, pads, effects)
- Custom pattern editor
- More synthesis parameters (filter envelope, LFO)
- MIDI CC automation data
- Export to other formats (WAV, MP3)
- Pattern randomization options
- Key signature selection
- Time signature variations
- Spectrum analyzer recording/export
- BPM detection from audio input

## Troubleshooting

### Common Issues

1. **No Sound During Preview**
   - Ensure your browser allows audio playback
   - Check system volume settings
   - Try clicking elsewhere on the page first (some browsers require user interaction)

2. **MIDI File Won't Download**
   - Check browser download settings
   - Ensure pop-up blockers aren't preventing the download
   - Try a different browser if issues persist

3. **Playback Stuttering**
   - Close other browser tabs to free up resources
   - Lower the intensity parameter
   - Try a simpler song structure

## Technical Notes

The application generates MIDI data in real-time using bitwise operations to create proper MIDI byte sequences. The Web Audio API implementation uses oscillators, filters, and gain nodes to approximate the sound of classic industrial synthesizers. The distortion algorithm uses a waveshaping technique that emulates analog distortion circuits.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
