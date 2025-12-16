// GameController.js - Controlador principal do jogo
import { Deck } from '../cards/Deck.js';
import { RulesEngine } from './RulesEngine.js';
import { StateManager } from './StateManager.js';
import { HumanPlayer } from '../players/HumanPlayer.js';
import { AIPlayer } from '../players/AIPlayer.js';

export class GameController {
    constructor(renderer) {
        this.stateManager = new StateManager();
        this.rulesEngine = new RulesEngine();
        this.renderer = renderer;
        this.deck = new Deck();
        
        this.bettingCallback = null;
        this.playingCallback = null;
    }

    // Inicializa um novo jogo
    startNewGame() {
        const state = this.stateManager.getState();
        
        // Cria os jogadores
        const players = [
            new HumanPlayer(0, 'Você'),
            new AIPlayer(1, 'Jogador 2'),
            new AIPlayer(2, 'Jogador 3'),
            new AIPlayer(3, 'Jogador 4')
        ];

        // Reseta todos os jogadores
        players.forEach(p => p.resetForGame());

        // Sorteia quem começa (0-3)
        const startingPlayer = Math.floor(Math.random() * 4);

        this.stateManager.updateState({
            players,
            humanPlayer: players[0],
            roundNumber: 1,
            numCards: 1,
            phase: 'PLAYING',
            currentPlayerIndex: startingPlayer,
            startingPlayerIndex: startingPlayer
        });

        this.renderer.showGameScreen();
        this.startNewRound();
    }

    // Inicia uma nova rodada
    startNewRound() {
        const state = this.stateManager.getState();
        
        // Reseta jogadores para a rodada
        state.players.forEach(p => {
            if (!p.isEliminated) {
                p.resetForRound();
            }
        });

        this.stateManager.resetForRound();
        
        // Embaralha e distribui cartas
        this.deck.reset();
        this.deck.shuffle();

        // Distribui cartas
        for (let i = 0; i < state.numCards; i++) {
            for (const player of state.players) {
                if (!player.isEliminated) {
                    player.receiveCard(this.deck.draw());
                }
            }
        }

        // Vira uma carta (vira)
        const viraCard = this.deck.draw();
        this.stateManager.setState('viraCard', viraCard);
        this.rulesEngine.setVira(viraCard);

        // Renderiza o estado inicial
        this.renderer.render(this.getGameState());

        // Inicia fase de apostas
        this.startBettingPhase();
    }

    // Fase de apostas
    async startBettingPhase() {
        this.stateManager.setState('phase', 'BETTING');
        const state = this.stateManager.getState();
        
        // Usa o jogador inicial definido (anti-horário)
        this.stateManager.setState('currentPlayerIndex', state.startingPlayerIndex);

        // Notifica quem vai começar
        const startingPlayer = state.players[state.startingPlayerIndex];
        await this.renderer.showNotification(
            `${startingPlayer.name} vai começar a rodada!`,
            3000
        );

        // Coleta apostas de cada jogador
        for (let i = 0; i < state.players.length; i++) {
            const player = this.stateManager.getCurrentPlayer();
            
            if (!player.isEliminated) {
                this.renderer.render(this.getGameState());
                
                if (player instanceof HumanPlayer) {
                    // Espera jogador humano apostar
                    await this.waitForHumanBet();
                } else {
                    // IA aposta
                    await this.sleep(800);
                    player.makeBet(this.getGameState());
                    
                    // Mostra notificação
                    await this.renderer.showNotification(
                        `${player.name} apostou ${player.bet} rodada${player.bet !== 1 ? 's' : ''}`,
                        3000
                    );
                    
                    this.renderer.render(this.getGameState());
                }
            }
            
            this.stateManager.nextPlayer();
        }

        // Inicia fase de jogo
        this.startPlayingPhase();
    }

    // Fase de jogo (vazas)
    async startPlayingPhase() {
        this.stateManager.setState('phase', 'PLAYING');
        const state = this.stateManager.getState();

        // Joga todas as vazas da rodada
        for (let trick = 0; trick < state.numCards; trick++) {
            await this.playTrick();
        }

        // Fim da rodada
        this.endRound();
    }

