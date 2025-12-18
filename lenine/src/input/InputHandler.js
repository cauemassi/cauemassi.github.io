// InputHandler - Manages mouse and touch input
export class InputHandler {
    constructor(gameController) {
        this.game = gameController;
        this.draggedCard = null;
        this.sourcePile = null;
        this.selectedCard = null;
        this.selectedPile = null;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.dragThreshold = 3; // Reduzido para iniciar drag mais rápido
        this.draggedElements = [];
        this.dragClone = null;
        this.currentDropTarget = null; // Target magnético atual
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const gameBoard = document.querySelector('.game-board');
        
        // Mouse events
        gameBoard.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Touch events
        gameBoard.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Double click/tap for auto-move
        gameBoard.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        
        // Stock click and touch
        const stockElement = document.getElementById('stock');
        stockElement.addEventListener('click', this.handleStockClick.bind(this));
        stockElement.addEventListener('touchend', this.handleStockTouch.bind(this));
    }

    handleMouseDown(e) {
        if (!this.game.canInteract()) return;
        
        const cardElement = e.target.closest('.card');
        if (!cardElement) return;
        
        const card = this.game.getCardFromElement(cardElement);
        const pile = this.game.getPileFromElement(cardElement.parentElement);
        
        if (!card || !pile) return;
        
        // Check if card can be moved
        if (!card.faceUp || !pile.canPickCard(card)) return;
        
        // Store initial mouse position
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.currentX = e.clientX;
        this.currentY = e.clientY;
        
        // Store card offset from cursor
        const rect = cardElement.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
        
        this.draggedCard = card;
        this.sourcePile = pile;
        
        cardElement.style.cursor = 'grabbing';
    }

    handleMouseMove(e) {
        if (!this.draggedCard) return;
        
        this.currentX = e.clientX;
        this.currentY = e.clientY;
        
        const dx = this.currentX - this.startX;
        const dy = this.currentY - this.startY;
        
        if (!this.isDragging && (Math.abs(dx) > this.dragThreshold || Math.abs(dy) > this.dragThreshold)) {
            this.isDragging = true;
            this.startDrag();
        }
        
        if (this.isDragging) {
            this.updateDragPosition(dx, dy);
            this.highlightDropTargets();
        }
    }

    handleMouseUp(e) {
        if (!this.draggedCard) return;
        
        if (this.isDragging) {
            this.handleDrop(e.clientX, e.clientY);
        } else {
            // Simple click - select card
            this.handleCardClick(this.draggedCard, this.sourcePile);
        }
        
        this.resetDrag();
        this.game.render(); // Garantir que a tela seja atualizada
    }

    handleTouchStart(e) {
        if (!this.game.canInteract()) return;
        
        const touch = e.touches[0];
        
        // Check if touching stock pile directly (not a card)
        const pileElement = touch.target.closest('.pile');
        if (pileElement && pileElement.id === 'stock') {
            // Touching stock itself, not for dragging
            return;
        }
        
        const cardElement = touch.target.closest('.card');
        
        if (!cardElement) return;
        
        e.preventDefault();
        
        const card = this.game.getCardFromElement(cardElement);
        const pile = this.game.getPileFromElement(cardElement.parentElement);
        
        // Don't allow dragging from stock
        if (pile && pile.id === 'stock') return;
        
        if (!card || !pile || !card.faceUp || !pile.canPickCard(card)) return;
        
        // Store initial touch position
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.currentX = touch.clientX;
        this.currentY = touch.clientY;
        
        // Store card offset from touch
        const rect = cardElement.getBoundingClientRect();
        this.offsetX = touch.clientX - rect.left;
        this.offsetY = touch.clientY - rect.top;
        
        this.draggedCard = card;
        this.sourcePile = pile;
    }

    handleTouchMove(e) {
        if (!this.draggedCard) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        
        this.currentX = touch.clientX;
        this.currentY = touch.clientY;
        
        const dx = this.currentX - this.startX;
        const dy = this.currentY - this.startY;
        
        if (!this.isDragging && (Math.abs(dx) > this.dragThreshold || Math.abs(dy) > this.dragThreshold)) {
            this.isDragging = true;
            this.startDrag();
        }
        
        if (this.isDragging) {
            this.updateDragPosition(dx, dy);
            this.highlightDropTargets();
        }
    }

