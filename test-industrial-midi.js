// ============================================================================
// Unit Tests for Industrial MIDI Creator
// ============================================================================

const industrialMidi = require('./industrial-midi.js');

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Test helper functions
function assert(condition, testName) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`✓ ${testName}`);
    } else {
        failedTests++;
        console.error(`✗ ${testName}`);
    }
}

function assertArrayEquals(actual, expected, testName) {
    const equal = actual.length === expected.length && 
                  actual.every((val, index) => val === expected[index]);
    assert(equal, testName);
}

function assertInRange(value, min, max, testName) {
    assert(value >= min && value <= max, testName);
}

// ============================================================================
// TEST SUITE 1: Utility Functions
// ============================================================================

console.log('\n=== Testing Utility Functions ===');

// Test seededRandom
const seed1 = industrialMidi.seededRandom(12345);
const seed2 = industrialMidi.seededRandom(12345);
assert(seed1 === seed2, 'seededRandom produces consistent results');
assert(seed1 >= 0 && seed1 < 1, 'seededRandom returns value in range [0, 1)');

// Test randomChoice
const testArray = ['a', 'b', 'c', 'd'];
const choice1 = industrialMidi.randomChoice(testArray, 100);
const choice2 = industrialMidi.randomChoice(testArray, 100);
assert(choice1 === choice2, 'randomChoice is deterministic with same seed');
assert(testArray.includes(choice1), 'randomChoice returns element from array');

// Test encodeVariableLength
assertArrayEquals(
    industrialMidi.encodeVariableLength(0),
    [0],
    'encodeVariableLength handles 0'
);
assertArrayEquals(
    industrialMidi.encodeVariableLength(127),
    [127],
    'encodeVariableLength handles single byte values'
);
assertArrayEquals(
    industrialMidi.encodeVariableLength(128),
    [0x81, 0x00],
    'encodeVariableLength handles two byte values'
);

// Test noteToFreq
assert(
    Math.abs(industrialMidi.noteToFreq(69) - 440) < 0.01,
    'noteToFreq converts A4 (MIDI 69) to 440 Hz'
);
assert(
    Math.abs(industrialMidi.noteToFreq(60) - 261.63) < 0.01,
    'noteToFreq converts C4 (MIDI 60) to ~261.63 Hz'
);

// ============================================================================
// TEST SUITE 2: Pattern Generation
// ============================================================================

console.log('\n=== Testing Pattern Generation ===');

// Test varyPitch
const basePitch = 60;
const variedPitch = industrialMidi.varyPitch(basePitch, 2, 12345);
assertInRange(variedPitch, 21, 108, 'varyPitch keeps result in MIDI range');

// Test with previous pitch (stepwise motion)
const variedPitch2 = industrialMidi.varyPitch(60, 2, 12345, 59);
assertInRange(Math.abs(variedPitch2 - 60), 0, 12, 'varyPitch respects interval constraints');

// Test generatePatternVariation
const testPattern = [
    { pitch: 60, velocity: 80, duration: 1 },
    { pitch: 62, velocity: 75, duration: 0.5 },
    { pitch: 64, velocity: 85, duration: 0.5 }
];
const variedPattern = industrialMidi.generatePatternVariation(testPattern, 12345);
assert(variedPattern.length === testPattern.length, 'generatePatternVariation maintains pattern length');
variedPattern.forEach((note, i) => {
    assertInRange(note.velocity, 40, 127, `Note ${i} velocity in valid range`);
    assert(note.duration > 0, `Note ${i} has positive duration`);
    if (note.pitch > 0) {
        assertInRange(note.pitch, 21, 108, `Note ${i} pitch in MIDI range`);
    }
});

// Test getBassPattern
const sections = ['intro', 'verse', 'chorus', 'bridge', 'outro', 'instrumental', 'breakdown'];
sections.forEach(section => {
    const pattern = industrialMidi.getBassPattern(section, 7, 12345);
    assert(Array.isArray(pattern), `getBassPattern returns array for ${section}`);
    assert(pattern.length > 0, `getBassPattern returns non-empty pattern for ${section}`);
    pattern.forEach((note, i) => {
        assert(note.hasOwnProperty('pitch'), `${section} note ${i} has pitch`);
        assert(note.hasOwnProperty('velocity'), `${section} note ${i} has velocity`);
        assert(note.hasOwnProperty('duration'), `${section} note ${i} has duration`);
    });
});

// Test getLeadPattern
sections.forEach(section => {
    const pattern = industrialMidi.getLeadPattern(section, 7, 12345);
    assert(Array.isArray(pattern), `getLeadPattern returns array for ${section}`);
    assert(pattern.length > 0, `getLeadPattern returns non-empty pattern for ${section}`);
});

// ============================================================================
// TEST SUITE 3: MIDI Generation
// ============================================================================

console.log('\n=== Testing MIDI Generation ===');

