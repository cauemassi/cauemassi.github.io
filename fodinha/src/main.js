// main.js - Ponto de entrada da aplicação
import { GameController } from './core/GameController.js';
import { Renderer } from './ui/Renderer.js';
import { InputHandler } from './input/InputHandler.js';

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🃏 Fodinha - Iniciando jogo...');
    
    // Cria os componentes principais
    const renderer = new Renderer();
    const gameController = new GameController(renderer);
    const inputHandler = new InputHandler(gameController, renderer);

    // Mostra a tela inicial
    renderer.showMenuScreen();
    
    console.log('✓ Jogo inicializado com sucesso!');
});
