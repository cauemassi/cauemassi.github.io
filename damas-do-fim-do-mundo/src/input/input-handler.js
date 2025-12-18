import { PLAYER, STATES } from '../utils/constants.js';

export class InputHandler {
    constructor(renderer, gameController) {
        this.renderer = renderer;
        this.gameController = gameController;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Board clicks
        this.renderer.boardElement.addEventListener('click', (e) => {
            this.handleBoardClick(e);
        });

        // Menu buttons
        const startButton = document.getElementById('start-game');
        if (startButton) {
            startButton.addEventListener('click', () => this.handleStartGame());
        }

        // Toggle API Key visibility based on checkbox
        const useAICheckbox = document.getElementById('use-ai');
        const apiKeyGroup = document.getElementById('api-key-group');
        if (useAICheckbox && apiKeyGroup) {
            useAICheckbox.addEventListener('change', (e) => {
                apiKeyGroup.style.display = e.target.checked ? 'flex' : 'none';
            });
        }

        // Game buttons
        const menuButton = document.getElementById('menu-btn');
        if (menuButton) {
            menuButton.addEventListener('click', () => this.handleBackToMenu());
        }

        const surrenderButton = document.getElementById('surrender-btn');
        if (surrenderButton) {
            surrenderButton.addEventListener('click', () => this.handleSurrender());
        }

        const restartButton = document.getElementById('restart-btn');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.handleRestart());
        }

        // Game over buttons
        const playAgainButton = document.getElementById('play-again-btn');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => this.handleRestart());
        }

        const backMenuButton = document.getElementById('back-menu-btn');
        if (backMenuButton) {
            backMenuButton.addEventListener('click', () => this.handleBackToMenu());
        }
    }

    handleBoardClick(e) {
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        this.gameController.handleCellClick(row, col);
    }

    handleStartGame() {
        const useAI = document.getElementById('use-ai').checked;
        const apiKey = document.getElementById('api-key').value.trim();
        const difficulty = document.getElementById('difficulty').value;
        const firstPlayer = document.getElementById('first-player').value;

        // Se usar IA mas não tem API Key, avisar
        if (useAI && !apiKey) {
            const confirmed = confirm('Sem API Key, a IA fará movimentos aleatórios. Continuar?');
            if (!confirmed) return;
        }

        this.gameController.startGame({
            apiKey: useAI ? apiKey : '', // Se não usar IA, passa string vazia
            difficulty,
            firstPlayer,
            useAI // Nova flag
        });
    }

    handleBackToMenu() {
        if (this.gameController.state !== STATES.GAME_OVER) {
            if (!confirm('Deseja realmente voltar ao menu? O jogo atual será perdido.')) {
                return;
            }
        }
        this.gameController.backToMenu();
    }

    handleSurrender() {
        if (confirm('Deseja realmente desistir?')) {
            this.gameController.surrender();
        }
    }

    handleRestart() {
        this.gameController.restart();
    }
}
