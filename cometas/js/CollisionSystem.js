/**
 * CollisionSystem.js
 * Sistema responsável por detectar e processar colisões
 * Separação de responsabilidades: lógica de colisão isolada
 */

class CollisionSystem {
    /**
     * Processa colisões entre projéteis e asteroides
     * @returns {Object} Informações sobre colisões { destroyedAsteroids, newFragments, score }
     */
    static processProjectileAsteroidCollisions(projectiles, asteroids) {
        const destroyedAsteroids = [];
        const newFragments = [];
        let scoreGained = 0;

        projectiles.forEach(projectile => {
            if (!projectile.alive) return;

            asteroids.forEach(asteroid => {
                if (!asteroid.alive) return;

                if (projectile.collidesWith(asteroid)) {
                    // Marca ambos para destruição
                    projectile.destroy();
                    asteroid.destroy();
                    
                    // Adiciona à lista de destruídos
                    if (!destroyedAsteroids.includes(asteroid)) {
                        destroyedAsteroids.push(asteroid);
                        scoreGained += asteroid.points;
                        
                        // Quebra o asteroide se não for pequeno
                        const fragments = asteroid.break();
                        newFragments.push(...fragments);
                    }
                }
            });
        });

        return { destroyedAsteroids, newFragments, scoreGained };
    }

    /**
     * Processa colisões entre nave e asteroides
     * @returns {Array} Asteroides que colidiram com a nave
     */
    static processShipAsteroidCollisions(ship, asteroids) {
        const collidedAsteroids = [];

        if (!ship.alive || ship.invincible) return collidedAsteroids;

        asteroids.forEach(asteroid => {
            if (!asteroid.alive) return;

            if (ship.collidesWith(asteroid)) {
                collidedAsteroids.push(asteroid);
            }
        });

        return collidedAsteroids;
    }

    /**
     * Remove entidades mortas de um array
     */
    static removeDeadEntities(entities) {
        return entities.filter(entity => entity.alive);
    }
}
