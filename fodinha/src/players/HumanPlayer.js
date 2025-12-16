// HumanPlayer.js - Jogador humano
import { Player } from './Player.js';

export class HumanPlayer extends Player {
    constructor(id, name = 'Você') {
        super(id, name);
        this.selectedCard = null;
        this.selectedBet = null;
    }

    // Humano seleciona carta via UI
    selectCard(cardIndex) {
        this.selectedCard = cardIndex;
    }

    // Humano seleciona palpite via UI
    selectBet(bet) {
        this.selectedBet = bet;
    }

    // Joga a carta selecionada
    playCard(gameState) {
        if (this.selectedCard !== null) {
            const card = this.hand.playCard(this.selectedCard);
            this.selectedCard = null;
            return card;
        }
        return null;
    }

    // Faz o palpite selecionado
    makeBet(gameState) {
        if (this.selectedBet !== null) {
            this.bet = this.selectedBet;
            this.selectedBet = null;
            return this.bet;
        }
        return null;
    }

    // Verifica se já selecionou carta
    hasSelectedCard() {
        return this.selectedCard !== null;
    }

    // Verifica se já selecionou palpite
    hasSelectedBet() {
        return this.selectedBet !== null;
    }
}
