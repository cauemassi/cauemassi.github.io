/**
 * Ship.js
 * Classe da nave do jogador
 * Implementa movimento, rotação e mecânicas de tiro
 */

class Ship extends Entity {
    constructor(x, y) {
        super(x, y);
        this.radius = 15;
        this.maxSpeed = 300;
        this.acceleration = 400;
        this.deceleration = 0.97;  // Fricção
        this.health = 100;
        this.maxHealth = 100;
        this.thrustActive = false;
        
        // Cooldown de tiro
        this.shootCooldown = 0;
        this.shootDelay = 0.15;  // 150ms entre tiros
        
        // Invencibilidade temporária após dano
        this.invincible = false;
        this.invincibleTime = 0;
        this.invincibleDuration = 2.0;  // 2 segundos
        
        // Power-up Super Tiro
        this.hasSuperShot = false;
        this.superShotCount = 0;
        this.maxSuperShots = 3;
    }

    /**
     * Atualiza a nave baseado no input do jogador
     */
    update(deltaTime, canvasWidth, canvasHeight, inputManager) {
        // Salva posição anterior para detectar colisão com borda
        const oldX = this.x;
        const oldY = this.y;
        
        // Rotação: joystick (mobile) ou mouse (desktop)
        const joystickAngle = inputManager.getJoystickRotation();
        
        if (joystickAngle !== null) {
            // Mobile: usa ângulo do joystick
            this.rotation = joystickAngle;
        } else {
            // Desktop: usa posição do mouse
            const mousePos = inputManager.getMousePosition();
            const targetAngle = Utils.angleBetween(this.x, this.y, mousePos.x, mousePos.y);
            this.rotation = targetAngle;
        }

        // Movimento WASD
        let ax = 0;
        let ay = 0;
        this.thrustActive = false;

        if (inputManager.isMovingForward()) {
            ax += Math.cos(this.rotation) * this.acceleration;
            ay += Math.sin(this.rotation) * this.acceleration;
            this.thrustActive = true;
        }
        if (inputManager.isMovingBackward()) {
            ax -= Math.cos(this.rotation) * this.acceleration * 0.5;
            ay -= Math.sin(this.rotation) * this.acceleration * 0.5;
        }
        if (inputManager.isMovingLeft()) {
            const perpAngle = this.rotation - Math.PI / 2;
            ax += Math.cos(perpAngle) * this.acceleration * 0.7;
            ay += Math.sin(perpAngle) * this.acceleration * 0.7;
        }
        if (inputManager.isMovingRight()) {
            const perpAngle = this.rotation + Math.PI / 2;
            ax += Math.cos(perpAngle) * this.acceleration * 0.7;
            ay += Math.sin(perpAngle) * this.acceleration * 0.7;
        }

        // Aplica aceleração
        this.vx += ax * deltaTime;
        this.vy += ay * deltaTime;

        // Aplica fricção
        this.vx *= this.deceleration;
        this.vy *= this.deceleration;

        // Limita velocidade máxima
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        // Atualiza posição
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Verifica colisão com bordas (nave toma dano)
        let hitBorder = false;
        const margin = this.radius;
        
        if (this.x < margin) {
            this.x = margin;
            this.vx = 0;
            hitBorder = true;
        }
        if (this.x > canvasWidth - margin) {
            this.x = canvasWidth - margin;
            this.vx = 0;
            hitBorder = true;
        }
        if (this.y < margin) {
            this.y = margin;
            this.vy = 0;
            hitBorder = true;
        }
        if (this.y > canvasHeight - margin) {
            this.y = canvasHeight - margin;
            this.vy = 0;
            hitBorder = true;
        }
        
        // Aplica dano se bateu na borda
        if (hitBorder) {
            this.takeDamage(20);
        }

        // Atualiza cooldown de tiro
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }

        // Atualiza invencibilidade
        if (this.invincible) {
            this.invincibleTime -= deltaTime;
            if (this.invincibleTime <= 0) {
                this.invincible = false;
            }
        }
    }

    /**
     * Tenta atirar um projétil
     * @param {boolean} isSuperShot - Se é um super tiro
     * @returns {Projectile|SuperProjectile|null} Novo projétil ou null se em cooldown
     */
    shoot(isSuperShot = false) {
        if (this.shootCooldown <= 0) {
            this.shootCooldown = this.shootDelay;
            
            // Cria projétil na ponta da nave
            const spawnDistance = 20;
            const px = this.x + Math.cos(this.rotation) * spawnDistance;
            const py = this.y + Math.sin(this.rotation) * spawnDistance;
            
            // Super tiro
            if (isSuperShot && this.hasSuperShot && this.superShotCount > 0) {
                this.superShotCount--;
                if (this.superShotCount <= 0) {
                    this.hasSuperShot = false;
                }
                return new SuperProjectile(px, py, this.rotation);
            }
            
            return new Projectile(px, py, this.rotation);
        }
        return null;
    }

    /**
     * Coleta power-up
     */
    collectPowerUp(powerUp) {
        if (powerUp.type === PowerUp.TYPE_SUPER_SHOT) {
            this.hasSuperShot = true;
            this.superShotCount = this.maxSuperShots;
        }
    }

    /**
     * Aplica dano à nave
     */
    takeDamage(amount) {
        if (this.invincible) return;
        
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        // Ativa invencibilidade
        this.invincible = true;
        this.invincibleTime = this.invincibleDuration;
        
        if (this.health <= 0) {
            this.destroy();
        }
    }

    /**
     * Obtém porcentagem de vida (0-1)
     */
    getHealthPercentage() {
        return this.health / this.maxHealth;
    }
    
    /**
     * Cura a nave
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    /**
     * Desenha a nave
     */
    draw(ctx) {
        // Efeito de piscar quando invencível
        if (this.invincible && Math.floor(this.invincibleTime * 10) % 2 === 0) {
            return;  // Não desenha em frames alternados
        }
        
        ProceduralSprites.drawShip(ctx, this.x, this.y, this.rotation, this.thrustActive);
    }
}
