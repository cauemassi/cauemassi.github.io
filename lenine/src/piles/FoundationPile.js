import { Pile } from './Pile.js';
import { Card } from '../cards/Card.js';

// FoundationPile - One of 4 suit-specific foundation piles
export class FoundationPile extends Pile {
    constructor(id, element, suit) {
        super('foundation', id);
        this.element = element;
        this.suit = suit;
        this.index = parseInt(id.split('-')[1]);
    }

    canPickCard(card) {
        return this.canRemove(card);
    }

    canAccept(card) {
        // Only accept single cards
        if (Array.isArray(card)) {
            return false;
        }

        // Must match suit
        if (card.suit !== this.suit) {
            return false;
        }

        // Empty: must be Ace
        if (this.isEmpty()) {
            return card.rank === 'A';
        }

        const topCard = this.getTopCard();
        
        // Must be next in sequence
        return card.value === topCard.value + 1;
    }

    canRemove(card) {
        // Can only remove the top card
        return card === this.getTopCard();
    }

    isComplete() {
        return this.cards.length === 13;
    }
}
