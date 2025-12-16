/**
 * SuperProjectile.js
 * Projétil especial mais poderoso com visual diferenciado
 */

class SuperProjectile extends Entity {
    constructor(x, y, angle) {
        super(x, y);
        this.radius = 8;  // Maior que projétil normal
        this.speed = 700;  // Mais rápido
        this.lifetime = 3.0;  // Dura mais
        this.age = 0;
        this.damage = 999;  // Destrói qualquer asteroide
        
        // Define velocidade baseada no ângulo
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        
        this.pulseTime = 0;
    }

    /**
     * Atualiza o super projétil
     */
    update(deltaTime, canvasWidth, canvasHeight) {
        // Atualiza posição sem wrap
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        this.age += deltaTime;
        this.pulseTime += deltaTime * 10;
        
        // Morre após lifetime ou ao sair da tela
        if (this.age >= this.lifetime || this.isOffScreen(canvasWidth, canvasHeight)) {
            this.destroy();
        }
    }

    /**
     * Desenha o super projétil
     */
    draw(ctx) {
        const pulse = Math.sin(this.pulseTime) * 0.3 + 1.0;
        
        ctx.save();
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffff00';
        
        // Núcleo amarelo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Halo branco interno
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, (this.radius * 0.5) * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
