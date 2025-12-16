/**
 * GameState.js
 * Gerencia o estado global do jogo
 * Responsável por: pontuação, fase, vidas, recorde, etc.
 */

class GameState {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.highScore = this.loadHighScore();
        this.isGameOver = false;
        this.isLevelComplete = false;
    }

    /**
     * Adiciona pontos
     */
    addScore(points) {
        this.score += points;
        
        // Atualiza recorde se necessário
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
    }

    /**
     * Avança para próxima fase
     */
    nextLevel() {
        this.level++;
        this.isLevelComplete = false;
    }

    /**
     * Reinicia o jogo
     */
    reset() {
        this.score = 0;
        this.level = 1;
        this.isGameOver = false;
        this.isLevelComplete = false;
    }

    /**
     * Game Over
     */
    gameOver() {
        this.isGameOver = true;
        this.saveHighScore();
    }

    /**
     * Marca fase como completa
     */
    completeLevel() {
        this.isLevelComplete = true;
    }

    /**
     * Calcula número de asteroides para a fase atual
     * Progressão: 3 + (level - 1) * 2
     */
    getAsteroidsForLevel() {
        return Math.min(3 + (this.level - 1) * 2, 15);  // Máximo 15 asteroides
    }

    /**
     * Calcula multiplicador de velocidade baseado na fase
     * Aumenta 15% a cada fase
     */
    getSpeedMultiplier() {
        return 1.0 + (this.level - 1) * 0.15;
    }

    /**
     * Salva recorde no localStorage
     */
    saveHighScore() {
        try {
            localStorage.setItem('cometasHighScore', this.highScore.toString());
        } catch (e) {
            console.warn('Não foi possível salvar o recorde:', e);
        }
    }

    /**
     * Carrega recorde do localStorage
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('cometasHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            console.warn('Não foi possível carregar o recorde:', e);
            return 0;
        }
    }

    /**
     * Verifica se é novo recorde
     */
    isNewHighScore() {
        return this.score >= this.highScore && this.score > 0;
    }
}
