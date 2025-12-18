// main.js - Ponto de entrada do jogo
import { GameController } from './core/GameController.js';

// Inicializa o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new GameController();
});