    handleTouchEnd(e) {
        if (!this.draggedCard) return;
        
        if (this.isDragging) {
            const touch = e.changedTouches[0];
            this.handleDrop(touch.clientX, touch.clientY);
        } else {
            // Simple tap - select card
            this.handleCardClick(this.draggedCard, this.sourcePile);
        }
        
        this.resetDrag();
        this.game.render();
    }

    startDrag() {
        // Get cards to drag (card + all below it in tableau)
        const cardsToDrag = this.sourcePile.getCardsFrom(this.draggedCard);
        
        // Store original positions
        this.draggedElements = [];
        cardsToDrag.forEach((card, index) => {
            card.element.classList.add('dragging');
            card.element.style.position = 'fixed';
            card.element.style.zIndex = 1000 + index;
            card.element.style.pointerEvents = 'none';
            
            // Store element for cleanup
            this.draggedElements.push(card.element);
        });
        
        // Add drop zones visual feedback
        document.querySelectorAll('.pile').forEach(pile => {
            pile.classList.add('potential-drop');
        });
        
        // Initial position update
        this.updateDragPosition(0, 0);
    }

    updateDragPosition(dx, dy) {
        const cardsToDrag = this.sourcePile.getCardsFrom(this.draggedCard);
        
        cardsToDrag.forEach((card, index) => {
            // Position card at cursor with offset maintained
            const x = this.currentX - (this.offsetX || card.element.offsetWidth / 2);
            const y = this.currentY - (this.offsetY || card.element.offsetHeight / 2) + (index * 24);
            
            card.element.style.left = `${x}px`;
            card.element.style.top = `${y}px`;
        });
    }

    highlightDropTargets() {
        // Remove previous highlights
        document.querySelectorAll('.pile.drop-target, .pile.invalid-target').forEach(el => {
            el.classList.remove('drop-target', 'invalid-target');
        });
        
        // Aumentar área de detecção - criar um raio maior ao redor do cursor
        const detectionRadius = 80; // pixels de raio para detecção
        const piles = document.querySelectorAll('.pile');
        let closestPile = null;
        let minDistance = Infinity;
        
        piles.forEach(pileElement => {
            const rect = pileElement.getBoundingClientRect();
            const pileCenterX = rect.left + rect.width / 2;
            const pileCenterY = rect.top + rect.height / 2;
            
            // Calcular distância do cursor ao centro da pilha
            const dx = this.currentX - pileCenterX;
            const dy = this.currentY - pileCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Se estiver dentro do raio de detecção e for a pilha mais próxima
            if (distance < detectionRadius && distance < minDistance) {
                minDistance = distance;
                closestPile = pileElement;
            }
        });
        
        // Highlight a pilha mais próxima se for válida
        if (closestPile) {
            const pile = this.game.getPileFromElement(closestPile);
            if (pile && this.game.canMoveCard(this.draggedCard, this.sourcePile, pile)) {
                closestPile.classList.add('drop-target');
                this.currentDropTarget = pile;
            } else if (pile) {
                closestPile.classList.add('invalid-target');
                this.currentDropTarget = null;
            }
        } else {
            this.currentDropTarget = null;
        }
    }

    handleDrop(x, y) {
        // Usar o drop target atual se existir (magnético)
        if (this.currentDropTarget) {
            // Se soltar na mesma pilha de origem, NÃO fazer nada
            if (this.currentDropTarget === this.sourcePile) {
                // Re-renderizar apenas a pilha de origem para restaurar posições
                this.game.renderer.renderPile(this.sourcePile);
                return false; // Indica que não houve movimento
            }
            this.game.tryMoveCard(this.draggedCard, this.sourcePile, this.currentDropTarget);
            // tryMoveCard já chama render() internamente quando bem-sucedido
            return true;
        }
        
        // Fallback: buscar elemento no ponto de drop com raio expandido
        const detectionRadius = 100;
        const piles = document.querySelectorAll('.pile');
        let closestPile = null;
        let minDistance = Infinity;
        
        piles.forEach(pileElement => {
            const rect = pileElement.getBoundingClientRect();
            const pileCenterX = rect.left + rect.width / 2;
            const pileCenterY = rect.top + rect.height / 2;
            
            const dx = x - pileCenterX;
            const dy = y - pileCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < detectionRadius && distance < minDistance) {
                minDistance = distance;
                closestPile = pileElement;
            }
        });
        