    // Joga uma vaza completa
    async playTrick() {
        const state = this.stateManager.getState();
        this.stateManager.clearTrick();

        // Cada jogador joga uma carta
        for (let i = 0; i < state.players.length; i++) {
            const player = this.stateManager.getCurrentPlayer();
            
            if (!player.isEliminated) {
                this.renderer.render(this.getGameState());
                
                if (player instanceof HumanPlayer) {
                    // Espera jogador humano jogar
                    await this.waitForHumanPlay();
                    const card = player.playCard(this.getGameState());
                    this.stateManager.addToTrick(card, player.id);
                } else {
                    // IA joga
                    await this.sleep(1000);
                    const card = player.playCard(this.getGameState());
                    this.stateManager.addToTrick(card, player.id);
                    
                    // Mostra notificação
                    await this.renderer.showNotification(
                        `${player.name} jogou ${card.value}${card.getSuitSymbol()}`,
                        3000
                    );
                }
                
                this.renderer.render(this.getGameState());
            }
            
            this.stateManager.nextPlayer();
        }

        // Determina vencedor da vaza
        await this.sleep(1500);
        const winnerId = this.rulesEngine.determineWinner(state.currentTrick);
        
        // Mostra resumo da rodada
        await this.renderer.showTrickSummary(
            state.currentTrick,
            winnerId,
            state.players,
            this.rulesEngine
        );
        
        if (winnerId !== null) {
            const winner = state.players.find(p => p.id === winnerId);
            winner.winTrick();
            this.stateManager.setCurrentPlayer(winnerId);
        }

        this.stateManager.nextTrick();
        await this.sleep(500);
    }

    // Fim da rodada
    endRound() {
        const state = this.stateManager.getState();
        
        // Verifica apostas e atualiza pontos
        for (const player of state.players) {
            if (!player.isEliminated) {
                if (!player.checkBet()) {
                    player.losePoint();
                }
            }
        }

        // Verifica se o jogo acabou
        if (this.stateManager.isGameOver()) {
            this.endGame();
        } else {
            this.stateManager.setState('phase', 'ROUND_END');
            this.renderer.showRoundEnd(this.getGameState());
        }
    }

    // Próxima rodada
    nextRound() {
        const state = this.stateManager.getState();
        
        // Ordem visual anti-horária: 0 → 3 → 1 → 2
        const visualOrder = [0, 3, 1, 2];
        
        // Encontra a posição atual na ordem visual
        const currentPosition = visualOrder.indexOf(state.startingPlayerIndex);
        
        // Próximo jogador na ordem visual (à direita no sentido anti-horário)
        let nextPosition = (currentPosition + 1) % visualOrder.length;
        let nextStarter = visualOrder[nextPosition];
        
        // Pula jogadores eliminados
        let attempts = 0;
        while (state.players[nextStarter].isEliminated && attempts < 4) {
            nextPosition = (nextPosition + 1) % visualOrder.length;
            nextStarter = visualOrder[nextPosition];
            attempts++;
        }
        
        this.stateManager.updateState({
            roundNumber: state.roundNumber + 1,
            numCards: this.stateManager.getNextRoundCards(),
            startingPlayerIndex: nextStarter
        });

        this.startNewRound();
    }

    // Fim do jogo
    endGame() {
        const state = this.stateManager.getState();
        
        // Atualiza melhor pontuação se jogador humano ganhou
        const winner = this.stateManager.getActivePlayers()[0];
        if (winner instanceof HumanPlayer) {
            const currentBest = this.loadBestScore();
            if (winner.points > currentBest) {
                this.saveBestScore(winner.points);
                state.bestScore = winner.points;
            }
        }

        this.stateManager.setState('phase', 'GAME_END');
        this.renderer.showGameEnd(this.getGameState());
    }

    // Aguarda aposta do jogador humano
    waitForHumanBet() {
        return new Promise(resolve => {
            this.bettingCallback = resolve;
        });
    }

    // Aguarda jogada do jogador humano
    waitForHumanPlay() {
        return new Promise(resolve => {
            this.playingCallback = resolve;
        });
    }

    // Jogador humano fez aposta
    onHumanBet(bet) {
        const state = this.stateManager.getState();
        state.humanPlayer.selectBet(bet);
        state.humanPlayer.makeBet(this.getGameState());
        
        if (this.bettingCallback) {
            this.bettingCallback();
            this.bettingCallback = null;
        }
    }

    // Jogador humano jogou carta
    onHumanPlay(cardIndex) {
        const state = this.stateManager.getState();
        state.humanPlayer.selectCard(cardIndex);
        
        if (this.playingCallback) {
            this.playingCallback();
            this.playingCallback = null;
        }
    }

    // Retorna o estado do jogo para renderização
    getGameState() {
        const state = this.stateManager.getState();
        return {
            ...state,
            rulesEngine: this.rulesEngine
        };
    }

    // Salva melhor pontuação
    saveBestScore(score) {
        localStorage.setItem('fodinha_best_score', score.toString());
    }

    // Carrega melhor pontuação
    loadBestScore() {
        const score = localStorage.getItem('fodinha_best_score');
        return score ? parseInt(score) : 0;
    }

    // Utilitário para delay
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
