// ============================================
// SCENE MANAGER
// ============================================
class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentScene = 'menu';
        this.selectedShip = 0;
        this.selectedLevel = 0;
        this.paused = false;
        
        // Cache de imagens para evitar recarregar
        this.imageCache = {};
        
        // Carregar imagem de fundo do menu
        console.log('Carregando background do menu...');
        this.menuBackground = new Image();
        this.menuBackgroundLoaded = false;
        
        this.menuBackground.onload = () => {
            this.menuBackgroundLoaded = true;
            console.log('✓ Background do menu carregado:', this.menuBackground.width + 'x' + this.menuBackground.height);
        };
        
        this.menuBackground.onerror = () => {
            console.error('✗ Erro ao carregar background do menu!');
            this.menuBackgroundLoaded = false;
        };
        
        this.menuBackground.src = 'images/backgrounds/capa.png';
        console.log('Background src:', this.menuBackground.src);
    }
    
    // Helper para carregar imagem com segurança
    loadImage(src) {
        if (!src) return null;
        
        // Retornar do cache se já foi carregado
        if (this.imageCache[src]) {
            return this.imageCache[src];
        }
        
        const img = new Image();
        img.onerror = () => {
            console.warn(`Falha ao carregar imagem: ${src}`);
            this.imageCache[src] = null;
        };
        img.src = src;
        
        this.imageCache[src] = img;
        return img;
    }
    
    // Helper para verificar se imagem está pronta
    isImageReady(img) {
        return img && img.complete && img.naturalWidth > 0;
    }

    update(input, deltaTime) {
        // Pausar/despausar durante o jogo
        if (this.currentScene === 'game' && input.wasPressed('start')) {
            this.paused = !this.paused;
        }

        // Se pausado, permitir voltar ao menu com B
        if (this.paused) {
            if (input.wasPressed('back')) {
                this.paused = false;
                this.currentScene = 'menu';
                input.reset();
            }
            return;
        }

        switch(this.currentScene) {
            case 'menu':
                this.updateMenu(input);
                break;
            case 'levelSelect':
                this.updateLevelSelect(input);
                break;
            case 'shipSelect':
                this.updateShipSelect(input);
                break;
            case 'game':
                this.game.updateGame(input, deltaTime);
                break;
            case 'gameOver':
                this.updateGameOver(input);
                break;
            case 'victory':
                this.updateVictory(input);
                break;
        }
    }

    draw(ctx) {
        switch(this.currentScene) {
            case 'menu':
                this.drawMenu(ctx);
                break;
            case 'levelSelect':
                this.drawLevelSelect(ctx);
                break;
            case 'shipSelect':
                this.drawShipSelect(ctx);
                break;
            case 'game':
                this.game.drawGame(ctx);
                // Desenhar overlay de pausa se necessário
                if (this.paused) {
                    this.drawPause(ctx);
                }
                break;
            case 'gameOver':
                this.drawGameOver(ctx);
                break;
            case 'victory':
                this.drawVictory(ctx);
                break;
        }
    }

    updateMenu(input) {
        if (input.isPressed('shoot') || input.isPressed('up')) {
            this.currentScene = 'levelSelect';
            input.reset();
        }
    }

    drawMenu(ctx) {
        // Desenhar background se carregado
        if (this.menuBackground && this.menuBackgroundLoaded && this.menuBackground.complete && this.menuBackground.naturalWidth > 0) {
            ctx.drawImage(this.menuBackground, 0, 0, CONFIG.width, CONFIG.height);
        } else {
            // Fallback: fundo padrão
            ctx.fillStyle = '#000033';
            ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
        }

        // Título (já está na imagem de fundo)
        
        // Configurar estilo de texto com borda
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';

        // Instruções
        ctx.font = '15px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffff00';
        ctx.strokeText('PRESSIONE A OU START', CONFIG.width / 2, 550);
        ctx.fillText('PRESSIONE A OU START', CONFIG.width / 2, 550);
        ctx.strokeText('PARA INICIAR', CONFIG.width / 2, 580);
        ctx.fillText('PARA INICIAR', CONFIG.width / 2, 580);

        // Controles
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.strokeText('SETAS: MOVER', CONFIG.width / 2, 630);
        ctx.fillText('SETAS: MOVER', CONFIG.width / 2, 630);
        ctx.strokeText('A: ATIRAR | START: PAUSAR', CONFIG.width / 2, 655);
        ctx.fillText('A: ATIRAR | START: PAUSAR', CONFIG.width / 2, 655);

        // Animação START
        const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.strokeText('TOQUE A OU START', CONFIG.width / 2, 690);
        ctx.fillText('TOQUE A OU START', CONFIG.width / 2, 690);
        ctx.globalAlpha = 1;
    }

    // ============================================
    // SELEÇÃO DE FASES
    // ============================================
    updateLevelSelect(input) {
        // Verificar se LEVELS está disponível
        if (typeof LEVELS === 'undefined' || !LEVELS.length) {
            console.error('LEVELS não está definido!');
            this.currentScene = 'menu';
            return;
        }

        // Navegação vertical
        if (input.isPressed('up') && !this.upPressed) {
            this.selectedLevel = Math.max(0, this.selectedLevel - 1);
            this.upPressed = true;
        } else if (!input.isPressed('up')) {
            this.upPressed = false;
        }

        if (input.isPressed('down') && !this.downPressed) {
            this.selectedLevel = Math.min(LEVELS.length - 1, this.selectedLevel + 1);
            this.downPressed = true;
        } else if (!input.isPressed('down')) {
            this.downPressed = false;
        }

        // Confirmar seleção (apenas fases não concluídas)
        if (input.isPressed('shoot') || input.wasPressed('shoot')) {
            const level = LEVELS[this.selectedLevel];
            if (!ProgressManager.isCompleted(level.id)) {
                this.currentScene = 'shipSelect';
                input.reset();
            }
        }

        // Botão B para voltar ao menu
        if (input.wasPressed('back')) {
            this.currentScene = 'menu';
            input.reset();
        }
    }

    drawLevelSelect(ctx) {
        // Verificar se LEVELS está disponível
        if (typeof LEVELS === 'undefined' || !LEVELS.length) {
            ctx.fillStyle = '#000033';
            ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
            ctx.fillStyle = '#ff0000';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('ERRO: LEVELS não carregado', CONFIG.width / 2, CONFIG.height / 2);
            return;
        }

        ctx.fillStyle = '#000033';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

        // Título
        ctx.fillStyle = '#00ffff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SELECIONE A FASE', CONFIG.width / 2, 80);

        // Lista de fases
        const startY = 150;
        const spacing = 100;

        LEVELS.forEach((level, index) => {
            const y = startY + (index * spacing);
            const isSelected = index === this.selectedLevel;
            const isCompleted = ProgressManager.isCompleted(level.id);

            // Box da fase
            ctx.fillStyle = isSelected ? 'rgba(0, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(60, y - 40, CONFIG.width - 120, 80);

            if (isSelected) {
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 3;
                ctx.strokeRect(60, y - 40, CONFIG.width - 120, 80);
            }

            // Número da fase
            ctx.fillStyle = isCompleted ? '#666666' : '#ffffff';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`FASE ${level.id}`, 80, y - 5);

            // Nome da fase
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillText(level.name, 80, y + 20);

            // Status
            if (isCompleted) {
                ctx.fillStyle = '#00ff00';
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.textAlign = 'right';
                ctx.fillText('✓ COMPLETA', CONFIG.width - 80, y + 5);
            } else if (isSelected) {
                ctx.fillStyle = '#ffff00';
                ctx.font = '8px "Press Start 2P", monospace';
                ctx.textAlign = 'right';
                ctx.fillText('▶ PRESSIONE A', CONFIG.width - 80, y + 5);
            }
        });

        // Instruções
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888888';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText('↑↓: NAVEGAR | A: SELECIONAR | B: VOLTAR', CONFIG.width / 2, CONFIG.height - 50);

        // Nota sobre fases concluídas
        ctx.fillStyle = '#666666';
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillText('Fases concluídas não podem ser selecionadas', CONFIG.width / 2, CONFIG.height - 25);
    }

    updateShipSelect(input) {
        if (input.isPressed('left') && !this.leftPressed) {
            this.selectedShip = (this.selectedShip - 1 + SHIPS.length) % SHIPS.length;
            this.leftPressed = true;
        } else if (!input.isPressed('left')) {
            this.leftPressed = false;
        }

        if (input.isPressed('right') && !this.rightPressed) {
            this.selectedShip = (this.selectedShip + 1) % SHIPS.length;
            this.rightPressed = true;
        } else if (!input.isPressed('right')) {
            this.rightPressed = false;
        }

        if (input.isPressed('shoot') || input.wasPressed('shoot')) {
            this.game.startGame(this.selectedShip, this.selectedLevel);
            this.currentScene = 'game';
            input.reset();
        }

        // Botão B para voltar
        if (input.wasPressed('back')) {
            this.currentScene = 'levelSelect';
            input.reset();
        }
    }

    drawShipSelect(ctx) {
        ctx.fillStyle = '#000033';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

        ctx.fillStyle = '#00ffff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SELECIONE SUA NAVE', CONFIG.width / 2, 80);

        const ship = SHIPS[this.selectedShip];
        const centerX = CONFIG.width / 2;
        
        // Layout: Piloto (esquerda) | Nave (direita)
        const pilotX = 120;
        const shipX = 360;
        const previewY = 200;

        // ========== PILOTO ==========
        ctx.save();
        
        // Box do piloto
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.fillRect(20, 120, 200, 200);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 120, 200, 200);

        // Sprite do piloto ou placeholder
        const pilotImg = this.loadImage(ship.pilotSprite);
        if (this.isImageReady(pilotImg)) {
            ctx.drawImage(pilotImg, 40, 140, 160, 160);
        } else {
            // Placeholder do piloto (boneco simples)
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(pilotX, previewY - 40, 30, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(pilotX - 25, previewY - 10, 50, 60);
            ctx.fillRect(pilotX - 35, previewY + 10, 15, 40);
            ctx.fillRect(pilotX + 20, previewY + 10, 15, 40);
        }
        
        // Nome do piloto
        ctx.fillStyle = '#ffff00';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ship.pilotName || 'PILOTO', pilotX, 310);
        
        ctx.restore();

        // ========== NAVE ==========
        ctx.save();
        
        // Box da nave
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(260, 120, 200, 200);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(260, 120, 200, 200);

        // Sprite da nave ou desenho padrão
        const shipImg = this.loadImage(ship.shipSprite);
        if (this.isImageReady(shipImg)) {
            ctx.drawImage(shipImg, shipX - 50, previewY - 50, 100, 100);
        } else {
            // Desenho padrão da nave (ampliado)
            ctx.translate(shipX, previewY);
            ctx.scale(2.5, 2.5);
            
            ctx.fillStyle = ship.color;
            ctx.beginPath();
            ctx.moveTo(0, -16);
            ctx.lineTo(-12, 8);
            ctx.lineTo(-6, 4);
            ctx.lineTo(-6, 12);
            ctx.lineTo(6, 12);
            ctx.lineTo(6, 4);
            ctx.lineTo(12, 8);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = ship.accentColor;
            ctx.fillRect(-3, -8, 6, 12);
            
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(-2, -4, 4, 4);
        }

        ctx.restore();

        // ========== INFO DA NAVE ==========
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ship.name, centerX, 360);

        ctx.font = '8px "Press Start 2P", monospace';
        const statsY = 400;
        const lineHeight = 25;
        
        ctx.textAlign = 'left';
        const statX = centerX - 120;
        
        ctx.fillText(`VELOCIDADE: ${'█'.repeat(Math.floor(ship.speed / 1.5))}`, statX, statsY);
        ctx.fillText(`DANO:       ${'█'.repeat(Math.floor(ship.damage))}`, statX, statsY + lineHeight);
        ctx.fillText(`CADÊNCIA:   ${'█'.repeat(Math.floor(1000 / ship.fireRate))}`, statX, statsY + lineHeight * 2);
        ctx.fillText(`TIPO:       ${ship.shotType.toUpperCase()}`, statX, statsY + lineHeight * 3);

        // Instruções
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888888';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText('◀ ▶: ESCOLHER | A: CONFIRMAR | B: VOLTAR', centerX, 600);
    }

    updateGameOver(input) {
        if (input.isPressed('shoot')) {
            this.currentScene = 'menu';
            input.reset();
        }
    }

    drawGameOver(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

        ctx.fillStyle = '#ff0000';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CONFIG.width / 2, CONFIG.height / 2 - 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText(`PONTUAÇÃO: ${this.game.player.score}`, CONFIG.width / 2, CONFIG.height / 2 + 20);

        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('PRESSIONE A', CONFIG.width / 2, CONFIG.height / 2 + 80);
    }

    updateVictory(input) {
        if (input.isPressed('shoot')) {
            // Marcar fase como concluída
            const level = LEVELS[this.selectedLevel];
            ProgressManager.save(level.id);
            
            this.currentScene = 'levelSelect';
            input.reset();
        }
    }

    drawVictory(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 51, 0.9)';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

        ctx.fillStyle = '#00ff00';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FASE COMPLETA!', CONFIG.width / 2, CONFIG.height / 2 - 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText(`PONTUAÇÃO: ${this.game.player.score}`, CONFIG.width / 2, CONFIG.height / 2 + 20);

        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('PRESSIONE A', CONFIG.width / 2, CONFIG.height / 2 + 80);
    }

    drawPause(ctx) {
        // Overlay escuro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

        // Texto PAUSE
        ctx.fillStyle = '#ffff00';
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSE', CONFIG.width / 2, CONFIG.height / 2 - 30);

        // Instruções
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('START: CONTINUAR', CONFIG.width / 2, CONFIG.height / 2 + 20);
        ctx.fillText('B: VOLTAR AO MENU', CONFIG.width / 2, CONFIG.height / 2 + 50);
    }
}
