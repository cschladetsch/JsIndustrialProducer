# JS Industrial Producer

A web-based industrial music generator inspired by Tool and Nine Inch Nails. Creates unique, procedurally generated songs with complex time signatures, dynamic structures, and optional robotic vocals.

## Features

### Music Generation
- **Industrial Sound Design**: Synthesized bass and lead tracks with distortion and filtering
- **Complex Time Signatures**: 7/8, 5/4, 9/8, and more - inspired by progressive metal
- **Dynamic Song Structures**: Intro, Verse, Chorus, Bridge, Breakdown, Outro sections
- **Real-time Parameter Control**: Adjust tempo (26-140 BPM), intensity, and distortion while playing
- **Human-like Timing**: Subtle variations in timing for more organic feel

### Visual Features
- **FFT Frequency Analyzer**: Three visualization modes (bars, waveform, circle)
- **Section Progress Indicator**: Shows progress through current section
- **Song Structure Editor**: Drag-and-drop interface to customize song arrangements
- **Vocal Output Display**: Shows current section and vocalized text

### Vocal Synthesis
- **Multiple Vocal Modes**: 
  - Off (default)
  - Robotic (square wave synthesis)
  - Whisper (high-passed)
  - Distorted (low-passed)
- **Phoneme-based Synthesis**: Maps text to frequency patterns for speech
- **Section-aware Timing**: Vocals trigger at musically appropriate intervals

### Playback Features
- **Continuous Music Mode**: Endless generative mode with automatic variations
- **Spacebar Control**: Pause/resume playback anytime
- **MIDI Export**: Download generated songs as MIDI files
- **Lyrics Generation**: Industrial-themed lyrics that sync with playback

### User Interface
- **Dark Theme**: Optimized for extended use
- **Responsive Design**: Works on various screen sizes
- **Independent Scroll**: Main window and lyrics scroll independently
- **Custom Dropdown**: Reliable vocal selection control

## Usage

1. **Choose a Structure**: Select a preset (Standard, Simple, Extended, Industrial) or drag sections to create custom arrangements

2. **Adjust Parameters**:
   - Tempo: Control the BPM (beats per minute)
   - Intensity: Affects volume and note density
   - Distortion: Amount of audio distortion applied
   - Song Length: Multiplier for section durations
   - Vocals: Select vocal synthesis mode

3. **Generate & Play**:
   - Click "Generate Song" to create a new composition
   - Click "Play Full Song" to hear it
   - Toggle "Continuous music" for endless variations
   - Press Spacebar to pause/resume

4. **Export**:
   - Download MIDI file of generated song
   - Copy or export lyrics as text file

## Technical Details

- **Web Audio API**: Real-time audio synthesis and processing
- **No External Dependencies**: Pure JavaScript implementation
- **Seeded Randomization**: Reproducible variations using seed values
- **Efficient Oscillator Management**: Automatic cleanup prevents audio buildup

## Keyboard Shortcuts

- **Spacebar**: Pause/Resume playback

## Browser Compatibility

Works best in modern browsers with Web Audio API support:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Credits

Created by Christian Schladetsch
Inspired by the musical styles of Tool and Nine Inch Nails