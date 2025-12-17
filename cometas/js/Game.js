/**
 * Game.js
 * Classe principal do jogo - Game Loop e gerenciamento de estado
 * Arquitetura: Composition over Inheritance
 * Utiliza sistemas modulares para separação de responsabilidades
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.inputManager = new InputManager();
        this.gameState = new GameState();
        this.particleSystem = new ParticleSystem();
        
        // Entidades do jogo
        this.ship = null;
        this.asteroids = [];
        this.projectiles = [];
        this.powerUps = [];
        this.healthPacks = [];
        
        // Game loop
        this.lastTime = 0;
        this.running = false;
        this.animationFrameId = null;
        this.paused = false;
        
        // Controle de transição de fase
        this.levelTransitionTimer = 0;
        this.levelTransitionDuration = 2.0;  // 2 segundos
        
        // Sistema de power-ups
        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = 20;  // A cada 20 segundos
        
        // Sistema de health packs
        this.healthPackSpawnTimer = 0;
        this.healthPackSpawnInterval = 15;  // A cada 15 segundos
        
        // Controle de pausa
        this.pausePressed = false;
    }

    /**
     * Inicia o jogo
     */
    start() {
        this.gameState.reset();
        this.setupLevel();
        this.running = true;
        this.lastTime = performance.now();
        this.updateHUD();
        this.gameLoop(this.lastTime);
    }

    /**
     * Para o jogo
     */
    stop() {
        this.running = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    /**
     * Configura uma nova fase
     */
    setupLevel() {
        // Cria/reinicia nave no centro
        const centerX = this.renderer.getWidth() / 2;
        const centerY = this.renderer.getHeight() / 2;
        
        if (!this.ship || !this.ship.alive) {
            this.ship = new Ship(centerX, centerY);
        } 
        // Não restaura vida ao passar de fase
        
        // Limpa arrays
        this.asteroids = [];
        this.projectiles = [];
        this.powerUps = [];
        this.particleSystem.clear();
        
        // Cria asteroides para a fase com velocidade aumentada
        const asteroidCount = this.gameState.getAsteroidsForLevel();
        const speedMultiplier = this.gameState.getSpeedMultiplier();
        
        for (let i = 0; i < asteroidCount; i++) {
            this.asteroids.push(
                Asteroid.createOffScreen(
                    this.renderer.getWidth(),
                    this.renderer.getHeight(),
                    Asteroid.SIZE_LARGE,
                    speedMultiplier
                )
            );
        }
        
        // Reseta timer de power-up
        this.powerUpSpawnTimer = 0;
        
        this.updateHUD();
    }

    /**
     * Game Loop principal
     */
    gameLoop(currentTime) {
        if (!this.running) return;
        
        // Calcula delta time em segundos
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);  // Cap em 100ms
        this.lastTime = currentTime;
        
        // Atualiza e renderiza
        this.update(deltaTime);
        this.render();
        
        // Próximo frame
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Atualiza lógica do jogo
     */
    update(deltaTime) {
        const width = this.renderer.getWidth();
        const height = this.renderer.getHeight();
        
        // Sistema de pausa
        if (this.inputManager.isPausing() && !this.pausePressed) {
            this.paused = !this.paused;
            this.pausePressed = true;
            this.showPauseOverlay(this.paused);
        }
        if (!this.inputManager.isPausing()) {
            this.pausePressed = false;
        }
        
        // Não atualiza se pausado
        if (this.paused) return;
        
        // Transição de fase
        if (this.gameState.isLevelComplete) {
            this.levelTransitionTimer += deltaTime;
            if (this.levelTransitionTimer >= this.levelTransitionDuration) {
                this.levelTransitionTimer = 0;
                this.gameState.nextLevel();
                this.setupLevel();
                this.hideLevelCompleteScreen();
            }
            return;  // Não atualiza durante transição
        }
        
        // Spawna power-ups periodicamente
        this.powerUpSpawnTimer += deltaTime;
        if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
            this.powerUpSpawnTimer = 0;
            this.powerUps.push(PowerUp.createOnScreen(width, height));
        }
        
        // Spawna health packs periodicamente
        this.healthPackSpawnTimer += deltaTime;
        if (this.healthPackSpawnTimer >= this.healthPackSpawnInterval) {
            this.healthPackSpawnTimer = 0;
            this.healthPacks.push(HealthPack.createOnScreen(width, height));
        }
        
        // Atualiza nave
        if (this.ship.alive) {
            this.ship.update(deltaTime, width, height, this.inputManager);
            
            // Tiro normal
            if (this.inputManager.isShooting()) {
                const projectile = this.ship.shoot(false);
                if (projectile) {
                    this.projectiles.push(projectile);
                }
            }
            
            // Super tiro (tecla R)
            if (this.inputManager.isUsingSuperShot()) {
                const projectile = this.ship.shoot(true);
                if (projectile) {
                    this.projectiles.push(projectile);
                }
            }
        }
        
        // Reseta input flags
        this.inputManager.resetJustPressed();
        
        // Atualiza asteroides
        this.asteroids.forEach(asteroid => {
            asteroid.update(deltaTime, width, height);
        });
        
        // Atualiza projéteis
        this.projectiles.forEach(projectile => {
            projectile.update(deltaTime, width, height);
        });
        
        // Atualiza power-ups
        this.powerUps.forEach(powerUp => {
            powerUp.update(deltaTime, width, height);
        });
        
        // Atualiza health packs
        this.healthPacks.forEach(healthPack => {
            healthPack.update(deltaTime, width, height);
        });
        
        // Atualiza partículas
        this.particleSystem.update(deltaTime);
        
        // Processa colisões
        this.handleCollisions();
        
        // Remove entidades mortas
        this.asteroids = CollisionSystem.removeDeadEntities(this.asteroids);
        this.projectiles = CollisionSystem.removeDeadEntities(this.projectiles);
        this.powerUps = CollisionSystem.removeDeadEntities(this.powerUps);
        this.healthPacks = CollisionSystem.removeDeadEntities(this.healthPacks);
        
        // Verifica condições de vitória/derrota
        this.checkGameConditions();
        
        // Atualiza HUD
        this.updateHUD();
    }

    /**
     * Processa todas as colisões
     */
    handleCollisions() {
        // Projéteis vs Asteroides
        const collision = CollisionSystem.processProjectileAsteroidCollisions(
            this.projectiles,
            this.asteroids
        );
        
        // Adiciona pontos
        if (collision.scoreGained > 0) {
            this.gameState.addScore(collision.scoreGained);
        }
        
        // Cria explosões para asteroides destruídos
        collision.destroyedAsteroids.forEach(asteroid => {
            this.particleSystem.createExplosion(asteroid.x, asteroid.y, 15);
        });
        
        // Adiciona fragmentos
        this.asteroids.push(...collision.newFragments);
        
        // Nave vs Asteroides
        const shipCollisions = CollisionSystem.processShipAsteroidCollisions(
            this.ship,
            this.asteroids
        );
        
        if (shipCollisions.length > 0) {
            // Aplica dano
            this.ship.takeDamage(34);  // 3 colisões = morte
            
            // Efeito visual
            this.particleSystem.createExplosion(this.ship.x, this.ship.y, 10);
        }
        
        // Nave vs Power-ups
        this.powerUps.forEach(powerUp => {
            if (powerUp.alive && this.ship.alive && this.ship.collidesWith(powerUp)) {
                this.ship.collectPowerUp(powerUp);
                powerUp.destroy();
                this.particleSystem.createExplosion(powerUp.x, powerUp.y, 10);
            }
        });
        
        // Nave vs Health Packs
        this.healthPacks.forEach(healthPack => {
            if (healthPack.alive && this.ship.alive && this.ship.collidesWith(healthPack)) {
                // Restaura vida
                this.ship.heal(healthPack.healAmount);
                healthPack.destroy();
                this.particleSystem.createExplosion(healthPack.x, healthPack.y, 10);
            }
        });
    }

    /**
     * Verifica condições de fim de jogo/fase
     */
    checkGameConditions() {
        // Game Over
        if (!this.ship.alive && !this.gameState.isGameOver) {
            this.gameState.gameOver();
            this.running = false;
            this.showGameOverScreen();
        }
        
        // Fase completa
        if (this.asteroids.length === 0 && !this.gameState.isLevelComplete) {
            this.gameState.completeLevel();
            this.showLevelCompleteScreen();
        }
    }

    /**
     * Renderiza o jogo
     */
    render() {
        this.renderer.render(
            this.ship,
            this.asteroids,
            this.projectiles,
            this.powerUps,
            this.healthPacks,
            this.particleSystem
        );
    }

    /**
     * Atualiza HUD
     */
    updateHUD() {
        document.getElementById('score').textContent = this.gameState.score;
        document.getElementById('level').textContent = this.gameState.level;
        
        if (this.ship && this.ship.alive) {
            const healthPercent = this.ship.getHealthPercentage() * 100;
            document.getElementById('health-bar-fill').style.width = healthPercent + '%';
            
            // Atualiza contador de super tiros
            const superShotDisplay = document.getElementById('super-shot-count');
            if (superShotDisplay) {
                if (this.ship.hasSuperShot) {
                    superShotDisplay.textContent = this.ship.superShotCount;
                    superShotDisplay.parentElement.style.display = 'flex';
                    
                    // Atualiza botão mobile
                    this.inputManager.updateMobileSuperShotButton(true);
                } else {
                    superShotDisplay.parentElement.style.display = 'none';
                    
                    // Esconde botão mobile
                    this.inputManager.updateMobileSuperShotButton(false);
                }
            }
        }
    }

    /**
     * Mostra/esconde overlay de pausa
     */
    showPauseOverlay(show) {
        const pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) {
            if (show) {
                pauseScreen.classList.add('active');
                // Atualiza UI de volume
                window.updateVolumeUI();
                window.updateMuteUI();
            } else {
                pauseScreen.classList.remove('active');
            }
        }
    }

    /**
     * Mostra tela de game over
     */
    showGameOverScreen() {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('gameover-screen').classList.add('active');
        document.getElementById('final-score-value').textContent = this.gameState.score;
        
        // Mostra se é novo recorde
        if (this.gameState.isNewHighScore()) {
            document.querySelector('.new-record').classList.remove('hidden');
        } else {
            document.querySelector('.new-record').classList.add('hidden');
        }
    }

    /**
     * Mostra tela de fase completa
     */
    showLevelCompleteScreen() {
        document.getElementById('level-complete-screen').classList.add('active');
    }

    /**
     * Esconde tela de fase completa
     */
    hideLevelCompleteScreen() {
        document.getElementById('level-complete-screen').classList.remove('active');
    }
}
