// Base Pile class - Foundation for all pile types
export class Pile {
    constructor(type, id) {
        this.type = type;
        this.id = id;
        this.cards = [];
        this.element = null;
    }

    addCard(card) {
        this.cards.push(card);
        return card;
    }

    addCards(cards) {
        this.cards.push(...cards);
        return cards;
    }

    removeCard(card) {
        if (card) {
            const index = this.cards.indexOf(card);
            if (index !== -1) {
                return this.cards.splice(index, 1)[0];
            }
            return null;
        }
        return this.cards.pop();
    }

    removeTopCard() {
        return this.cards.pop();
    }

    removeCards(count) {
        return this.cards.splice(-count, count);
    }

    getTopCard() {
        return this.cards[this.cards.length - 1] || null;
    }

    getCards(fromIndex) {
        return this.cards.slice(fromIndex);
    }

    getAllCards() {
        return [...this.cards];
    }

    isEmpty() {
        return this.cards.length === 0;
    }

    get length() {
        return this.cards.length;
    }

    clear() {
        this.cards = [];
    }

    canAccept(card, fromPile) {
        // Override in subclasses
        return false;
    }

    canPickCard(card) {
        // Override in subclasses
        return this.canRemove(card);
    }

    canRemove(card) {
        // Override in subclasses
        return false;
    }

    getCardsFrom(card) {
        const index = this.cards.indexOf(card);
        if (index === -1) return [];
        return this.cards.slice(index);
    }
}