// Test createHeaderChunk
const header = industrialMidi.createHeaderChunk(3, 480);
assert(header.length === 14, 'MIDI header has correct length');
assertArrayEquals(header.slice(0, 4), [0x4D, 0x54, 0x68, 0x64], 'MIDI header starts with "MThd"');
assertArrayEquals(header.slice(8, 10), [0x00, 0x01], 'MIDI header specifies format 1');

// Test createTempoTrack
const tempoTrack = industrialMidi.createTempoTrack(['verse'], 480, 120, industrialMidi.encodeVariableLength);
assert(tempoTrack[0] === 0x4D && tempoTrack[1] === 0x54, 'Tempo track starts with "MT"');
assert(tempoTrack.includes(0xFF) && tempoTrack.includes(0x51), 'Tempo track contains tempo meta event');

// Test complete MIDI generation
const testSections = ['intro', 'verse', 'chorus', 'outro'];
const midiData = industrialMidi.generateMIDI(testSections, 90, 7, 1.0, 12345);
assert(midiData instanceof Uint8Array, 'generateMIDI returns Uint8Array');
assert(midiData.length > 100, 'generateMIDI produces substantial data');
assertArrayEquals(
    Array.from(midiData.slice(0, 4)),
    [0x4D, 0x54, 0x68, 0x64],
    'Generated MIDI starts with proper header'
);

// ============================================================================
// TEST SUITE 4: Lyrics Generation
// ============================================================================

console.log('\n=== Testing Lyrics Generation ===');

// Test generateLyricLine
const lyricLine = industrialMidi.generateLyricLine(['existential', 'emotional'], 12345);
assert(typeof lyricLine === 'string', 'generateLyricLine returns string');
assert(lyricLine.length > 0, 'generateLyricLine returns non-empty string');

// Test that lyrics contain words from specified categories
const existentialWords = industrialMidi.LYRICS_VOCABULARY.existential;
const emotionalWords = industrialMidi.LYRICS_VOCABULARY.emotional;
const allWords = [...existentialWords, ...emotionalWords];
const hasValidWord = allWords.some(word => lyricLine.toLowerCase().includes(word));
assert(hasValidWord, 'generateLyricLine uses words from specified categories');

// Test generateLyrics
const lyrics = industrialMidi.generateLyrics(testSections, 12345);
assert(typeof lyrics === 'object', 'generateLyrics returns object');

// Check that appropriate sections have lyrics
let verseCount = 0;
let chorusCount = 0;
Object.keys(lyrics).forEach(key => {
    if (key.startsWith('verse_')) {
        verseCount++;
        assert(Array.isArray(lyrics[key]), `${key} lyrics is array`);
        assert(lyrics[key].length === 4, `${key} has 4 lines`);
    }
    if (key.startsWith('chorus_')) {
        chorusCount++;
        assert(Array.isArray(lyrics[key]), `${key} lyrics is array`);
        assert(lyrics[key].length === 4, `${key} has 4 lines`);
    }
});
assert(verseCount > 0, 'Lyrics generated for verse sections');
assert(chorusCount > 0, 'Lyrics generated for chorus sections');

// ============================================================================
// TEST SUITE 5: Edge Cases and Boundaries
// ============================================================================

console.log('\n=== Testing Edge Cases ===');

// Test extreme intensity values
const lowIntensityPattern = industrialMidi.getBassPattern('verse', 1, 12345);
const highIntensityPattern = industrialMidi.getBassPattern('verse', 10, 12345);
lowIntensityPattern.forEach((note, i) => {
    assertInRange(note.velocity, 40, 127, `Low intensity note ${i} velocity valid`);
});
highIntensityPattern.forEach((note, i) => {
    assertInRange(note.velocity, 40, 127, `High intensity note ${i} velocity valid`);
});

// Test with empty sections array
const emptyMidi = industrialMidi.generateMIDI([], 120, 7, 1.0, 12345);
assert(emptyMidi instanceof Uint8Array, 'generateMIDI handles empty sections');

// Test with very long section array
const longSections = Array(50).fill('verse');
const longMidi = industrialMidi.generateMIDI(longSections, 120, 7, 1.0, 12345);
assert(longMidi instanceof Uint8Array, 'generateMIDI handles many sections');

// Test variable length encoding edge cases
assertArrayEquals(
    industrialMidi.encodeVariableLength(0x3FFF),
    [0xFF, 0x7F],
    'encodeVariableLength handles maximum 2-byte value'
);
assertArrayEquals(
    industrialMidi.encodeVariableLength(0x1FFFFF),
    [0xFF, 0xFF, 0x7F],
    'encodeVariableLength handles maximum 3-byte value'
);

// ============================================================================
// TEST RESULTS SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(50));
console.log('TEST RESULTS SUMMARY');
console.log('='.repeat(50));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✓`);
console.log(`Failed: ${failedTests} ✗`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log('='.repeat(50));

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);