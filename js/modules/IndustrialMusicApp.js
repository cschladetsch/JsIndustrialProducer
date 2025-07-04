import { AudioEngine } from './AudioEngine.js';
import { SongStructure } from './SongStructure.js';
import { Visualizer } from './Visualizer.js';
import { VocalSynthesizer } from './VocalSynthesizer.js';
import { LyricsGenerator } from './LyricsGenerator.js';
import { MidiGenerator } from './MidiGenerator.js';

export class IndustrialMusicApp {
    constructor() {
        this.audioEngine = new AudioEngine();
        this.songStructure = new SongStructure();
        this.visualizer = null;
        this.vocalSynth = null;
        this.lyricsGen = new LyricsGenerator();
        this.midiGen = new MidiGenerator();
        
        this.midiData = null;
        this.currentSeed = Date.now();
        this.isLooping = false;
        this.isPaused = false;
        this.sectionTimeSignatures = [];
        this.totalSongDuration = 0;
        
        // For continuous mode
        this.maxBeats = 0;
        this.scheduleNextBeat = null;
    }

    async initialize() {
        try {
            // Initialize audio engine
            const audioInitialized = await this.audioEngine.initialize();
            if (!audioInitialized) {
                this.showStatus('Error: Web Audio API not supported');
                return false;
            }
            
            // Initialize components
            this.songStructure.initialize();
            this.visualizer = new Visualizer(this.audioEngine);
            this.visualizer.initialize();
            this.vocalSynth = new VocalSynthesizer(this.audioEngine);
            
            // Setup UI event listeners
            this.setupEventListeners();
            
            // Initialize custom dropdown
            this.initializeVocalDropdown();
            
            return true;
        } catch (error) {
            console.error('Error during initialization:', error);
            this.showStatus('Error: ' + error.message);
            return false;
        }
    }

    setupEventListeners() {
        try {
            // Control sliders
            const tempoSlider = document.getElementById('tempo');
            const intensitySlider = document.getElementById('intensity');
            const distortionSlider = document.getElementById('distortion');
            const songLengthSlider = document.getElementById('songLength');
            
            if (tempoSlider) {
                tempoSlider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    this.audioEngine.updateTempo(value);
                    document.getElementById('tempoValue').textContent = value;
                });
            }
            
