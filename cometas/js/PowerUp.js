/**
 * PowerUp.js
 * Classe para power-ups coletáveis que concedem habilidades especiais
 */

class PowerUp extends Entity {
    static TYPE_SUPER_SHOT = 'super_shot';
    
    constructor(x, y, type = PowerUp.TYPE_SUPER_SHOT) {
        super(x, y);
        this.type = type;
        this.radius = 20;
        this.rotationSpeed = 2;
        this.pulseTime = 0;
        
        // Movimento lento flutuante
        const angle = Utils.random(0, Math.PI * 2);
        const speed = 30;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Tempo de vida (30 segundos)
        this.lifetime = 30;
        this.age = 0;
    }

    /**
     * Atualiza o power-up
     */
    update(deltaTime, canvasWidth, canvasHeight) {
        super.update(deltaTime, canvasWidth, canvasHeight);
        
        this.rotation += this.rotationSpeed * deltaTime;
        this.pulseTime += deltaTime * 3;
        this.age += deltaTime;
        
        // Morre após lifetime
        if (this.age >= this.lifetime) {
            this.destroy();
        }
    }

    /**
     * Desenha o power-up
     */
    draw(ctx) {
        const pulse = Math.sin(this.pulseTime) * 0.3 + 1.0;
        const size = this.radius * pulse;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Símbolo de raio (poder especial)
        ctx.strokeStyle = '#ffff00';
        ctx.fillStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffff00';
        
        // Desenha estrela de 4 pontas
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI / 4) * i;
            const radius = i % 2 === 0 ? size : size * 0.4;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Letra R no centro
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText('R', 0, 0);
        
        ctx.restore();
    }

    /**
     * Cria power-up em posição aleatória na tela
     */
    static createOnScreen(canvasWidth, canvasHeight) {
        const margin = 100;
        const x = Utils.random(margin, canvasWidth - margin);
        const y = Utils.random(margin, canvasHeight - margin);
        return new PowerUp(x, y);
    }
}
