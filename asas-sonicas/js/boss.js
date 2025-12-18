// ============================================
// BOSS - HARPIA MECÂNICA
// ============================================
class Boss {
    constructor() {
        this.x = CONFIG.width / 2;
        this.y = -100;
        this.width = 80;
        this.height = 80;
        this.hp = 100;
        this.maxHp = 100;
        this.dead = false;
        this.active = false;
        this.phase = 1;
        this.shootCooldown = 0;
        this.moveTimer = 0;
        this.targetX = this.x;
        this.pattern = 0;
        this.patternTimer = 0;
    }

    activate() {
        this.active = true;
    }

    update(deltaTime, playerX, playerY) {
        // Entrada do chefe
        if (!this.active) {
            this.y += 1;
            if (this.y >= 100) {
                this.y = 100;
                this.active = true;
            }
            return;
        }

        // Movimento
        this.moveTimer += deltaTime;
        if (this.moveTimer > 2000) {
            this.targetX = 100 + Math.random() * (CONFIG.width - 200);
            this.moveTimer = 0;
        }

        const dx = this.targetX - this.x;
        this.x += dx * 0.02;

        // Mudança de fase
        if (this.hp < this.maxHp * 0.5 && this.phase === 1) {
            this.phase = 2;
        }

        // Pattern timer
        this.patternTimer += deltaTime;
        if (this.patternTimer > 3000) {
            this.pattern = (this.pattern + 1) % 3;
            this.patternTimer = 0;
        }

        this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);
    }

    shoot(playerX, playerY) {
        if (this.shootCooldown > 0) return [];
        
        const cooldown = this.phase === 2 ? 300 : 500;
        this.shootCooldown = cooldown;
        const projectiles = [];

        switch(this.pattern) {
            case 0: // Rajada frontal
                for (let i = 0; i < 5; i++) {
                    projectiles.push(new Projectile(
                        this.x + (i - 2) * 15, this.y + 40,
                        0, 8,
                        1, true
                    ));
                }
                break;
            case 1: // Espiral
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + this.patternTimer * 0.01;
                    projectiles.push(new Projectile(
                        this.x, this.y + 40,
                        Math.cos(angle) * 5, Math.sin(angle) * 5,
                        1, true
                    ));
                }
                break;
            case 2: // Direcionado
                const dx = playerX - this.x;
                const dy = playerY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                for (let i = -1; i <= 1; i++) {
                    const spread = i * 0.2;
                    projectiles.push(new Projectile(
                        this.x, this.y + 40,
                        ((dx / dist) + spread) * 6, (dy / dist) * 6,
                        1, true
                    ));
                }
                break;
        }

        return projectiles;
    }

    hit(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.dead = true;
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.save();

        // Corpo principal
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 20;
        ctx.fillRect(this.x - 40, this.y - 40, 80, 80);

        // Detalhes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 30, this.y - 30, 60, 60);

        // Olho
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Asas
        ctx.fillStyle = '#8800ff';
        ctx.fillRect(this.x - 60, this.y - 10, 20, 40);
        ctx.fillRect(this.x + 40, this.y - 10, 20, 40);

        ctx.restore();

        // Barra de vida
        if (this.active) {
            const barWidth = 300;
            const barHeight = 20;
            const barX = (CONFIG.width - barWidth) / 2;
            const barY = 20;

            ctx.fillStyle = '#330033';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            ctx.fillStyle = '#ff00ff';
            const hpWidth = (this.hp / this.maxHp) * barWidth;
            ctx.fillRect(barX, barY, hpWidth, barHeight);

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barWidth, barHeight);

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('HARPIA MECÂNICA', CONFIG.width / 2, barY - 5);
        }
    }
}
