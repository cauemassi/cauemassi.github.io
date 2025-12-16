export class Menu {
    constructor() {
        this.menuElement = document.getElementById('menu');
        this.startButton = document.getElementById('startBtn');
        this.highScoreElement = document.getElementById('highScore');
        
        this.onStartCallback = null;
    }

    show(highScore) {
        this.menuElement.classList.remove('hidden');
        this.highScoreElement.textContent = highScore;
    }

    hide() {
        this.menuElement.classList.add('hidden');
    }

    onStart(callback) {
        this.onStartCallback = callback;
        this.startButton.addEventListener('click', () => {
            if (this.onStartCallback) {
                this.onStartCallback();
            }
        });
    }
}