        if (closestPile) {
            const targetPile = this.game.getPileFromElement(closestPile);
            if (targetPile) {
                // Se soltar na mesma pilha de origem, NÃO fazer nada
                if (targetPile === this.sourcePile) {
                    // Re-renderizar apenas a pilha de origem para restaurar posições
                    this.game.renderer.renderPile(this.sourcePile);
                    return false; // Indica que não houve movimento
                }
                this.game.tryMoveCard(this.draggedCard, this.sourcePile, targetPile);
                // tryMoveCard já chama render() internamente quando bem-sucedido
                return true;
            }
        }
        
        // Nenhuma pilha encontrada - re-renderizar a pilha de origem
        if (this.sourcePile) {
            this.game.renderer.renderPile(this.sourcePile);
        }
        return false;
    }

    handleCardClick(card, pile) {
        // If no card selected, select this one
        if (!this.selectedCard) {
            this.selectedCard = card;
            this.selectedPile = pile;
            card.element.classList.add('selected');
            return;
        }
        
        // If same card clicked, deselect
        if (this.selectedCard === card) {
            this.clearSelection();
            return;
        }
        
        // Try to move selected card to this pile
        const targetPile = pile;
        this.game.tryMoveCard(this.selectedCard, this.selectedPile, targetPile);
        this.clearSelection();
    }

    handleDoubleClick(e) {
        const cardElement = e.target.closest('.card');
        if (!cardElement) return;
        
        const card = this.game.getCardFromElement(cardElement);
        const pile = this.game.getPileFromElement(cardElement.parentElement);
        
        if (!card || !pile || !card.faceUp) return;
        
        // Try auto-move to foundation
        this.game.tryAutoMoveToFoundation(card, pile);
    }

    handleStockClick(e) {
        if (!this.game.canInteract()) return;
        
        // Evitar que o clique no stock inicie um drag
        const clickedElement = e.target.closest('.pile');
        if (clickedElement && clickedElement.id === 'stock') {
            e.preventDefault();
            e.stopPropagation();
            this.game.drawFromStock();
        }
    }

    handleStockTouch(e) {
        if (!this.game.canInteract()) return;
        
        // Prevenir que toque no stock seja tratado como drag
        const touchedElement = e.target.closest('.pile');
        if (touchedElement && touchedElement.id === 'stock') {
            e.preventDefault();
            e.stopPropagation();
            
            // Se não estava arrastando, compra carta
            if (!this.isDragging && !this.draggedCard) {
                this.game.drawFromStock();
            }
        }
    }

    clearSelection() {
        if (this.selectedCard) {
            this.selectedCard.element.classList.remove('selected');
        }
        this.selectedCard = null;
        this.selectedPile = null;
    }

    resetDrag() {
        if (this.draggedCard && this.sourcePile) {
            const cardsToDrag = this.sourcePile.getCardsFrom(this.draggedCard);
            cardsToDrag.forEach(card => {
                card.element.classList.remove('dragging');
                card.element.style.position = '';
                card.element.style.left = '';
                card.element.style.top = '';
                card.element.style.transform = '';
                card.element.style.zIndex = '';
                card.element.style.cursor = '';
                card.element.style.pointerEvents = '';
            });
        }
        
        // Remove visual feedback
        document.querySelectorAll('.pile').forEach(pile => {
            pile.classList.remove('potential-drop', 'drop-target', 'invalid-target');
        });
        
        this.draggedCard = null;
        this.sourcePile = null;
        this.isDragging = false;
        this.currentDropTarget = null;
        this.draggedElements = [];
    }

    destroy() {
        // Remove all event listeners
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.removeEventListener('mousedown', this.handleMouseDown);
            gameBoard.removeEventListener('touchstart', this.handleTouchStart);
        }
    }
}
