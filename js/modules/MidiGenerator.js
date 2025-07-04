import { AudioEngine } from './AudioEngine.js';

export class MidiGenerator {
    constructor() {
        this.ticksPerQuarter = 480;
    }

    generate(sections, tempo, intensity, distortion, seed) {
        const microsecondsPerQuarter = Math.round(60000000 / tempo);
        
        // MIDI file header - now with 6 tracks
        const header = [
            0x4D, 0x54, 0x68, 0x64, // "MThd"
            0x00, 0x00, 0x00, 0x06, // Header length
            0x00, 0x01, // Format type 1
            0x00, 0x06, // Number of tracks (tempo, drums, bass, lead, pad, effects)
            (this.ticksPerQuarter >> 8) & 0xFF, this.ticksPerQuarter & 0xFF
        ];
        
        // Create tracks
        const track1 = this.createTempoTrack(microsecondsPerQuarter, sections);
        const track2 = this.createDrumTrack(sections, tempo, intensity, seed);
        const track3 = this.createBassTrack(sections, intensity, seed);
        const track4 = this.createLeadTrack(sections, intensity, seed);
        const track5 = this.createPadTrack(sections, intensity, seed);
        const track6 = this.createEffectsTrack(sections, intensity, seed);
        
        // Combine all parts
        return new Uint8Array([...header, ...track1, ...track2, ...track3, ...track4, ...track5, ...track6]);
    }

