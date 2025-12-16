// Player.js - Classe base para jogadores
import { Hand } from '../cards/Hand.js';

export class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.hand = new Hand();
        this.points = 5; // Todos começam com 5 pontos
        this.bet = null; // Palpite da rodada
        this.tricksWon = 0; // Vazas ganhas na rodada
        this.isEliminated = false;
    }

    // Recebe uma carta
    receiveCard(card) {
        this.hand.addCard(card);
    }

    // Joga uma carta (deve ser implementado pelas subclasses)
    playCard(gameState) {
        throw new Error('playCard must be implemented by subclass');
    }

    // Faz um palpite (deve ser implementado pelas subclasses)
    makeBet(gameState) {
        throw new Error('makeBet must be implemented by subclass');
    }

    // Incrementa vazas ganhas
    winTrick() {
        this.tricksWon++;
    }

    // Verifica se acertou o palpite
    checkBet() {
        return this.bet === this.tricksWon;
    }

    // Perde um ponto
    losePoint() {
        this.points--;
        if (this.points <= 0) {
            this.isEliminated = true;
        }
    }

    // Reseta para nova rodada
    resetForRound() {
        this.hand.clear();
        this.bet = null;
        this.tricksWon = 0;
    }

    // Reseta para novo jogo
    resetForGame() {
        this.resetForRound();
        this.points = 5;
        this.isEliminated = false;
    }
}
