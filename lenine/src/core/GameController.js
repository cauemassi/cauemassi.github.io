// GameController - Main game controller
import { StateManager } from './StateManager.js';
import { ScoreManager } from './ScoreManager.js';
import { Deck } from '../cards/Deck.js';
import { TableauPile } from '../piles/TableauPile.js';
import { FoundationPile } from '../piles/FoundationPile.js';
import { StockPile } from '../piles/StockPile.js';
import { WastePile } from '../piles/WastePile.js';
import { RulesEngine } from '../rules/RulesEngine.js';
import { Renderer } from '../ui/Renderer.js';
import { StorageService } from '../storage/StorageService.js';

export class GameController {
    constructor() {
        this.stateManager = new StateManager();
        this.scoreManager = new ScoreManager();
        this.rulesEngine = new RulesEngine();
        this.renderer = new Renderer();
        this.storage = new StorageService();
        
        this.deck = null;
        this.tableauPiles = [];
        this.foundationPiles = [];
        this.stockPile = null;
        this.wastePile = null;
        
        this.timer = null;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isPaused = false;
    }

    initialize() {
        this.renderer.initialize();
        this.setupPiles();
        this.loadBestScores();
    }

    setupPiles() {
        // Create tableau piles (7 columns)
        for (let i = 0; i < 7; i++) {
            const element = document.getElementById(`tableau-${i}`);
            const pile = new TableauPile(`tableau-${i}`, element);
            this.tableauPiles.push(pile);
        }
        
        // Create foundation piles (4 suits)
        const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
        suits.forEach((suit, i) => {
            const element = document.getElementById(`foundation-${i}`);
            const pile = new FoundationPile(`foundation-${i}`, element, suit);
            this.foundationPiles.push(pile);
        });
        
        // Create stock and waste piles
        const stockElement = document.getElementById('stock');
        const wasteElement = document.getElementById('waste');
        this.stockPile = new StockPile('stock', stockElement);
        this.wastePile = new WastePile('waste', wasteElement);
    }

    newGame() {
        this.resetGame();
        this.dealCards();
        this.startTimer();
        this.stateManager.setState(StateManager.STATES.PLAYING);
        this.render();
    }

    resetGame() {
        // Clear all piles
        this.tableauPiles.forEach(pile => pile.clear());
        this.foundationPiles.forEach(pile => pile.clear());
        this.stockPile.clear();
        this.wastePile.clear();
        
        // Reset score and timer
        this.scoreManager.reset();
        this.stopTimer();
        this.elapsedTime = 0;
        this.updateUI();
    }

