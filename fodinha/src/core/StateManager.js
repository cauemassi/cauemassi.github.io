// StateManager.js - Gerencia o estado do jogo
export class StateManager {
    constructor() {
        this.state = {
            // Estado do jogo
            phase: 'MENU', // MENU, RULES, BETTING, PLAYING, ROUND_END, GAME_END
            
            // Rodada
            roundNumber: 1,
            numCards: 1, // Quantidade de cartas na rodada
            viraCard: null,
            
            // Vaza
            currentTrickNumber: 1,
            currentTrick: [], // Array de { card, playerId }
            currentPlayerIndex: 0,
            startingPlayerIndex: 0, // Jogador que inicia a rodada
            
            // Jogadores
            players: [],
            humanPlayer: null,
            
            // Pontuação
            bestScore: 0
        };
    }

    // Retorna o estado atual
    getState() {
        return this.state;
    }

    // Define uma propriedade do estado
    setState(key, value) {
        this.state[key] = value;
    }

    // Define múltiplas propriedades
    updateState(updates) {
        Object.assign(this.state, updates);
    }

    // Retorna o jogador atual
    getCurrentPlayer() {
        return this.state.players[this.state.currentPlayerIndex];
    }

    // Avança para o próximo jogador (sentido anti-horário visual)
    // Ordem visual na tela: Player 0 (fundo) → Player 3 (direita) → Player 1 (topo) → Player 2 (esquerda)
    nextPlayer() {
        const visualOrder = [0, 3, 1, 2]; // Sequência anti-horária visual
        
        do {
            const currentPosition = visualOrder.indexOf(this.state.currentPlayerIndex);
            const nextPosition = (currentPosition + 1) % visualOrder.length;
            this.state.currentPlayerIndex = visualOrder[nextPosition];
        } while (this.getCurrentPlayer().isEliminated);
    }

    // Define o jogador inicial da vaza
    setCurrentPlayer(playerId) {
        this.state.currentPlayerIndex = this.state.players.findIndex(p => p.id === playerId);
    }

    // Adiciona carta à vaza atual
    addToTrick(card, playerId) {
        this.state.currentTrick.push({ card, playerId });
    }

    // Limpa a vaza atual
    clearTrick() {
        this.state.currentTrick = [];
    }

    // Incrementa número da vaza
    nextTrick() {
        this.state.currentTrickNumber++;
        this.clearTrick();
    }

    // Reseta para nova rodada
    resetForRound() {
        this.state.currentTrickNumber = 1;
        this.clearTrick();
    }

    // Calcula o número de cartas da próxima rodada
    getNextRoundCards() {
        const sequence = [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1];
        const currentIndex = sequence.indexOf(this.state.numCards);
        
        if (currentIndex === -1 || currentIndex >= sequence.length - 1) {
            return 1; // Recomeça
        }
        
        return sequence[currentIndex + 1];
    }

    // Retorna jogadores ativos (não eliminados)
    getActivePlayers() {
        return this.state.players.filter(p => !p.isEliminated);
    }

    // Verifica se o jogo acabou
    isGameOver() {
        return this.getActivePlayers().length === 1;
    }
}
