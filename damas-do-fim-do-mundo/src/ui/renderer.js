import { PLAYER } from '../utils/constants.js';

export class Renderer {
    constructor() {
        this.boardElement = document.getElementById('board');
        this.selectedCell = null;
        this.validMoveCells = [];
    }

    renderBoard(board, validMoves = []) {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = this.createCell(row, col, board);
                this.boardElement.appendChild(cell);
            }
        }

        this.highlightValidMoves(validMoves);
    }

    createCell(row, col, board) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
        cell.dataset.row = row;
        cell.dataset.col = col;

        const piece = board.getPiece(row, col);
        if (piece) {
            const pieceElement = this.createPiece(piece);
            cell.appendChild(pieceElement);
        }

        return cell;
    }

    createPiece(piece) {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'piece';
        pieceElement.classList.add(piece.owner);
        
        if (piece.isKing()) {
            pieceElement.classList.add('king');
        }

        return pieceElement;
    }

    selectCell(row, col) {
        this.clearSelection();
        
        const cell = this.getCellElement(row, col);
        if (cell) {
            cell.classList.add('selected');
            this.selectedCell = { row, col };
        }
    }

    clearSelection() {
        const selected = this.boardElement.querySelector('.selected');
        if (selected) {
            selected.classList.remove('selected');
        }
        this.selectedCell = null;
        this.clearValidMoveHighlights();
    }

    highlightValidMoves(moves) {
        this.clearValidMoveHighlights();
        
        for (const move of moves) {
            const cell = this.getCellElement(move.to.row, move.to.col);
            if (cell) {
                if (move.captures.length > 0) {
                    cell.classList.add('capture-move');
                } else {
                    cell.classList.add('valid-move');
                }
                this.validMoveCells.push(cell);
            }
        }
    }

    clearValidMoveHighlights() {
        for (const cell of this.validMoveCells) {
            cell.classList.remove('valid-move', 'capture-move');
        }
        this.validMoveCells = [];
    }

    getCellElement(row, col) {
        return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    animateMove(from, to, captures, callback) {
        const fromCell = this.getCellElement(from.row, from.col);
        const toCell = this.getCellElement(to.row, to.col);
        
        if (!fromCell || !toCell) {
            callback();
            return;
        }

        const piece = fromCell.querySelector('.piece');
        if (!piece) {
            callback();
            return;
        }

        // Calculate positions for animation
        const fromRect = fromCell.getBoundingClientRect();
        const toRect = toCell.getBoundingClientRect();
        
        const deltaX = toRect.left - fromRect.left;
        const deltaY = toRect.top - fromRect.top;

        // If there are captures, animate "jumping" over them
        if (captures && captures.length > 0) {
            this.animateJumpSequence(piece, from, to, captures, deltaX, deltaY, callback);
        } else {
            // Simple slide animation
            this.animateSlide(piece, deltaX, deltaY, callback);
        }
    }

    animateSlide(piece, deltaX, deltaY, callback) {
        piece.style.setProperty('--final-x', `${deltaX}px`);
        piece.style.setProperty('--final-y', `${deltaY}px`);
        piece.style.setProperty('--jump-x', `${deltaX * 0.5}px`);
        piece.style.setProperty('--jump-y', `${deltaY * 0.5 - 30}px`);
        
        piece.classList.add('jumping');
        
        setTimeout(() => {
            piece.classList.remove('jumping');
            piece.style.removeProperty('--final-x');
            piece.style.removeProperty('--final-y');
            piece.style.removeProperty('--jump-x');
            piece.style.removeProperty('--jump-y');
            callback();
        }, 600);
    }

    animateJumpSequence(piece, from, to, captures, deltaX, deltaY, callback) {
        // For captures, make the piece "jump" higher
        piece.style.setProperty('--final-x', `${deltaX}px`);
        piece.style.setProperty('--final-y', `${deltaY}px`);
        piece.style.setProperty('--jump-x', `${deltaX * 0.5}px`);
        piece.style.setProperty('--jump-y', `${deltaY * 0.5 - 50}px`); // Higher jump
        
        piece.classList.add('jumping');
        
        setTimeout(() => {
            piece.classList.remove('jumping');
            piece.style.removeProperty('--final-x');
            piece.style.removeProperty('--final-y');
            piece.style.removeProperty('--jump-x');
            piece.style.removeProperty('--jump-y');
            callback();
        }, 600);
    }

    updateTurnIndicator(currentPlayer) {
        const indicator = document.getElementById('turn-indicator');
        if (indicator) {
            indicator.textContent = currentPlayer === PLAYER.HUMAN ? 'Seu turno' : 'Turno da IA';
        }
    }

    updateDifficultyBadge(difficulty) {
        const badge = document.getElementById('difficulty-badge');
        if (badge) {
            const labels = {
                'easy': '🟢 Fácil',
                'medium': '🟡 Médio',
                'hard': '🔴 Difícil'
            };
            badge.textContent = labels[difficulty] || difficulty;
        }
    }

    showAIMessage(message) {
        const messageElement = document.getElementById('ai-message');
        if (messageElement) {
            messageElement.textContent = message;
            
            // Remove animation class if exists
            messageElement.classList.remove('blink');
            
            // Trigger reflow to restart animation
            void messageElement.offsetWidth;
            
            // Add blink animation
            messageElement.classList.add('blink');
            
            // Remove class after animation completes
            setTimeout(() => {
                messageElement.classList.remove('blink');
            }, 1000);
        }
    }

    showLoading(show = true) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
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

    updateScore(playerWins, aiWins) {
        const playerElement = document.getElementById('player-wins');
        const aiElement = document.getElementById('ai-wins');
        
        if (playerElement) playerElement.textContent = playerWins;
        if (aiElement) aiElement.textContent = aiWins;
    }

    showGameOver(winner, message) {
        const title = document.getElementById('gameover-title');
        const messageElement = document.getElementById('gameover-message');

        if (title) {
            title.textContent = winner === PLAYER.HUMAN ? '🎉 Você Venceu!' : '💀 Game Over';
        }

        if (messageElement) {
            messageElement.textContent = message;
        }

        this.showScreen('gameover-screen');
    }
}
