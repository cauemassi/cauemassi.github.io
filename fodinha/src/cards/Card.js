// Card.js - Representa uma carta do baralho
export class Card {
    constructor(value, suit) {
        this.value = value; // '4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'
        this.suit = suit;   // 'C' (Paus), 'H' (Copas), 'S' (Espadas), 'D' (Ouros)
    }

    // Retorna a hierarquia base do Truco (sem considerar manilha)
    static getValueHierarchy() {
        return ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
    }

    // Retorna a hierarquia dos naipes (para manilhas)
    static getSuitHierarchy() {
        return ['D', 'S', 'H', 'C']; // Ouros > Espadas > Copas > Paus
    }

    // Retorna o símbolo do naipe
    getSuitSymbol() {
        const symbols = {
            'C': '♣',
            'H': '♥',
            'S': '♠',
            'D': '♦'
        };
        return symbols[this.suit];
    }

    // Retorna o nome do naipe
    getSuitName() {
        const names = {
            'C': 'Paus',
            'H': 'Copas',
            'S': 'Espadas',
            'D': 'Ouros'
        };
        return names[this.suit];
    }

    // Verifica se a carta é vermelha
    isRed() {
        return this.suit === 'H' || this.suit === 'D';
    }

    // Retorna string da carta para debugging
    toString() {
        return `${this.value}${this.getSuitSymbol()}`;
    }
}