    createTempoTrack(microsecondsPerQuarter, sections) {
        let track = [];
        
        // Track header
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Tempo meta event
        track.push(0x00, 0xFF, 0x51, 0x03);
        track.push((microsecondsPerQuarter >> 16) & 0xFF);
        track.push((microsecondsPerQuarter >> 8) & 0xFF);
        track.push(microsecondsPerQuarter & 0xFF);
        
        // Initial time signature (4/4)
        track.push(0x00, 0xFF, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08);
        
        // End of track
        track.push(...this.encodeVariableLength(0), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    createBassTrack(sections, intensity, seed) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Program change to synth bass
        track.push(0x00, 0xC0, 0x26); // Synth Bass 1 on channel 1
        
        // Use AudioEngine for dynamic patterns
        const audioEngine = new AudioEngine();
        let currentTick = 0;
        
        sections.forEach((section, sectionIndex) => {
            const bars = 4;
            const pattern = audioEngine.getBassPattern(section, intensity, seed + sectionIndex);
            
            for (let bar = 0; bar < bars; bar++) {
                pattern.forEach(note => {
                    if (currentTick > 0) {
                        track.push(...this.encodeVariableLength(currentTick));
                        currentTick = 0;
                    }
                    
                    if (note.pitch > 0) {
                        // Note on
                        track.push(...this.encodeVariableLength(0));
                        track.push(0x90, note.pitch, note.velocity);
                        
                        // Note duration
                        const duration = Math.floor(note.duration * this.ticksPerQuarter);
                        track.push(...this.encodeVariableLength(duration));
                        
                        // Note off
                        track.push(...this.encodeVariableLength(0));
                        track.push(0x80, note.pitch, 0);
                    } else {
                        // Rest
                        currentTick += Math.floor(note.duration * this.ticksPerQuarter);
                    }
                });
            }
        });
        
        // End of track
        track.push(...this.encodeVariableLength(0), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    createLeadTrack(sections, intensity, seed) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Program change to lead synth
        track.push(0x00, 0xC1, 0x50); // Synth Lead on channel 2
        
        // Use AudioEngine for dynamic patterns
        const audioEngine = new AudioEngine();
        let currentTick = 0;
        
        sections.forEach((section, sectionIndex) => {
            const bars = 4;
            const pattern = audioEngine.getLeadPattern(section, intensity, seed + sectionIndex + 1000);
            const rng = audioEngine.seededRandom(seed + sectionIndex);
            
            for (let bar = 0; bar < bars; bar++) {
                for (let beat = 0; beat < 16; beat++) { // 16th notes
                    if (audioEngine.shouldPlayLead(section, beat, rng)) {
                        const noteIndex = beat % pattern.length;
                        const note = pattern[noteIndex];
                        
                        if (note && note.pitch > 0) {
                            if (currentTick > 0) {
                                track.push(...this.encodeVariableLength(currentTick));
                                currentTick = 0;
                            }
                            
                            // Note on
                            track.push(...this.encodeVariableLength(0));
                            track.push(0x91, note.pitch, note.velocity);
                            
                            // Note duration
                            const duration = Math.floor(note.duration * this.ticksPerQuarter);
                            track.push(...this.encodeVariableLength(duration));
                            
                            // Note off
                            track.push(...this.encodeVariableLength(0));
                            track.push(0x81, note.pitch, 0);
                        } else {
                            currentTick += this.ticksPerQuarter / 4;
                        }
                    } else {
                        currentTick += this.ticksPerQuarter / 4;
                    }
                }
            }
        });
        
        // End of track
        track.push(...this.encodeVariableLength(0), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    createDrumTrack(sections, tempo, intensity, seed) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Use channel 10 for drums (0x99 for note on, 0x89 for note off)
        const audioEngine = new AudioEngine();
        audioEngine.currentTempo = tempo;
        const rng = audioEngine.seededRandom(seed);
        
        let currentTick = 0;
        
        sections.forEach((section, sectionIndex) => {
            const bars = 4; // Simplified for MIDI
            const beatsPerBar = 4;
            
            for (let bar = 0; bar < bars; bar++) {
                for (let beat = 0; beat < beatsPerBar * 4; beat++) { // 16th notes
                    const drumPattern = audioEngine.getDrumPattern(section, beat, intensity, rng);
                    
                    // Kick drum (C1 = 36)
                    if (drumPattern.kick) {
                        track.push(...this.encodeVariableLength(0));
                        track.push(0x99, 36, Math.floor(80 * drumPattern.kickVelocity));
                        track.push(...this.encodeVariableLength(this.ticksPerQuarter / 8));
                        track.push(0x89, 36, 0);
                        currentTick = this.ticksPerQuarter / 8;
                    }
                    
                    // Snare drum (D1 = 38)
                    if (drumPattern.snare) {
                        track.push(...this.encodeVariableLength(0));
                        track.push(0x99, 38, Math.floor(70 * drumPattern.snareVelocity));
                        track.push(...this.encodeVariableLength(this.ticksPerQuarter / 8));
                        track.push(0x89, 38, 0);
                        currentTick = this.ticksPerQuarter / 8;
                    }
                    
                    // Hi-hat (F#1 = 42 closed, A#1 = 46 open)
                    if (drumPattern.hihat) {
                        const hihatNote = Math.random() > 0.8 ? 46 : 42;
                        track.push(...this.encodeVariableLength(0));
                        track.push(0x99, hihatNote, Math.floor(50 * drumPattern.hihatVelocity));
                        track.push(...this.encodeVariableLength(this.ticksPerQuarter / 16));
                        track.push(0x89, hihatNote, 0);
                        currentTick = this.ticksPerQuarter / 16;
                    }
                    
                    // Advance to next 16th note if nothing played
                    if (!drumPattern.kick && !drumPattern.snare && !drumPattern.hihat) {
                        currentTick += this.ticksPerQuarter / 4;
                    }
                }
            }
        });
        
        // End of track
        track.push(...this.encodeVariableLength(0), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    createPadTrack(sections, intensity, seed) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Program change to pad sound (Pad 2 warm)
        track.push(0x00, 0xC2, 0x59); // Channel 3
        
        const rng = this.seededRandom(seed + 2000);
        let currentTick = 0;
        
        sections.forEach((section, sectionIndex) => {
            // Pad chords for atmosphere
            if (section === 'chorus' || section === 'bridge' || section === 'breakdown') {
                // C minor chord progression
                const chords = [
                    [48, 51, 55], // Cm
                    [46, 50, 53], // Bb
                    [43, 46, 50], // G
                    [48, 52, 55]  // Ab
                ];
                
                const chord = chords[sectionIndex % chords.length];
                const velocity = 40 + intensity * 3;
                
                // Play chord
                chord.forEach(note => {
                    track.push(...this.encodeVariableLength(0));
                    track.push(0x92, note, velocity);
                });
                
                // Hold for 2 bars
                const holdDuration = this.ticksPerQuarter * 8;
                track.push(...this.encodeVariableLength(holdDuration));
                
                // Release chord
                chord.forEach(note => {
                    track.push(...this.encodeVariableLength(0));
                    track.push(0x82, note, 0);
                });
                
                currentTick = 0;
            } else {
                // Rest for other sections
                currentTick += this.ticksPerQuarter * 16;
            }
        });
        
        // End of track
        track.push(...this.encodeVariableLength(0), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    createEffectsTrack(sections, intensity, seed) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Program change to FX sound (FX 4 atmosphere)
        track.push(0x00, 0xC3, 0x63); // Channel 4
        
        const rng = this.seededRandom(seed + 3000);
        let currentTick = 0;
        
        sections.forEach((section, sectionIndex) => {
            // Effects only in specific sections
            if (section === 'intro' || section === 'breakdown' || section === 'outro') {
                // Random atmospheric note
                const note = 60 + Math.floor(rng() * 24) - 12;
                const velocity = 30 + intensity * 2;
                
                // Play effect
                track.push(...this.encodeVariableLength(0));
                track.push(0x93, note, velocity);
                
                // Hold for variable duration
                const duration = this.ticksPerQuarter * (2 + Math.floor(rng() * 4));
                track.push(...this.encodeVariableLength(duration));
                
                // Release
                track.push(...this.encodeVariableLength(0));
                track.push(0x83, note, 0);
                
                // Rest
                currentTick = this.ticksPerQuarter * 8;
            } else {
                // Rest for other sections
                currentTick += this.ticksPerQuarter * 16;
            }
        });
        
        // End of track
        track.push(...this.encodeVariableLength(0), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    seededRandom(seed) {
        return () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    encodeVariableLength(value) {
        const bytes = [];
        bytes.push(value & 0x7F);
        value >>= 7;
        while (value > 0) {
            bytes.unshift((value & 0x7F) | 0x80);
            value >>= 7;
        }
        return bytes;
    }
}