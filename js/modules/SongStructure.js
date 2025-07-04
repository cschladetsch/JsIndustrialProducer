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
        this.dragMode = 'copy'; // 'copy' or 'move'
        this.dragSource = null; // 'palette' or 'structure'
    }

    initialize() {
        this.structureEditor = document.getElementById('structureEditor');
        this.dropIndicator = document.getElementById('dropIndicator');
        this.paletteContainer = document.getElementById('sectionPalette');
        
        // Initialize drag and drop for palette sections
        document.querySelectorAll('.draggable-section').forEach(element => {
            element.addEventListener('dragstart', (e) => this.handleDragStart(e, 'palette'));
            element.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
        
        // Setup drop zones for both structure editor and palette
        this.structureEditor.addEventListener('dragover', (e) => this.handleDragOver(e, 'structure'));
        this.structureEditor.addEventListener('drop', (e) => this.handleDrop(e, 'structure'));
        
        // Make palette a drop zone too
        this.paletteContainer.addEventListener('dragover', (e) => this.handleDragOver(e, 'palette'));
        this.paletteContainer.addEventListener('drop', (e) => this.handleDrop(e, 'palette'));
        
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

    handleDragStart(e, source) {
        this.draggedElement = e.target;
        this.dragSource = source;
        e.target.classList.add('dragging');
        
        // Get section name from either dataset or text content
        const sectionName = e.target.dataset.section || 
                          e.target.textContent.toLowerCase().replace('×', '').trim();
        
        e.dataTransfer.effectAllowed = source === 'palette' ? 'copy' : 'move';
        e.dataTransfer.setData('text/plain', sectionName);
        e.dataTransfer.setData('source', source);
        
        // Store if this is a move operation (from structure)
        if (source === 'structure') {
            e.dataTransfer.setData('elementId', Date.now().toString());
            e.target.dataset.elementId = Date.now().toString();
        }
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        if (this.dropIndicator) {
            this.dropIndicator.style.display = 'none';
        }
        
        // Clean up palette drop indicator if exists
        const paletteDropIndicator = this.paletteContainer.querySelector('.palette-drop-indicator');
        if (paletteDropIndicator) {
            paletteDropIndicator.remove();
        }
    }

    handleDragOver(e, dropZone) {
        e.preventDefault();
        
        const sourceType = e.dataTransfer.getData('source') || this.dragSource;
        
        // Set drop effect based on source and destination
        if (dropZone === 'palette' && sourceType === 'structure') {
            // Moving from structure back to palette means removing from structure
            e.dataTransfer.dropEffect = 'move';
            this.showPaletteDropIndicator(e);
        } else if (dropZone === 'structure') {
            // Copy from palette or move within structure
            e.dataTransfer.dropEffect = sourceType === 'palette' ? 'copy' : 'move';
            this.showStructureDropIndicator(e);
        }
    }

    showStructureDropIndicator(e) {
        const afterElement = this.getDragAfterElement(this.structureEditor, e.clientX);
        if (afterElement == null) {
            this.dropIndicator.style.left = (this.structureEditor.offsetWidth - 2) + 'px';
        } else {
            this.dropIndicator.style.left = (afterElement.offsetLeft - 4) + 'px';
        }
        this.dropIndicator.style.display = 'block';
    }

    showPaletteDropIndicator(e) {
        // Visual feedback for dropping back to palette
        let indicator = this.paletteContainer.querySelector('.palette-drop-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'palette-drop-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 2px dashed #4ecdc4;
                pointer-events: none;
                z-index: 10;
            `;
            this.paletteContainer.style.position = 'relative';
            this.paletteContainer.appendChild(indicator);
        }
    }

    handleDrop(e, dropZone) {
        e.preventDefault();
        
        const section = e.dataTransfer.getData('text/plain');
        const source = e.dataTransfer.getData('source') || this.dragSource;
        const elementId = e.dataTransfer.getData('elementId');
        
        if (dropZone === 'palette' && source === 'structure') {
            // Remove from structure (return to palette)
            if (elementId) {
                const element = this.structureEditor.querySelector(`[data-element-id="${elementId}"]`);
                if (element) {
                    element.remove();
                }
            } else if (this.draggedElement && this.draggedElement.parentElement === this.structureEditor) {
                this.draggedElement.remove();
            }
            
            this.updateSections();
            this.updateInfo();
        } else if (dropZone === 'structure') {
            if (source === 'palette') {
                // Copy from palette to structure
                const afterElement = this.getDragAfterElement(this.structureEditor, e.clientX);
                this.addSection(section, afterElement);
            } else if (source === 'structure') {
                // Move within structure (reorder)
                const afterElement = this.getDragAfterElement(this.structureEditor, e.clientX);
                if (this.draggedElement && this.draggedElement !== afterElement) {
                    if (afterElement) {
                        afterElement.insertAdjacentElement('afterend', this.draggedElement);
                    } else {
                        this.structureEditor.insertBefore(this.draggedElement, this.dropIndicator);
                    }
                    this.updateSections();
                    this.updateInfo();
                }
            }
        }
        
        this.dropIndicator.style.display = 'none';
        const paletteDropIndicator = this.paletteContainer.querySelector('.palette-drop-indicator');
        if (paletteDropIndicator) {
            paletteDropIndicator.remove();
        }
    }

    getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.section-block:not(.dragging)')];
        
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
        newSection.dataset.section = section;
        
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
        
        // Make the new section draggable within structure
        newSection.addEventListener('dragstart', (e) => this.handleDragStart(e, 'structure'));
        newSection.addEventListener('dragend', this.handleDragEnd.bind(this));
        
        this.updateSections();
        this.updateInfo();
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