export class VocalSynthesizer {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.currentVocalType = 'off';
        
        // Phoneme mappings
        this.vowels = {
            'a': [700, 1220, 2600],
            'e': [400, 2300, 3000],
            'i': [300, 2700, 3300],
            'o': [500, 1000, 2500],
            'u': [350, 700, 2400],
        };
        
        this.consonants = {
            's': [4000, 5000, 6000],
            'f': [1200, 2400, 3600],
            'r': [300, 1000, 1500],
            'l': [350, 1600, 2400],
            'n': [250, 1700, 2400],
            'm': [200, 1200, 2000],
            't': [2000, 3000, 4000],
            'd': [200, 1700, 2600],
            'k': [350, 1800, 2700],
            'g': [200, 1300, 2300],
            'p': [200, 800, 1800],
            'b': [200, 900, 2300],
            'h': [500, 1500, 2500],
        };
    }

    synthesize(text, vocalType) {
        if (!this.audioEngine.audioContext || !this.audioEngine.masterGain) return;
        
        // Update vocal text display
        const vocalText = document.getElementById('vocalText');
        vocalText.textContent = text;
        vocalText.style.opacity = '1';
        
        // Re-trigger animation
        vocalText.style.animation = 'none';
        setTimeout(() => {
            vocalText.style.animation = 'vocalPulse 2s ease-in-out';
        }, 10);
        
        // Clear waiting text after animation
        setTimeout(() => {
            if (vocalText.textContent === text) {
                vocalText.textContent = 'Waiting...';
                vocalText.style.opacity = '0.5';
            }
        }, 2500);
        
        // Create phonemes
        const phonemes = text.toLowerCase().split('').map(char => {
            if (this.vowels[char]) return { freqs: this.vowels[char], duration: 0.15, gain: 0.3 };
            if (this.consonants[char]) return { freqs: this.consonants[char], duration: 0.05, gain: 0.2 };
            if (char === ' ') return { freqs: [0], duration: 0.1, gain: 0 };
            return { freqs: [400, 1200, 2000], duration: 0.1, gain: 0.15 };
        });
        
        let time = this.audioEngine.audioContext.currentTime;
        
        phonemes.forEach(phoneme => {
            if (phoneme.gain === 0) {
                time += phoneme.duration;
                return;
            }
            
            // Create formant oscillators
            phoneme.freqs.forEach((freq, index) => {
                if (freq === 0) return;
                
                const osc = this.audioEngine.audioContext.createOscillator();
                const gain = this.audioEngine.audioContext.createGain();
                const filter = this.audioEngine.audioContext.createBiquadFilter();
                
                // Apply vocal type effects
                this.applyVocalEffect(osc, filter, vocalType, freq);
                
                osc.frequency.value = freq;
                
                // Create envelope with reduced volume
                const vocalVolume = 0.15;
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(phoneme.gain * vocalVolume / (index + 1), time + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, time + phoneme.duration);
                
                // Add vibrato
                const vibrato = this.audioEngine.audioContext.createOscillator();
                const vibratoGain = this.audioEngine.audioContext.createGain();
                vibrato.frequency.value = 5;
                vibratoGain.gain.value = freq * 0.02;
                
                vibrato.connect(vibratoGain);
                vibratoGain.connect(osc.frequency);
                
                // Connect audio graph
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.audioEngine.masterGain);
                
                // Start and stop
                osc.start(time);
                vibrato.start(time);
                osc.stop(time + phoneme.duration);
                vibrato.stop(time + phoneme.duration);
                
                this.audioEngine.activeOscillators.push({ osc: osc, stopTime: time + phoneme.duration });
                this.audioEngine.activeOscillators.push({ osc: vibrato, stopTime: time + phoneme.duration });
            });
            
            time += phoneme.duration;
        });
    }

    applyVocalEffect(osc, filter, vocalType, freq) {
        if (vocalType === 'robotic') {
            osc.type = 'square';
            filter.type = 'bandpass';
            filter.frequency.value = freq;
            filter.Q.value = 10;
        } else if (vocalType === 'whisper') {
            osc.type = 'sawtooth';
            filter.type = 'highpass';
            filter.frequency.value = 2000;
            filter.Q.value = 1;
        } else if (vocalType === 'distorted') {
            osc.type = 'sawtooth';
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            filter.Q.value = 5;
        }
    }

    shouldVocalize(section, beat) {
        return (
            (section === 'chorus' && beat % 8 === 0) ||
            (section === 'verse' && beat % 16 === 0) ||
            (section === 'bridge' && beat % 12 === 0) ||
            (section === 'breakdown' && beat % 4 === 0)
        );
    }
}