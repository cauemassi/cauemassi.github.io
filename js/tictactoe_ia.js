document.addEventListener('DOMContentLoaded', () => {
    // Telas
    const startScreen = document.getElementById('start-screen');
    const playerSetupScreen = document.getElementById('player-setup-screen');
    const gameScreen = document.getElementById('game-screen');

    // Botões
    const startGameBtn = document.getElementById('start-game-btn');
    const confirmPlayersBtn = document.getElementById('confirm-players-btn');
    const chooseXBtn = document.getElementById('choose-x');
    const chooseOBtn = document.getElementById('choose-o');
    const restartBtn = document.getElementById('restart-btn');
    const menuBtn = document.getElementById('menu-btn');

    // Elementos do Jogo
    const statusDisplay = document.getElementById('status');
    const scoreboardDisplay = document.getElementById('scoreboard');
    const cells = document.querySelectorAll('.cell');
    const player1NameInput = document.getElementById('player1-name');
    const player2NameInput = document.getElementById('player2-name');

    // Estado do Jogo
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer;
    let gameActive = true;
    let player1 = { name: '', symbol: '', score: 0 };
    let player2 = { name: '', symbol: '', score: 0 };
    let startingPlayer = 'player2'; // Jogador 2 sempre começa a primeira partida

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // --- Funções de Navegação entre Telas ---

    function showPlayerSetup() {
        startScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        playerSetupScreen.classList.remove('hidden');
        confirmPlayersBtn.classList.add('hidden');
        player1NameInput.value = '';
        player2NameInput.value = '';
        chooseXBtn.disabled = false;
        chooseOBtn.disabled = false;
    }

    function showGameScreen() {
        if (player1NameInput.value === '' || player2NameInput.value === '') {
            alert('Por favor, insira o nome dos dois jogadores.');
            return;
        }
        player1.name = player1NameInput.value;
        player2.name = player2NameInput.value;
        
        playerSetupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        startNewRound();
    }
    
    function showStartScreen() {
        gameScreen.classList.add('hidden');
        playerSetupScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        // Reseta tudo
        player1 = { name: '', symbol: '', score: 0 };
        player2 = { name: '', symbol: '', score: 0 };
        startingPlayer = 'player2';
    }

    // --- Funções de Lógica do Jogo ---

    function startNewRound() {
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        cells.forEach(cell => {
            cell.innerText = '';
            cell.classList.remove('x', 'o');
        });

        // Alterna o jogador inicial
        if (startingPlayer === 'player1') {
            currentPlayer = player1.symbol;
            startingPlayer = 'player2';
        } else {
            currentPlayer = player2.symbol;
            startingPlayer = 'player1';
        }
        
        updateStatus();
        updateScoreboard();
    }
    
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }

        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.innerText = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());

        if (checkWin()) {
            gameActive = false;
            updateScore();
            updateStatus(getWinnerName() + ' VENCEU!');
            return;
        }

        if (!gameState.includes('')) {
            gameActive = false;
            updateStatus('DEU VELHA!');
            return;
        }

        currentPlayer = currentPlayer === player1.symbol ? player2.symbol : player1.symbol;
        updateStatus();
    }

    function checkWin() {
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                return true;
            }
        }
        return false;
    }

    function getWinnerName() {
        return currentPlayer === player1.symbol ? player1.name : player2.name;
    }
    
    function updateScore() {
        if (currentPlayer === player1.symbol) {
            player1.score++;
        } else {
            player2.score++;
        }
        updateScoreboard();
    }
    
    function updateScoreboard() {
        scoreboardDisplay.innerText = `${player1.name}: ${player1.score} | ${player2.name}: ${player2.score}`;
    }

    function updateStatus(message) {
        if (message) {
            statusDisplay.innerText = message;
        } else {
            const currentPlayerName = currentPlayer === player1.symbol ? player1.name : player2.name;
            statusDisplay.innerText = `VEZ DE ${currentPlayerName}`;
        }
    }

    function handleSymbolChoice(symbol) {
        player1.symbol = symbol;
        player2.symbol = symbol === 'X' ? 'O' : 'X';
        chooseXBtn.disabled = true;
        chooseOBtn.disabled = true;
        confirmPlayersBtn.classList.remove('hidden');
    }

    // --- Event Listeners ---

    startGameBtn.addEventListener('click', showPlayerSetup);
    confirmPlayersBtn.addEventListener('click', showGameScreen);
    menuBtn.addEventListener('click', showStartScreen);
    restartBtn.addEventListener('click', startNewRound);
    
    chooseXBtn.addEventListener('click', () => handleSymbolChoice('X'));
    chooseOBtn.addEventListener('click', () => handleSymbolChoice('O'));

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
});
