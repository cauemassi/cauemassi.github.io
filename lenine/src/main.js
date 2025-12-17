// Main entry point
import { GameController } from './core/GameController.js';
import { InputHandler } from './input/InputHandler.js';
import { StateManager } from './core/StateManager.js';

class LenineGame {
    constructor() {
        this.controller = new GameController();
        this.inputHandler = null;
    }

    async init() {
        // Initialize game controller
        this.controller.initialize();
        
        // Setup input handler
        this.inputHandler = new InputHandler(this.controller);
        
        // Setup UI event listeners
        this.setupMenuListeners();
        this.setupGameListeners();
        this.setupModalListeners();
        
        // Show menu screen
        this.showScreen('menu-screen');
        
        // Load best scores
        this.controller.loadBestScores();
    }

    setupMenuListeners() {
        // New game button in menu
        document.getElementById('btn-new-game').addEventListener('click', () => {
            this.startNewGame();
        });
        
        // Continue button (TODO: implement save/load)
        document.getElementById('btn-continue').addEventListener('click', () => {
            // Not implemented yet
        });
        
        // Statistics button
        document.getElementById('btn-stats').addEventListener('click', () => {
            this.controller.showStatistics();
            this.showScreen('stats-screen');
        });
        
        // Back to menu from stats
        document.getElementById('btn-back-menu').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });
    }

    setupGameListeners() {
        // Pause button
        document.getElementById('btn-pause').addEventListener('click', () => {
            this.controller.pause();
        });
        
        // New game button in game screen
        document.getElementById('btn-new-game-play').addEventListener('click', () => {
            if (confirm('Deseja iniciar um novo jogo? O progresso atual será perdido.')) {
                this.startNewGame();
            }
        });
        
        // Hint button
        document.getElementById('btn-hint').addEventListener('click', () => {
            this.controller.getHint();
        });
        
        // Auto-complete button
        document.getElementById('btn-auto-complete').addEventListener('click', () => {
            this.controller.autoComplete();
        });
    }

    setupModalListeners() {
        // Pause modal
        document.getElementById('btn-resume').addEventListener('click', () => {
            this.controller.resume();
        });
        
        document.getElementById('btn-quit').addEventListener('click', () => {
            this.controller.hideModal('pause-modal');
            this.controller.stopTimer();
            this.showScreen('menu-screen');
            this.controller.stateManager.toMenu();
        });
        
        // Victory modal
        document.getElementById('btn-play-again').addEventListener('click', () => {
            this.controller.hideModal('victory-modal');
            this.startNewGame();
        });
        
        document.getElementById('btn-menu').addEventListener('click', () => {
            this.controller.hideModal('victory-modal');
            this.controller.loadBestScores();
            this.showScreen('menu-screen');
            this.controller.stateManager.toMenu();
        });
    }

    startNewGame() {
        this.showScreen('game-screen');
        this.controller.newGame();
        
        // Initialize input handler if not already done
        if (!this.inputHandler.initialized) {
            this.inputHandler.initialize();
            this.inputHandler.initialized = true;
        }
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show requested screen
        document.getElementById(screenId).classList.add('active');
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const game = new LenineGame();
        game.init();
    });
} else {
    const game = new LenineGame();
    game.init();
}
