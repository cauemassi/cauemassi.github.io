import { Board } from '../board/board.js';
import { MoveValidator } from '../rules/move-validator.js';
import { RulesEngine } from '../rules/rules-engine.js';
import { AIService } from '../ai/ai-service.js';
import { DialogueManager } from '../ai/dialogue-manager.js';
import { StateManager } from './state-manager.js';
import { Renderer } from '../ui/renderer.js';
import { StorageService } from '../utils/storage.js';
import { STATES, PLAYER } from '../utils/constants.js';

export class GameController {
    constructor() {
        this.stateManager = new StateManager();
        this.renderer = new Renderer();
        this.dialogueManager = new DialogueManager();
        
        this.board = null;
        this.moveValidator = null;
        this.rulesEngine = null;
        this.aiService = null;
        
        this.config = null;
        this.currentPlayer = null;
        this.selectedPiece = null;
        this.validMovesForSelected = [];
        
        this.score = StorageService.getScore();
        this.renderer.updateScore(this.score.playerWins, this.score.aiWins);
        
        this.loadApiKey();
    }

    get state() {
        return this.stateManager.getState();
    }

    loadApiKey() {
        const apiKey = StorageService.getApiKey();
        const input = document.getElementById('api-key');
        if (input && apiKey) {
            input.value = apiKey;
        }
    }

    startGame(config) {
        this.config = config;
        
        // Save API key
        StorageService.saveApiKey(config.apiKey);
        
        // Initialize game components
        this.board = new Board();
        this.moveValidator = new MoveValidator(this.board);
        this.rulesEngine = new RulesEngine(this.board, this.moveValidator);
        this.aiService = new AIService(config.apiKey);
        
        // Set initial player
        this.currentPlayer = config.firstPlayer === 'player' ? PLAYER.HUMAN : PLAYER.AI;
        
        // Update UI
        this.renderer.showScreen('game-screen');
        this.renderer.updateDifficultyBadge(config.difficulty);
        this.renderer.renderBoard(this.board);
        this.renderer.showAIMessage(this.dialogueManager.getOpeningDialogue());
        
        // Start game
        if (this.currentPlayer === PLAYER.AI) {
            this.stateManager.setState(STATES.AI_TURN);
            this.executeAITurn();
        } else {
            this.stateManager.setState(STATES.PLAYER_TURN);
            this.renderer.updateTurnIndicator(PLAYER.HUMAN);
        }
    }

    handleCellClick(row, col) {
        console.log('Click na célula:', row, col, 'Estado:', this.state);
        
        if (this.state !== STATES.PLAYER_TURN) {
            console.log('Não é seu turno!');
            return;
        }

        const piece = this.board.getPiece(row, col);
        console.log('Peça na célula:', piece);
        
        // Selecting own piece
        if (piece && piece.owner === PLAYER.HUMAN) {
            console.log('Selecionando peça do jogador');
            this.selectPiece(row, col);
            return;
        }

        // Moving selected piece
        if (this.selectedPiece) {
            console.log('Tentando mover de', this.selectedPiece, 'para', row, col);
            this.tryMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
        } else {
            console.log('Nenhuma peça selecionada');
        }
    }

    selectPiece(row, col) {
        this.selectedPiece = { row, col };
        
        // Get valid moves for this piece
        const allValidMoves = this.moveValidator.getAllValidMoves(PLAYER.HUMAN);
        console.log('Total de movimentos válidos para o jogador:', allValidMoves.length);
        
        this.validMovesForSelected = allValidMoves.filter(move => 
            move.from.row === row && move.from.col === col
        );
        
        console.log('Movimentos válidos para esta peça:', this.validMovesForSelected.length);
        this.validMovesForSelected.forEach(move => {
            console.log(`  ${this.positionToNotation(move.from.row, move.from.col)} -> ${this.positionToNotation(move.to.row, move.to.col)}`);
        });
        
        this.renderer.selectCell(row, col);
        this.renderer.highlightValidMoves(this.validMovesForSelected);
    }
    
    positionToNotation(row, col) {
        const columns = 'abcdefgh';
        return columns[col] + (row + 1);
    }

    tryMove(fromRow, fromCol, toRow, toCol) {
        const move = this.validMovesForSelected.find(m => 
            m.to.row === toRow && m.to.col === toCol
        );

        if (!move) {
            this.renderer.clearSelection();
            this.selectedPiece = null;
            this.validMovesForSelected = [];
            return;
        }

        this.executeMove(move, true); // Animate player moves too
        this.selectedPiece = null;
        this.validMovesForSelected = [];
        
        // Wait for animation before continuing
        setTimeout(() => {
            // Check game over
            const gameOverResult = this.rulesEngine.checkGameOver();
            if (gameOverResult.isOver) {
                this.endGame(gameOverResult.winner);
                return;
            }

            // Switch to AI turn
            this.currentPlayer = PLAYER.AI;
            this.stateManager.setState(STATES.AI_TURN);
            this.executeAITurn();
        }, 650);
    }

