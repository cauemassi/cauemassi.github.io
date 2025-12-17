import { Pile } from './Pile.js';

// StockPile - The draw pile
export class StockPile extends Pile {
    constructor(id, element) {
        super('stock', id);
        this.element = element;
    }

    canPickCard() {
        return false;
    }

    canAccept() {
        return false;
    }

    canRemove() {
        return !this.isEmpty();
    }

    draw() {
        if (this.isEmpty()) {
            return null;
        }
        const card = this.removeCard();
        card.faceUp = true;
        return card;
    }

    refill(cards) {
        // Add cards back to stock (from waste when recycling)
        this.cards = cards.reverse();
        this.cards.forEach(card => {
            card.faceUp = false;
        });
    }
}
