// InputHandler.js - Gerencia eventos de entrada do usuário
export class InputHandler {
    constructor(gameController, renderer) {
        this.gameController = gameController;
        this.renderer = renderer;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botões do menu
        document.getElementById('start-game').addEventListener('click', () => {
            this.onStartGame();
        });

        document.getElementById('show-rules').addEventListener('click', () => {
            this.onShowRules();
        });

        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.onBackToMenu();
        });

        // Botões de fim de rodada
        document.getElementById('next-round').addEventListener('click', () => {
            this.onNextRound();
        });

        // Botões de fim de jogo
        document.getElementById('play-again').addEventListener('click', () => {
            this.onPlayAgain();
        });

        document.getElementById('back-to-menu-2').addEventListener('click', () => {
            this.onBackToMenu();
        });

        // Callbacks do renderer
        this.renderer.onCardClick = (cardIndex) => {
            this.onCardClick(cardIndex);
        };

        this.renderer.onBetClick = (bet) => {
            this.onBetClick(bet);
        };
    }

    onStartGame() {
        this.gameController.startNewGame();
    }

    onShowRules() {
        this.renderer.showRulesScreen();
    }

    onBackToMenu() {
        this.renderer.showMenuScreen();
    }

    onNextRound() {
        this.gameController.nextRound();
    }

    onPlayAgain() {
        this.gameController.startNewGame();
    }

    onCardClick(cardIndex) {
        this.gameController.onHumanPlay(cardIndex);
    }

    onBetClick(bet) {
        this.gameController.onHumanBet(bet);
    }
}
