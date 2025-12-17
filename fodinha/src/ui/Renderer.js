// Renderer.js - Gerencia a renderização da interface
export class Renderer {
    constructor() {
        this.screens = {
            menu: document.getElementById('menu-screen'),
            rules: document.getElementById('rules-screen'),
            game: document.getElementById('game-screen')
        };

        this.modals = {
            bet: document.getElementById('bet-modal'),
            roundEnd: document.getElementById('round-end-modal'),
            gameEnd: document.getElementById('game-end-modal'),
            notification: document.getElementById('notification-modal'),
            trickSummary: document.getElementById('trick-summary-modal')
        };

        this.elements = {
            bestScore: document.getElementById('best-score'),
            viraCard: document.getElementById('vira-card'),
            manilhaInfo: document.getElementById('manilha-info'),
            tableCards: document.getElementById('table-cards'),
            roundNumber: document.getElementById('round-number'),
            trickNumber: document.getElementById('trick-number'),
            betButtons: document.getElementById('bet-buttons'),
            betQuestion: document.getElementById('bet-question'),
            roundSummary: document.getElementById('round-summary'),
            gameSummary: document.getElementById('game-summary'),
            betViraValue: document.getElementById('bet-vira-value'),
            betManilhaValue: document.getElementById('bet-manilha-value'),
            betPlayerCards: document.getElementById('bet-player-cards'),
            trickSummaryContent: document.getElementById('trick-summary-content'),
            trickSummaryClose: document.getElementById('trick-summary-close')
        };
    }

