// ScoreManager - Handles scoring system
export class ScoreManager {
    static SCORES = {
        MOVE_TO_FOUNDATION: 10,
        REVEAL_CARD: 5,
        WASTE_TO_TABLEAU: 5,
        RECYCLE_WASTE: -20
    };

    constructor() {
        this.score = 0;
        this.moves = 0;
    }

    moveToFoundation() {
        this.score += ScoreManager.SCORES.MOVE_TO_FOUNDATION;
        this.moves++;
        return this.score;
    }

    revealCard() {
        this.score += ScoreManager.SCORES.REVEAL_CARD;
        return this.score;
    }

    wasteToTableau() {
        this.score += ScoreManager.SCORES.WASTE_TO_TABLEAU;
        this.moves++;
        return this.score;
    }

    recycleWaste() {
        this.score = Math.max(0, this.score + ScoreManager.SCORES.RECYCLE_WASTE);
        return this.score;
    }

    regularMove() {
        this.moves++;
        return this.score;
    }

    addScore(points) {
        this.score += points;
        return this.getScore();
    }

    getScore() {
        return Math.max(0, this.score);
    }

    getMoves() {
        return this.moves;
    }

    reset() {
        this.score = 0;
        this.moves = 0;
    }

    calculateFinalScore(timeInSeconds) {
        // Bonus for fast completion
        const timeBonus = Math.max(0, 1000 - timeInSeconds);
        return this.getScore() + timeBonus;
    }
}
