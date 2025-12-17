import { Pile } from './Pile.js';

// WastePile - Receives cards drawn from stock
export class WastePile extends Pile {
    constructor(id, element) {
        super('waste', id);
        this.element = element;
    }

    canPickCard(card) {
        return this.canRemove(card);
    }

    canAccept() {
        // Only accepts from stock internally
        return false;
    }

    canRemove(card) {
        // Can only remove top card
        return card === this.getTopCard();
    }

    receiveFromStock(card) {
        if (card) {
            card.faceUp = true;
            this.addCard(card);
        }
    }
}
