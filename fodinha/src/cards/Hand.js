// Hand.js - Gerencia a mão de cartas de um jogador
export class Hand {
    constructor() {
        this.cards = [];
    }

    // Adiciona uma carta à mão
    addCard(card) {
        this.cards.push(card);
    }

    // Remove e retorna uma carta pelo índice
    playCard(index) {
        if (index >= 0 && index < this.cards.length) {
            return this.cards.splice(index, 1)[0];
        }
        return null;
    }

    // Remove e retorna uma carta específica
    removeCard(card) {
        const index = this.cards.indexOf(card);
        if (index !== -1) {
            return this.cards.splice(index, 1)[0];
        }
        return null;
    }

    // Retorna todas as cartas
    getCards() {
        return this.cards;
    }

    // Retorna quantidade de cartas
    count() {
        return this.cards.length;
    }

    // Limpa a mão
    clear() {
        this.cards = [];
    }

    // Verifica se tem uma carta específica
    hasCard(card) {
        return this.cards.includes(card);
    }
}