    dealCards() {
        // Create and shuffle deck
        this.deck = new Deck();
        this.deck.shuffle();
        
        // Deal to tableau (standard Klondike setup)
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.deck.drawCard();
                const isLastCard = row === col;
                
                if (isLastCard) {
                    card.flip();
                }
                
                this.tableauPiles[col].addCard(card);
            }
        }
        
        // Remaining cards go to stock
        while (!this.deck.isEmpty()) {
            const card = this.deck.drawCard();
            this.stockPile.addCard(card);
        }
    }

    drawFromStock() {
        if (this.stockPile.isEmpty()) {
            // Recycle waste back to stock
            if (this.wastePile.isEmpty()) return;
            
            while (!this.wastePile.isEmpty()) {
                const card = this.wastePile.removeTopCard();
                card.faceUp = false;
                this.stockPile.addCard(card);
            }
            
            this.scoreManager.addScore(-20); // Penalty for recycling
            this.updateUI();
            this.render();
            return;
        }
        
        // Draw card from stock to waste
        const card = this.stockPile.removeTopCard();
        card.flip();
        this.wastePile.addCard(card);
        
        this.render();
    }

    tryMoveCard(card, sourcePile, targetPile) {
        if (!this.rulesEngine.canMove(card, sourcePile, targetPile)) {
            this.showInvalidMove();
            return false;
        }
        
        // Get all cards to move
        const cardsToMove = sourcePile.getCardsFrom(card);
        
        // Move cards
        cardsToMove.forEach(c => {
            sourcePile.removeCard(c);
            targetPile.addCard(c);
        });
        
        // Flip top card in source pile if needed
        if (!sourcePile.isEmpty() && sourcePile.type === 'tableau') {
            const topCard = sourcePile.getTopCard();
            if (!topCard.faceUp) {
                topCard.flip();
                this.scoreManager.addScore(5); // Reveal card bonus
            }
        }
        
        // Update score
        if (targetPile.type === 'foundation') {
            this.scoreManager.addScore(10);
        } else if (sourcePile.type === 'waste' && targetPile.type === 'tableau') {
            this.scoreManager.addScore(5);
        }
        
        this.updateUI();
        this.render();
        this.checkVictory();
        
        return true;
    }

    tryAutoMoveToFoundation(card, sourcePile) {
        // Try to move to matching foundation
        for (const foundation of this.foundationPiles) {
            if (foundation.suit === card.suit && this.rulesEngine.canMove(card, sourcePile, foundation)) {
                this.tryMoveCard(card, sourcePile, foundation);
                return true;
            }
        }
        return false;
    }

    canMoveCard(card, sourcePile, targetPile) {
        return this.rulesEngine.canMove(card, sourcePile, targetPile);
    }

    checkVictory() {
        // Check if all foundation piles are complete (13 cards each)
        const isComplete = this.foundationPiles.every(pile => pile.cards.length === 13);
        
        if (isComplete) {
            this.stopTimer();
            this.handleVictory();
        }
    }

    handleVictory() {
        this.stateManager.victory();
        
        const finalTime = this.elapsedTime;
        const finalScore = this.scoreManager.getScore();
        
        // Save statistics
        this.storage.recordWin(finalTime, finalScore);
        
        // Update UI
        document.getElementById('final-time').textContent = this.formatTime(finalTime);
        document.getElementById('final-score').textContent = finalScore;
        
        this.showModal('victory-modal');
    }

    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
                this.updateTimerDisplay();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    pauseTimer() {
        this.isPaused = true;
    }

    resumeTimer() {
        this.isPaused = false;
        this.startTime = Date.now() - (this.elapsedTime * 1000);
    }

    updateTimerDisplay() {
        const timeElement = document.getElementById('game-time');
        if (timeElement) {
            timeElement.textContent = this.formatTime(this.elapsedTime);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    updateUI() {
        this.updateTimerDisplay();
        const scoreElement = document.getElementById('game-score');
        if (scoreElement) {
            scoreElement.textContent = this.scoreManager.getScore();
        }
    }

    render() {
        // Render all piles
        this.tableauPiles.forEach(pile => this.renderer.renderPile(pile));
        this.foundationPiles.forEach(pile => this.renderer.renderPile(pile));
        this.renderer.renderPile(this.stockPile);
        this.renderer.renderPile(this.wastePile);
    }

    loadBestScores() {
        const stats = this.storage.getStatistics();
        
        const bestTimeEl = document.getElementById('best-time');
        const bestScoreEl = document.getElementById('best-score');
        
        if (stats.bestTime > 0) {
            bestTimeEl.textContent = this.formatTime(stats.bestTime);
        } else {
            bestTimeEl.textContent = '--:--';
        }
        
        if (stats.bestScore > 0) {
            bestScoreEl.textContent = stats.bestScore;
        } else {
            bestScoreEl.textContent = '---';
        }
    }

    showStatistics() {
        const stats = this.storage.getStatistics();
        
        document.getElementById('total-games').textContent = stats.gamesPlayed;
        document.getElementById('wins').textContent = stats.wins;
        
        const winRate = stats.gamesPlayed > 0 
            ? Math.round((stats.wins / stats.gamesPlayed) * 100) 
            : 0;
        document.getElementById('win-rate').textContent = `${winRate}%`;
    }

    showInvalidMove() {
        // Visual feedback for invalid move
        document.body.classList.add('invalid-move');
        setTimeout(() => {
            document.body.classList.remove('invalid-move');
        }, 300);
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    pause() {
        this.pauseTimer();
        this.stateManager.pause();
        this.showModal('pause-modal');
    }

    resume() {
        this.resumeTimer();
        this.stateManager.resume();
        this.hideModal('pause-modal');
    }

    canInteract() {
        return this.stateManager.is(StateManager.STATES.PLAYING);
    }

    getCardFromElement(element) {
        const cardId = element.dataset.cardId;
        if (!cardId) return null;
        
        // Search in all piles
        const allPiles = [
            ...this.tableauPiles,
            ...this.foundationPiles,
            this.stockPile,
            this.wastePile
        ];
        
        for (const pile of allPiles) {
            const card = pile.cards.find(c => c.id === cardId);
            if (card) return card;
        }
        
        return null;
    }

    getPileFromElement(element) {
        const pileElement = element.closest('.pile');
        if (!pileElement) return null;
        
        const pileId = pileElement.id;
        
        // Search in all piles
        const allPiles = [
            ...this.tableauPiles,
            ...this.foundationPiles,
            this.stockPile,
            this.wastePile
        ];
        
        return allPiles.find(pile => pile.id === pileId);
    }

    getHint() {
        // TODO: Implement hint system
        // Find valid moves and highlight them
        console.log('Hint system not yet implemented');
    }

    canAutoComplete() {
        // Check if all tableau cards are face up
        return this.tableauPiles.every(pile => 
            pile.cards.every(card => card.faceUp)
        );
    }

    autoComplete() {
        if (!this.canAutoComplete()) return;
        
        // Auto-move all cards to foundations
        let movesMade = true;
        
        while (movesMade) {
            movesMade = false;
            
            // Try to move from tableau
            for (const tableau of this.tableauPiles) {
                if (!tableau.isEmpty()) {
                    const card = tableau.getTopCard();
                    if (this.tryAutoMoveToFoundation(card, tableau)) {
                        movesMade = true;
                        break;
                    }
                }
            }
            
            // Try to move from waste
            if (!movesMade && !this.wastePile.isEmpty()) {
                const card = this.wastePile.getTopCard();
                if (this.tryAutoMoveToFoundation(card, this.wastePile)) {
                    movesMade = true;
                }
            }
        }
    }
}
