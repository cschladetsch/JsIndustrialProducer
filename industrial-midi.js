// ============================================================================
// Industrial MIDI Creator - Core JavaScript Module
// ============================================================================

// ============================================================================
// SECTION 1: CONSTANTS AND CONFIGURATION
// ============================================================================

const MIDI_CONSTANTS = {
    TICKS_PER_QUARTER: 480,
    CHANNELS: {
        BASS: 0,
        LEAD: 1
    },
    PROGRAMS: {
        SYNTH_BASS_1: 0x26,
        SYNTH_LEAD: 0x50
    }
};

const MUSIC_CONSTANTS = {
    BARS_PER_SECTION: {
        intro: 12,
        verse: 16,
        'pre-chorus': 8,
        chorus: 16,
        bridge: 12,
        instrumental: 16,
        breakdown: 8,
        outro: 12
    },
    TIME_SIGNATURES: {
        intro: { numerator: 4, denominator: 4 },
        verse: { numerator: 7, denominator: 8 },
        'pre-chorus': { numerator: 5, denominator: 4 },
        chorus: { numerator: 4, denominator: 4 },
        bridge: { numerator: 7, denominator: 8 },
        instrumental: { numerator: 9, denominator: 8 },
        breakdown: { numerator: 5, denominator: 4 },
        outro: { numerator: 4, denominator: 4 }
    },
    HUMAN_INTERVALS: [0, 0, 0, 1, 2, 3, 4, 5, 7, 12, -1, -2, -3, -4, -5, -7, -12],
    SMOOTH_INTERVALS: [0, 1, 2, 3, -1, -2, -3]
};

// ============================================================================
// SECTION 2: UTILITY FUNCTIONS
// ============================================================================

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function randomChoice(arr, seed) {
    return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function encodeVariableLength(value) {
    const bytes = [];
    bytes.push(value & 0x7F);
    value >>= 7;
    while (value > 0) {
        bytes.unshift((value & 0x7F) | 0x80);
        value >>= 7;
    }
    return bytes;
}

function noteToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
}

// ============================================================================
// SECTION 3: MUSIC GENERATION - PATTERNS
// ============================================================================

function varyPitch(pitch, maxVariation, seed, previousPitch = null) {
    const useSmooth = seededRandom(seed) < 0.7;
    const intervals = useSmooth ? MUSIC_CONSTANTS.SMOOTH_INTERVALS : MUSIC_CONSTANTS.HUMAN_INTERVALS;
    
    if (previousPitch !== null) {
        const currentInterval = pitch - previousPitch;
        if (Math.abs(currentInterval) <= 3 && seededRandom(seed + 1) < 0.6) {
            const direction = currentInterval === 0 ? 0 : currentInterval / Math.abs(currentInterval);
            const variation = Math.floor(seededRandom(seed + 2) * 3) * direction;
            return Math.max(21, Math.min(108, pitch + variation));
        }
    }
    
    const interval = randomChoice(intervals, seed + 3);
    return Math.max(21, Math.min(108, pitch + interval));
}

function generatePatternVariation(basePattern, seed) {
    let previousPitch = null;
    
    return basePattern.map((note, index) => {
        const noteSeed = seed + index * 1000;
        
        let pitchVariation = note.pitch;
        if (note.pitch > 0) {
            pitchVariation = varyPitch(note.pitch, 2, noteSeed, previousPitch);
            previousPitch = pitchVariation;
        }
        
        const velocityVariation = Math.floor(note.velocity + (seededRandom(noteSeed + 1) - 0.5) * 10);
        const durationVariation = note.duration * (0.9 + seededRandom(noteSeed + 2) * 0.2);
        
        return {
            pitch: pitchVariation,
            velocity: Math.max(40, Math.min(127, velocityVariation)),
            duration: durationVariation
        };
    });
}

