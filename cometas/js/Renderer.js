/**
 * Renderer.js
 * Responsável por toda a renderização visual do jogo
 * Separação clara entre lógica de jogo e renderização
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        
        // Setup do canvas para visual retrô
        this.ctx.imageSmoothingEnabled = false;
        
        // Listener para redimensionamento
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Ajusta tamanho do canvas para preencher a janela
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Limpa o canvas
     */
    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Efeito de grid opcional (comentado para performance)
        // this.drawGrid();
    }

    /**
     * Desenha grid de fundo (opcional, estilo retrô)
     */
    drawGrid() {
        const gridSize = 50;
        this.ctx.strokeStyle = '#001100';
        this.ctx.lineWidth = 1;
        
        // Linhas verticais
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Linhas horizontais
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Renderiza todas as entidades do jogo
     */
    render(ship, asteroids, projectiles, powerUps, healthPacks, particleSystem) {
        this.clear();
        
        // Desenha partículas (atrás de tudo)
        particleSystem.draw(this.ctx);
        
        // Desenha asteroides
        asteroids.forEach(asteroid => {
            if (asteroid.alive) {
                asteroid.draw(this.ctx);
            }
        });
        
        // Desenha power-ups
        powerUps.forEach(powerUp => {
            if (powerUp.alive) {
                powerUp.draw(this.ctx);
            }
        });
        
        // Desenha health packs
        healthPacks.forEach(healthPack => {
            if (healthPack.alive) {
                healthPack.draw(this.ctx);
            }
        });
        
        // Desenha projéteis
        projectiles.forEach(projectile => {
            if (projectile.alive) {
                projectile.draw(this.ctx);
            }
        });
        
        // Desenha nave
        if (ship.alive) {
            ship.draw(this.ctx);
        }
    }

    /**
     * Obtém dimensões do canvas
     */
    getWidth() {
        return this.canvas.width;
    }

    getHeight() {
        return this.canvas.height;
    }
}
