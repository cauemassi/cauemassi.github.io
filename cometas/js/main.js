/**
 * main.js
 * Ponto de entrada da aplicação
 * Gerencia navegação entre telas e inicialização do jogo
 */

// Instância global do jogo
let game = null;

/**
 * Inicialização quando DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    loadHighScore();
});

/**
 * Configura event listeners da UI
 */
function initializeUI() {
    // Botão "Iniciar Jogo" no menu
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // Botão "Voltar ao Menu" na tela de game over
    document.getElementById('menu-button').addEventListener('click', backToMenu);
}

/**
 * Carrega e exibe recorde
 */
function loadHighScore() {
    try {
        const highScore = localStorage.getItem('cometasHighScore') || '0';
        document.getElementById('high-score-value').textContent = highScore;
    } catch (e) {
        console.warn('Não foi possível carregar recorde:', e);
        document.getElementById('high-score-value').textContent = '0';
    }
}

/**
 * Inicia o jogo
 */
function startGame() {
    // Esconde menu, mostra tela de jogo
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // Cria nova instância do jogo
    if (game) {
        game.stop();
    }
    game = new Game();
    game.start();
}

/**
 * Volta ao menu principal
 */
function backToMenu() {
    // Para o jogo se estiver rodando
    if (game) {
        game.stop();
    }
    
    // Atualiza recorde no menu
    loadHighScore();
    
    // Esconde todas as telas, mostra menu
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('menu-screen').classList.add('active');
}

/**
 * Previne comportamentos padrão que podem atrapalhar o jogo
 */
window.addEventListener('keydown', (e) => {
    // Previne scroll com space e arrow keys, e Escape
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(e.code)) {
        e.preventDefault();
    }
});

// Previne menu de contexto no canvas
document.addEventListener('contextmenu', (e) => {
    if (e.target.id === 'game-canvas') {
        e.preventDefault();
    }
});