function getBassPattern(section, intensity, seed = 0) {
    const patterns = {
        intro: [
            { pitch: randomChoice([36, 38, 41], seed), velocity: 60, duration: 1 },
            { pitch: randomChoice([36, 38, 41], seed + 1), velocity: 50, duration: 0.5 },
            { pitch: randomChoice([41, 43, 46], seed + 2), velocity: 55, duration: 0.5 },
            { pitch: randomChoice([36, 38, 41], seed + 3), velocity: 60, duration: 1 },
            { pitch: randomChoice([43, 46, 48], seed + 4), velocity: 55, duration: 1 }
        ],
        verse: [
            { pitch: 36, velocity: 70, duration: 0.5 },
            { pitch: 36, velocity: 60, duration: 0.5 },
            { pitch: 41, velocity: 65, duration: 0.5 },
            { pitch: 36, velocity: 70, duration: 0.5 },
            { pitch: 43, velocity: 65, duration: 0.5 },
            { pitch: 41, velocity: 60, duration: 0.5 },
            { pitch: 36, velocity: 70, duration: 0.5 }
        ],
        chorus: [
            { pitch: 36, velocity: 80, duration: 0.25 },
            { pitch: 36, velocity: 75, duration: 0.25 },
            { pitch: 48, velocity: 80, duration: 0.5 },
            { pitch: 43, velocity: 75, duration: 0.5 },
            { pitch: 41, velocity: 80, duration: 0.5 },
            { pitch: 36, velocity: 85, duration: 0.5 },
            { pitch: 36, velocity: 80, duration: 0.5 }
        ],
        'pre-chorus': [
            { pitch: 36, velocity: 75, duration: 0.8 },
            { pitch: 41, velocity: 70, duration: 0.8 },
            { pitch: 43, velocity: 75, duration: 0.8 },
            { pitch: 48, velocity: 70, duration: 0.8 },
            { pitch: 43, velocity: 75, duration: 0.8 }
        ],
        bridge: [
            { pitch: 41, velocity: 70, duration: 0.875 },
            { pitch: 43, velocity: 65, duration: 0.875 },
            { pitch: 46, velocity: 70, duration: 0.875 },
            { pitch: 48, velocity: 65, duration: 0.875 }
        ],
        outro: [
            { pitch: 36, velocity: 60, duration: 2 },
            { pitch: 41, velocity: 50, duration: 1 },
            { pitch: 36, velocity: 40, duration: 1 }
        ],
        instrumental: [
            { pitch: 36, velocity: 85, duration: 0.333 },
            { pitch: 36, velocity: 75, duration: 0.333 },
            { pitch: 41, velocity: 80, duration: 0.333 },
            { pitch: 43, velocity: 85, duration: 0.5 },
            { pitch: 46, velocity: 80, duration: 0.5 },
            { pitch: 48, velocity: 85, duration: 0.5 },
            { pitch: 43, velocity: 80, duration: 0.5 },
            { pitch: 41, velocity: 85, duration: 0.5 },
            { pitch: 36, velocity: 90, duration: 0.5 }
        ],
        breakdown: [
            { pitch: 36, velocity: 95, duration: 1 },
            { pitch: 36, velocity: 90, duration: 0.5 },
            { pitch: 31, velocity: 95, duration: 0.5 },
            { pitch: 36, velocity: 95, duration: 1 },
            { pitch: 29, velocity: 90, duration: 2 }
        ]
    };
    
    const pattern = patterns[section] || patterns.verse;
    const basePattern = pattern.map(note => ({
        ...note,
        velocity: Math.min(127, note.velocity + (intensity - 5) * 5)
    }));
    
    return generatePatternVariation(basePattern, seed);
}

