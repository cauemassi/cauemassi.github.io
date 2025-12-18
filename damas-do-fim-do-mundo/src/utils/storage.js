export class StorageService {
    static KEYS = {
        API_KEY: 'damas_api_key',
        PLAYER_WINS: 'damas_player_wins',
        AI_WINS: 'damas_ai_wins'
    };

    static saveApiKey(apiKey) {
        localStorage.setItem(this.KEYS.API_KEY, apiKey);
    }

    static getApiKey() {
        return localStorage.getItem(this.KEYS.API_KEY) || '';
    }

    static saveScore(playerWins, aiWins) {
        localStorage.setItem(this.KEYS.PLAYER_WINS, playerWins);
        localStorage.setItem(this.KEYS.AI_WINS, aiWins);
    }

    static getScore() {
        return {
            playerWins: parseInt(localStorage.getItem(this.KEYS.PLAYER_WINS)) || 0,
            aiWins: parseInt(localStorage.getItem(this.KEYS.AI_WINS)) || 0
        };
    }
}