    executeMove(move, animate = true) {
        console.log('=== EXECUTANDO MOVIMENTO ===');
        console.log('De:', this.positionToNotation(move.from.row, move.from.col));
        console.log('Para:', this.positionToNotation(move.to.row, move.to.col));
        console.log('Capturas:', move.captures.length);
        console.log('Animar:', animate);
        
        if (move.captures.length > 0) {
            console.log('Peças capturadas:');
            move.captures.forEach((cap, i) => {
                console.log(`  ${i + 1}. ${this.positionToNotation(cap.row, cap.col)}`);
            });
        }
        
        if (animate) {
            // Animate the move first
            this.renderer.animateMove(move.from, move.to, move.captures, () => {
                // Then execute the actual move
                try {
                    this.rulesEngine.executeMove(move);
                    this.renderer.renderBoard(this.board);
                } catch (error) {
                    console.error('ERRO ao executar movimento:', error);
                    alert('Erro ao executar movimento. Verifique o console (F12) para mais detalhes.');
                    throw error;
                }
            });
        } else {
            // No animation, execute immediately
            try {
                this.rulesEngine.executeMove(move);
                this.renderer.renderBoard(this.board);
            } catch (error) {
                console.error('ERRO ao executar movimento:', error);
                alert('Erro ao executar movimento. Verifique o console (F12) para mais detalhes.');
                throw error;
            }
        }
    }

    async executeAITurn() {
        this.renderer.updateTurnIndicator(PLAYER.AI);
        this.renderer.showLoading(true);
        
        await this.delay(500); // Brief delay for UX
        
        try {
            const validMoves = this.moveValidator.getAllValidMoves(PLAYER.AI);
            
            if (validMoves.length === 0) {
                this.endGame(PLAYER.HUMAN);
                return;
            }

            const move = await this.aiService.getMove(
                this.board, 
                this.config.difficulty, 
                validMoves,
                this.config.useAI !== false // Pass useAI flag
            );

            this.renderer.showLoading(false);
            
            if (!move) {
                this.endGame(PLAYER.HUMAN);
                return;
            }

            // Execute move with animation
            this.executeMove(move, true);
            
            // Wait for animation to complete before showing dialogue
            await this.delay(650);
            
            // Show AI dialogue with blink effect
            const dialogue = this.dialogueManager.getDialogueForMove(move, {
                playerPieceCount: this.rulesEngine.getPieceCount(PLAYER.HUMAN),
                aiPieceCount: this.rulesEngine.getPieceCount(PLAYER.AI)
            });
            this.renderer.showAIMessage(dialogue);
            
            // Check game over
            const gameOverResult = this.rulesEngine.checkGameOver();
            if (gameOverResult.isOver) {
                this.endGame(gameOverResult.winner);
                return;
            }

            // Switch to player turn
            this.currentPlayer = PLAYER.HUMAN;
            this.stateManager.setState(STATES.PLAYER_TURN);
            this.renderer.updateTurnIndicator(PLAYER.HUMAN);
            
        } catch (error) {
            console.error('Erro na jogada da IA:', error);
            this.renderer.showLoading(false);
            alert('Erro ao obter jogada da IA. Verifique sua API Key.');
            this.backToMenu();
        }
    }

    endGame(winner) {
        this.stateManager.setState(STATES.GAME_OVER);
        
        // Update score
        if (winner === PLAYER.HUMAN) {
            this.score.playerWins++;
        } else {
            this.score.aiWins++;
        }
        StorageService.saveScore(this.score.playerWins, this.score.aiWins);
        this.renderer.updateScore(this.score.playerWins, this.score.aiWins);
        
        // Show game over screen
        const message = winner === PLAYER.HUMAN 
            ? this.dialogueManager.getDefeatDialogue()
            : this.dialogueManager.getVictoryDialogue();
        
        this.renderer.showGameOver(winner, message);
    }

    surrender() {
        this.endGame(PLAYER.AI);
    }

    restart() {
        if (this.config) {
            this.startGame(this.config);
        }
    }

    backToMenu() {
        this.stateManager.setState(STATES.MENU);
        this.renderer.showScreen('menu-screen');
        this.board = null;
        this.selectedPiece = null;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
