export class LyricsGenerator {
    constructor() {
        this.generatedLyrics = {};
        this.currentLyrics = [];
        
        this.themes = {
            existential: [
                'fractured', 'dissolve', 'beneath', 'hollow', 'spiral', 'descend',
                'machine', 'synthetic', 'digital', 'static', 'void', 'echo',
                'rust', 'corrode', 'decay', 'fragment', 'shatter', 'erode'
            ],
            emotional: [
                'numb', 'disconnect', 'isolate', 'suffocate', 'drown', 'bleed',
                'scar', 'wound', 'break', 'tear', 'rip', 'crush'
            ],
            abstract: [
                'time', 'space', 'dimension', 'reality', 'existence', 'consciousness',
                'illusion', 'perception', 'distortion', 'reflection', 'shadow', 'light'
            ],
            industrial: [
                'steel', 'wire', 'circuit', 'pulse', 'frequency', 'signal',
                'transmission', 'feedback', 'overload', 'system', 'malfunction', 'glitch'
            ]
        };
        
        this.patterns = {
            verse: [
                '{abstract} {emotional} through {industrial}',
                '{existential} in the {abstract}',
                'I {emotional} as {industrial} {existential}',
                'The {abstract} {existential}, {emotional} within',
                '{industrial} {emotional} my {abstract}'
            ],
            chorus: [
                '{existential}! {existential}!',
                'We {emotional} in {industrial}',
                '{abstract} {existential} away',
                'Breaking down, {emotional}',
                '{industrial} {abstract} {emotional}'
            ],
            bridge: [
                'Is this {abstract}?',
                'Where {industrial} meets {emotional}',
                '{existential} becomes {abstract}',
                'Lost in {industrial} {abstract}'
            ]
        };
    }

    generate(sections, seed) {
        this.generatedLyrics = {};
        this.currentLyrics = [];
        
        sections.forEach((section, index) => {
            if (section === 'intro' || section === 'outro' || section === 'instrumental') {
                this.generatedLyrics[`${section}_${index}`] = ['[Instrumental]'];
            } else if (section === 'breakdown') {
                const word = this.randomChoice(this.themes.existential, seed + index * 1000);
                this.generatedLyrics[`${section}_${index}`] = [
                    word.toUpperCase(),
                    word.toUpperCase(),
                    '...',
                    word.toUpperCase()
                ];
            } else {
                const linesCount = section === 'verse' ? 4 : section === 'chorus' ? 3 : 2;
                const lines = [];
                
                for (let i = 0; i < linesCount; i++) {
                    const pattern = this.randomChoice(
                        this.patterns[section] || this.patterns.verse,
                        seed + index * 1000 + i * 100
                    );
                    
                    let line = pattern;
                    line = line.replace(/{abstract}/g, () => 
                        this.randomChoice(this.themes.abstract, seed + Math.random() * 10000)
                    );
                    line = line.replace(/{emotional}/g, () => 
                        this.randomChoice(this.themes.emotional, seed + Math.random() * 10000)
                    );
                    line = line.replace(/{existential}/g, () => 
                        this.randomChoice(this.themes.existential, seed + Math.random() * 10000)
                    );
                    line = line.replace(/{industrial}/g, () => 
                        this.randomChoice(this.themes.industrial, seed + Math.random() * 10000)
                    );
                    
                    lines.push(line.charAt(0).toUpperCase() + line.slice(1));
                }
                
                this.generatedLyrics[`${section}_${index}`] = lines;
            }
        });
        
        return this.generatedLyrics;
    }

    display(lyrics) {
        const lyricsDisplay = document.getElementById('lyricsDisplay');
        lyricsDisplay.innerHTML = '';
        this.currentLyrics = [];
        
        Object.entries(lyrics).forEach(([key, lines]) => {
            const [section, index] = key.split('_');
            
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'lyrics-section';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'lyrics-section-title';
            titleDiv.textContent = `[${section.toUpperCase()}]`;
            sectionDiv.appendChild(titleDiv);
            
            lines.forEach(line => {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'lyrics-line';
                lineDiv.textContent = line;
                sectionDiv.appendChild(lineDiv);
                this.currentLyrics.push({ 
                    element: lineDiv, 
                    section: parseInt(index), 
                    text: line 
                });
            });
            
            lyricsDisplay.appendChild(sectionDiv);
        });
    }

    updateCurrentLyric(currentSection, currentBeat) {
        if (this.currentLyrics.length === 0) return;
        
        this.currentLyrics.forEach(lyric => {
            lyric.element.classList.remove('current');
        });
        
        const currentSectionLyrics = this.currentLyrics.filter(l => l.section === currentSection);
        if (currentSectionLyrics.length > 0) {
            const lyricIndex = Math.floor((currentBeat / 4) % currentSectionLyrics.length);
            if (currentSectionLyrics[lyricIndex]) {
                currentSectionLyrics[lyricIndex].element.classList.add('current');
            }
        }
    }

    getCurrentLyricText(currentSection, currentBeat) {
        const currentSectionLyrics = this.currentLyrics.filter(l => l.section === currentSection);
        if (currentSectionLyrics.length > 0) {
            const lyricIndex = Math.floor((currentBeat / 4) % currentSectionLyrics.length);
            if (currentSectionLyrics[lyricIndex]) {
                return currentSectionLyrics[lyricIndex].text;
            }
        }
        return null;
    }

    clearCurrentLyric() {
        this.currentLyrics.forEach(lyric => {
            lyric.element.classList.remove('current');
        });
    }

    getPlainText() {
        let text = '';
        Object.entries(this.generatedLyrics).forEach(([key, lines]) => {
            const section = key.split('_')[0];
            text += `[${section.toUpperCase()}]\n`;
            lines.forEach(line => {
                text += line + '\n';
            });
            text += '\n';
        });
        return text;
    }

    getExportText() {
        let text = `Industrial Song - Lyrics\n`;
        text += `Generated: ${new Date().toLocaleString()}\n\n`;
        text += this.getPlainText();
        return text;
    }

    randomChoice(arr, seed) {
        const x = Math.sin(seed) * 10000;
        const random = x - Math.floor(x);
        return arr[Math.floor(random * arr.length)];
    }
}