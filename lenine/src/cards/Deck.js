import { Card } from './Card.js';

// Deck class - Creates and manages a standard 52-card deck
export class Deck {
    constructor() {
        this.cards = [];
        this.initialize();
    }

    initialize() {
        this.cards = [];
        const suits = Object.values(Card.SUITS);
        
        for (const suit of suits) {
            for (const rank of Card.RANKS) {
                this.cards.push(new Card(suit, rank));
            }
        }
    }

    shuffle() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this;
    }

    deal(count = 1) {
        return this.cards.splice(0, count);
    }

    drawCard() {
        return this.cards.shift();
    }

    isEmpty() {
        return this.cards.length === 0;
    }

    get remaining() {
        return this.cards.length;
    }

    reset() {
        this.initialize();
        return this;
    }
}
