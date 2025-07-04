export class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.analyser = null;
        this.activeOscillators = [];
        this.isPlaying = false;
        this.isPaused = false;
        this.currentTempo = 70;
        this.currentIntensity = 7;
        this.currentDistortion = 60;
        this.currentSection = 0;
        this.currentBeat = 0;
        this.totalBeats = 0;
        this.startTime = 0;
        this.totalSongDuration = 0;
        this.playbackInterval = null;
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initializeAnalyzer();
            return true;
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            return false;
        }
    }

    initializeAnalyzer() {
        if (!this.audioContext) return;
        
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;
        
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 1.0;
        
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }

    updateTempo(value) {
        this.currentTempo = value;
    }

    updateIntensity(value) {
        this.currentIntensity = value;
        if (this.masterGain) {
            const targetGain = 0.3 + (this.currentIntensity - 5) * 0.05;
            this.masterGain.gain.exponentialRampToValueAtTime(
                Math.max(0.01, targetGain), 
                this.audioContext.currentTime + 0.1
            );
        }
    }

    updateDistortion(value) {
        this.currentDistortion = value;
    }

    playSection(section, beat, intensity, distortion, sectionIndex, seed) {
        if (!this.audioContext || !this.masterGain) return;
        
        // Limit concurrent oscillators to prevent audio issues
        if (this.activeOscillators.length > 50) {
            this.cleanupOscillators();
            if (this.activeOscillators.length > 80) {
                console.warn('Too many oscillators, skipping beat');
                return;
            }
        }
        
        const now = this.audioContext.currentTime;
        const beatDuration = 60 / this.currentTempo;
        const rng = this.seededRandom(seed + sectionIndex + beat);
        
        // Tool-inspired complex drum patterns
        const drumPatterns = this.getDrumPattern(section, beat, intensity, rng);
        
        // Play drums with variations
        if (section !== 'intro' || beat > 16) {
            if (drumPatterns.kick) {
                this.playKick(now, intensity * drumPatterns.kickVelocity);
                // Double kick sometimes
                if (rng() < 0.05 && intensity > 7) {
                    this.playKick(now + beatDuration * 0.125, intensity * 0.7);
                }
            }
            if (drumPatterns.snare) {
                this.playSnare(now, intensity * drumPatterns.snareVelocity);
                // Ghost notes
                if (rng() < 0.1) {
                    this.playSnare(now - beatDuration * 0.0625, intensity * 0.3);
                }
            }
            if (drumPatterns.hihat) {
                this.playHihat(now, intensity * drumPatterns.hihatVelocity);
            }
        }
        
        // Play bass with evolving patterns
        const bassPattern = this.getBassPattern(section, intensity, seed + sectionIndex + Math.floor(beat / 16));
        const currentBassNote = bassPattern[beat % bassPattern.length];
        if (currentBassNote.pitch > 0) {
            this.playBass(now, currentBassNote.pitch, currentBassNote.velocity / 127, 
                currentBassNote.duration * beatDuration, distortion);
        }
        
        // Play lead with more complex triggering
        const leadTrigger = this.shouldPlayLead(section, beat, rng);
        if (leadTrigger) {
            const leadPattern = this.getLeadPattern(section, intensity, seed + sectionIndex + Math.floor(beat / 8));
            const leadIndex = beat % leadPattern.length;
            const leadNote = leadPattern[leadIndex];
            if (leadNote && leadNote.pitch > 0) {
                this.playLead(now, leadNote.pitch, leadNote.velocity / 127, 
                    leadNote.duration * beatDuration, distortion);
            }
        }
        
        // Enhanced atmospheric effects
        if ((section === 'breakdown' && beat % 16 === 0) || 
            (section === 'intro' && beat % 32 === 0) ||
            (rng() < 0.02)) {
            this.playAtmosphere(now, intensity, seed + beat);
        }
        
        // Occasional glitch effects (NIN-inspired)
        if (rng() < 0.03 && intensity > 6) {
            this.playGlitch(now, intensity, rng);
        }
    }
    
    getDrumPattern(section, beat, intensity, rng) {
        // Base patterns with variations
        let kick = false, snare = false, hihat = false;
        let kickVelocity = 1, snareVelocity = 1, hihatVelocity = 0.7;
        
        // Different patterns for different sections
        if (section === 'verse') {
            // Standard rock beat with variations
            kick = beat % 4 === 0 || (beat % 8 === 6 && rng() < 0.3);
            snare = beat % 8 === 4;
            hihat = beat % 2 === 1 && intensity > 4;
        } else if (section === 'chorus') {
            // More intense pattern
            kick = beat % 4 === 0 || beat % 4 === 2 || (beat % 8 === 3 && rng() < 0.4);
            snare = beat % 4 === 2 || (beat % 8 === 7 && rng() < 0.3);
            hihat = beat % 1 === 0 && intensity > 3;
        } else if (section === 'breakdown') {
            // Sparse, unpredictable
            kick = (beat % 7 === 0 || beat % 11 === 0) && rng() < 0.8;
            snare = beat % 13 === 4 && rng() < 0.6;
            hihat = rng() < 0.2;
        } else if (section === 'bridge') {
            // Tool-style odd time feel
            kick = beat % 5 === 0 || beat % 7 === 3;
            snare = beat % 7 === 4 || beat % 5 === 3;
            hihat = beat % 3 === 1;
        } else {
            // Default pattern
            kick = beat % 4 === 0;
            snare = beat % 8 === 4;
            hihat = beat % 2 === 1 && intensity > 5;
        }
        
        // Velocity variations
        kickVelocity = 0.7 + rng() * 0.3;
        snareVelocity = 0.6 + rng() * 0.4;
        hihatVelocity = 0.4 + rng() * 0.3;
        
        return { kick, snare, hihat, kickVelocity, snareVelocity, hihatVelocity };
    }
    
    shouldPlayLead(section, beat, rng) {
        if (section === 'chorus') {
            return beat % 4 === 0 || (beat % 8 === 3 && rng() < 0.5);
        } else if (section === 'verse') {
            return beat % 16 === 0 || (beat % 16 === 8 && rng() < 0.3);
        } else if (section === 'bridge') {
            return beat % 3 === 0 || beat % 5 === 0;
        } else if (section === 'breakdown') {
            return rng() < 0.15;
        }
        return false;
    }
    
    playGlitch(time, intensity, rng) {
        // NIN-style digital glitch
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'square';
        osc.frequency.value = 40 + rng() * 2000;
        osc.frequency.exponentialRampToValueAtTime(20, time + 0.05);
        
        filter.type = 'bandpass';
        filter.frequency.value = 1000 + rng() * 3000;
        filter.Q.value = 10 + rng() * 20;
        
        const volume = 0.1 + (intensity / 20);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(time);
        osc.stop(time + 0.05);
        
        this.activeOscillators.push({ osc, stopTime: time + 0.05 });
    }

    playKick(time, intensity) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
        
        const volume = 0.5 + (intensity / 20);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(time);
        osc.stop(time + 0.2);
        
        this.activeOscillators.push({ osc, stopTime: time + 0.2 });
    }

    playSnare(time, intensity) {
        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, 4410, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < 4410; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        noise.buffer = buffer;
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 3000;
        
        const noiseGain = this.audioContext.createGain();
        const volume = 0.2 + (intensity / 30);
        noiseGain.gain.setValueAtTime(volume, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        
        noise.start(time);
    }

    playHihat(time, intensity) {
        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, 2205, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < 2205; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        
        const gain = this.audioContext.createGain();
        const volume = 0.1 + (intensity / 50);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        noise.start(time);
    }

    playBass(time, pitch, velocity, duration, distortion) {
        const frequency = 440 * Math.pow(2, (pitch - 69) / 12);
        
        // Create multiple oscillators for richer sound
        const osc = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        const filterEnv = this.audioContext.createGain();
        
        // Vary oscillator types for different textures
        const waveforms = ['sawtooth', 'square', 'triangle'];
        osc.type = distortion > 50 ? waveforms[Math.floor(Math.random() * waveforms.length)] : 'sine';
        osc2.type = 'sine'; // Sub oscillator
        
        osc.frequency.setValueAtTime(frequency, time);
        osc2.frequency.setValueAtTime(frequency * 0.5, time); // Sub bass
        
        // Add slight detuning for thickness
        const detune = (Math.random() - 0.5) * 10;
        osc.detune.setValueAtTime(detune, time);
        
        // Dynamic filter with envelope
        filter.type = 'lowpass';
        const baseFreq = 200 + distortion * 20;
        filter.frequency.setValueAtTime(baseFreq * 4, time);
        filter.frequency.exponentialRampToValueAtTime(baseFreq, time + 0.1);
        filter.Q.setValueAtTime(5 + distortion / 10, time);
        
        // Filter modulation
        if (Math.random() < 0.3) {
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            lfo.frequency.value = 2 + Math.random() * 4;
            lfoGain.gain.value = baseFreq * 0.3;
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            lfo.start(time);
            lfo.stop(time + duration);
            this.activeOscillators.push({ osc: lfo, stopTime: time + duration });
        }
        
        const volume = velocity * 0.3;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(volume, time + 0.01);
        gain.gain.setValueAtTime(volume, time + duration - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        // Sub oscillator mix
        const subGain = this.audioContext.createGain();
        subGain.gain.value = 0.4;
        
        if (distortion > 70) {
            const waveshaper = this.audioContext.createWaveShaper();
            waveshaper.curve = this.makeDistortionCurve(distortion);
            waveshaper.oversample = '4x';
            
            osc.connect(waveshaper);
            osc2.connect(subGain);
            subGain.connect(waveshaper);
            waveshaper.connect(filter);
        } else {
            osc.connect(filter);
            osc2.connect(subGain);
            subGain.connect(filter);
        }
        
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(time);
        osc2.start(time);
        osc.stop(time + duration);
        osc2.stop(time + duration);
        
        this.activeOscillators.push({ osc, stopTime: time + duration });
        this.activeOscillators.push({ osc: osc2, stopTime: time + duration });
    }

    playLead(time, pitch, velocity, duration, distortion) {
        const frequency = 440 * Math.pow(2, (pitch - 69) / 12);
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        const delay = this.audioContext.createDelay();
        const feedback = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(frequency, time);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(frequency * 2, time);
        filter.Q.setValueAtTime(2, time);
        
        delay.delayTime.value = 0.2;
        feedback.gain.value = 0.3;
        
        const volume = velocity * 0.2;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(volume, time + 0.05);
        gain.gain.setValueAtTime(volume, time + duration - 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        gain.connect(this.masterGain);
        delay.connect(this.masterGain);
        
        osc.start(time);
        osc.stop(time + duration);
        
        this.activeOscillators.push({ osc, stopTime: time + duration });
    }

    playAtmosphere(time, intensity, seed) {
        const duration = 4;
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        const baseFreq = 80 + (seed % 40);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, time);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(baseFreq * 1.01, time);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + duration);
        
        const volume = 0.1 + (intensity / 100);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(volume, time + 1);
        gain.gain.setValueAtTime(volume, time + duration - 1);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + duration);
        osc2.stop(time + duration);
        
        this.activeOscillators.push({ osc: osc1, stopTime: time + duration });
        this.activeOscillators.push({ osc: osc2, stopTime: time + duration });
    }

    makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }

    getBassPattern(section, intensity, seed = 0) {
        // Tool/NIN-inspired bass patterns with more variation
        const rng = this.seededRandom(seed);
        const basePatterns = {
            intro: [
                { pitch: 36, velocity: 60, duration: 1 },
                { pitch: 36, velocity: 50, duration: 0.5 },
                { pitch: 41, velocity: 55, duration: 0.5 }
            ],
            verse: [
                { pitch: 36, velocity: 70, duration: 0.5 },
                { pitch: 36, velocity: 60, duration: 0.5 },
                { pitch: 41, velocity: 65, duration: 0.5 }
            ],
            chorus: [
                { pitch: 36, velocity: 80, duration: 0.25 },
                { pitch: 36, velocity: 75, duration: 0.25 },
                { pitch: 48, velocity: 80, duration: 0.5 }
            ],
            bridge: [
                { pitch: 41, velocity: 70, duration: 0.75 },
                { pitch: 43, velocity: 65, duration: 0.25 },
                { pitch: 46, velocity: 70, duration: 0.5 }
            ],
            breakdown: [
                { pitch: 29, velocity: 90, duration: 2 },
                { pitch: 0, velocity: 0, duration: 0.5 },
                { pitch: 29, velocity: 85, duration: 0.5 }
            ]
        };
        
        let pattern = basePatterns[section] || basePatterns.verse;
        
        // Add variations inspired by Tool's polyrhythms and NIN's glitch aesthetics
        return pattern.map(note => {
            const variation = {
                pitch: note.pitch,
                velocity: note.velocity,
                duration: note.duration
            };
            
            // Pitch variations - occasional octave jumps or dissonant intervals
            if (rng() < 0.15) {
                const pitchShifts = [-12, -7, -5, 0, 5, 7, 12];
                variation.pitch += pitchShifts[Math.floor(rng() * pitchShifts.length)];
            }
            
            // Velocity dynamics - sudden drops or spikes
            variation.velocity = Math.floor(
                note.velocity + (rng() - 0.5) * 30 + 
                (intensity - 5) * 5
            );
            variation.velocity = Math.max(20, Math.min(127, variation.velocity));
            
            // Duration glitches - occasional stutters or holds
            if (rng() < 0.1) {
                variation.duration = rng() < 0.5 ? 0.125 : 1.5;
            }
            
            // Ghost notes
            if (rng() < 0.05) {
                variation.velocity = Math.floor(variation.velocity * 0.3);
            }
            
            return variation;
        });
    }
    
    seededRandom(seed) {
        return () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    getLeadPattern(section, intensity, seed = 0) {
        const rng = this.seededRandom(seed + 1000);
        
        // Generate more complex, evolving patterns
        const scaleNotes = [60, 62, 63, 65, 67, 68, 70, 72]; // C minor scale
        const pattern = [];
        
        // Different pattern lengths based on section
        const patternLengths = {
            intro: 1,
            verse: 3 + Math.floor(rng() * 2),
            chorus: 4 + Math.floor(rng() * 3),
            bridge: 5 + Math.floor(rng() * 3),
            breakdown: 2,
            outro: 1
        };
        
        const length = patternLengths[section] || 3;
        
        for (let i = 0; i < length; i++) {
            // Choose notes from scale with occasional chromatic additions
            let pitch = scaleNotes[Math.floor(rng() * scaleNotes.length)];
            
            // Add chromatic passing tones occasionally
            if (rng() < 0.2) {
                pitch += Math.floor(rng() * 3) - 1;
            }
            
            // Octave variations
            if (rng() < 0.3) {
                pitch += rng() < 0.5 ? 12 : -12;
            }
            
            // Dynamic velocity based on section and randomness
            let velocity = 50 + intensity * 5;
            if (section === 'chorus' || section === 'bridge') {
                velocity += 20;
            }
            velocity += Math.floor((rng() - 0.5) * 40);
            velocity = Math.max(30, Math.min(127, velocity));
            
            // Varied durations for more interesting rhythms
            const durations = [0.25, 0.5, 0.75, 1, 1.5, 2];
            const duration = durations[Math.floor(rng() * durations.length)];
            
            // Occasional rests (silence)
            if (rng() < 0.1) {
                pattern.push({ pitch: 0, velocity: 0, duration: duration });
            } else {
                pattern.push({ pitch, velocity, duration });
            }
        }
        
        return pattern;
    }

    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentSection = 0;
        this.currentBeat = 0;
        this.totalBeats = 0;
        
        this.cleanupOscillators();
        
        if (this.playbackInterval) {
            clearTimeout(this.playbackInterval);
            this.playbackInterval = null;
        }
    }

    cleanupOscillators() {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const toRemove = [];
        
        this.activeOscillators = this.activeOscillators.filter((item, index) => {
            // Remove oscillators that should have stopped
            if (item.stopTime <= now + 0.1) {
                try {
                    // Ensure it's stopped and disconnected
                    if (item.osc.stop) item.osc.stop(now);
                    if (item.osc.disconnect) item.osc.disconnect();
                } catch (e) {
                    // Already stopped
                }
                return false;
            }
            return true;
        });
        
        // Log cleanup for debugging
        if (this.activeOscillators.length > 100) {
            console.warn(`High oscillator count: ${this.activeOscillators.length}`);
        }
    }
}