function getLeadPattern(section, intensity, seed = 0) {
    const patterns = {
        intro: [
            { pitch: 0, velocity: 0, duration: 4 }
        ],
        verse: [
            { pitch: randomChoice([60, 62, 63], seed), velocity: 60, duration: 0.5 },
            { pitch: randomChoice([65, 67, 68], seed + 1), velocity: 55, duration: 0.5 },
            { pitch: randomChoice([60, 62, 63], seed + 2), velocity: 60, duration: 0.5 },
            { pitch: randomChoice([58, 60], seed + 3), velocity: 55, duration: 0.5 },
            { pitch: randomChoice([55, 57], seed + 4), velocity: 60, duration: 0.5 },
            { pitch: randomChoice([58, 60], seed + 5), velocity: 55, duration: 0.25 },
            { pitch: randomChoice([60, 62], seed + 6), velocity: 60, duration: 0.25 }
        ],
        chorus: [
            { pitch: 72, velocity: 80, duration: 0.5 },
            { pitch: 70, velocity: 75, duration: 0.5 },
            { pitch: 67, velocity: 80, duration: 0.5 },
            { pitch: 72, velocity: 85, duration: 1 },
            { pitch: 75, velocity: 80, duration: 0.5 },
            { pitch: 72, velocity: 75, duration: 0.5 },
            { pitch: 70, velocity: 80, duration: 0.5 }
        ],
        'pre-chorus': [
            { pitch: 63, velocity: 70, duration: 0.8 },
            { pitch: 65, velocity: 75, duration: 0.8 },
            { pitch: 67, velocity: 70, duration: 0.8 },
            { pitch: 68, velocity: 75, duration: 0.8 },
            { pitch: 67, velocity: 70, duration: 0.8 }
        ],
        bridge: [
            { pitch: 65, velocity: 65, duration: 0.875 },
            { pitch: 67, velocity: 60, duration: 0.875 },
            { pitch: 70, velocity: 65, duration: 0.875 },
            { pitch: 72, velocity: 60, duration: 0.875 }
        ],
        instrumental: [
            { pitch: 72, velocity: 85, duration: 0.222 },
            { pitch: 75, velocity: 80, duration: 0.222 },
            { pitch: 77, velocity: 85, duration: 0.222 },
            { pitch: 79, velocity: 90, duration: 0.333 },
            { pitch: 77, velocity: 85, duration: 0.333 },
            { pitch: 75, velocity: 80, duration: 0.333 },
            { pitch: 72, velocity: 85, duration: 0.5 },
            { pitch: 70, velocity: 80, duration: 0.5 },
            { pitch: 67, velocity: 85, duration: 0.5 }
        ],
        breakdown: [
            { pitch: 48, velocity: 90, duration: 1 },
            { pitch: 0, velocity: 0, duration: 0.5 },
            { pitch: 48, velocity: 95, duration: 0.5 },
            { pitch: 0, velocity: 0, duration: 1 },
            { pitch: 46, velocity: 90, duration: 2 }
        ],
        outro: [
            { pitch: 60, velocity: 50, duration: 2 },
            { pitch: 0, velocity: 0, duration: 1 },
            { pitch: 55, velocity: 40, duration: 1 }
        ]
    };
    
    const pattern = patterns[section] || patterns.verse;
    const basePattern = pattern.map(note => ({
        ...note,
        velocity: note.velocity > 0 ? Math.min(127, note.velocity + (intensity - 5) * 5) : 0
    }));
    
    return generatePatternVariation(basePattern, seed);
}

// ============================================================================
// SECTION 4: MIDI FILE GENERATION
// ============================================================================

function createHeaderChunk(numTracks, ticksPerQuarter) {
    const header = [];
    header.push(0x4D, 0x54, 0x68, 0x64); // "MThd"
    header.push(0x00, 0x00, 0x00, 0x06); // Header length (6 bytes)
    header.push(0x00, 0x01); // Format type 1
    header.push((numTracks >> 8) & 0xFF, numTracks & 0xFF); // Number of tracks
    header.push((ticksPerQuarter >> 8) & 0xFF, ticksPerQuarter & 0xFF); // Ticks per quarter
    return header;
}

function createTempoTrack(sections, ticksPerQuarter, tempo, encodeVariableLength) {
    let track = [];
    track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
    track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
    
    // Set tempo
    const microsecondsPerQuarter = Math.round(60000000 / tempo);
    track.push(0x00, 0xFF, 0x51, 0x03);
    track.push((microsecondsPerQuarter >> 16) & 0xFF);
    track.push((microsecondsPerQuarter >> 8) & 0xFF);
    track.push(microsecondsPerQuarter & 0xFF);
    
    // Initial time signature
    track.push(0x00, 0xFF, 0x58, 0x04);
    track.push(0x04, 0x02, 0x18, 0x08);
    
    // End of track
    track.push(...encodeVariableLength(0), 0xFF, 0x2F, 0x00);
    
    // Update track length
    const length = track.length - 8;
    track[4] = (length >> 24) & 0xFF;
    track[5] = (length >> 16) & 0xFF;
    track[6] = (length >> 8) & 0xFF;
    track[7] = length & 0xFF;
    
    return track;
}

