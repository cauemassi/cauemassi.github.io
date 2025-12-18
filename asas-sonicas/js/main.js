// ============================================
// INICIALIZAÇÃO
// ============================================
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    new Game(canvas);
});

// Prevenir zoom em mobile
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => {
    if (e.scale !== 1) e.preventDefault();
}, { passive: false });
