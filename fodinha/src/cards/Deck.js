// Deck.js - Gerencia o baralho de 40 cartas
import { Card } from './Card.js';

export class Deck {
    constructor() {
        this.cards = [];
        this.initializeDeck();
    }

    // Cria o baralho de 40 cartas (sem 8, 9, 10)
    initializeDeck() {
        const values = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
        const suits = ['C', 'H', 'S', 'D'];

        this.cards = [];
        for (const suit of suits) {
            for (const value of values) {
                this.cards.push(new Card(value, suit));
            }
        }
    }

    // Embaralha o baralho usando algoritmo Fisher-Yates
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    // Remove e retorna uma carta do topo
    draw() {
        return this.cards.pop();
    }

    // Retorna quantas cartas restam
    remaining() {
        return this.cards.length;
    }

    // Reseta o baralho
    reset() {
        this.initializeDeck();
    }
}
