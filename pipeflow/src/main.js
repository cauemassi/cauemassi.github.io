// main.js - Ponto de entrada do jogo
import { GameController } from './core/GameController.js';

// Fix viewport height for mobile browsers
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Prevent scroll on mobile
function preventScroll(e) {
    e.preventDefault();
}

// Inicializa o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Set viewport height
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // Prevent pull-to-refresh and overscroll
    document.body.addEventListener('touchmove', preventScroll, { passive: false });
    document.body.addEventListener('gesturestart', preventScroll);
    
    // Initialize game
    new GameController();
});
