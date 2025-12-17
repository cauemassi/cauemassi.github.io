// RulesEngine - Validates moves and provides hints
export class RulesEngine {
    constructor() {
        // No need for game state in constructor
    }

    canMove(card, fromPile, toPile) {
        if (!card || !fromPile || !toPile) {
            return false;
        }

        // Can't move to same pile
        if (fromPile === toPile) {
            return false;
        }

        // Check if card can be removed from source
        if (!fromPile.canRemove(card)) {
            return false;
        }

        // Get cards to move
        let cardsToMove = [card];
        if (fromPile.type === 'tableau') {
            const allCards = fromPile.getCardsFrom(card);
            if (allCards.length > 1 && toPile.type === 'foundation') {
                // Foundation only accepts single cards
                return false;
            }
            cardsToMove = allCards;
        }

        // Check if destination accepts
        return toPile.canAccept(cardsToMove.length === 1 ? cardsToMove[0] : cardsToMove, fromPile);
    }

    findValidMoves() {
        const moves = [];
        const { tableau, foundations, waste } = this.gameState;

        // Check waste to tableau/foundation
        if (waste && !waste.isEmpty()) {
            const wasteCard = waste.getTopCard();
            
            // To foundations
            foundations.forEach(foundation => {
                if (foundation.canAccept(wasteCard)) {
                    moves.push({
                        card: wasteCard,
                        from: waste,
                        to: foundation,
                        priority: 10
                    });
                }
            });

            // To tableau
            tableau.forEach(pile => {
                if (pile.canAccept(wasteCard, waste)) {
                    moves.push({
                        card: wasteCard,
                        from: waste,
                        to: pile,
                        priority: 5
                    });
                }
            });
        }

        // Check tableau to foundation/tableau
        tableau.forEach(fromPile => {
            if (fromPile.isEmpty()) return;

            const topCard = fromPile.getTopCard();
            if (!topCard.faceUp) return;

            // To foundations
            foundations.forEach(foundation => {
                if (foundation.canAccept(topCard)) {
                    moves.push({
                        card: topCard,
                        from: fromPile,
                        to: foundation,
                        priority: 10
                    });
                }
            });

            // To other tableau piles
            tableau.forEach(toPile => {
                if (fromPile === toPile) return;
                
                const movableCards = fromPile.cards.filter(c => c.faceUp);
                movableCards.forEach(card => {
                    if (fromPile.canRemove(card) && toPile.canAccept(card, fromPile)) {
                        moves.push({
                            card: card,
                            from: fromPile,
                            to: toPile,
                            priority: toPile.isEmpty() ? 3 : 5
                        });
                    }
                });
            });
        });

        // Sort by priority (higher priority first)
        return moves.sort((a, b) => b.priority - a.priority);
    }

    getHint() {
        const moves = this.findValidMoves();
        return moves.length > 0 ? moves[0] : null;
    }

    canAutoComplete() {
        // Check if all cards are revealed
        const { tableau } = this.gameState;
        
        for (const pile of tableau) {
            for (const card of pile.cards) {
                if (!card.faceUp) {
                    return false;
                }
            }
        }

        return true;
    }

    isGameWon() {
        const { foundations } = this.gameState;
        return foundations.every(foundation => foundation.isComplete());
    }

    autoMove(card, fromPile) {
        // Try to move to foundation automatically
        const { foundations } = this.gameState;
        
        for (const foundation of foundations) {
            if (foundation.canAccept(card)) {
                return foundation;
            }
        }

        return null;
    }
}
