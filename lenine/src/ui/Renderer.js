// Renderer - Handles all DOM rendering
export class Renderer {
    constructor() {
        this.pileElements = new Map();
        this.cardElements = new Map();
    }

    initialize() {
        // Cache pile elements
        document.querySelectorAll('.pile').forEach(element => {
            const pileType = element.dataset.pile;
            const pileId = element.id;
            this.pileElements.set(pileId, element);
        });
    }

    renderPile(pile) {
        const element = this.pileElements.get(pile.id);
        if (!element) return;

        // Clear current cards AND text content
        element.innerHTML = '';
        element.textContent = '';

        // Remove classes
        element.classList.remove('empty', 'has-cards');

        if (pile.isEmpty()) {
            element.classList.add('empty');
            
            // Show suit symbol for foundations
            if (pile.type === 'foundation') {
                const suitSymbol = element.dataset.suit;
                element.textContent = this.getSuitSymbol(suitSymbol);
            }
            return;
        }

        // Has cards - ensure no text content
        element.textContent = '';

        // Render cards
        pile.cards.forEach((card, index) => {
            // Get or create card element
            let cardElement = card.element;
            if (!cardElement) {
                cardElement = card.createElement();
            } else {
                // Update existing element content to match current card state
                card.updateElement();
            }
            
            // Reset ALL inline styles completely
            cardElement.removeAttribute('style');
            
            // Reset classes
            cardElement.classList.remove('dragging', 'selected');
            
            // Apply base positioning
            cardElement.style.position = 'absolute';
            cardElement.style.left = '0';
            cardElement.style.pointerEvents = 'auto';
            
            // Position card based on pile type
            if (pile.type === 'tableau') {
                const offset = index * 24; // Stack offset
                cardElement.style.top = `${offset}px`;
                cardElement.style.zIndex = index;
            } else if (pile.type === 'stock' || pile.type === 'waste') {
                cardElement.style.top = '0';
                cardElement.style.zIndex = index;
            } else {
                // Foundation - stack cards on top of each other
                cardElement.style.top = '0';
                cardElement.style.zIndex = index;
            }

            element.appendChild(cardElement);
            this.cardElements.set(card.id, cardElement);
        });

        // Add has-cards class to foundation
        if (pile.type === 'foundation') {
            element.classList.add('has-cards');
        }
        
        // Add has-cards class for tableau too
        if (pile.type === 'tableau' && pile.cards.length > 0) {
            element.classList.add('has-cards');
        }
    }

    renderAllPiles(piles) {
        Object.values(piles).forEach(pile => {
            if (Array.isArray(pile)) {
                pile.forEach(p => this.renderPile(p));
            } else {
                this.renderPile(pile);
            }
        });
    }

    getSuitSymbol(suit) {
        const symbols = {
            'spades': '♠',
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣'
        };
        return symbols[suit] || '';
    }

    highlightCard(card) {
        const element = this.cardElements.get(card.id);
        if (element) {
            element.classList.add('selected');
        }
    }

    unhighlightCard(card) {
        const element = this.cardElements.get(card.id);
        if (element) {
            element.classList.remove('selected');
        }
    }

    highlightPile(pile, isValid = true) {
        const element = this.pileElements.get(pile.id);
        if (element) {
            element.classList.add(isValid ? 'drop-target' : 'invalid-target');
        }
    }

    unhighlightPile(pile) {
        const element = this.pileElements.get(pile.id);
        if (element) {
            element.classList.remove('drop-target', 'invalid-target');
        }
    }

    unhighlightAllPiles() {
        this.pileElements.forEach(element => {
            element.classList.remove('drop-target', 'invalid-target');
        });
    }

    animateCardFlip(card) {
        const element = this.cardElements.get(card.id);
        if (element) {
            element.classList.add('flipping');
            setTimeout(() => {
                element.classList.remove('flipping');
            }, 400);
        }
    }

    animateCardMove(cardElement, fromPos, toPos, callback) {
        if (!cardElement) return;

        const duration = 250;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const eased = 1 - Math.pow(1 - progress, 3);

            const currentX = fromPos.x + (toPos.x - fromPos.x) * eased;
            const currentY = fromPos.y + (toPos.y - fromPos.y) * eased;

            cardElement.style.transform = `translate(${currentX}px, ${currentY}px)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                cardElement.style.transform = '';
                if (callback) callback();
            }
        };

        requestAnimationFrame(animate);
    }

    updateScore(score) {
        const element = document.getElementById('game-score');
        if (element) {
            element.textContent = score;
        }
    }

    updateTime(timeString) {
        const element = document.getElementById('game-time');
        if (element) {
            element.textContent = timeString;
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    updateBestScores(bestTime, bestScore) {
        const timeElement = document.getElementById('best-time');
        const scoreElement = document.getElementById('best-score');

        if (timeElement) {
            timeElement.textContent = bestTime ? this.formatTime(bestTime) : '--:--';
        }

        if (scoreElement) {
            scoreElement.textContent = bestScore || '---';
        }
    }

    updateStats(totalGames, wins, winRate) {
        const totalElement = document.getElementById('total-games');
        const winsElement = document.getElementById('wins');
        const rateElement = document.getElementById('win-rate');

        if (totalElement) totalElement.textContent = totalGames;
        if (winsElement) winsElement.textContent = wins;
        if (rateElement) rateElement.textContent = `${winRate}%`;
    }

    showVictory(time, score) {
        const finalTime = document.getElementById('final-time');
        const finalScore = document.getElementById('final-score');

        if (finalTime) finalTime.textContent = this.formatTime(time);
        if (finalScore) finalScore.textContent = score;

        this.showModal('victory-modal');
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    enableButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
        }
    }

    disableButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
        }
    }
}
