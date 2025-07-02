# JsTechnoProducer - Industrial MIDI Song Creator

## Overview

JsTechnoProducer is a web-based application that generates industrial/techno MIDI songs with customizable parameters. This tool allows musicians and producers to quickly create industrial-style MIDI compositions that can be imported into digital audio workstations (DAWs) for further production.

## Features

### Core Functionality
- **Real-time MIDI Generation**: Create complete MIDI songs with multiple tracks instantly
- **Web Audio Preview**: Listen to your creation directly in the browser before downloading
- **Customizable Song Structure**: Choose from multiple predefined song arrangements
- **Parameter Control**: Adjust tempo, intensity, and distortion levels
- **Multi-track Output**: Generates bass and lead tracks with tempo information

### User Interface
- **Dark Industrial Theme**: Visually appealing dark interface matching the industrial music aesthetic
- **Real-time Visual Feedback**: See the song structure and playback progress
- **Responsive Controls**: Sliders and dropdowns for intuitive parameter adjustment
- **Section Visualization**: Color-coded display of song sections (intro, verse, chorus, bridge, outro)

## Technical Details

### Technologies Used
- **Pure JavaScript**: No external dependencies or frameworks required
- **Web Audio API**: For real-time audio synthesis and playback
- **MIDI File Format**: Generates standard MIDI files compatible with all major DAWs
- **HTML5/CSS3**: Modern web standards for the interface

### MIDI Implementation
The application generates Type 1 MIDI files with:
- **Track 1**: Tempo and time signature information
- **Track 2**: Bass/rhythm track using Synth Bass 1 (Program 38)
- **Track 3**: Lead/melody track using Synth Lead (Program 80)

### Song Structure Options
1. **Standard**: Intro → Verse → Chorus → Verse → Chorus → Bridge → Chorus → Outro
2. **Simple**: Verse → Chorus → Verse → Chorus
3. **Extended**: Extended version with double choruses for longer compositions
4. **Industrial**: Atmospheric with extended intro/outro sections

### Audio Synthesis
The preview feature uses Web Audio API to create:
- **Sawtooth waves** for bass sounds with adjustable distortion
- **Square waves** for lead sounds with low-pass filtering
- **Dynamic gain control** based on intensity settings
- **Section-specific frequency patterns** for musical variation

## Parameters

### Tempo (BPM)
- **Range**: 60-140 BPM
- **Default**: 85 BPM
- **Description**: Controls the speed of the song. Lower values create slower, more atmospheric tracks while higher values create more energetic compositions.

### Intensity
- **Range**: 1-10
- **Default**: 7
- **Description**: Affects the velocity of MIDI notes and the volume/filtering of the preview. Higher intensity creates more aggressive, louder sounds.

### Distortion
- **Range**: 0-100
- **Default**: 60
- **Description**: Applies waveshaping distortion to the bass sounds during preview. Higher values create more industrial, gritty textures.

## Usage Instructions

1. **Open the Application**: Load `main.js` (which is actually an HTML file) in a modern web browser
2. **Adjust Parameters**: Use the sliders to set your desired tempo, intensity, and distortion levels
3. **Select Structure**: Choose a song structure from the dropdown menu
4. **Generate Song**: Click "Generate Song" to create the MIDI data
5. **Preview**: Click "Play Preview" to hear a synthesized version in your browser
6. **Download**: Click "Download MIDI" to save the generated file

## File Structure

```
JsTheDayTheWoldWentAway/
├── Readme              # Brief project identifier
├── Readme.md           # This comprehensive documentation
├── main.js             # Main application file (HTML/CSS/JavaScript)
└── Industrial MIDI Creator _ Claude _ Claude_files/  # Related web assets
```

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

## License and Usage

This tool is designed for creative music production. Generated MIDI files can be used freely in your productions. The application itself should be used in accordance with any licensing terms provided by the original developers.

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