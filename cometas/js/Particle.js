/**
 * Particle.js
 * Sistema de partículas para efeitos visuais (explosões)
 */

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    /**
     * Cria explosão em uma posição
     */
    createExplosion(x, y, count = 15) {
        const newParticles = ProceduralSprites.createExplosion(x, y, count);
        this.particles.push(...newParticles);
    }

    /**
     * Atualiza todas as partículas
     */
    update(deltaTime) {
        // Atualiza e remove partículas mortas
        this.particles = this.particles.filter(particle => {
            return ProceduralSprites.updateParticle(particle, deltaTime);
        });
    }

    /**
     * Desenha todas as partículas
     */
    draw(ctx) {
        this.particles.forEach(particle => {
            ProceduralSprites.drawParticle(ctx, particle);
        });
    }

    /**
     * Limpa todas as partículas
     */
    clear() {
        this.particles = [];
    }
}
