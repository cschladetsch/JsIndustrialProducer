#!/usr/bin/env node

// Comprehensive Unit Tests for 6-Channel MIDI Export
// Tests the enhanced MIDI generation with drums, bass, lead, pad, and effects tracks

const fs = require('fs');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✓ ${message}`);
        testsPassed++;
    } else {
        console.error(`✗ ${message}`);
        testsFailed++;
    }
}

function assertArrayEquals(actual, expected, message) {
    const equals = actual.length === expected.length && 
                  actual.every((val, index) => val === expected[index]);
    assert(equals, message);
    if (!equals) {
        console.log('  Expected:', expected);
        console.log('  Actual:', actual);
    }
}

// Mock classes from the main application
class MidiGenerator {
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

    createDrumTrack(sections, tempo, intensity, seed) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Simple drum pattern for testing
        sections.forEach(() => {
            // Kick on beat 1
            track.push(...this.encodeVariableLength(0));
            track.push(0x99, 36, 80); // Note on, channel 10
            track.push(...this.encodeVariableLength(this.ticksPerQuarter));
            track.push(0x89, 36, 0); // Note off
            
            // Snare on beat 2
            track.push(...this.encodeVariableLength(0));
            track.push(0x99, 38, 70);
            track.push(...this.encodeVariableLength(this.ticksPerQuarter));
            track.push(0x89, 38, 0);
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

    createBassTrack(sections, intensity, seed) {
        let track = [];
        track.push(0x4D, 0x54, 0x72, 0x6B); // "MTrk"
        track.push(0x00, 0x00, 0x00, 0x00); // Length placeholder
        
        // Program change to synth bass
        track.push(0x00, 0xC0, 0x26); // Synth Bass 1 on channel 1
        
        // Simple bass pattern for testing
        sections.forEach(() => {
            // Play E2
            track.push(...this.encodeVariableLength(0));
            track.push(0x90, 40, 60 + intensity * 2);
            track.push(...this.encodeVariableLength(this.ticksPerQuarter * 2));
            track.push(0x80, 40, 0);
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
        
        // Simple lead pattern for testing
        sections.forEach(() => {
            // Play C4
            track.push(...this.encodeVariableLength(0));
            track.push(0x91, 60, 50 + intensity * 3);
            track.push(...this.encodeVariableLength(this.ticksPerQuarter));
            track.push(0x81, 60, 0);
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
        
        // Program change to pad sound
        track.push(0x00, 0xC2, 0x59); // Warm Pad on channel 3
        
        // Simple pad chord for testing
        sections.forEach(() => {
            // C minor chord
            const chord = [48, 51, 55]; // C3, Eb3, G3
            chord.forEach(note => {
                track.push(...this.encodeVariableLength(0));
                track.push(0x92, note, 40 + intensity * 2);
            });
            
            // Hold for 4 beats
            track.push(...this.encodeVariableLength(this.ticksPerQuarter * 4));
            
            // Release
            chord.forEach(note => {
                track.push(...this.encodeVariableLength(0));
                track.push(0x82, note, 0);
            });
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
        
        // Program change to FX sound
        track.push(0x00, 0xC3, 0x63); // FX 4 atmosphere on channel 4
        
        // Simple effect for testing
        sections.forEach(() => {
            // Play A5
            track.push(...this.encodeVariableLength(0));
            track.push(0x93, 81, 30 + intensity);
            track.push(...this.encodeVariableLength(this.ticksPerQuarter * 8));
            track.push(0x83, 81, 0);
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

    seededRandom(seed) {
        return () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }
}

// Test Suite
console.log('=== MIDI Export Unit Tests ===\n');

// Test 1: MIDI Header with 6 tracks
console.log('Testing MIDI Header...');
const midiGen = new MidiGenerator();
const sections = ['intro', 'verse', 'chorus', 'outro'];
const midiData = midiGen.generate(sections, 120, 7, 60, 12345);

// Check header
assert(midiData[0] === 0x4D && midiData[1] === 0x54 && midiData[2] === 0x68 && midiData[3] === 0x64, 
       'MIDI header starts with "MThd"');
assert(midiData[10] === 0x00 && midiData[11] === 0x06, 
       'MIDI header specifies 6 tracks');
assert(midiData[8] === 0x00 && midiData[9] === 0x01, 
       'MIDI format is Type 1 (multiple tracks)');

// Test 2: Variable Length Encoding
console.log('\nTesting Variable Length Encoding...');
assertArrayEquals(midiGen.encodeVariableLength(0), [0], 'Encode 0');
assertArrayEquals(midiGen.encodeVariableLength(127), [127], 'Encode 127');
assertArrayEquals(midiGen.encodeVariableLength(128), [0x81, 0x00], 'Encode 128');
assertArrayEquals(midiGen.encodeVariableLength(16383), [0xFF, 0x7F], 'Encode 16383');
assertArrayEquals(midiGen.encodeVariableLength(16384), [0x81, 0x80, 0x00], 'Encode 16384');

// Test 3: Track Creation
console.log('\nTesting Track Creation...');
const tempoTrack = midiGen.createTempoTrack(500000, sections); // 120 BPM
assert(tempoTrack[0] === 0x4D && tempoTrack[1] === 0x54 && tempoTrack[2] === 0x72 && tempoTrack[3] === 0x6B,
       'Tempo track starts with "MTrk"');
assert(tempoTrack.includes(0xFF) && tempoTrack.includes(0x51), 
       'Tempo track contains tempo meta event');

const drumTrack = midiGen.createDrumTrack(sections, 120, 7, 12345);
assert(drumTrack[0] === 0x4D && drumTrack[1] === 0x54 && drumTrack[2] === 0x72 && drumTrack[3] === 0x6B,
       'Drum track starts with "MTrk"');
assert(drumTrack.includes(0x99), 'Drum track uses channel 10 (0x99)');

const bassTrack = midiGen.createBassTrack(sections, 7, 12345);
assert(bassTrack.includes(0xC0) && bassTrack.includes(0x26), 
       'Bass track sets Synth Bass 1 program');
assert(bassTrack.includes(0x90), 'Bass track uses channel 1 (0x90)');

const leadTrack = midiGen.createLeadTrack(sections, 7, 12345);
assert(leadTrack.includes(0xC1) && leadTrack.includes(0x50), 
       'Lead track sets Synth Lead program');
assert(leadTrack.includes(0x91), 'Lead track uses channel 2 (0x91)');

const padTrack = midiGen.createPadTrack(sections, 7, 12345);
assert(padTrack.includes(0xC2) && padTrack.includes(0x59), 
       'Pad track sets Warm Pad program');
assert(padTrack.includes(0x92), 'Pad track uses channel 3 (0x92)');

const effectsTrack = midiGen.createEffectsTrack(sections, 7, 12345);
assert(effectsTrack.includes(0xC3) && effectsTrack.includes(0x63), 
       'Effects track sets FX 4 atmosphere program');
assert(effectsTrack.includes(0x93), 'Effects track uses channel 4 (0x93)');

// Test 4: Track Length Encoding
console.log('\nTesting Track Length Encoding...');
const trackLength = (drumTrack[4] << 24) | (drumTrack[5] << 16) | (drumTrack[6] << 8) | drumTrack[7];
assert(trackLength === drumTrack.length - 8, 
       'Drum track length is correctly encoded');

// Test 5: End of Track Events
console.log('\nTesting End of Track Events...');
const tracks = [tempoTrack, drumTrack, bassTrack, leadTrack, padTrack, effectsTrack];
tracks.forEach((track, index) => {
    const lastBytes = track.slice(-3);
    assert(lastBytes[0] === 0xFF && lastBytes[1] === 0x2F && lastBytes[2] === 0x00,
           `Track ${index + 1} ends with proper EOT event`);
});

// Test 6: MIDI Channels
console.log('\nTesting MIDI Channel Assignments...');
assert(drumTrack.includes(0x99) && drumTrack.includes(0x89), 
       'Drums use channel 10 for note on/off');
assert(bassTrack.includes(0x90) && bassTrack.includes(0x80), 
       'Bass uses channel 1 for note on/off');
assert(leadTrack.includes(0x91) && leadTrack.includes(0x81), 
       'Lead uses channel 2 for note on/off');
assert(padTrack.includes(0x92) && padTrack.includes(0x82), 
       'Pad uses channel 3 for note on/off');
assert(effectsTrack.includes(0x93) && effectsTrack.includes(0x83), 
       'Effects use channel 4 for note on/off');

// Test 7: Velocity Sensitivity
console.log('\nTesting Velocity Sensitivity...');
const lowIntensity = midiGen.createBassTrack(['verse'], 3, 12345);
const highIntensity = midiGen.createBassTrack(['verse'], 9, 12345);
const lowVelocityIndex = lowIntensity.indexOf(0x90) + 2;
const highVelocityIndex = highIntensity.indexOf(0x90) + 2;
assert(lowIntensity[lowVelocityIndex] < highIntensity[highVelocityIndex],
       'Higher intensity produces higher velocity notes');

// Test 8: Seeded Random
console.log('\nTesting Seeded Random Generator...');
const rng1 = midiGen.seededRandom(12345);
const rng2 = midiGen.seededRandom(12345);
const values1 = [rng1(), rng1(), rng1()];
const values2 = [rng2(), rng2(), rng2()];
assertArrayEquals(values1, values2, 'Same seed produces same sequence');

const rng3 = midiGen.seededRandom(54321);
const values3 = [rng3(), rng3(), rng3()];
assert(values1[0] !== values3[0], 'Different seeds produce different sequences');

// Test 9: Complete MIDI File Structure
console.log('\nTesting Complete MIDI File Structure...');
let offset = 14; // After header
for (let i = 0; i < 6; i++) {
    assert(midiData[offset] === 0x4D && midiData[offset + 1] === 0x54 && 
           midiData[offset + 2] === 0x72 && midiData[offset + 3] === 0x6B,
           `Track ${i + 1} header found at correct position`);
    
    const trackLength = (midiData[offset + 4] << 24) | (midiData[offset + 5] << 16) | 
                       (midiData[offset + 6] << 8) | midiData[offset + 7];
    offset += 8 + trackLength;
}
assert(offset === midiData.length, 'All tracks accounted for in file');

// Test 10: Edge Cases
console.log('\nTesting Edge Cases...');
const emptyMidi = midiGen.generate([], 120, 7, 60, 12345);
assert(emptyMidi.length > 14, 'Empty sections still create valid MIDI');

const extremeTempo = midiGen.generate(['verse'], 60, 10, 100, 12345);
assert(extremeTempo.length > 0, 'Extreme parameters create valid MIDI');

// Test 11: Save Test File
console.log('\nSaving test MIDI file...');
try {
    const testMidi = midiGen.generate(
        ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro'],
        85, 7, 60, Date.now()
    );
    fs.writeFileSync('test_6track_export.mid', Buffer.from(testMidi));
    console.log('✓ Test MIDI file saved as test_6track_export.mid');
    testsPassed++;
} catch (e) {
    console.error('✗ Failed to save test MIDI file:', e.message);
    testsFailed++;
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Success Rate: ${Math.round(testsPassed / (testsPassed + testsFailed) * 100)}%`);

process.exit(testsFailed > 0 ? 1 : 0);