export class SongStructure {
    constructor() {
        this.sections = [];
        this.structures = {
            standard: ['intro', 'intro', 'verse', 'verse', 'instrumental', 'chorus', 'chorus', 
                      'verse', 'instrumental', 'chorus', 'chorus', 'bridge', 'chorus', 'chorus', 'outro'],
            simple: ['intro', 'verse', 'verse', 'chorus', 'chorus', 'verse', 'chorus', 'outro'],
            extended: ['intro', 'intro', 'verse', 'pre-chorus', 'chorus', 'instrumental',
                      'verse', 'pre-chorus', 'chorus', 'chorus', 'bridge', 'breakdown',
                      'chorus', 'chorus', 'outro', 'outro'],
            industrial: ['intro', 'breakdown', 'verse', 'breakdown', 'chorus', 'instrumental',
                        'breakdown', 'verse', 'breakdown', 'chorus', 'bridge', 'breakdown', 'outro']
        };
        
        this.timeSignatures = {
            intro: { numerator: 4, denominator: 4 },
            verse: { numerator: 4, denominator: 4 },
            'pre-chorus': { numerator: 4, denominator: 4 },
            chorus: { numerator: 4, denominator: 4 },
            bridge: { numerator: 4, denominator: 4 },
            breakdown: { numerator: 7, denominator: 8 },
            instrumental: { numerator: 4, denominator: 4 },
            outro: { numerator: 4, denominator: 4 }
        };
        
        this.barsPerSection = {
            intro: 8,
            verse: 16,
            'pre-chorus': 8,
            chorus: 16,
            bridge: 12,
            breakdown: 8,
            instrumental: 8,
            outro: 8
        };
        
        this.draggedElement = null;
        this.dropIndicator = null;
    }

    initialize() {
        this.structureEditor = document.getElementById('structureEditor');
        this.dropIndicator = document.getElementById('dropIndicator');
        
        // Initialize drag and drop for palette sections
        document.querySelectorAll('.draggable-section').forEach(element => {
            element.addEventListener('dragstart', this.handleDragStart.bind(this));
            element.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
        
        // Setup drop zone
        this.structureEditor.addEventListener('dragover', this.handleDragOver.bind(this));
        this.structureEditor.addEventListener('drop', this.handleDrop.bind(this));
        
        // Setup preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.loadPreset(preset);
            });
        });
        
        // Load default structure
        this.loadPreset('standard');
    }

    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', e.target.dataset.section);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.dropIndicator.style.display = 'none';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        
        const afterElement = this.getDragAfterElement(e.clientX);
        if (afterElement == null) {
            this.dropIndicator.style.left = (this.structureEditor.offsetWidth - 2) + 'px';
        } else {
            this.dropIndicator.style.left = (afterElement.offsetLeft - 4) + 'px';
        }
        this.dropIndicator.style.display = 'block';
    }

    handleDrop(e) {
        e.preventDefault();
        const section = e.dataTransfer.getData('text/plain');
        const afterElement = this.getDragAfterElement(e.clientX);
        
        this.addSection(section, afterElement);
        this.dropIndicator.style.display = 'none';
        this.updateInfo();
    }

    getDragAfterElement(x) {
        const draggableElements = [...this.structureEditor.querySelectorAll('.section-block:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    addSection(section, afterElement) {
        const newSection = document.createElement('div');
        newSection.className = `section-block ${section}`;
        newSection.textContent = section.toUpperCase();
        newSection.draggable = true;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            newSection.remove();
            this.updateSections();
            this.updateInfo();
        };
        
        newSection.appendChild(removeBtn);
        
        if (afterElement) {
            afterElement.insertAdjacentElement('afterend', newSection);
        } else {
            const indicator = this.structureEditor.querySelector('.drop-indicator');
            if (indicator) {
                this.structureEditor.insertBefore(newSection, indicator);
            } else {
                this.structureEditor.appendChild(newSection);
            }
        }
        
        newSection.addEventListener('dragstart', this.handleDragStart.bind(this));
        newSection.addEventListener('dragend', this.handleDragEnd.bind(this));
        
        this.updateSections();
    }

    loadPreset(preset) {
        this.structureEditor.innerHTML = '<div class="drop-indicator" id="dropIndicator"></div>';
        this.dropIndicator = document.getElementById('dropIndicator');
        
        const structure = this.structures[preset];
        structure.forEach(section => {
            this.addSection(section);
        });
        
        this.updateInfo();
    }

    updateSections() {
        this.sections = Array.from(this.structureEditor.querySelectorAll('.section-block'))
            .map(el => el.textContent.toLowerCase().replace('×', '').trim());
    }

    updateInfo() {
        this.updateSections();
        const totalBars = this.sections.reduce((sum, section) => 
            sum + (this.barsPerSection[section] || 8), 0);
        const approxMinutes = Math.round((totalBars * 4 * 60) / (70 * 60));
        
        document.getElementById('structureInfo').textContent = 
            `${this.sections.length} sections, ~${totalBars} bars, ~${approxMinutes} minutes`;
    }

    getSections() {
        this.updateSections();
        return this.sections;
    }

    getRandomTimeSignature() {
        const signatures = [
            { numerator: 5, denominator: 4 },
            { numerator: 7, denominator: 8 },
            { numerator: 9, denominator: 8 },
            { numerator: 6, denominator: 8 }
        ];
        return signatures[Math.floor(Math.random() * signatures.length)];
    }
}