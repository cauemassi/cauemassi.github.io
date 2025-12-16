// AIEngine.js - Inteligência artificial para os jogadores CPU
import { Card } from '../cards/Card.js';

export class AIEngine {
    constructor() {
        this.difficulty = 'medium'; // easy, medium, hard
    }

    // IA faz um palpite baseado nas cartas que tem
    makeBet(player, gameState) {
        const hand = player.hand.getCards();
        const numCards = hand.length;
        const rulesEngine = gameState.rulesEngine;
        
        // Analisa a força da mão
        let strongCards = 0;
        let manilhas = 0;

        for (const card of hand) {
            if (rulesEngine.isManilha(card)) {
                manilhas++;
                strongCards++;
            } else {
                const strength = rulesEngine.getCardStrength(card).strength;
                // Considera fortes: A, 2, 3, K
                if (strength >= 7) {
                    strongCards++;
                }
            }
        }

        // Calcula palpite baseado nas cartas fortes
        let bet = Math.floor(strongCards * 0.7); // Conservador
        
        // Adiciona alguma aleatoriedade
        if (Math.random() > 0.7) {
            bet = Math.min(bet + 1, numCards);
        }

        // Verifica se é o último a apostar
        const currentBets = gameState.players
            .filter(p => p.bet !== null && p.id !== player.id)
            .map(p => p.bet);
        
        const isLastPlayer = currentBets.length === gameState.players.length - 1;
        
        // Valida a aposta
        const validBets = rulesEngine.getValidBets(currentBets, numCards, isLastPlayer);
        
        if (!validBets.includes(bet)) {
            // Se a aposta não é válida, escolhe a mais próxima
            if (validBets.length > 0) {
                bet = validBets.reduce((prev, curr) => 
                    Math.abs(curr - bet) < Math.abs(prev - bet) ? curr : prev
                );
            } else {
                bet = 0;
            }
        }

        return bet;
    }

    // IA escolhe qual carta jogar
    chooseCard(player, gameState) {
        const hand = player.hand.getCards();
        const rulesEngine = gameState.rulesEngine;
        const currentTrick = gameState.currentTrick;
        const bet = player.bet;
        const tricksWon = player.tricksWon;
        const tricksRemaining = gameState.numCards - gameState.currentTrickNumber + 1;
        
        // Calcula quantas vazas ainda precisa ganhar
        const tricksNeeded = bet - tricksWon;
        
        // Se já ganhou o suficiente, joga cartas fracas
        if (tricksNeeded <= 0) {
            return this.playWeakestCard(hand, rulesEngine);
        }

        // Se precisa ganhar todas as restantes, joga forte
        if (tricksNeeded >= tricksRemaining) {
            return this.playStrongestCard(hand, rulesEngine);
        }

        // Se é o primeiro a jogar na vaza
        if (currentTrick.length === 0) {
            // Joga carta média
            return this.playMediumCard(hand, rulesEngine);
        }

        // Se já tem cartas na mesa, decide se tenta ganhar
        const winningCard = this.findWinningCard(hand, currentTrick, rulesEngine);
        
        if (winningCard !== null) {
            // Decide se vale a pena tentar ganhar
            if (tricksNeeded > tricksRemaining / 2) {
                return winningCard; // Precisa ganhar, tenta
            } else {
                // Não precisa urgentemente, 50% de chance
                return Math.random() > 0.5 ? winningCard : this.playWeakestCard(hand, rulesEngine);
            }
        } else {
            // Não pode ganhar, joga fraca
            return this.playWeakestCard(hand, rulesEngine);
        }
    }

    // Encontra a carta mais fraca
    playWeakestCard(hand, rulesEngine) {
        let weakestIndex = 0;
        let weakestStrength = rulesEngine.getCardStrength(hand[0]).strength;

        for (let i = 1; i < hand.length; i++) {
            const strength = rulesEngine.getCardStrength(hand[i]).strength;
            if (strength < weakestStrength) {
                weakestStrength = strength;
                weakestIndex = i;
            }
        }

        return weakestIndex;
    }

    // Encontra a carta mais forte
    playStrongestCard(hand, rulesEngine) {
        let strongestIndex = 0;
        let strongestStrength = rulesEngine.getCardStrength(hand[0]).strength;

        for (let i = 1; i < hand.length; i++) {
            const strength = rulesEngine.getCardStrength(hand[i]).strength;
            if (strength > strongestStrength) {
                strongestStrength = strength;
                strongestIndex = i;
            }
        }

        return strongestIndex;
    }

    // Encontra uma carta média
    playMediumCard(hand, rulesEngine) {
        if (hand.length <= 2) {
            return 0;
        }

        const strengths = hand.map((card, index) => ({
            index,
            strength: rulesEngine.getCardStrength(card).strength
        }));

        strengths.sort((a, b) => a.strength - b.strength);
        
        // Retorna a carta do meio
        return strengths[Math.floor(strengths.length / 2)].index;
    }

    // Encontra uma carta que pode ganhar a vaza atual
    findWinningCard(hand, currentTrick, rulesEngine) {
        // Determina a força da carta mais forte na mesa
        let highestStrength = -1;
        for (const played of currentTrick) {
            const strength = rulesEngine.getCardStrength(played.card).strength;
            if (strength > highestStrength) {
                highestStrength = strength;
            }
        }

        // Procura a carta mais fraca que ainda vence
        let bestIndex = null;
        let bestStrength = Infinity;

        for (let i = 0; i < hand.length; i++) {
            const strength = rulesEngine.getCardStrength(hand[i]).strength;
            if (strength > highestStrength && strength < bestStrength) {
                bestStrength = strength;
                bestIndex = i;
            }
        }

        return bestIndex;
    }
}
