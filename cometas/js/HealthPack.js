/**
 * HealthPack.js
 * Classe para corações de vida coletáveis
 */

class HealthPack extends Entity {
    constructor(x, y) {
        super(x, y);
        this.radius = 20;
        this.rotationSpeed = 2;
        this.pulseTime = 0;
        this.healAmount = 34; // Restaura ~1/3 da vida
        
        // Movimento lento flutuante
        const angle = Utils.random(0, Math.PI * 2);
        const speed = 30;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Tempo de vida (25 segundos)
        this.lifetime = 25;
        this.age = 0;
    }

    /**
     * Atualiza o health pack
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
     * Desenha o coração
     */
    draw(ctx) {
        const pulse = Math.sin(this.pulseTime) * 0.3 + 1.0;
        const size = this.radius * pulse;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Desenha coração
        ctx.fillStyle = '#ff0066';
        ctx.strokeStyle = '#ff66aa';
        ctx.lineWidth = 2;
        
        // Coração usando path
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        // Curva esquerda superior
        ctx.bezierCurveTo(
            -size / 2, -topCurveHeight,
            -size, topCurveHeight / 2,
            0, size
        );
        // Curva direita superior
        ctx.bezierCurveTo(
            size, topCurveHeight / 2,
            size / 2, -topCurveHeight,
            0, topCurveHeight
        );
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        // Brilho
        ctx.shadowColor = '#ff0066';
        ctx.shadowBlur = 10 * pulse;
        ctx.stroke();
        
        ctx.restore();
    }

    /**
     * Cria health pack em posição aleatória na tela
     */
    static createOnScreen(width, height) {
        const margin = 100;
        const x = Utils.random(margin, width - margin);
        const y = Utils.random(margin, height - margin);
        return new HealthPack(x, y);
    }
}