            if (intensitySlider) {
                intensitySlider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    this.audioEngine.updateIntensity(value);
                    document.getElementById('intensityValue').textContent = value;
                });
            }
            
            if (distortionSlider) {
                distortionSlider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    this.audioEngine.updateDistortion(value);
                    document.getElementById('distortionValue').textContent = value;
                });
            }
            
            if (songLengthSlider) {
                songLengthSlider.addEventListener('input', (e) => {
                    const minutes = Math.round(5 * parseFloat(e.target.value));
                    document.getElementById('songLengthValue').textContent = e.target.value + 'x (~' + minutes + ' min)';
                });
            }
            
            // Buttons
            const generateBtn = document.getElementById('generateBtn');
            const playBtn = document.getElementById('playBtn');
            const loopBtn = document.getElementById('loopBtn');
            const stopBtn = document.getElementById('stopBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            
            if (!generateBtn || !playBtn || !loopBtn || !stopBtn) {
                throw new Error('Required buttons not found in DOM');
            }
            
            generateBtn.addEventListener('click', () => this.generateSong());
            playBtn.addEventListener('click', () => this.play());
            loopBtn.addEventListener('click', () => this.toggleLoop());
            stopBtn.addEventListener('click', () => this.stop());
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => this.downloadMidi());
            }
        
            // Lyrics buttons (these are hidden initially)
            const regenBtn = document.getElementById('regenerateLyricsBtn');
            const copyBtn = document.getElementById('copyLyricsBtn');
            const exportBtn = document.getElementById('exportLyricsBtn');
            
            if (regenBtn) regenBtn.addEventListener('click', () => this.regenerateLyrics());
            if (copyBtn) copyBtn.addEventListener('click', () => this.copyLyrics());
            if (exportBtn) exportBtn.addEventListener('click', () => this.exportLyrics());
            
            // Spacebar pause/resume
            document.addEventListener('keydown', (e) => this.handleKeyPress(e));
            
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            throw error;
        }
    }

    initializeVocalDropdown() {
        const vocalDisplay = document.getElementById('vocalDisplay');
        const vocalOptions = document.getElementById('vocalOptions');
        const vocalInput = document.getElementById('vocals');
        
        // Set default
        vocalInput.value = 'Robotic';
        vocalDisplay.textContent = 'Robotic';
        
        vocalDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            vocalOptions.classList.toggle('select-hide');
        });
        
        vocalOptions.querySelectorAll('div').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.getAttribute('data-value');
                const text = option.textContent;
                vocalInput.value = value;
                vocalDisplay.textContent = text;
                vocalOptions.classList.add('select-hide');
            });
        });
        
        document.addEventListener('click', () => {
            vocalOptions.classList.add('select-hide');
        });
    }

    generateSong() {
        try {
            // Generate more unique seed using multiple entropy sources
            this.currentSeed = Math.floor(
                Date.now() * Math.random() * 1000 + 
                performance.now() * 1000 + 
                Math.random() * 1000000
            );
            
            const sections = this.songStructure.getSections();
            
            if (sections.length === 0) {
                this.showStatus('Please add sections to the song structure!');
                return;
            }
            
            // Generate MIDI data
            this.midiData = this.midiGen.generate(
                sections,
                this.audioEngine.currentTempo,
                this.audioEngine.currentIntensity,
                this.audioEngine.currentDistortion,
                this.currentSeed
            );
            
            // Generate lyrics
            const lyrics = this.lyricsGen.generate(sections, this.currentSeed);
            this.displayLyrics(lyrics);
            
            // Show UI elements
            document.getElementById('downloadBtn').style.display = 'inline-block';
            document.getElementById('lyricsContainer').style.display = 'block';
            
            // Reset playback state
            this.audioEngine.isPlaying = false;
            this.isPaused = false;
            
            this.showStatus(`Song generated successfully! (Seed: ${Math.floor(this.currentSeed)})`);
        } catch (error) {
            console.error('Error generating song:', error);
            this.showStatus('Error generating song: ' + error.message);
        }
    }

    play() {
        if (this.audioEngine.isPlaying) return;
        
        this.isLooping = false;
        this.startPlayback();
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        document.getElementById('loopBtn').classList.toggle('active', this.isLooping);
        
        if (this.isLooping) {
            this.showStatus('Continuous music mode enabled');
            if (!this.audioEngine.isPlaying) {
                this.startPlayback();
            }
        } else {
            this.showStatus(this.audioEngine.isPlaying ? 'Continuous mode disabled - will stop after current song' : 'Ready');
        }
    }

    async startPlayback() {
        const sections = this.songStructure.getSections();
        if (sections.length === 0) {
            this.showStatus('Please add sections to the song structure!');
            return;
        }
        
        // Initialize audio if needed
        if (!this.audioEngine.audioContext) {
            await this.audioEngine.initialize();
        }
        
        // Start visualizer
        document.getElementById('analyzerContainer').style.display = 'block';
        if (!this.visualizer.animationId) {
            this.visualizer.startAnimation();
        }
        
        // Show UI elements
        document.getElementById('progressBar').style.display = 'block';
        document.getElementById('vocalOutputContainer').style.display = 'block';
        document.getElementById('vocalText').textContent = 'Waiting...';
        document.getElementById('vocalText').style.opacity = '0.5';
        
        // Update vocal type display
        const vocalType = document.getElementById('vocals').value;
        document.getElementById('vocalTypeDisplay').textContent = vocalType.charAt(0).toUpperCase() + vocalType.slice(1);
        document.getElementById('vocalBeatDisplay').textContent = '0';
        document.getElementById('nextVocalDisplay').textContent = '-';
        
        // Reset state
        this.audioEngine.isPlaying = true;
        this.audioEngine.currentSection = 0;
        this.audioEngine.currentBeat = 0;
        this.audioEngine.totalBeats = 0;
        this.isPaused = false;
        
        // Calculate song parameters
        this.calculateSongParameters(sections);
        
        // Start playback loop
        this.scheduleNextBeat = () => {
            try {
                if (this.isPaused || !this.audioEngine.isPlaying) return;
                
                if (this.audioEngine.currentSection >= sections.length) {
                    if (this.isLooping) {
                        this.handleLoop(sections);
                        return;
                    } else {
                        console.log(`Song finished: ${this.audioEngine.totalBeats} beats played`);
                        this.stop();
                        return;
                    }
                }
                
                // Play current beat
                const section = sections[this.audioEngine.currentSection];
                if (!section) {
                    console.error('Invalid section at index:', this.audioEngine.currentSection);
                    this.stop();
                    return;
                }
                
                this.playBeat(section, sections);
                
                // Schedule next beat
                const beatDuration = 60 / this.audioEngine.currentTempo;
                const nextBeatTime = beatDuration * 250; // Quarter note in milliseconds
                this.audioEngine.playbackInterval = setTimeout(this.scheduleNextBeat, nextBeatTime);
            } catch (error) {
                console.error('Error in scheduleNextBeat:', error);
                this.showStatus('Playback error - stopping');
                this.stop();
            }
        };
        
        this.scheduleNextBeat();
        this.showStatus(this.isLooping ? 'Continuous music mode...' : 'Playing full song...');
    }

    calculateSongParameters(sections) {
        const songLengthMultiplier = parseFloat(document.getElementById('songLength').value);
        this.maxBeats = 0;
        this.totalSongDuration = 0;
        
        // Generate time signatures
        this.sectionTimeSignatures = sections.map((section, index) => {
            let timeSig = this.songStructure.timeSignatures[section] || { numerator: 4, denominator: 4 };
            if ((section === 'verse' || section === 'bridge') && Math.random() > 0.5) {
                timeSig = this.songStructure.getRandomTimeSignature();
            }
            return timeSig;
        });
        
        // Calculate total beats and duration
        sections.forEach((section, index) => {
            const baseBars = this.songStructure.barsPerSection[section] || 8;
            const bars = Math.round(baseBars * songLengthMultiplier);
            const timeSig = this.sectionTimeSignatures[index];
            const beatsPerBar = timeSig.numerator / (timeSig.denominator / 4);
            const sectionBeats = bars * beatsPerBar;
            this.maxBeats += sectionBeats;
            
            const beatDuration = 60 / this.audioEngine.currentTempo;
            const sectionDuration = sectionBeats * beatDuration * 0.25; // Quarter note duration
            this.totalSongDuration += sectionDuration;
        });
        
        console.log(`Song parameters: ${this.maxBeats} beats, ${this.totalSongDuration} seconds`);
        this.audioEngine.totalSongDuration = this.totalSongDuration;
        this.audioEngine.startTime = this.audioEngine.audioContext.currentTime;
    }

    playBeat(section, sections) {
        // Add timing variations
        const grooveAmount = 0.02;
        const rushDragAmount = 0.015;
        const beatDuration = 60 / this.audioEngine.currentTempo;
        
        let timingOffset = 0;
        if (this.audioEngine.currentBeat % 2 === 1) {
            timingOffset += grooveAmount * beatDuration * 250;
        }
        
        const humanError = (Math.random() - 0.5) * rushDragAmount * beatDuration * 250;
        timingOffset += humanError;
        
        // Play audio
        setTimeout(() => {
            const skipProbability = section === 'breakdown' ? 0.1 : 0.05;
            if (Math.random() > skipProbability) {
                this.audioEngine.playSection(
                    section,
                    this.audioEngine.currentBeat,
                    this.audioEngine.currentIntensity,
                    this.audioEngine.currentDistortion,
                    this.audioEngine.currentSection,
                    this.currentSeed
                );
            }
            
            // Clean up oscillators periodically to prevent memory issues
            if (this.audioEngine.currentBeat % 16 === 0) {
                this.audioEngine.cleanupOscillators();
            }
        }, timingOffset);
        
        // Update state
        this.audioEngine.currentBeat++;
        this.audioEngine.totalBeats++;
        
        // Update UI
        this.updateUI(section, sections);
        
        // Check vocals
        this.checkVocals(section);
        
        // Check section end
        const songLengthMultiplier = parseFloat(document.getElementById('songLength').value);
        const baseBars = this.songStructure.barsPerSection[section] || 8;
        const timeSig = this.sectionTimeSignatures[this.audioEngine.currentSection];
        const beatsPerBar = timeSig.numerator / (timeSig.denominator / 4);
        const sectionBeats = Math.round(baseBars * songLengthMultiplier) * beatsPerBar;
        
        if (this.audioEngine.currentBeat >= sectionBeats) {
            this.audioEngine.currentBeat = 0;
            this.audioEngine.currentSection++;
        }
    }

    updateUI(section, sections) {
        // Calculate actual progress based on sections completed
        let completedBeats = 0;
        let totalBeats = 0;
        
        // Calculate beats for completed sections
        for (let i = 0; i < this.audioEngine.currentSection; i++) {
            const songLengthMultiplier = parseFloat(document.getElementById('songLength').value);
            const baseBars = this.songStructure.barsPerSection[sections[i]] || 8;
            const timeSig = this.sectionTimeSignatures[i];
            const beatsPerBar = timeSig.numerator / (timeSig.denominator / 4);
            completedBeats += Math.round(baseBars * songLengthMultiplier) * beatsPerBar;
        }
        
        // Add current section progress
        completedBeats += this.audioEngine.currentBeat;
        
        // Calculate total beats for all sections
        sections.forEach((sec, idx) => {
            const songLengthMultiplier = parseFloat(document.getElementById('songLength').value);
            const baseBars = this.songStructure.barsPerSection[sec] || 8;
            const timeSig = this.sectionTimeSignatures[idx];
            const beatsPerBar = timeSig.numerator / (timeSig.denominator / 4);
            totalBeats += Math.round(baseBars * songLengthMultiplier) * beatsPerBar;
        });
        
        const progress = totalBeats > 0 ? (completedBeats / totalBeats) * 100 : 0;
        document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
        
        // Update labels
        const elapsed = this.audioEngine.audioContext.currentTime - this.audioEngine.startTime;
        const minutes = Math.floor(elapsed / 60);
        const seconds = Math.floor(elapsed % 60);
        const totalMinutes = Math.floor(this.totalSongDuration / 60);
        const totalSeconds = Math.floor(this.totalSongDuration % 60);
        
        document.getElementById('currentTimeLabel').textContent = 
            `Time: ${minutes}:${seconds.toString().padStart(2, '0')} / ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
        
        if (this.audioEngine.currentSection < sections.length) {
            document.getElementById('currentSectionLabel').textContent = 
                `Section: ${section.toUpperCase()} (${this.audioEngine.currentSection + 1}/${sections.length})`;
            
            // Update vocal output section state
            const sectionStateElement = document.getElementById('sectionState');
            if (sectionStateElement) {
                sectionStateElement.textContent = section.toUpperCase();
            }
            
            // Update vocal beat display
            document.getElementById('vocalBeatDisplay').textContent = this.audioEngine.currentBeat;
            
            // Update section progress
            const songLengthMultiplier = parseFloat(document.getElementById('songLength').value);
            const baseBars = this.songStructure.barsPerSection[section] || 8;
            const timeSig = this.sectionTimeSignatures[this.audioEngine.currentSection] || { numerator: 4, denominator: 4 };
            const beatsPerBar = timeSig.numerator / (timeSig.denominator / 4);
            const sectionBeats = Math.round(baseBars * songLengthMultiplier) * beatsPerBar;
            const sectionProgress = (this.audioEngine.currentBeat / sectionBeats) * 100;
            
            document.getElementById('sectionProgressFill').style.width = sectionProgress + '%';
            document.getElementById('sectionProgressLabel').textContent = `Progress: ${Math.round(sectionProgress)}%`;
            
            // Highlight current section
            this.highlightCurrentSection(this.audioEngine.currentSection);
        }
        
        // Update current lyric
        this.lyricsGen.updateCurrentLyric(this.audioEngine.currentSection, this.audioEngine.currentBeat);
    }

    checkVocals(section) {
        const vocalType = document.getElementById('vocals').value;
        
        // Calculate next vocal beat
        let nextVocalBeat = '-';
        if (vocalType !== 'off') {
            if (section === 'chorus') {
                nextVocalBeat = Math.ceil(this.audioEngine.currentBeat / 8) * 8;
            } else if (section === 'verse') {
                nextVocalBeat = Math.ceil(this.audioEngine.currentBeat / 16) * 16;
            } else if (section === 'bridge') {
                nextVocalBeat = Math.ceil(this.audioEngine.currentBeat / 12) * 12;
            } else if (section === 'breakdown') {
                nextVocalBeat = Math.ceil(this.audioEngine.currentBeat / 4) * 4;
            }
            
            if (nextVocalBeat <= this.audioEngine.currentBeat) {
                nextVocalBeat = '-';
            }
        }
        document.getElementById('nextVocalDisplay').textContent = nextVocalBeat;
        
        if (vocalType !== 'off' && this.vocalSynth.shouldVocalize(section, this.audioEngine.currentBeat)) {
            const lyricText = this.lyricsGen.getCurrentLyricText(this.audioEngine.currentSection, this.audioEngine.currentBeat);
            if (lyricText) {
                const words = lyricText.split(' ');
                const phrase = words.slice(0, Math.min(3, words.length)).join(' ');
                this.vocalSynth.synthesize(phrase, vocalType);
            }
        }
    }

    highlightCurrentSection(sectionIndex) {
        const allSections = document.querySelectorAll('#structureEditor .section-block');
        allSections.forEach(section => section.classList.remove('playing'));
        
        if (sectionIndex >= 0 && sectionIndex < allSections.length) {
            allSections[sectionIndex].classList.add('playing');
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
        }
    }

    handleLoop(sections) {
        console.log('Looping to new variation...');
        
        // Clean up
        this.audioEngine.cleanupOscillators();
        
        // Add delay before starting new loop
        setTimeout(() => {
            // Reset state
            this.audioEngine.currentSection = 0;
            this.audioEngine.currentBeat = 0;
            this.audioEngine.totalBeats = 0;
            
            // Generate truly random seed using multiple sources
            this.currentSeed = Math.floor(Date.now() * Math.random() * 1000 + performance.now() * 1000);
            console.log('New seed:', this.currentSeed);
            
            document.getElementById('progressFill').style.width = '0%';
            
            // More aggressive structure changes
            if (Math.random() < 0.5) {
                const structures = ['standard', 'simple', 'extended', 'industrial'];
                const randomStructure = structures[Math.floor(Math.random() * structures.length)];
                this.songStructure.loadPreset(randomStructure);
                sections = this.songStructure.getSections();
                
                // Sometimes shuffle sections for more variety
                if (Math.random() < 0.3) {
                    const shuffled = [...sections];
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    // Keep intro/outro at beginning/end
                    const intro = shuffled.find(s => s === 'intro');
                    const outro = shuffled.find(s => s === 'outro');
                    sections = shuffled.filter(s => s !== 'intro' && s !== 'outro');
                    if (intro) sections.unshift(intro);
                    if (outro) sections.push(outro);
                }
            }
            
            // Occasionally adjust parameters for variety
            if (Math.random() < 0.4) {
                // Slight tempo variation
                const tempoVariation = Math.floor((Math.random() - 0.5) * 20);
                const newTempo = Math.max(26, Math.min(140, this.audioEngine.currentTempo + tempoVariation));
                this.audioEngine.updateTempo(newTempo);
                document.getElementById('tempo').value = newTempo;
                document.getElementById('tempoValue').textContent = newTempo;
                
                // Intensity variation
                const intensityVariation = Math.floor((Math.random() - 0.5) * 4);
                const newIntensity = Math.max(1, Math.min(10, this.audioEngine.currentIntensity + intensityVariation));
                this.audioEngine.updateIntensity(newIntensity);
                document.getElementById('intensity').value = newIntensity;
                document.getElementById('intensityValue').textContent = newIntensity;
            }
            
            // Recalculate parameters
            this.calculateSongParameters(sections);
            
            // Regenerate lyrics
            const lyrics = this.lyricsGen.generate(sections, this.currentSeed);
            this.displayLyrics(lyrics);
            
            this.showStatus('Continuous music mode... (New variation)');
            
            // Continue playback
            if (this.isLooping && this.audioEngine.isPlaying) {
                this.scheduleNextBeat();
            }
        }, 500);
    }

    stop() {
        this.audioEngine.stop();
        
        if (this.audioEngine.playbackInterval) {
            clearTimeout(this.audioEngine.playbackInterval);
            this.audioEngine.playbackInterval = null;
        }
        
        // Reset UI
        document.getElementById('status').textContent = 'Playback stopped';
        document.getElementById('status').classList.remove('playing');
        document.getElementById('status').classList.remove('paused');
        document.getElementById('progressBar').style.display = 'none';
        document.getElementById('progressFill').style.width = '0%';
        
        // Clear visualizer
        if (this.visualizer.animationId) {
            this.visualizer.stopAnimation();
            this.visualizer.clear();
        }
        
        // Reset section highlights
        const allSections = document.querySelectorAll('#structureEditor .section-block');
        allSections.forEach(section => section.classList.remove('playing'));
        
        // Reset labels
        document.getElementById('currentSectionLabel').textContent = 'Section: -';
        document.getElementById('currentTimeLabel').textContent = 'Time: 0:00 / 0:00';
        document.getElementById('sectionProgressFill').style.width = '0%';
        document.getElementById('sectionProgressLabel').textContent = 'Progress: 0%';
        
        // Hide vocal output
        document.getElementById('vocalOutputContainer').style.display = 'none';
        
        // Clear current lyrics
        this.lyricsGen.clearCurrentLyric();
    }

    handleKeyPress(e) {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            
            if (!this.audioEngine.isPlaying) {
                if (this.midiData || this.isLooping) {
                    this.startPlayback();
                }
            } else {
                this.togglePause();
            }
        }
    }

    togglePause() {
        if (!this.isPaused) {
            // Pause
            this.isPaused = true;
            
            if (this.audioEngine.playbackInterval) {
                clearTimeout(this.audioEngine.playbackInterval);
                this.audioEngine.playbackInterval = null;
            }
            
            this.showStatus('Paused');
            document.getElementById('status').classList.add('paused');
            
            // Stop all sounds
            this.audioEngine.activeOscillators.forEach(item => {
                try {
                    item.osc.stop(this.audioEngine.audioContext.currentTime);
                } catch (e) {}
            });
            this.audioEngine.activeOscillators = [];
        } else {
            // Resume
            this.isPaused = false;
            this.showStatus(this.isLooping ? 'Continuous music mode...' : 'Playing full song...');
            document.getElementById('status').classList.remove('paused');
            
            if (this.scheduleNextBeat) {
                this.scheduleNextBeat();
            }
        }
    }

    downloadMidi() {
        if (!this.midiData) return;
        
        const blob = new Blob([this.midiData], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'industrial_song.mid';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showStatus('MIDI file downloaded!');
    }

    regenerateLyrics() {
        this.currentSeed = Date.now() + Math.random() * 10000;
        const sections = this.songStructure.getSections();
        const lyrics = this.lyricsGen.generate(sections, this.currentSeed);
        this.displayLyrics(lyrics);
    }

    copyLyrics() {
        const text = this.lyricsGen.getPlainText();
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copyLyricsBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }

    exportLyrics() {
        const text = this.lyricsGen.getExportText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'industrial_song_lyrics.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

    displayLyrics(lyrics) {
        this.lyricsGen.display(lyrics);
    }

    showStatus(message) {
        document.getElementById('status').textContent = message;
    }
}