function createBassTrack(sections, ticksPerQuarter, intensity, encodeVariableLength, seed, songLengthMultiplier) {
    let track = [];
    track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
    track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
    
    // Program change to synth bass
    track.push(0x00, 0xC0, MIDI_CONSTANTS.PROGRAMS.SYNTH_BASS_1);
    
    sections.forEach((section, sectionIndex) => {
        const pattern = getBassPattern(section, intensity, seed + sectionIndex * 10000);
        const baseBars = MUSIC_CONSTANTS.BARS_PER_SECTION[section] || 8;
        const barsInSection = Math.round(baseBars * songLengthMultiplier);
        const timeSig = MUSIC_CONSTANTS.TIME_SIGNATURES[section] || { numerator: 4, denominator: 4 };
        const beatsPerBar = timeSig.numerator / (timeSig.denominator / 4);
        
        for (let bar = 0; bar < barsInSection; bar++) {
            pattern.forEach(note => {
                const deltaTime = encodeVariableLength(0);
                track.push(...deltaTime);
                track.push(0x90, note.pitch, note.velocity);
                
                const duration = Math.floor(note.duration * ticksPerQuarter);
                const durationDelta = encodeVariableLength(duration);
                track.push(...durationDelta);
                track.push(0x80, note.pitch, 0x00);
            });
        }
    });
    
    // End of track
    track.push(...encodeVariableLength(0), 0xFF, 0x2F, 0x00);
    
    // Update track length
    const length = track.length - 8;
    track[4] = (length >> 24) & 0xFF;
    track[5] = (length >> 16) & 0xFF;
    track[6] = (length >> 8) & 0xFF;
    track[7] = length & 0xFF;
    
    return track;
}

function createLeadTrack(sections, ticksPerQuarter, intensity, encodeVariableLength, seed, songLengthMultiplier) {
    let track = [];
    track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
    track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
    
    // Program change to synth lead
    track.push(0x00, 0xC1, MIDI_CONSTANTS.PROGRAMS.SYNTH_LEAD);
    
    sections.forEach((section, sectionIndex) => {
        const pattern = getLeadPattern(section, intensity, seed + sectionIndex * 20000);
        const baseBars = MUSIC_CONSTANTS.BARS_PER_SECTION[section] || 8;
        const barsInSection = Math.round(baseBars * songLengthMultiplier);
        
        for (let bar = 0; bar < barsInSection; bar++) {
            pattern.forEach(note => {
                if (note.pitch > 0) {
                    const deltaTime = encodeVariableLength(0);
                    track.push(...deltaTime);
                    track.push(0x91, note.pitch, note.velocity);
                    
                    const duration = Math.floor(note.duration * ticksPerQuarter);
                    const durationDelta = encodeVariableLength(duration);
                    track.push(...durationDelta);
                    track.push(0x81, note.pitch, 0x00);
                } else {
                    const restDuration = Math.floor(note.duration * ticksPerQuarter);
                    const restDelta = encodeVariableLength(restDuration);
                    track.push(...restDelta);
                }
            });
        }
    });
    
    // End of track
    track.push(...encodeVariableLength(0), 0xFF, 0x2F, 0x00);
    
    // Update track length
    const length = track.length - 8;
    track[4] = (length >> 24) & 0xFF;
    track[5] = (length >> 16) & 0xFF;
    track[6] = (length >> 8) & 0xFF;
    track[7] = length & 0xFF;
    
    return track;
}

function generateMIDI(sections, tempo, intensity, songLengthMultiplier, seed) {
    const ticksPerQuarter = MIDI_CONSTANTS.TICKS_PER_QUARTER;
    
    // Create MIDI file structure
    const headerChunk = createHeaderChunk(3, ticksPerQuarter);
    const tempoTrack = createTempoTrack(sections, ticksPerQuarter, tempo, encodeVariableLength);
    const bassTrack = createBassTrack(sections, ticksPerQuarter, intensity, encodeVariableLength, seed, songLengthMultiplier);
    const leadTrack = createLeadTrack(sections, ticksPerQuarter, intensity, encodeVariableLength, seed, songLengthMultiplier);
    
    // Combine all chunks
    const midiData = new Uint8Array([
        ...headerChunk,
        ...tempoTrack,
        ...bassTrack,
        ...leadTrack
    ]);
    
    return midiData;
}

