// ============================================
// GAME
// ============================================
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = new InputManager();
        this.sceneManager = new SceneManager(this);
        
        // Mobile controls
        if (CONFIG.isMobile) {
            document.getElementById('mobileControls').classList.add('active');
        }

        this.reset();
        this.lastTime = performance.now();
        this.loop();
    }

    reset() {
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.background = new Background();
        this.boss = null;
        this.bossMode = false;
        this.waveTimer = 0;
        this.currentWave = 0;
        this.gameTime = 0;
    }

    startGame(shipIndex) {
        this.reset();
        this.player = new Player(SHIPS[shipIndex]);
    }

    updateGame(input, deltaTime) {
        if (!this.player) return;

        this.gameTime += deltaTime;

        // Background
        if (!this.bossMode) {
            this.background.update();
        }

        // Player
        this.player.update(input, deltaTime);

        if (input.isPressed('shoot')) {
            const newProjectiles = this.player.shoot();
            this.projectiles.push(...newProjectiles);
        }

        // Spawn waves
        if (!this.bossMode && this.gameTime > 60000) {
            // Spawn boss
            this.boss = new Boss();
            this.bossMode = true;
        } else if (!this.bossMode) {
            this.waveTimer += deltaTime;
            if (this.waveTimer > 2000) {
                this.spawnWave();
                this.waveTimer = 0;
            }
        }

        // Boss
        if (this.boss) {
            this.boss.update(deltaTime, this.player.x, this.player.y);
            if (this.boss.active && Math.random() < 0.02) {
                const bossProjectiles = this.boss.shoot(this.player.x, this.player.y);
                this.projectiles.push(...bossProjectiles);
            }

            if (this.boss.dead) {
                this.player.score += 5000;
                this.createExplosion(this.boss.x, this.boss.y, 30, '#ff00ff');
                this.sceneManager.currentScene = 'victory';
            }
        }

        // Enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(deltaTime, this.player.x, this.player.y);
            
            if (Math.random() < 0.01) {
                const enemyProjectiles = enemy.shoot(this.player.x, this.player.y);
                this.projectiles.push(...enemyProjectiles);
            }

            return !enemy.dead;
        });

        // Projectiles
        this.projectiles = this.projectiles.filter(proj => {
            proj.update();
            return !proj.dead;
        });

        // Particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return !particle.isDead();
        });

        // Collisions
        this.checkCollisions();

        // Game Over
        if (this.player.lives <= 0) {
            this.sceneManager.currentScene = 'gameOver';
        }
    }

    spawnWave() {
        this.currentWave++;
        const types = ['drone', 'fighter', 'heavy'];
        const type = types[Math.min(Math.floor(this.currentWave / 3), 2)];
        const count = 3 + Math.floor(this.currentWave / 2);

        for (let i = 0; i < count; i++) {
            const x = 50 + (CONFIG.width - 100) * (i / count);
            const y = -50 - i * 50;
            this.enemies.push(new Enemy(x, y, type));
        }
    }

    checkCollisions() {
        // Player projectiles vs enemies
        for (let proj of this.projectiles) {
            if (proj.isEnemy) continue;

            for (let enemy of this.enemies) {
                if (this.checkCollision(proj, enemy)) {
                    proj.dead = true;
                    if (enemy.hit(proj.damage)) {
                        this.player.score += enemy.score;
                        this.createExplosion(enemy.x, enemy.y, 10, enemy.color);
                    }
                }
            }

            // Vs boss
            if (this.boss && this.boss.active && this.checkCollision(proj, this.boss)) {
                proj.dead = true;
                this.boss.hit(proj.damage);
            }
        }

        // Enemy projectiles vs player
        for (let proj of this.projectiles) {
            if (!proj.isEnemy) continue;

            if (this.checkCollision(proj, this.player)) {
                proj.dead = true;
                if (this.player.hit()) {
                    this.createExplosion(this.player.x, this.player.y, 15, '#00ffff');
                }
            }
        }

        // Player vs enemies
        for (let enemy of this.enemies) {
            if (this.checkCollision(this.player, enemy)) {
                enemy.dead = true;
                if (this.player.hit()) {
                    this.createExplosion(this.player.x, this.player.y, 15, '#00ffff');
                }
            }
        }
    }

    checkCollision(a, b) {
        const ax = a.x - (a.width || 16) / 2;
        const ay = a.y - (a.height || 16) / 2;
        const aw = a.width || 16;
        const ah = a.height || 16;

        const bx = b.x - (b.width || 16) / 2;
        const by = b.y - (b.height || 16) / 2;
        const bw = b.width || 16;
        const bh = b.height || 16;

        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    createExplosion(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    drawGame(ctx) {
        this.background.draw(ctx);

        // Enemies
        this.enemies.forEach(enemy => enemy.draw(ctx));

        // Boss
        if (this.boss) {
            this.boss.draw(ctx);
        }

        // Player
        if (this.player) {
            this.player.draw(ctx);
        }

        // Projectiles
        this.projectiles.forEach(proj => proj.draw(ctx));

        // Particles
        this.particles.forEach(particle => particle.draw(ctx));

        // UI
        this.drawUI(ctx);
    }

    drawUI(ctx) {
        if (!this.player) return;

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px monospace';
        ctx.textAlign = 'left';

        // Score
        ctx.fillText(`PONTOS: ${this.player.score}`, 10, 30);

        // Lives
        ctx.fillText(`VIDAS:`, 10, 60);
        for (let i = 0; i < this.player.lives; i++) {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(80 + i * 25, 47, 20, 10);
        }

        // Wave
        if (!this.bossMode) {
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText(`ONDA: ${this.currentWave}`, CONFIG.width - 10, 30);
        }
    }

    loop() {
        const currentTime = performance.now();
        const deltaTime = Math.min(currentTime - this.lastTime, 100);
        this.lastTime = currentTime;

        this.sceneManager.update(this.input, deltaTime);
        
        this.ctx.imageSmoothingEnabled = false;
        this.sceneManager.draw(this.ctx);

        requestAnimationFrame(() => this.loop());
    }
}
