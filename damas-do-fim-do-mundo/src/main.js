import { GameController } from './core/game-controller.js';
import { InputHandler } from './input/input-handler.js';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const gameController = new GameController();
    const inputHandler = new InputHandler(gameController.renderer, gameController);
    
    console.log('🎮 Damas do Fim do Mundo - Inicializado');
    console.log('Feito por Caue Massi');
});
