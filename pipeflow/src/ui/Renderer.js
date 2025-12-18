// Renderer.js - Renderiza o jogo no DOM
export class Renderer {
    constructor() {
        this.gridElement = document.getElementById('game-grid');
        this.currentPipeElement = document.getElementById('current-pipe');
        this.nextPipeElements = [
            document.getElementById('next-pipe-1'),
            document.getElementById('next-pipe-2'),
            document.getElementById('next-pipe-3')
        ];
        this.hudLevel = document.getElementById('hud-level');
        this.hudScore = document.getElementById('hud-score');
        this.hudTime = document.getElementById('hud-time');
    }

    renderGrid(grid, selectedRow, selectedCol) {
        const size = grid.size;
        this.gridElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        this.gridElement.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        this.gridElement.innerHTML = '';

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = grid.getCell(row, col);
                const cellElement = this.createCellElement(cell, row === selectedRow && col === selectedCol);
                this.gridElement.appendChild(cellElement);
            }
        }
    }

    createCellElement(cell, isSelected) {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        cellDiv.dataset.row = cell.row;
        cellDiv.dataset.col = cell.col;

        if (isSelected) {
            cellDiv.classList.add('selected');
        }

        if (cell.isStart) {
            cellDiv.classList.add('start');
        } else if (cell.isEnd) {
            cellDiv.classList.add('end');
        }

        if (cell.hasPipe()) {
            const pipeDiv = this.createPipeElement(cell.pipe);
            cellDiv.appendChild(pipeDiv);
        }

        return cellDiv;
    }

    createPipeElement(pipe) {
        const pipeDiv = document.createElement('div');
        pipeDiv.className = 'pipe';
        pipeDiv.classList.add(`pipe-${pipe.type}`);
        pipeDiv.style.transform = `rotate(${pipe.rotation}deg)`;

        if (pipe.hasWater) {
            pipeDiv.classList.add('flowing');
        }

        return pipeDiv;
    }

    renderPipeQueue(currentPipe, upcomingPipes) {
        if (currentPipe) {
            this.renderPipePreview(this.currentPipeElement, currentPipe);
        }

        upcomingPipes.forEach((pipe, index) => {
            if (this.nextPipeElements[index]) {
                this.renderPipePreview(this.nextPipeElements[index], pipe);
            }
        });
    }

    renderPipePreview(element, pipeData) {
        element.innerHTML = '';
        const pipeDiv = document.createElement('div');
        pipeDiv.className = 'pipe';
        pipeDiv.classList.add(`pipe-${pipeData.type}`);
        pipeDiv.style.transform = `rotate(${pipeData.rotation}deg)`;
        pipeDiv.style.width = '80%';
        pipeDiv.style.height = '80%';
        element.appendChild(pipeDiv);
    }

    updateHUD(level, score, time) {
        this.hudLevel.textContent = level;
        this.hudScore.textContent = score;
        
        // Formatar tempo como MM:SS
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.hudTime.textContent = timeFormatted;
    }

    renderLevelSelect(levels) {
        const container = document.getElementById('levels-grid');
        container.innerHTML = '';

        levels.forEach(level => {
            const card = document.createElement('div');
            card.className = `level-card ${level.unlocked ? 'unlocked' : 'locked'}`;
            card.dataset.levelId = level.id;

            const number = document.createElement('div');
            number.className = 'level-number';
            number.textContent = level.id;
            card.appendChild(number);

            if (level.record) {
                const record = document.createElement('div');
                record.className = 'level-record';
                record.textContent = `★ ${level.record.score}`;
                card.appendChild(record);
            }

            if (level.unlocked) {
                card.addEventListener('click', () => {
                    if (this.onLevelSelect) {
                        this.onLevelSelect(level.id);
                    }
                });
            }

            container.appendChild(card);
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
    }

    showResult(isSuccess, level, score, record, hasNextLevel) {
        const title = document.getElementById('result-title');
        const resultLevel = document.getElementById('result-level');
        const resultScore = document.getElementById('result-score');
        const resultRecord = document.getElementById('result-record');
        const btnNext = document.getElementById('btn-next-level');

        title.textContent = isSuccess ? 'Vitória! 🎉' : 'Derrota 😢';
        resultLevel.textContent = level;
        resultScore.textContent = score;
        resultRecord.textContent = record ? record.score : score;

        if (hasNextLevel && isSuccess) {
            btnNext.style.display = 'block';
        } else {
            btnNext.style.display = 'none';
        }

        this.showScreen('result-screen');
    }

    updateDifficultyDisplay(difficulty) {
        const difficultyMap = {
            'easy': 'Fácil',
            'medium': 'Médio',
            'hard': 'Difícil'
        };
        const element = document.getElementById('current-difficulty');
        if (element) {
            element.textContent = difficultyMap[difficulty] || 'Médio';
        }
    }

    updateSpeedButton(isActive) {
        const btn = document.getElementById('btn-speed');
        if (btn) {
            if (isActive) {
                btn.classList.add('active');
                btn.textContent = '⚡ Acelerado';
            } else {
                btn.classList.remove('active');
                btn.textContent = '⚡ Acelerar';
            }
        }
    }
}
