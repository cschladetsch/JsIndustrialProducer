import { AudioEngine } from './AudioEngine.js';

export class MidiGenerator {
    constructor() {
        this.ticksPerQuarter = 480;
    }

    generate(sections, tempo, intensity, distortion, seed, preset = 'standard') {
        const microsecondsPerQuarter = Math.round(60000000 / tempo);
        
        // Initialize section bar counts
        this.barsPerSection = {
            intro: 16,
            verse: 32,
            'pre-chorus': 16,
            chorus: 32,
            bridge: 24,
            breakdown: 16,
            instrumental: 32,
            outro: 16
        };
        
        // Tool-specific longer sections for epic songs
        this.toolBarsPerSection = {
            intro: 32,        // Long atmospheric builds like Fear Inoculum
            verse: 40,        // Extended verses like Schism/Lateralus
            'pre-chorus': 24,  // Substantial buildup
            chorus: 32,       // Powerful and expansive
            bridge: 48,       // Complex transitional sections
            breakdown: 32,    // Danny Carey drum showcases
            instrumental: 56, // Epic solos like Reflection/Disposition
            outro: 40         // Extended fade-outs like Right in Two
        };
        
        // MIDI file header - now with 6 tracks
        const header = [
            0x4D, 0x54, 0x68, 0x64, // "MThd"
            0x00, 0x00, 0x00, 0x06, // Header length
            0x00, 0x01, // Format type 1
            0x00, 0x06, // Number of tracks (tempo, drums, bass, lead, pad, effects)
            (this.ticksPerQuarter >> 8) & 0xFF, this.ticksPerQuarter & 0xFF
        ];
        
        // Create tracks with proper section lengths
        const track1 = this.createTempoTrack(microsecondsPerQuarter, sections, preset);
        const track2 = this.createDrumTrack(sections, tempo, intensity, seed, preset);
        const track3 = this.createBassTrack(sections, intensity, seed, preset);
        const track4 = this.createLeadTrack(sections, intensity, seed, preset);
        const track5 = this.createPadTrack(sections, intensity, seed, preset);
        const track6 = this.createEffectsTrack(sections, intensity, seed, preset);
        
        // Combine all parts
        return new Uint8Array([...header, ...track1, ...track2, ...track3, ...track4, ...track5, ...track6]);
    }

