export class StateManager {
    constructor() {
        this.states = {
            MENU: 'menu',
            PLAYING: 'playing',
            PAUSED: 'paused',
            GAME_OVER: 'gameOver'
        };
        
        this.currentState = this.states.MENU;
        this.score = 0;
        this.level = 1;
        this.highScore = this.loadHighScore();
        this.specialPowerUpAvailable = false;
    }

    setState(newState) {
        this.currentState = newState;
    }

    getState() {
        return this.currentState;
    }

    isPlaying() {
        return this.currentState === this.states.PLAYING;
    }

    isPaused() {
        return this.currentState === this.states.PAUSED;
    }

    addScore(points) {
        this.score += points;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }

    resetScore() {
        this.score = 0;
    }

    nextLevel() {
        this.level++;
    }

    resetLevel() {
        this.level = 1;
    }

    saveHighScore() {
        localStorage.setItem('comecome_highscore', this.highScore.toString());
    }

    loadHighScore() {
        const saved = localStorage.getItem('comecome_highscore');
        return saved ? parseInt(saved) : 0;
    }

    setSpecialPowerUp(available) {
        this.specialPowerUpAvailable = available;
    }

    hasSpecialPowerUp() {
        return this.specialPowerUpAvailable;
    }

    useSpecialPowerUp() {
        if (this.specialPowerUpAvailable) {
            this.specialPowerUpAvailable = false;
            return true;
        }
        return false;
    }
}
