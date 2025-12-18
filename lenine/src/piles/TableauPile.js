import { Pile } from './Pile.js';

// TableauPile - Represents one of the 7 tableau columns
export class TableauPile extends Pile {
    constructor(id, element) {
        super('tableau', id);
        this.element = element;
        this.index = parseInt(id.split('-')[1]);
    }

    canPickCard(card) {
        return this.canRemove(card);
    }

    canAccept(cards, fromPile) {
        if (!Array.isArray(cards)) {
            cards = [cards];
        }

        const topCard = cards[0];
        
        // Empty pile: only Kings allowed
        if (this.isEmpty()) {
            return topCard.rank === 'K';
        }

        const targetCard = this.getTopCard();
        
        // Must be face up (carta do topo deve estar virada)
        if (!targetCard.faceUp) {
            return false;
        }

        // Must be opposite color
        if (topCard.color === targetCard.color) {
            return false;
        }

        // Must be one rank lower
        return topCard.value === targetCard.value - 1;
    }

    canRemove(card) {
        // Can only remove face-up cards
        if (!card.faceUp) {
            return false;
        }

        const cardIndex = this.cards.indexOf(card);
        if (cardIndex === -1) {
            return false;
        }

        // Check if all cards below are in valid sequence
        for (let i = cardIndex; i < this.cards.length - 1; i++) {
            const current = this.cards[i];
            const next = this.cards[i + 1];

            if (!current.faceUp || !next.faceUp) {
                return false;
            }

            if (current.color === next.color) {
                return false;
            }

            if (next.value !== current.value - 1) {
                return false;
            }
        }

        return true;
    }

    getMovableCards(card) {
        const cardIndex = this.cards.indexOf(card);
        if (cardIndex === -1 || !this.canRemove(card)) {
            return [];
        }
        return this.cards.slice(cardIndex);
    }

    revealTopCard() {
        if (!this.isEmpty()) {
            const topCard = this.getTopCard();
            if (!topCard.faceUp) {
                topCard.flip();
                return true;
            }
        }
        return false;
    }
}