    createTempoTrack(microsecondsPerQuarter, sections, preset) {
        let track = [];
        
        // Track header
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Track name
        const trackName = "01-Master Tempo";
        track.push(0x00, 0xFF, 0x03, trackName.length);
        for (let i = 0; i < trackName.length; i++) {
            track.push(trackName.charCodeAt(i));
        }
        
        // Sequence number
        track.push(0x00, 0xFF, 0x00, 0x02, 0x00, 0x00);
        
        // Tempo meta event
        track.push(0x00, 0xFF, 0x51, 0x03);
        track.push((microsecondsPerQuarter >> 16) & 0xFF);
        track.push((microsecondsPerQuarter >> 8) & 0xFF);
        track.push(microsecondsPerQuarter & 0xFF);
        
        // Tool-inspired time signature changes
        let currentTick = 0;
        const barLength = this.ticksPerQuarter * 4; // 4 beats per bar base
        
        // Initial time signature (4/4)
        track.push(0x00, 0xFF, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08);
        
        sections.forEach((section, index) => {
            const timeSignatures = this.getToolTimeSignatures(section, index);
            
            timeSignatures.forEach((timeSig, sigIndex) => {
                if (sigIndex > 0 || index > 0) { // Don't repeat initial 4/4
                    const deltaTime = sigIndex === 0 ? barLength * 4 : barLength * timeSig.bars;
                    track.push(...this.encodeVariableLength(deltaTime));
                    track.push(0xFF, 0x58, 0x04);
                    track.push(timeSig.numerator, timeSig.denominator, 0x18, 0x08);
                    currentTick = 0;
                }
            });
        });
        
        // End of track
        track.push(...this.encodeVariableLength(currentTick), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    getToolTimeSignatures(section, sectionIndex) {
        // Tool-inspired complex time signature progressions
        const patterns = {
            intro: [
                { numerator: 4, denominator: 2, bars: 4 }, 
                { numerator: 7, denominator: 2, bars: 2 },
                { numerator: 4, denominator: 2, bars: 2 }
            ],
            verse: [
                { numerator: 7, denominator: 2, bars: 4 }, // Signature Tool 7/4
                { numerator: 9, denominator: 2, bars: 2 }, // Complex 9/4 like "Schism"
                { numerator: 7, denominator: 2, bars: 4 },
                { numerator: 4, denominator: 2, bars: 4 }, // Resolution to 4/4
                { numerator: 5, denominator: 2, bars: 2 }  // 5/4 transition
            ],
            chorus: [
                { numerator: 4, denominator: 2, bars: 8 }, // Stable chorus in 4/4
                { numerator: 7, denominator: 2, bars: 4 }, // But with 7/4 variations
                { numerator: 4, denominator: 2, bars: 4 }
            ],
            bridge: [
                { numerator: 9, denominator: 2, bars: 4 }, // Complex 9/4 like "Forty Six & 2"
                { numerator: 7, denominator: 2, bars: 4 },
                { numerator: 5, denominator: 2, bars: 2 },
                { numerator: 4, denominator: 2, bars: 2 }
            ],
            breakdown: [
                { numerator: 11, denominator: 2, bars: 2 }, // Extremely complex like "Rosetta Stoned"
                { numerator: 7, denominator: 2, bars: 3 },
                { numerator: 9, denominator: 2, bars: 2 },
                { numerator: 4, denominator: 2, bars: 1 }  // Brief resolution
            ],
            instrumental: [
                { numerator: 5, denominator: 2, bars: 4 },
                { numerator: 7, denominator: 2, bars: 4 },
                { numerator: 9, denominator: 2, bars: 4 },
                { numerator: 4, denominator: 2, bars: 4 }
            ],
            outro: [
                { numerator: 7, denominator: 2, bars: 4 }, 
                { numerator: 5, denominator: 2, bars: 2 },
                { numerator: 4, denominator: 2, bars: 2 }
            ]
        };
        
        // Add section-specific variations based on index for more complexity
        const basePattern = patterns[section] || [{ numerator: 4, denominator: 2, bars: 4 }];
        
        // Tool songs often have evolving complexity - later sections get more complex
        if (sectionIndex > 3) {
            return basePattern.map(sig => ({
                ...sig,
                numerator: sig.numerator === 4 ? 7 : (sig.numerator === 7 ? 9 : sig.numerator)
            }));
        }
        
        return basePattern;
    }

    createBassTrack(sections, intensity, seed, preset) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Track name
        const trackName = "02-Industrial Bass";
        track.push(0x00, 0xFF, 0x03, trackName.length);
        for (let i = 0; i < trackName.length; i++) {
            track.push(trackName.charCodeAt(i));
        }
        
        // Program change to aggressive distorted bass
        track.push(0x00, 0xC0, 0x1F); // Overdriven Guitar - more aggressive than distorted guitar
        
        // Add aggressive effects
        track.push(0x00, 0xB0, 0x5B, 0x7F); // Max reverb for heaviness
        track.push(0x00, 0xB0, 0x5D, 0x70); // Heavy chorus
        track.push(0x00, 0xE0, 0x00, 0x40); // Center pitch bend
        
        // Use AudioEngine for dynamic patterns
        const audioEngine = new AudioEngine();
        let absoluteTick = 0;
        
        sections.forEach((section, sectionIndex) => {
            let sectionBars;
            if (preset === 'tool') {
                sectionBars = this.toolBarsPerSection[section] || this.barsPerSection[section] || 8;
            } else {
                sectionBars = this.barsPerSection[section] || 8;
            }
            const timeSignatures = this.getToolTimeSignatures(section, sectionIndex);
            const pattern = audioEngine.getBassPattern(section, intensity, seed + sectionIndex);
            
            let barsRemaining = sectionBars;
            timeSignatures.forEach(timeSig => {
                const barsForThisTimeSig = Math.min(timeSig.bars, barsRemaining);
                for (let bar = 0; bar < barsForThisTimeSig; bar++) {
                    // Adapt pattern to time signature
                    const beatsInBar = timeSig.numerator * (4 / timeSig.denominator);
                    const patternLength = Math.floor(pattern.length * (beatsInBar / 4));
                    
                    for (let beat = 0; beat < patternLength; beat++) {
                        const note = pattern[beat % pattern.length];
                        const noteDuration = Math.floor(note.duration * this.ticksPerQuarter * (beatsInBar / 4));
                        
                        if (note.pitch > 0) {
                            // Tool-style Drop D tuning (D-A-D-G-B-E)
                            let toolPitch = note.pitch;
                            // Convert to Drop D: lowest strings tuned down
                            if (note.pitch <= 40) { // Low E string becomes D (down 2 semitones)
                                toolPitch = note.pitch - 2;
                            }
                            toolPitch = Math.max(24, toolPitch - 12); // One octave down for heaviness
                            const aggressiveVelocity = Math.min(127, Math.floor(note.velocity * 1.2)); // INCREASE velocity for aggression
                            
                            // Aggressive note on with accent
                            track.push(...this.encodeVariableLength(absoluteTick));
                            track.push(0x90, toolPitch, aggressiveVelocity);
                            
                            // Add aggressive accents on strong beats
                            if (beat % 4 === 0) {
                                track.push(...this.encodeVariableLength(0));
                                track.push(0x90, toolPitch + 12, Math.floor(aggressiveVelocity * 0.8)); // Octave accent
                            }
                            
                            // Add occasional pitch bends (Tool-style)
                            if ((beat + sectionIndex) % 7 === 0) {
                                track.push(...this.encodeVariableLength(Math.floor(noteDuration * 0.1)));
                                track.push(0xE0, 0x00, 0x44); // Slight pitch bend up
                                track.push(...this.encodeVariableLength(Math.floor(noteDuration * 0.1)));
                                track.push(0xE0, 0x00, 0x40); // Return to center
                                
                                // Note off after bend
                                track.push(...this.encodeVariableLength(Math.floor(noteDuration * 0.8)));
                            } else {
                                // Normal note off
                                track.push(...this.encodeVariableLength(noteDuration));
                            }
                            track.push(0x80, toolPitch, 0);
                            
                            absoluteTick = 0;
                        } else {
                            // Accumulate rest time
                            absoluteTick += noteDuration;
                        }
                    }
                }
                barsRemaining -= barsForThisTimeSig;
            });
        });
        
        // End of track
        track.push(...this.encodeVariableLength(absoluteTick), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    createLeadTrack(sections, intensity, seed, preset) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Track name
        const trackName = "03-Industrial Lead";
        track.push(0x00, 0xFF, 0x03, trackName.length);
        for (let i = 0; i < trackName.length; i++) {
            track.push(trackName.charCodeAt(i));
        }
        
        // Program change to lead synth
        track.push(0x00, 0xC1, 0x50); // Synth Lead on channel 2
        
        // Use AudioEngine for dynamic patterns
        const audioEngine = new AudioEngine();
        let absoluteTick = 0;
        
        sections.forEach((section, sectionIndex) => {
            const bars = 4;
            const pattern = audioEngine.getLeadPattern(section, intensity, seed + sectionIndex + 1000);
            const rng = audioEngine.seededRandom(seed + sectionIndex);
            
            for (let bar = 0; bar < bars; bar++) {
                for (let beat = 0; beat < 16; beat++) { // 16th notes
                    const sixteenthNoteDuration = this.ticksPerQuarter / 4;
                    
                    if (audioEngine.shouldPlayLead(section, beat, rng)) {
                        const noteIndex = beat % pattern.length;
                        const note = pattern[noteIndex];
                        
                        if (note && note.pitch > 0) {
                            // Note on at current absolute time
                            track.push(...this.encodeVariableLength(absoluteTick));
                            track.push(0x91, note.pitch, note.velocity);
                            
                            // Note duration
                            const duration = Math.floor(note.duration * this.ticksPerQuarter);
                            
                            // Note off after duration
                            track.push(...this.encodeVariableLength(duration));
                            track.push(0x81, note.pitch, 0);
                            
                            // Move to next sixteenth note position
                            absoluteTick = Math.max(0, sixteenthNoteDuration - duration);
                        } else {
                            absoluteTick += sixteenthNoteDuration;
                        }
                    } else {
                        absoluteTick += sixteenthNoteDuration;
                    }
                }
            }
        });
        
        // End of track
        track.push(...this.encodeVariableLength(absoluteTick), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    createDrumTrack(sections, tempo, intensity, seed, preset) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Track name
        const trackName = preset === 'tool' ? "04-Danny Carey Drums" : "04-Industrial Drums";
        track.push(0x00, 0xFF, 0x03, trackName.length);
        for (let i = 0; i < trackName.length; i++) {
            track.push(trackName.charCodeAt(i));
        }
        
        // Set to drum channel (channel 10)
        track.push(0x00, 0xC9, 0x00); // Program 0 on channel 10 (drums)
        
        // Import AudioEngine at the top of the file to avoid repeated instantiation
        const audioEngine = new AudioEngine();
        audioEngine.currentTempo = tempo;
        const rng = audioEngine.seededRandom(seed);
        
        let absoluteTick = 0;
        
        sections.forEach((section, sectionIndex) => {
            const timeSignatures = this.getToolTimeSignatures(section, sectionIndex);
            
            timeSignatures.forEach(timeSig => {
                for (let bar = 0; bar < timeSig.bars; bar++) {
                    const beatsInBar = timeSig.numerator * (4 / timeSig.denominator);
                    const subdivisionsPerBeat = 4; // 16th notes
                    const totalSubdivisions = Math.floor(beatsInBar * subdivisionsPerBeat);
                    const subdivisionDuration = this.ticksPerQuarter / 4;
                    
                    // Danny Carey-inspired polyrhythmic patterns
                    const polyrhythmCycle = this.getDannyCareyPattern(section, bar, beatsInBar, sectionIndex, rng);
                    
                    for (let subdivision = 0; subdivision < totalSubdivisions; subdivision++) {
                        const drumPattern = this.getComplexDrumPattern(section, subdivision, beatsInBar, polyrhythmCycle, intensity, rng);
                        let eventsThisBeat = [];
                        
                        // Enhanced drum samples with Tool-style complexity
                        if (drumPattern.kick) {
                            eventsThisBeat.push({note: 36, velocity: Math.floor(90 * drumPattern.kickVelocity), duration: subdivisionDuration / 2});
                        }
                        if (drumPattern.snare) {
                            // Use both snare and rim shots
                            const snareNote = drumPattern.rimshot ? 37 : 38;
                            eventsThisBeat.push({note: snareNote, velocity: Math.floor(80 * drumPattern.snareVelocity), duration: subdivisionDuration / 2});
                        }
                        if (drumPattern.hihat) {
                            const hihatNote = drumPattern.openHat ? 46 : 42;
                            eventsThisBeat.push({note: hihatNote, velocity: Math.floor(60 * drumPattern.hihatVelocity), duration: subdivisionDuration / 4});
                        }
                        
                        // Add Tool-style percussion elements
                        if (drumPattern.tom) {
                            const tomNote = 43 + (subdivision % 3); // Floor, mid, high toms
                            eventsThisBeat.push({note: tomNote, velocity: Math.floor(70 * drumPattern.tomVelocity), duration: subdivisionDuration});
                        }
                        if (drumPattern.crash) {
                            eventsThisBeat.push({note: 49, velocity: Math.floor(85 * drumPattern.crashVelocity), duration: subdivisionDuration * 2});
                        }
                        if (drumPattern.ride) {
                            eventsThisBeat.push({note: 51, velocity: Math.floor(65 * drumPattern.rideVelocity), duration: subdivisionDuration / 2});
                        }
                        
                        if (eventsThisBeat.length > 0) {
                            // Play all drum events simultaneously on channel 9 (MIDI drum channel)
                            eventsThisBeat.forEach((event, index) => {
                                track.push(...this.encodeVariableLength(index === 0 ? absoluteTick : 0));
                                track.push(0x99, event.note, event.velocity); // Channel 9 (10 in 1-based counting)
                            });
                            
                            // Schedule note offs
                            eventsThisBeat.forEach((event, index) => {
                                track.push(...this.encodeVariableLength(index === 0 ? event.duration : 0));
                                track.push(0x89, event.note, 0); // Channel 9 note off
                            });
                            
                            absoluteTick = subdivisionDuration - eventsThisBeat[0].duration;
                        } else {
                            absoluteTick += subdivisionDuration;
                        }
                    }
                }
            });
        });
        
        // End of track
        track.push(...this.encodeVariableLength(absoluteTick), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    getDannyCareyPattern(section, bar, beatsInBar, sectionIndex, rng) {
        // Create polyrhythmic cycles inspired by Danny Carey
        const patterns = {
            verse: [5, 7, 4], // 5 over 4, 7 over 4 polyrhythms
            chorus: [3, 4, 7], // Simpler but still complex
            breakdown: [9, 7, 5, 4], // Maximum complexity
            bridge: [7, 5, 4], 
            intro: [4, 7], // Build complexity
            outro: [5, 4, 3] // Wind down
        };
        
        const cyclePattern = patterns[section] || [4, 7, 5];
        const cycleIndex = (bar + sectionIndex) % cyclePattern.length;
        return cyclePattern[cycleIndex];
    }

    getComplexDrumPattern(section, subdivision, beatsInBar, polyrhythmCycle, intensity, rng) {
        // Enhanced drum pattern generation with Tool-style complexity
        let kick = false, snare = false, hihat = false, tom = false, crash = false, ride = false;
        let rimshot = false, openHat = false;
        let kickVelocity = 1, snareVelocity = 1, hihatVelocity = 0.7;
        let tomVelocity = 0.8, crashVelocity = 1, rideVelocity = 0.6;
        
        // Polyrhythmic kick pattern
        if (subdivision % polyrhythmCycle === 0) {
            kick = true;
            kickVelocity = 0.9 + (intensity / 10) * 0.1;
        }
        
        // Snare on complex intervals
        const snareInterval = Math.floor(beatsInBar * 4 / 2); // Adapt to time signature
        if ((subdivision + polyrhythmCycle) % snareInterval === Math.floor(snareInterval / 2)) {
            snare = true;
            rimshot = rng() < 0.3; // 30% chance of rimshot
            snareVelocity = 0.8 + (intensity / 10) * 0.2;
        }
        
        // Hi-hat with Danny Carey-style patterns
        if (section === 'verse' || section === 'chorus') {
            hihat = subdivision % 2 === 1;
            openHat = (subdivision % 8 === 7) && rng() < 0.4;
        } else if (section === 'breakdown') {
            hihat = rng() < 0.3; // Sparse in breakdown
            openHat = rng() < 0.1;
        }
        
        // Tom fills (Tool-style)
        if (subdivision % 16 > 12 && rng() < 0.2) {
            tom = true;
            tomVelocity = 0.7 + rng() * 0.3;
        }
        
        // Crash on section transitions and emphasis
        if (subdivision === 0 && section === 'chorus') {
            crash = true;
            crashVelocity = 0.9;
        }
        
        // Ride bell (Tool signature sound)
        if (section === 'bridge' && subdivision % 3 === 0) {
            ride = true;
            rideVelocity = 0.5 + rng() * 0.3;
        }
        
        return {
            kick, snare, hihat, tom, crash, ride,
            rimshot, openHat,
            kickVelocity, snareVelocity, hihatVelocity,
            tomVelocity, crashVelocity, rideVelocity
        };
    }

    createPadTrack(sections, intensity, seed, preset) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Track name
        const trackName = preset === 'tool' ? "05-Tool Atmosphere" : "05-Industrial Pads";
        track.push(0x00, 0xFF, 0x03, trackName.length);
        for (let i = 0; i < trackName.length; i++) {
            track.push(trackName.charCodeAt(i));
        }
        
        // Program change to atmospheric pad (Pad 4 choir)
        track.push(0x00, 0xC2, 0x5B); // Channel 3 - More atmospheric
        
        // Add reverb and modulation for Tool-style atmosphere
        track.push(0x00, 0xB2, 0x5B, 0x7F); // Reverb depth
        track.push(0x00, 0xB2, 0x01, 0x40); // Modulation wheel
        
        const rng = this.seededRandom(seed + 2000);
        let absoluteTick = 0;
        
        sections.forEach((section, sectionIndex) => {
            const timeSignatures = this.getToolTimeSignatures(section, sectionIndex);
            
            timeSignatures.forEach(timeSig => {
                const totalTicks = this.ticksPerQuarter * 4 * timeSig.bars; // Duration for this time signature
                
                if (section === 'chorus' || section === 'bridge' || section === 'breakdown' || section === 'intro' || 
                    (preset === 'tool' && (section === 'verse' || section === 'instrumental'))) {
                    // Tool-style extended chord progressions with drone notes
                    const toolChords = this.getToolChordProgression(section, sectionIndex, rng);
                    const chord = toolChords[sectionIndex % toolChords.length];
                    const velocity = 35 + intensity * 2; // Subtle but present
                    
                    // Add drone note (Tool signature)
                    const droneNote = 36; // Low C drone
                    track.push(...this.encodeVariableLength(absoluteTick));
                    track.push(0x92, droneNote, Math.floor(velocity * 0.6));
                    
                    // Play chord with slight delays for richness
                    chord.forEach((note, index) => {
                        const delay = index * (this.ticksPerQuarter / 16); // Slight stagger
                        track.push(...this.encodeVariableLength(index === 0 ? delay : delay));
                        track.push(0x92, note, velocity + (index * 2)); // Slight velocity variation
                    });
                    
                    // Add subtle modulation changes throughout
                    const modulationPoints = Math.floor(totalTicks / (this.ticksPerQuarter * 2));
                    for (let mod = 1; mod <= modulationPoints; mod++) {
                        const modTime = (totalTicks * mod) / modulationPoints;
                        const modValue = 0x40 + Math.floor(rng() * 0x20 - 0x10); // Subtle modulation
                        track.push(...this.encodeVariableLength(Math.floor(modTime)));
                        track.push(0xB2, 0x01, Math.max(0, Math.min(0x7F, modValue)));
                    }
                    
                    // Hold for the duration of time signature
                    const releaseTime = totalTicks - (chord.length * (this.ticksPerQuarter / 16));
                    
                    // Release drone first
                    track.push(...this.encodeVariableLength(Math.floor(releaseTime * 0.8)));
                    track.push(0x82, droneNote, 0);
                    
                    // Release chord
                    chord.forEach((note, index) => {
                        const releaseDelay = Math.floor(releaseTime * 0.2 / chord.length);
                        track.push(...this.encodeVariableLength(index === 0 ? releaseDelay : releaseDelay));
                        track.push(0x82, note, 0);
                    });
                    
                    absoluteTick = 0;
                } else {
                    // Rest for other sections but maintain some atmosphere
                    if (section === 'verse' && rng() < 0.3) {
                        // Subtle atmospheric notes in verses
                        const atmosphereNote = 72 + Math.floor(rng() * 12); // High ethereal notes
                        track.push(...this.encodeVariableLength(absoluteTick));
                        track.push(0x92, atmosphereNote, 25); // Very quiet
                        track.push(...this.encodeVariableLength(totalTicks));
                        track.push(0x82, atmosphereNote, 0);
                        absoluteTick = 0;
                    } else {
                        absoluteTick += totalTicks;
                    }
                }
            });
        });
        
        // End of track
        track.push(...this.encodeVariableLength(absoluteTick), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    getToolChordProgression(section, sectionIndex, rng) {
        // Tool-inspired chord progressions with extensions and drone notes
        const progressions = {
            intro: [
                [48, 51, 55, 60], // Cm add9
                [46, 50, 53, 58], // Bb add9
                [43, 46, 50, 55], // Gm add9
                [41, 44, 48, 53]  // F add9
            ],
            verse: [
                [48, 51, 55], // Cm
                [46, 50, 53], // Bb
                [41, 44, 48], // F
                [43, 46, 50]  // Gm
            ],
            chorus: [
                [48, 51, 55, 60, 63], // Cm(add9,11)
                [46, 50, 53, 58, 62], // Bb(add9,11) 
                [43, 46, 50, 55, 58], // Gm(add9,11)
                [48, 52, 55, 60, 64]  // Ab(add9,11)
            ],
            breakdown: [
                [36, 48, 51, 55], // Cm with drone
                [34, 46, 50, 53], // Bb with drone
                [31, 43, 46, 50], // G with drone
                [36, 48, 52, 55]  // Ab with drone
            ],
            bridge: [
                [48, 52, 56, 60], // Ab maj7
                [46, 50, 54, 58], // Bb maj7
                [44, 48, 52, 56], // F maj7
                [43, 47, 51, 55]  // Gm7
            ]
        };
        
        return progressions[section] || progressions.verse;
    }

    createEffectsTrack(sections, intensity, seed, preset) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Track name
        const trackName = preset === 'tool' ? "06-Tool Textures" : "06-Industrial FX";
        track.push(0x00, 0xFF, 0x03, trackName.length);
        for (let i = 0; i < trackName.length; i++) {
            track.push(trackName.charCodeAt(i));
        }
        
        // Program change to FX sound (FX 1 rain)
        track.push(0x00, 0xC3, 0x60); // Channel 4 - More textural
        
        // Add heavy effects processing
        track.push(0x00, 0xB3, 0x5B, 0x7F); // Max reverb
        track.push(0x00, 0xB3, 0x5D, 0x60); // Chorus depth
        
        const rng = this.seededRandom(seed + 3000);
        let absoluteTick = 0;
        
        sections.forEach((section, sectionIndex) => {
            const timeSignatures = this.getToolTimeSignatures(section, sectionIndex);
            
            timeSignatures.forEach(timeSig => {
                const sectionDuration = this.ticksPerQuarter * 4 * timeSig.bars;
                
                // Tool-style textural elements throughout
                if (section === 'intro' || section === 'breakdown' || section === 'outro' || 
                   (section === 'bridge' && rng() < 0.7) ||
                   (preset === 'tool' && (section === 'instrumental' || section === 'verse'))) {
                    
                    // Multiple layers of atmospheric sounds
                    const effectLayers = this.getToolEffectLayers(section, intensity, rng, preset);
                    
                    effectLayers.forEach((layer, layerIndex) => {
                        const startDelay = layerIndex * (this.ticksPerQuarter / 8);
                        
                        // Start effect layer
                        track.push(...this.encodeVariableLength(layerIndex === 0 ? absoluteTick + startDelay : startDelay));
                        track.push(0x93, layer.note, layer.velocity);
                        
                        // Add pitch bends for Tool-style texture
                        if (layer.pitchBend) {
                            track.push(...this.encodeVariableLength(Math.floor(layer.duration * 0.3)));
                            track.push(0xE3, 0x00, layer.bendAmount);
                            track.push(...this.encodeVariableLength(Math.floor(layer.duration * 0.4)));
                            track.push(0xE3, 0x00, 0x40); // Return to center
                        }
                        
                        // End effect layer
                        const endTime = Math.floor(layer.duration - (layer.pitchBend ? layer.duration * 0.7 : 0));
                        track.push(...this.encodeVariableLength(endTime));
                        track.push(0x83, layer.note, 0);
                    });
                    
                    // Add periodic filter sweeps (Tool signature)
                    if (section === 'breakdown') {
                        const sweepCount = Math.floor(sectionDuration / (this.ticksPerQuarter * 2));
                        for (let sweep = 0; sweep < sweepCount; sweep++) {
                            const sweepTime = (sectionDuration * sweep) / sweepCount;
                            const cutoffValue = 0x20 + Math.floor(rng() * 0x40);
                            track.push(...this.encodeVariableLength(Math.floor(sweepTime)));
                            track.push(0xB3, 0x4A, cutoffValue); // Filter cutoff modulation
                        }
                    }
                    
                    absoluteTick = 0;
                } else {
                    // Subtle ambient textures in verses/choruses
                    if (rng() < 0.4) {
                        const subtleNote = 84 + Math.floor(rng() * 12); // High ethereal range
                        const subtleVelocity = 15 + Math.floor(rng() * 10); // Very quiet
                        
                        track.push(...this.encodeVariableLength(absoluteTick));
                        track.push(0x93, subtleNote, subtleVelocity);
                        track.push(...this.encodeVariableLength(sectionDuration));
                        track.push(0x83, subtleNote, 0);
                        absoluteTick = 0;
                    } else {
                        absoluteTick += sectionDuration;
                    }
                }
            });
        });
        
        // End of track
        track.push(...this.encodeVariableLength(absoluteTick), 0xFF, 0x2F, 0x00);
        
        // Update track length
        const length = track.length - 8;
        track[4] = (length >> 24) & 0xFF;
        track[5] = (length >> 16) & 0xFF;
        track[6] = (length >> 8) & 0xFF;
        track[7] = length & 0xFF;
        
        return track;
    }

    getToolEffectLayers(section, intensity, rng, preset = 'standard') {
        const layers = [];
        const baseIntensity = intensity / 10;
        
        // Enhanced layers for Tool mode
        const isToolMode = preset === 'tool';
        const layerCount = isToolMode ? 4 : 3;
        const durationMultiplier = isToolMode ? 2 : 1;
        
        // Layer 1: Low drone/texture
        layers.push({
            note: 24 + Math.floor(rng() * 12), // Very low range
            velocity: Math.floor((isToolMode ? 25 : 20) * baseIntensity),
            duration: this.ticksPerQuarter * 8 * durationMultiplier,
            pitchBend: false,
            bendAmount: 0x40
        });
        
        // Layer 2: Mid-range texture with pitch bend
        layers.push({
            note: 48 + Math.floor(rng() * 24),
            velocity: Math.floor((isToolMode ? 40 : 35) * baseIntensity),
            duration: this.ticksPerQuarter * 6 * durationMultiplier,
            pitchBend: true,
            bendAmount: 0x48 + Math.floor(rng() * 16)
        });
        
        // Layer 3: High atmospheric
        if (section === 'breakdown' || rng() < (isToolMode ? 0.8 : 0.6)) {
            layers.push({
                note: 72 + Math.floor(rng() * 12),
                velocity: Math.floor((isToolMode ? 30 : 25) * baseIntensity),
                duration: this.ticksPerQuarter * 4 * durationMultiplier,
                pitchBend: rng() < 0.5,
                bendAmount: 0x38 + Math.floor(rng() * 16)
            });
        }
        
        // Layer 4: Tool-specific ultra-high ethereal layer
        if (isToolMode && (section === 'instrumental' || section === 'bridge' || rng() < 0.7)) {
            layers.push({
                note: 84 + Math.floor(rng() * 8), // Very high ethereal range
                velocity: Math.floor(20 * baseIntensity),
                duration: this.ticksPerQuarter * 12 * durationMultiplier,
                pitchBend: rng() < 0.3,
                bendAmount: 0x44 + Math.floor(rng() * 8)
            });
        }
        
        return layers;
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