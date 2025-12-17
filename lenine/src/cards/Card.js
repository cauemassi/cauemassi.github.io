// Card class - Represents a single playing card
export class Card {
    static SUITS = {
        SPADES: 'spades',
        HEARTS: 'hearts',
        DIAMONDS: 'diamonds',
        CLUBS: 'clubs'
    };

    static SUIT_SYMBOLS = {
        spades: '♠',
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣'
    };

    static RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = false;
        this.element = null;
        this.id = `${suit}-${rank}`;
    }

    get value() {
        return Card.RANKS.indexOf(this.rank) + 1;
    }

    get color() {
        return (this.suit === Card.SUITS.HEARTS || this.suit === Card.SUITS.DIAMONDS) ? 'red' : 'black';
    }

    get suitSymbol() {
        return Card.SUIT_SYMBOLS[this.suit];
    }

    flip() {
        this.faceUp = !this.faceUp;
        if (this.element) {
            this.updateElement();
        }
    }

    createElement() {
        const card = document.createElement('div');
        card.className = `card ${this.color} ${this.faceUp ? '' : 'face-down'}`;
        card.dataset.cardId = this.id;
        card.dataset.suit = this.suit;
        card.dataset.rank = this.rank;

        if (this.faceUp) {
            card.innerHTML = `
                <div class="card-content">
                    <span class="card-rank">${this.rank}</span>
                    <span class="card-suit">${this.suitSymbol}</span>
                </div>
            `;
        }

        this.element = card;
        return card;
    }

    updateElement() {
        if (!this.element) return;

        this.element.className = `card ${this.color} ${this.faceUp ? '' : 'face-down'}`;
        
        if (this.faceUp) {
            this.element.innerHTML = `
                <div class="card-content">
                    <span class="card-rank">${this.rank}</span>
                    <span class="card-suit">${this.suitSymbol}</span>
                </div>
            `;
        } else {
            this.element.innerHTML = '';
        }
    }

    toString() {
        return `${this.rank}${this.suitSymbol}`;
    }
}
