/**
 * Asteroid.js
 * Classe dos asteroides (cometas)
 * Implementa diferentes tamanhos e comportamento de divisão
 */

class Asteroid extends Entity {
    static SIZE_LARGE = 'large';
    static SIZE_MEDIUM = 'medium';
    static SIZE_SMALL = 'small';
    
    constructor(x, y, size = Asteroid.SIZE_LARGE, vx = null, vy = null, speedMultiplier = 1.0) {
        super(x, y);
        
        this.size = size;
        this.rotationSpeed = Utils.random(-2, 2);  // Velocidade de rotação
        this.speedMultiplier = speedMultiplier;
        
        // Define propriedades baseado no tamanho
        this.setupSize(speedMultiplier);
        
        // Gera forma procedural única
        this.shape = ProceduralSprites.generateAsteroidShape(this.radius, this.vertexCount);
        
        // Define velocidade
        if (vx !== null && vy !== null) {
            this.vx = vx;
            this.vy = vy;
        } else {
            // Velocidade aleatória se não especificada
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(this.minSpeed, this.maxSpeed);
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }
    }

    /**
     * Configura propriedades baseado no tamanho
     */
    setupSize(speedMultiplier = 1.0) {
        switch (this.size) {
            case Asteroid.SIZE_LARGE:
                this.radius = 40;
                this.vertexCount = 10;
                this.minSpeed = 30 * speedMultiplier;
                this.maxSpeed = 60 * speedMultiplier;
                this.points = 20;
                this.health = 1;
                break;
            case Asteroid.SIZE_MEDIUM:
                this.radius = 25;
                this.vertexCount = 8;
                this.minSpeed = 50 * speedMultiplier;
                this.maxSpeed = 100 * speedMultiplier;
                this.points = 50;
                this.health = 1;
                break;
            case Asteroid.SIZE_SMALL:
                this.radius = 15;
                this.vertexCount = 6;
                this.minSpeed = 70 * speedMultiplier;
                this.maxSpeed = 130 * speedMultiplier;
                this.points = 100;
                this.health = 1;
                break;
        }
    }

    /**
     * Atualiza o asteroide
     */
    update(deltaTime, canvasWidth, canvasHeight) {
        super.update(deltaTime, canvasWidth, canvasHeight);
        
        // Rotação contínua
        this.rotation += this.rotationSpeed * deltaTime;
    }

    /**
     * Quebra o asteroide em pedaços menores
     * @returns {Array} Array de novos asteroides menores ou vazio
     */
    break() {
        const fragments = [];
        
        if (this.size === Asteroid.SIZE_LARGE) {
            // Quebra em 2 médios
            for (let i = 0; i < 2; i++) {
                const angle = Utils.random(0, Math.PI * 2);
                const speed = Utils.random(60, 120) * this.speedMultiplier;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                fragments.push(new Asteroid(this.x, this.y, Asteroid.SIZE_MEDIUM, vx, vy, this.speedMultiplier));
            }
        } else if (this.size === Asteroid.SIZE_MEDIUM) {
            // Quebra em 2 pequenos
            for (let i = 0; i < 2; i++) {
                const angle = Utils.random(0, Math.PI * 2);
                const speed = Utils.random(80, 150) * this.speedMultiplier;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                fragments.push(new Asteroid(this.x, this.y, Asteroid.SIZE_SMALL, vx, vy, this.speedMultiplier));
            }
        }
        // SIZE_SMALL não quebra, apenas retorna array vazio
        
        return fragments;
    }

    /**
     * Desenha o asteroide
     */
    draw(ctx) {
        ProceduralSprites.drawAsteroid(ctx, this.x, this.y, this.rotation, this.shape);
    }

    /**
     * Cria asteroide em posição aleatória fora da tela
     */
    static createOffScreen(canvasWidth, canvasHeight, size = Asteroid.SIZE_LARGE, speedMultiplier = 1.0) {
        const margin = 50;
        const side = Utils.randomInt(0, 3);  // 0=top, 1=right, 2=bottom, 3=left
        
        let x, y;
        
        switch (side) {
            case 0: // Top
                x = Utils.random(0, canvasWidth);
                y = -margin;
                break;
            case 1: // Right
                x = canvasWidth + margin;
                y = Utils.random(0, canvasHeight);
                break;
            case 2: // Bottom
                x = Utils.random(0, canvasWidth);
                y = canvasHeight + margin;
                break;
            case 3: // Left
                x = -margin;
                y = Utils.random(0, canvasHeight);
                break;
        }
        
        // Direciona o asteroide para dentro da tela
        const targetX = Utils.random(canvasWidth * 0.3, canvasWidth * 0.7);
        const targetY = Utils.random(canvasHeight * 0.3, canvasHeight * 0.7);
        const angle = Utils.angleBetween(x, y, targetX, targetY);
        
        const asteroid = new Asteroid(x, y, size, null, null, speedMultiplier);
        const speed = Utils.random(asteroid.minSpeed, asteroid.maxSpeed);
        asteroid.vx = Math.cos(angle) * speed;
        asteroid.vy = Math.sin(angle) * speed;
        
        return asteroid;
    }
}