// ============================================================================
// SECTION 5: LYRICS GENERATION
// ============================================================================

const LYRICS_VOCABULARY = {
    existential: ['machine', 'void', 'silence', 'echo', 'shadow', 'nothing', 'everything', 'lost', 'found', 'broken', 'whole', 'endless', 'finite', 'system', 'control'],
    emotional: ['numb', 'feel', 'bleed', 'scream', 'whisper', 'burn', 'freeze', 'shatter', 'mend', 'tear', 'heal', 'ache', 'release', 'hold', 'let go'],
    abstract: ['static', 'noise', 'signal', 'frequency', 'wave', 'pulse', 'current', 'flow', 'crash', 'reboot', 'delete', 'create', 'destroy', 'rebuild', 'transform'],
    industrial: ['metal', 'rust', 'gear', 'wire', 'circuit', 'steam', 'oil', 'concrete', 'steel', 'chrome', 'electric', 'mechanical', 'digital', 'analog', 'synthetic']
};

function generateLyrics(sections, seed) {
    const lyrics = {};
    let lyricSeed = seed;
    
    sections.forEach((section, index) => {
        lyricSeed += index * 10000;
        
        switch(section) {
            case 'verse':
                lyrics[`${section}_${index}`] = [
                    generateLyricLine(['existential', 'emotional'], lyricSeed),
                    generateLyricLine(['abstract', 'industrial'], lyricSeed + 1),
                    generateLyricLine(['emotional', 'existential'], lyricSeed + 2),
                    generateLyricLine(['industrial', 'abstract'], lyricSeed + 3)
                ];
                break;
            case 'chorus':
                const chorusLine1 = generateLyricLine(['emotional', 'abstract'], lyricSeed);
                const chorusLine2 = generateLyricLine(['existential', 'industrial'], lyricSeed + 1);
                lyrics[`${section}_${index}`] = [
                    chorusLine1,
                    chorusLine2,
                    chorusLine1,
                    generateLyricLine(['abstract', 'emotional'], lyricSeed + 2)
                ];
                break;
            case 'bridge':
                lyrics[`${section}_${index}`] = [
                    generateLyricLine(['existential'], lyricSeed),
                    generateLyricLine(['abstract'], lyricSeed + 1),
                    generateLyricLine(['emotional'], lyricSeed + 2)
                ];
                break;
            case 'breakdown':
                lyrics[`${section}_${index}`] = [
                    randomChoice(LYRICS_VOCABULARY.industrial, lyricSeed).toUpperCase(),
                    randomChoice(LYRICS_VOCABULARY.existential, lyricSeed + 1).toUpperCase()
                ];
                break;
            default:
                lyrics[`${section}_${index}`] = [];
        }
    });
    
    return lyrics;
}

function generateLyricLine(categories, seed) {
    const words = [];
    categories.forEach((category, i) => {
        const vocab = LYRICS_VOCABULARY[category];
        words.push(randomChoice(vocab, seed + i * 1000));
    });
    
    const structures = [
        () => `${words[0]} in the ${words[1]}`,
        () => `${words[0]} ${words[1]}`,
        () => `The ${words[0]} will ${words[1]}`,
        () => `I am ${words[0]}, you are ${words[1]}`,
        () => `${words[0]} through ${words[1]}`,
        () => `${words[0]} becomes ${words[1]}`
    ];
    
    return randomChoice(structures, seed + 5000)();
}

// ============================================================================
// SECTION 6: EXPORT FUNCTIONS
// ============================================================================

// Export for use in HTML and tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Constants
        MIDI_CONSTANTS,
        MUSIC_CONSTANTS,
        LYRICS_VOCABULARY,
        
        // Utility functions
        seededRandom,
        randomChoice,
        encodeVariableLength,
        noteToFreq,
        
        // Pattern generation
        varyPitch,
        generatePatternVariation,
        getBassPattern,
        getLeadPattern,
        
        // MIDI generation
        createHeaderChunk,
        createTempoTrack,
        createBassTrack,
        createLeadTrack,
        generateMIDI,
        
        // Lyrics
        generateLyrics,
        generateLyricLine
    };
}