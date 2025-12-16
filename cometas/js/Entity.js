/**
 * Entity.js
 * Classe base para todas as entidades do jogo
 * Implementa propriedades e comportamentos comuns
 */

class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;  // Velocidade X
        this.vy = 0;  // Velocidade Y
        this.rotation = 0;
        this.radius = 10;  // Para detecção de colisão
        this.alive = true;
    }

    /**
     * Atualiza física básica da entidade
     */
    update(deltaTime, canvasWidth, canvasHeight) {
        // Atualiza posição baseado na velocidade
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Wrap around screen (teletransporte nas bordas)
        const wrapped = Utils.wrapPosition(this.x, this.y, canvasWidth, canvasHeight);
        this.x = wrapped.x;
        this.y = wrapped.y;
    }

    /**
     * Desenha a entidade (implementado por subclasses)
     */
    draw(ctx) {
        // Override em subclasses
    }

    /**
     * Verifica colisão com outra entidade (círculo vs círculo)
     */
    collidesWith(other) {
        return Utils.circleCollision(
            this.x, this.y, this.radius,
            other.x, other.y, other.radius
        );
    }

    /**
     * Destroi a entidade
     */
    destroy() {
        this.alive = false;
    }

    /**
     * Verifica se está fora da tela (com margem)
     */
    isOffScreen(canvasWidth, canvasHeight, margin = 50) {
        return this.x < -margin || 
               this.x > canvasWidth + margin || 
               this.y < -margin || 
               this.y > canvasHeight + margin;
    }
}
