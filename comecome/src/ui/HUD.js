export class HUD {
    constructor() {
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartButton = document.getElementById('restartBtn');
        
        this.onRestartCallback = null;
    }

    showGameOver(score) {
        this.gameOverElement.classList.remove('hidden');
        this.finalScoreElement.textContent = score;
    }

    hideGameOver() {
        this.gameOverElement.classList.add('hidden');
    }

    onRestart(callback) {
        this.onRestartCallback = callback;
        this.restartButton.addEventListener('click', () => {
            if (this.onRestartCallback) {
                this.onRestartCallback();
            }
        });
    }

    showMobileControls() {
        const mobileControls = document.getElementById('mobileControls');
        if ('ontouchstart' in window) {
            mobileControls.classList.remove('hidden');
        }
    }

    hideMobileControls() {
        const mobileControls = document.getElementById('mobileControls');
        mobileControls.classList.add('hidden');
    }
}
