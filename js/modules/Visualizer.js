export class Visualizer {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.analyserCanvas = null;
        this.analyserCtx = null;
        this.analyserMode = 'bars';
        this.animationId = null;
    }

    initialize() {
        this.analyserCanvas = document.getElementById('analyzerCanvas');
        if (!this.analyserCanvas) {
            console.warn('Analyzer canvas not found - skipping visualizer initialization');
            return;
        }
        this.analyserCtx = this.analyserCanvas.getContext('2d');
        
        // Setup mode buttons
        const analyzerButtons = document.querySelectorAll('.analyzer-btn');
        if (analyzerButtons.length > 0) {
            analyzerButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.analyzer-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.analyserMode = e.target.dataset.mode;
                });
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.analyserCanvas && document.getElementById('analyzerContainer').style.display !== 'none') {
                const rect = this.analyserCanvas.getBoundingClientRect();
                this.analyserCanvas.width = rect.width * (window.devicePixelRatio || 1);
                this.analyserCanvas.height = rect.height * (window.devicePixelRatio || 1);
            }
        });
    }

    startAnimation() {
        if (this.animationId) return;
        
        // Set canvas size if needed
        if (this.analyserCanvas) {
            const rect = this.analyserCanvas.getBoundingClientRect();
            this.analyserCanvas.width = rect.width * window.devicePixelRatio || 600;
            this.analyserCanvas.height = rect.height * window.devicePixelRatio || 120;
            this.analyserCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        }
        
        this.draw();
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    draw() {
        this.animationId = requestAnimationFrame(() => this.draw());
        
        if (!this.audioEngine.analyser || !this.analyserCtx) return;
        
        const width = this.analyserCanvas.width / (window.devicePixelRatio || 1);
        const height = this.analyserCanvas.height / (window.devicePixelRatio || 1);
        
        if (width <= 0 || height <= 0) {
            const rect = this.analyserCanvas.getBoundingClientRect();
            this.analyserCanvas.width = rect.width * (window.devicePixelRatio || 1) || 600;
            this.analyserCanvas.height = rect.height * (window.devicePixelRatio || 1) || 120;
            return;
        }
        
        this.analyserCtx.fillStyle = '#0a0a0a';
        this.analyserCtx.fillRect(0, 0, this.analyserCanvas.width, this.analyserCanvas.height);
        
        if (this.analyserMode === 'bars') {
            this.drawBars(width, height);
        } else if (this.analyserMode === 'wave') {
            this.drawWaveform(width, height);
        } else if (this.analyserMode === 'circle') {
            this.drawCircle(width, height);
        }
    }

    drawBars(width, height) {
        const bufferLength = this.audioEngine.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.audioEngine.analyser.getByteFrequencyData(dataArray);
        
        const barWidth = width / bufferLength * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;
            
            const r = barHeight + 25 * (i / bufferLength);
            const g = 250 * (i / bufferLength);
            const b = 50;
            
            this.analyserCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.analyserCtx.fillRect(x, height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
            if (x > width) break;
        }
    }

    drawWaveform(width, height) {
        const bufferLength = this.audioEngine.analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        this.audioEngine.analyser.getByteTimeDomainData(dataArray);
        
        this.analyserCtx.lineWidth = 2;
        this.analyserCtx.strokeStyle = '#4ecdc4';
        this.analyserCtx.beginPath();
        
        const sliceWidth = width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * height / 2;
            
            if (i === 0) {
                this.analyserCtx.moveTo(x, y);
            } else {
                this.analyserCtx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.analyserCtx.stroke();
    }

    drawCircle(width, height) {
        const bufferLength = this.audioEngine.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.audioEngine.analyser.getByteFrequencyData(dataArray);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        
        this.analyserCtx.beginPath();
        
        for (let i = 0; i < 360; i += 2) {
            const index = Math.floor((i / 360) * bufferLength);
            const value = dataArray[index] / 255;
            const r = radius + value * 30;
            
            const angle = (i * Math.PI) / 180;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            if (i === 0) {
                this.analyserCtx.moveTo(x, y);
            } else {
                this.analyserCtx.lineTo(x, y);
            }
        }
        
        this.analyserCtx.closePath();
        this.analyserCtx.strokeStyle = '#ff6b6b';
        this.analyserCtx.lineWidth = 2;
        this.analyserCtx.stroke();
    }

    clear() {
        if (this.analyserCtx && this.analyserCanvas) {
            this.analyserCtx.fillStyle = '#0a0a0a';
            this.analyserCtx.fillRect(0, 0, this.analyserCanvas.width, this.analyserCanvas.height);
        }
    }
}