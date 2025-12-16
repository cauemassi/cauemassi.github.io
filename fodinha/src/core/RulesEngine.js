// RulesEngine.js - Implementa as regras do Truco Paulista para Fodinha
import { Card } from '../cards/Card.js';

export class RulesEngine {
    constructor() {
        this.manilhaValue = null;
    }

    // Define qual é a manilha baseado na carta virada (vira)
    setVira(viraCard) {
        const hierarchy = Card.getValueHierarchy();
        const viraIndex = hierarchy.indexOf(viraCard.value);
        
        // A manilha é a carta imediatamente acima na hierarquia
        // Se for '3' (última), volta para '4' (primeira)
        const manilhaIndex = (viraIndex + 1) % hierarchy.length;
        this.manilhaValue = hierarchy[manilhaIndex];
        
        return this.manilhaValue;
    }

    // Retorna o valor da manilha atual
    getManilha() {
        return this.manilhaValue;
    }

    // Verifica se uma carta é manilha
    isManilha(card) {
        return card.value === this.manilhaValue;
    }

    // Retorna a força da carta considerando manilhas
    // Retorna: { strength: number, isManilha: boolean }
    getCardStrength(card) {
        const isManilha = this.isManilha(card);
        
        if (isManilha) {
            // Manilhas: força baseada no naipe
            const suitHierarchy = Card.getSuitHierarchy();
            const suitStrength = suitHierarchy.indexOf(card.suit);
            // Manilhas têm força 1000+ para sempre vencerem cartas normais
            return { strength: 1000 + suitStrength, isManilha: true };
        } else {
            // Cartas normais: força baseada na hierarquia de valores
            const valueHierarchy = Card.getValueHierarchy();
            const valueStrength = valueHierarchy.indexOf(card.value);
            return { strength: valueStrength, isManilha: false };
        }
    }

    // Determina o vencedor de uma vaza
    // Recebe array de { card, playerId }
    // Retorna o playerId do vencedor ou null se empate
    determineWinner(playedCards) {
        if (!playedCards || playedCards.length === 0) {
            return null;
        }

        // Separa manilhas e cartas normais
        const manilhas = [];
        const normalCards = [];

        for (const played of playedCards) {
            const cardStrength = this.getCardStrength(played.card);
            if (cardStrength.isManilha) {
                manilhas.push({ ...played, strength: cardStrength.strength });
            } else {
                normalCards.push({ ...played, strength: cardStrength.strength });
            }
        }

        // Se há manilhas, a mais forte vence
        if (manilhas.length > 0) {
            let strongest = manilhas[0];
            for (let i = 1; i < manilhas.length; i++) {
                if (manilhas[i].strength > strongest.strength) {
                    strongest = manilhas[i];
                }
            }
            return strongest.playerId;
        }

        // Se não há manilhas, verifica cartas normais
        // REGRA ESPECIAL: Se duas ou mais cartas normais com mesmo valor, empate = todos perdem
        const valueGroups = {};
        for (const played of normalCards) {
            const value = played.card.value;
            if (!valueGroups[value]) {
                valueGroups[value] = [];
            }
            valueGroups[value].push(played);
        }

        // Remove grupos com mais de uma carta (empate)
        const validCards = [];
        for (const value in valueGroups) {
            if (valueGroups[value].length === 1) {
                validCards.push(valueGroups[value][0]);
            }
        }

        // Se não sobrou nenhuma carta válida, ninguém ganha
        if (validCards.length === 0) {
            return null;
        }

        // Encontra a carta mais forte entre as válidas
        let strongest = { ...validCards[0], strength: this.getCardStrength(validCards[0].card).strength };
        for (let i = 1; i < validCards.length; i++) {
            const strength = this.getCardStrength(validCards[i].card).strength;
            if (strength > strongest.strength) {
                strongest = { ...validCards[i], strength };
            }
        }

        return strongest.playerId;
    }

    // Valida se um palpite é permitido (regra do último jogador)
    validateBet(bet, currentBets, numCards, isLastPlayer) {
        if (bet < 0 || bet > numCards) {
            return false;
        }

        // Se é o último jogador, não pode fazer a soma = numCards
        if (isLastPlayer) {
            const totalBets = currentBets.reduce((sum, b) => sum + b, 0) + bet;
            if (totalBets === numCards) {
                return false; // Aposta inválida
            }
        }

        return true;
    }

    // Gera as opções de aposta válidas para um jogador
    getValidBets(currentBets, numCards, isLastPlayer) {
        const validBets = [];
        
        for (let bet = 0; bet <= numCards; bet++) {
            if (this.validateBet(bet, currentBets, numCards, isLastPlayer)) {
                validBets.push(bet);
            }
        }

        return validBets;
    }
}
