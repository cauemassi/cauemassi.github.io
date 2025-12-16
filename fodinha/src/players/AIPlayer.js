// AIPlayer.js - Jogador controlado por IA
import { Player } from './Player.js';
import { AIEngine } from '../ai/AIEngine.js';

export class AIPlayer extends Player {
    constructor(id, name) {
        super(id, name);
        this.aiEngine = new AIEngine();
    }

    // IA joga uma carta
    playCard(gameState) {
        const cardIndex = this.aiEngine.chooseCard(this, gameState);
        return this.hand.playCard(cardIndex);
    }

    // IA faz um palpite
    makeBet(gameState) {
        this.bet = this.aiEngine.makeBet(this, gameState);
        return this.bet;
    }
}
