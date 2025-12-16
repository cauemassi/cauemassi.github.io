/**
 * Projectile.js
 * Classe de projéteis disparados pela nave
 */

class Projectile extends Entity {
    constructor(x, y, angle) {
        super(x, y);
        this.radius = 3;
        this.speed = 600;
        this.lifetime = 2.0;  // 2 segundos de vida
        this.age = 0;
        
        // Define velocidade baseada no ângulo
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    /**
     * Atualiza o projétil
     */
    update(deltaTime, canvasWidth, canvasHeight) {
        // Atualiza posição sem wrap (projéteis não teletransportam)
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        this.age += deltaTime;
        
        // Projétil morre após lifetime ou ao sair da tela
        if (this.age >= this.lifetime || this.isOffScreen(canvasWidth, canvasHeight)) {
            this.destroy();
        }
    }

    /**
     * Desenha o projétil
     */
    draw(ctx) {
        ProceduralSprites.drawProjectile(ctx, this.x, this.y);
    }
}
