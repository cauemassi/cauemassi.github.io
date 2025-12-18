// ============================================
// SCENE MANAGER
// ============================================
class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentScene = 'menu';
        this.selectedShip = 0;
    }

    update(input, deltaTime) {
        switch(this.currentScene) {
            case 'menu':
                this.updateMenu(input);
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
            case 'shipSelect':
                this.drawShipSelect(ctx);
                break;
            case 'game':
                this.game.drawGame(ctx);
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
            this.currentScene = 'shipSelect';
            input.reset();
        }
    }

    drawMenu(ctx) {
        ctx.fillStyle = '#000033';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

        // Título
        ctx.save();
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ASAS SÔNICAS', CONFIG.width / 2, 200);
        ctx.restore();

        // Subtítulo
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText('SHOOT \'EM UP 16 BITS', CONFIG.width / 2, 250);

        // Instruções
        ctx.font = '16px monospace';
        ctx.fillText('PRESSIONE ESPAÇO', CONFIG.width / 2, 400);
        ctx.fillText('OU TOQUE PARA INICIAR', CONFIG.width / 2, 430);

        // Controles
        ctx.font = '12px monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText('WASD/SETAS: MOVER', CONFIG.width / 2, 520);
        ctx.fillText('ESPAÇO: ATIRAR', CONFIG.width / 2, 540);

        // Animação
        const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#ffff00';
        ctx.fillText('▶ START ◀', CONFIG.width / 2, 480);
        ctx.globalAlpha = 1;
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

        if (input.isPressed('shoot')) {
            this.game.startGame(this.selectedShip);
            this.currentScene = 'game';
            input.reset();
        }
    }

    drawShipSelect(ctx) {
        ctx.fillStyle = '#000033';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SELECIONE SUA NAVE', CONFIG.width / 2, 80);

        const ship = SHIPS[this.selectedShip];
        const centerX = CONFIG.width / 2;
        const centerY = 250;

        // Preview da nave
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(2, 2);
        
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

        ctx.restore();

        // Stats
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText(ship.name, centerX, 380);

        ctx.font = '14px monospace';
        const statsY = 420;
        const lineHeight = 25;
        
        ctx.textAlign = 'left';
        const statX = centerX - 120;
        
        ctx.fillText(`VELOCIDADE: ${'█'.repeat(ship.speed / 1.5)}`, statX, statsY);
        ctx.fillText(`DANO:       ${'█'.repeat(ship.damage)}`, statX, statsY + lineHeight);
        ctx.fillText(`CADÊNCIA:   ${'█'.repeat(Math.floor(1000 / ship.fireRate))}`, statX, statsY + lineHeight * 2);
        ctx.fillText(`TIPO:       ${ship.shotType.toUpperCase()}`, statX, statsY + lineHeight * 3);

        // Instruções
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888888';
        ctx.font = '12px monospace';
        ctx.fillText('◀ SETAS: ESCOLHER | ESPAÇO: CONFIRMAR ▶', centerX, 600);
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
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CONFIG.width / 2, CONFIG.height / 2 - 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText(`PONTUAÇÃO: ${this.game.player.score}`, CONFIG.width / 2, CONFIG.height / 2 + 20);

        ctx.font = '16px monospace';
        ctx.fillText('PRESSIONE ESPAÇO', CONFIG.width / 2, CONFIG.height / 2 + 80);
    }

    updateVictory(input) {
        if (input.isPressed('shoot')) {
            this.currentScene = 'menu';
            input.reset();
        }
    }

    drawVictory(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 51, 0.9)';
        ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FASE COMPLETA!', CONFIG.width / 2, CONFIG.height / 2 - 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText(`PONTUAÇÃO: ${this.game.player.score}`, CONFIG.width / 2, CONFIG.height / 2 + 20);

        ctx.font = '16px monospace';
        ctx.fillText('PRESSIONE ESPAÇO', CONFIG.width / 2, CONFIG.height / 2 + 80);
    }
}
