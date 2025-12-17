/**
 * main.js
 * Ponto de entrada da aplicação
 * Gerencia navegação entre telas e inicialização do jogo
 */

// Instância global do jogo
let game = null;
let backgroundMusic = null;
let isMuted = false;
let currentVolume = 0.3;
let musicUnlocked = false;

/**
 * Inicialização quando DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    loadHighScore();
    setupMusic();
    loadSettings();
    unlockAudioContext();
});

/**
 * Configura event listeners da UI
 */
function initializeUI() {
    // Botão "Iniciar Jogo" no menu
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // Botão "Opções" no menu
    document.getElementById('options-button').addEventListener('click', showOptions);
    
    // Botão "Voltar ao Menu" na tela de game over
    document.getElementById('menu-button').addEventListener('click', backToMenu);
    
    // Botões da tela de opções
    document.getElementById('back-to-menu').addEventListener('click', backToMenuFromOptions);
    document.getElementById('volume-up').addEventListener('click', volumeUp);
    document.getElementById('volume-down').addEventListener('click', volumeDown);
    document.getElementById('mute-button').addEventListener('click', toggleMute);
    
    // Botões da tela de pausa
    document.getElementById('resume-button').addEventListener('click', resumeGame);
    document.getElementById('pause-menu-button').addEventListener('click', backToMenuFromPause);
    document.getElementById('pause-volume-up').addEventListener('click', volumeUp);
    document.getElementById('pause-volume-down').addEventListener('click', volumeDown);
    document.getElementById('pause-mute-button').addEventListener('click', toggleMute);
    
    // Botão de pausa mobile
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
        btnPause.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePause();
        }, { passive: false });
    }
}

/**
 * Carrega e exibe recorde
 */
function loadHighScore() {
    try {
        const highScore = localStorage.getItem('cometasHighScore') || '0';
        document.getElementById('high-score-value').textContent = highScore;
    } catch (e) {
        console.warn('Não foi possível carregar recorde:', e);
        document.getElementById('high-score-value').textContent = '0';
    }
}

/**
 * Configura música de fundo
 */
function setupMusic() {
    backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
        backgroundMusic.volume = currentVolume;
    }
}

/**
 * Desbloqueia áudio em mobile (requer interação do usuário)
 */
function unlockAudioContext() {
    const unlockAudio = () => {
        if (backgroundMusic && !musicUnlocked) {
            backgroundMusic.play().then(() => {
                backgroundMusic.pause();
                backgroundMusic.currentTime = 0;
                musicUnlocked = true;
                console.log('Áudio desbloqueado');
            }).catch(e => {
                console.log('Áudio ainda bloqueado');
            });
        }
    };
    
    // Tenta desbloquear em qualquer interação
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
}

/**
 * Carrega configurações salvas
 */
function loadSettings() {
    try {
        const savedVolume = localStorage.getItem('cometasVolume');
        const savedMuted = localStorage.getItem('cometasMuted');
        
        if (savedVolume !== null) {
            currentVolume = parseFloat(savedVolume);
        }
        
        if (savedMuted !== null) {
            isMuted = savedMuted === 'true';
        }
        
        updateVolumeUI();
        updateMuteUI();
        applyVolume();
    } catch (e) {
        console.warn('Não foi possível carregar configurações:', e);
    }
}

/**
 * Salva configurações
 */
function saveSettings() {
    try {
        localStorage.setItem('cometasVolume', currentVolume.toString());
        localStorage.setItem('cometasMuted', isMuted.toString());
    } catch (e) {
        console.warn('Não foi possível salvar configurações:', e);
    }
}

/**
 * Aplica volume atual à música
 */
function applyVolume() {
    if (backgroundMusic) {
        backgroundMusic.volume = isMuted ? 0 : currentVolume;
    }
}

/**
 * Aumenta volume
 */
function volumeUp() {
    currentVolume = Math.min(1.0, currentVolume + 0.1);
    updateVolumeUI();
    applyVolume();
    saveSettings();
}

/**
 * Diminui volume
 */
function volumeDown() {
    currentVolume = Math.max(0, currentVolume - 0.1);
    updateVolumeUI();
    applyVolume();
    saveSettings();
}

/**
 * Alterna mute
 */
function toggleMute() {
    isMuted = !isMuted;
    updateMuteUI();
    applyVolume();
    saveSettings();
}

/**
 * Atualiza UI do volume
 */
function updateVolumeUI() {
    const percent = Math.round(currentVolume * 100);
    
    // Atualiza tela de opções
    const volumeFill = document.getElementById('volume-fill');
    const volumePercent = document.getElementById('volume-percent');
    if (volumeFill) volumeFill.style.width = percent + '%';
    if (volumePercent) volumePercent.textContent = percent + '%';
    
    // Atualiza tela de pausa
    const pauseVolumeFill = document.getElementById('pause-volume-fill');
    const pauseVolumePercent = document.getElementById('pause-volume-percent');
    if (pauseVolumeFill) pauseVolumeFill.style.width = percent + '%';
    if (pauseVolumePercent) pauseVolumePercent.textContent = percent + '%';
}

/**
 * Atualiza UI do mute
 */
function updateMuteUI() {
    const text = isMuted ? '🔇 Som Desligado' : '🔊 Som Ligado';
    
    // Atualiza tela de opções
    const muteButton = document.getElementById('mute-button');
    if (muteButton) muteButton.textContent = text;
    
    // Atualiza tela de pausa
    const pauseMuteButton = document.getElementById('pause-mute-button');
    if (pauseMuteButton) pauseMuteButton.textContent = text;
}

/**
 * Inicia o jogo
 */
function startGame() {
    // Esconde menu, mostra tela de jogo
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // Inicia música
    if (backgroundMusic) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(e => {
            console.warn('Erro ao tocar música:', e);
        });
    }
    
    // Cria nova instância do jogo
    if (game) {
        game.stop();
    }
    game = new Game();
    game.start();
}

/**
 * Volta ao menu principal
 */
function backToMenu() {
    // Para o jogo se estiver rodando
    if (game) {
        game.stop();
    }
    
    // Para música
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    
    // Atualiza recorde no menu
    loadHighScore();
    
    // Esconde todas as telas, mostra menu
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('menu-screen').classList.add('active');
}

/**
 * Mostra tela de opções
 */
function showOptions() {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('options-screen').classList.add('active');
}

/**
 * Volta ao menu das opções
 */
function backToMenuFromOptions() {
    document.getElementById('options-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');
}

/**
 * Alterna pausa
 */
function togglePause() {
    if (game && game.running) {
        game.paused = !game.paused;
        game.showPauseOverlay(game.paused);
    }
}

/**
 * Continua o jogo
 */
function resumeGame() {
    if (game && game.running) {
        game.paused = false;
        game.showPauseOverlay(false);
    }
}

/**
 * Volta ao menu a partir da tela de pausa
 */
function backToMenuFromPause() {
    if (game) {
        game.paused = false;
        game.showPauseOverlay(false);
    }
    backToMenu();
}

// Expõe funções globalmente para uso no Game.js
window.updateVolumeUI = updateVolumeUI;
window.updateMuteUI = updateMuteUI;

/**
 * Previne comportamentos padrão que podem atrapalhar o jogo
 */
window.addEventListener('keydown', (e) => {
    // Previne scroll com space e arrow keys, e Escape
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(e.code)) {
        e.preventDefault();
    }
});

// Previne menu de contexto no canvas
document.addEventListener('contextmenu', (e) => {
    if (e.target.id === 'game-canvas') {
        e.preventDefault();
    }
});
