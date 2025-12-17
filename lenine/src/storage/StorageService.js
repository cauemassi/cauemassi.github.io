// StorageService - Handles localStorage operations
export class StorageService {
    constructor() {
        this.KEYS = {
            BEST_TIME: 'lenine_best_time',
            BEST_SCORE: 'lenine_best_score',
            TOTAL_GAMES: 'lenine_total_games',
            WINS: 'lenine_wins',
            CURRENT_GAME: 'lenine_current_game'
        };
    }

    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    }

    recordWin(time, score) {
        // Increment games and wins
        const totalGames = this.get(this.KEYS.TOTAL_GAMES, 0) + 1;
        const wins = this.get(this.KEYS.WINS, 0) + 1;
        
        this.set(this.KEYS.TOTAL_GAMES, totalGames);
        this.set(this.KEYS.WINS, wins);
        
        // Update best time
        const bestTime = this.get(this.KEYS.BEST_TIME, null);
        if (bestTime === null || time < bestTime) {
            this.set(this.KEYS.BEST_TIME, time);
        }
        
        // Update best score
        const bestScore = this.get(this.KEYS.BEST_SCORE, 0);
        if (score > bestScore) {
            this.set(this.KEYS.BEST_SCORE, score);
        }
    }

    getStatistics() {
        return {
            gamesPlayed: this.get(this.KEYS.TOTAL_GAMES, 0),
            wins: this.get(this.KEYS.WINS, 0),
            bestTime: this.get(this.KEYS.BEST_TIME, 0),
            bestScore: this.get(this.KEYS.BEST_SCORE, 0)
        };
    }
}
