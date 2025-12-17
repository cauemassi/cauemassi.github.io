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
                    // Verifica se é super projétil
                    const isSuperShot = projectile instanceof SuperProjectile;
                    
                    if (isSuperShot) {
                        // Super tiro NÃO é destruído (atravessa)
                        asteroid.destroy();
                        
                        // Lógica especial do super tiro
                        if (!destroyedAsteroids.includes(asteroid)) {
                            destroyedAsteroids.push(asteroid);
                            scoreGained += asteroid.points;
                            
                            // Grande -> 2 pequenos, Médio -> desaparece, Pequeno -> destruído
                            if (asteroid.size === Asteroid.SIZE_LARGE) {
                                // Cria 2 pequenos diretamente
                                const fragments = this.createSmallFragments(asteroid, 2);
                                newFragments.push(...fragments);
                            }
                            // Médio e pequeno simplesmente desaparecem (sem fragmentos)
                        }
                    } else {
                        // Projétil normal
                        projectile.destroy();
                        asteroid.destroy();
                        
                        if (!destroyedAsteroids.includes(asteroid)) {
                            destroyedAsteroids.push(asteroid);
                            scoreGained += asteroid.points;
                            
                            // Quebra normalmente
                            const fragments = asteroid.break();
                            newFragments.push(...fragments);
                        }
                    }
                }
            });
        });

        return { destroyedAsteroids, newFragments, scoreGained };
    }
    
    /**
     * Cria fragmentos pequenos a partir de um asteroide
     */
    static createSmallFragments(asteroid, count) {
        const fragments = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Utils.random(-0.5, 0.5);
            const speed = asteroid.speed * 1.2;
            fragments.push(new Asteroid(
                asteroid.x,
                asteroid.y,
                Asteroid.SIZE_SMALL,
                angle,
                speed
            ));
        }
        return fragments;
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