    // Mostra uma tela
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    }

    // Mostra um modal
    showModal(modalName) {
        this.hideAllModals();
        if (this.modals[modalName]) {
            this.modals[modalName].classList.add('active');
        }
    }

    // Esconde todos os modais
    hideAllModals() {
        Object.values(this.modals).forEach(modal => modal.classList.remove('active'));
    }

    // Mostra a tela do menu
    showMenuScreen() {
        this.showScreen('menu');
        this.updateBestScore();
    }

    // Mostra a tela de regras
    showRulesScreen() {
        this.showScreen('rules');
    }

    // Mostra a tela do jogo
    showGameScreen() {
        this.showScreen('game');
        this.hideAllModals();
    }

    // Atualiza melhor pontuação
    updateBestScore() {
        const bestScore = localStorage.getItem('fodinha_best_score') || 0;
        this.elements.bestScore.textContent = bestScore;
    }

    // Renderiza o estado completo do jogo
    render(gameState) {
        this.renderPlayers(gameState);
        this.renderVira(gameState);
        this.renderTable(gameState);
        this.renderInfo(gameState);
        
        // Se está na fase de apostas do jogador humano
        if (gameState.phase === 'BETTING') {
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            if (currentPlayer && currentPlayer.id === 0 && currentPlayer.bet === null) {
                // Pequeno delay para garantir que o DOM está pronto
                setTimeout(() => {
                    this.showBettingModal(gameState);
                }, 100);
            }
        }
    }

    // Renderiza informações dos jogadores
    renderPlayers(gameState) {
        gameState.players.forEach((player, playerId) => {
            // Busca o elemento correto pelo data-player
            const infoElement = document.querySelector(`.player-info[data-player="${playerId}"]`);
            const cardsElement = document.getElementById(`player-${playerId}-cards`);

            if (!infoElement) return;

            // Atualiza classe de ativo
            if (gameState.currentPlayerIndex === playerId && gameState.phase === 'PLAYING') {
                infoElement.classList.add('active');
            } else {
                infoElement.classList.remove('active');
            }

            // Atualiza classe de eliminado
            if (player.isEliminated) {
                infoElement.classList.add('eliminated');
            } else {
                infoElement.classList.remove('eliminated');
            }

            // Atualiza informações
            const pointsSpan = infoElement.querySelector('.player-points');
            const betSpan = infoElement.querySelector('.player-bet');
            const tricksSpan = infoElement.querySelector('.player-tricks');

            pointsSpan.textContent = `❤️ ${player.points}`;
            betSpan.textContent = `Palpite: ${player.bet !== null ? player.bet : '-'}`;
            tricksSpan.textContent = `Rodadas: ${player.tricksWon}`;

            // Renderiza cartas
            this.renderPlayerCards(player, cardsElement, gameState);
        });
    }

    // Renderiza as cartas de um jogador
    renderPlayerCards(player, container, gameState) {
        container.innerHTML = '';
        const cards = player.hand.getCards();

        if (player.id === 0) {
            // Jogador humano: mostra cartas
            cards.forEach((card, index) => {
                const cardElement = this.createCardElement(card, gameState.rulesEngine);
                
                // Apenas permite clicar durante a fase de jogo e se é o turno do jogador
                if (gameState.phase === 'PLAYING' && 
                    gameState.currentPlayerIndex === 0) {
                    cardElement.addEventListener('click', () => {
                        if (this.onCardClick) {
                            // Adiciona animação antes de processar a jogada
                            cardElement.classList.add('animating');
                            
                            // Aguarda a animação completar
                            setTimeout(() => {
                                this.onCardClick(index);
                            }, 600); // Duração da animação
                        }
                    });
                } else {
                    cardElement.classList.add('disabled');
                }
                
                container.appendChild(cardElement);
            });
        } else {
            // IA: mostra cartas viradas
            cards.forEach(() => {
                const cardBack = document.createElement('div');
                cardBack.className = 'card-back';
                cardBack.textContent = '🃏';
                container.appendChild(cardBack);
            });
        }
    }

    // Cria elemento HTML de uma carta
    createCardElement(card, rulesEngine) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.isRed() ? 'red' : 'black'}`;
        
        // Destaca manilhas
        if (rulesEngine.isManilha(card)) {
            cardDiv.classList.add('manilha');
        }

        const valueDiv = document.createElement('div');
        valueDiv.className = 'card-value';
        valueDiv.textContent = card.value;

        const suitDiv = document.createElement('div');
        suitDiv.className = 'card-suit';
        suitDiv.textContent = card.getSuitSymbol();

        cardDiv.appendChild(valueDiv);
        cardDiv.appendChild(suitDiv);

        return cardDiv;
    }

    // Renderiza a carta virada e manilha
    renderVira(gameState) {
        if (gameState.viraCard) {
            this.elements.viraCard.innerHTML = '';
            const cardElement = this.createCardElement(gameState.viraCard, gameState.rulesEngine);
            cardElement.style.cursor = 'default';
            this.elements.viraCard.appendChild(cardElement);

            const manilha = gameState.rulesEngine.getManilha();
            this.elements.manilhaInfo.textContent = `Manilha: ${manilha}`;
        }
    }

    // Renderiza as cartas na mesa
    renderTable(gameState) {
        this.elements.tableCards.innerHTML = '';
        
        gameState.currentTrick.forEach(({ card, playerId }) => {
            const cardElement = this.createCardElement(card, gameState.rulesEngine);
            cardElement.classList.add('table-card');
            cardElement.style.cursor = 'default';
            
            // Adiciona indicador do jogador
            const playerLabel = document.createElement('div');
            playerLabel.style.fontSize = '0.8em';
            playerLabel.style.marginTop = '5px';
            playerLabel.textContent = gameState.players[playerId].name;
            
            const wrapper = document.createElement('div');
            wrapper.style.textAlign = 'center';
            wrapper.appendChild(cardElement);
            wrapper.appendChild(playerLabel);
            
            this.elements.tableCards.appendChild(wrapper);
        });
    }

    // Renderiza informações da rodada
    renderInfo(gameState) {
        this.elements.roundNumber.textContent = `Partida: ${gameState.roundNumber}`;
        this.elements.trickNumber.textContent = `Rodada: ${gameState.currentTrickNumber}/${gameState.numCards}`;
    }

    // Mostra modal de aposta
    showBettingModal(gameState) {
        const currentBets = gameState.players
            .filter(p => p.bet !== null && p.id !== 0)
            .map(p => p.bet);
        
        const isLastPlayer = currentBets.length === gameState.players.length - 1;
        const validBets = gameState.rulesEngine.getValidBets(
            currentBets, 
            gameState.numCards, 
            isLastPlayer
        );

        // Mostra vira e manilha
        if (gameState.viraCard) {
            const viraText = `${gameState.viraCard.value}${gameState.viraCard.getSuitSymbol()}`;
            const manilhaText = gameState.rulesEngine.getManilha();
            
            if (this.elements.betViraValue) {
                this.elements.betViraValue.textContent = viraText;
            }
            if (this.elements.betManilhaValue) {
                this.elements.betManilhaValue.textContent = manilhaText;
            }
        }

        // Mostra as cartas do jogador
        if (this.elements.betPlayerCards && gameState.humanPlayer) {
            this.elements.betPlayerCards.innerHTML = '';
            
            const cards = gameState.humanPlayer.hand.getCards();
            
            cards.forEach(card => {
                const cardElement = this.createCardElement(card, gameState.rulesEngine);
                cardElement.style.cursor = 'default';
                cardElement.style.transform = 'none';
                this.elements.betPlayerCards.appendChild(cardElement);
            });
        }

        // Botões de aposta
        this.elements.betButtons.innerHTML = '';
        
        validBets.forEach(bet => {
            const button = document.createElement('button');
            button.className = 'btn btn-primary';
            button.textContent = bet;
            button.addEventListener('click', () => {
                if (this.onBetClick) {
                    this.onBetClick(bet);
                    this.hideAllModals();
                }
            });
            this.elements.betButtons.appendChild(button);
        });

        let question = `Você tem ${gameState.numCards} carta${gameState.numCards > 1 ? 's' : ''}. `;
        question += `Quantas rodadas você vai ganhar?`;
        
        if (isLastPlayer) {
            const forbiddenBet = gameState.numCards - currentBets.reduce((a, b) => a + b, 0);
            if (forbiddenBet < 0) {
                question += ` (Não pode apostar ${forbiddenBet})`;
            }
        }
        
        this.elements.betQuestion.textContent = question;
        this.showModal('bet');
    }

    // Mostra notificação temporária
    showNotification(message, duration = 2000) {
        const notificationMessage = document.getElementById('notification-message');
        notificationMessage.textContent = message;
        this.showModal('notification');
        
        return new Promise(resolve => {
            setTimeout(() => {
                this.hideModal('notification');
                resolve();
            }, duration);
        });
    }

    // Esconde um modal específico
    hideModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.remove('active');
        }
    }

    // Mostra resumo da rodada (vaza)
    showTrickSummary(currentTrick, winnerId, players, rulesEngine) {
        if (!this.elements.trickSummaryContent) return;
        
        this.elements.trickSummaryContent.innerHTML = '';
        
        // Para cada jogada na rodada
        currentTrick.forEach(play => {
            const player = players.find(p => p.id === play.playerId);
            const isWinner = play.playerId === winnerId;
            
            const playDiv = document.createElement('div');
            playDiv.className = `trick-play ${isWinner ? 'winner' : ''}`;
            
            const playerName = document.createElement('div');
            playerName.className = 'trick-play-player';
            playerName.textContent = player.name;
            if (isWinner) {
                playerName.textContent += ' 👑';
            }
            
            const cardDisplay = document.createElement('div');
            cardDisplay.className = `trick-play-card ${play.card.isRed() ? 'red' : 'black'}`;
            
            // Mostra se é manilha
            const isManilha = rulesEngine.isManilha(play.card);
            cardDisplay.textContent = `${play.card.value}${play.card.getSuitSymbol()}`;
            if (isManilha) {
                cardDisplay.textContent += ' ⭐';
                cardDisplay.style.borderColor = 'var(--accent)';
                cardDisplay.style.borderWidth = '2px';
                cardDisplay.style.borderStyle = 'solid';
            }
            
            playDiv.appendChild(playerName);
            playDiv.appendChild(cardDisplay);
            this.elements.trickSummaryContent.appendChild(playDiv);
        });
        
        // Anuncia o vencedor
        const winner = players.find(p => p.id === winnerId);
        if (winner) {
            const announcement = document.createElement('div');
            announcement.className = 'trick-winner-announcement';
            announcement.innerHTML = `<h3>🏆 ${winner.name} ganhou esta rodada!</h3>`;
            this.elements.trickSummaryContent.appendChild(announcement);
        }
        
        this.showModal('trickSummary');
        
        // Retorna uma Promise que resolve quando o botão é clicado
        return new Promise(resolve => {
            const closeHandler = () => {
                this.hideModal('trickSummary');
                this.elements.trickSummaryClose.removeEventListener('click', closeHandler);
                resolve();
            };
            this.elements.trickSummaryClose.addEventListener('click', closeHandler);
        });
    }

    // Mostra resumo do fim da rodada
    showRoundEnd(gameState) {
        this.elements.roundSummary.innerHTML = '';
        
        gameState.players.forEach(player => {
            const div = document.createElement('div');
            div.className = 'player-summary';
            
            const correct = player.checkBet();
            if (!player.isEliminated) {
                div.classList.add(correct ? 'success' : 'error');
            }

            let html = `<strong>${player.name}</strong><br>`;
            html += `Palpite: ${player.bet} | Rodadas: ${player.tricksWon}<br>`;
            html += `Resultado: ${correct ? '✓ Acertou!' : '✗ Errou -1 ponto'}<br>`;
            html += `Pontos: ${player.points}`;
            
            if (player.isEliminated) {
                html += ` <strong style="color: var(--danger);">ELIMINADO</strong>`;
            }

            div.innerHTML = html;
            this.elements.roundSummary.appendChild(div);
        });

        this.showModal('roundEnd');
    }

    // Mostra resumo do fim do jogo
    showGameEnd(gameState) {
        this.elements.gameSummary.innerHTML = '';
        
        const winner = gameState.players.find(p => !p.isEliminated);
        
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'player-summary winner';
        winnerDiv.innerHTML = `
            <h3>🏆 Vencedor: ${winner.name}</h3>
            <p>Pontos finais: ${winner.points}</p>
        `;
        this.elements.gameSummary.appendChild(winnerDiv);

        const rankingDiv = document.createElement('div');
        rankingDiv.innerHTML = '<h3>Ranking Final:</h3>';
        
        // Ordena por pontos
        const sorted = [...gameState.players].sort((a, b) => b.points - a.points);
        sorted.forEach((player, index) => {
            const div = document.createElement('div');
            div.className = 'player-summary';
            div.innerHTML = `${index + 1}º - ${player.name}: ${player.points} pontos`;
            rankingDiv.appendChild(div);
        });

        this.elements.gameSummary.appendChild(rankingDiv);
        this.showModal('gameEnd');
    }

    // Callbacks
    onCardClick = null;
    onBetClick = null;
}
