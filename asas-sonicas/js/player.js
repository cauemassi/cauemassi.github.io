// ============================================
// PLAYER
// ============================================
class Player {
    constructor(ship) {
        this.ship = ship;
        this.x = CONFIG.width / 2;
        this.y = CONFIG.height - 100;
        this.width = 32;
        this.height = 32;
        this.lives = 3;
        this.score = 0;
        this.invulnerable = false;
        this.invulnerableTime = 0;
        this.shootCooldown = 0;
        this.blinkTimer = 0;
    }

    update(input, deltaTime) {
        // Movimento
        let dx = 0, dy = 0;
        
        if (input.isPressed('left')) dx -= 1;
        if (input.isPressed('right')) dx += 1;
        if (input.isPressed('up')) dy -= 1;
        if (input.isPressed('down')) dy += 1;

        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        this.x += dx * this.ship.speed;
        this.y += dy * this.ship.speed;

        this.x = Math.max(16, Math.min(CONFIG.width - 16, this.x));
        this.y = Math.max(16, Math.min(CONFIG.height - 16, this.y));

        // Disparo
        this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);

        // Invulnerabilidade
        if (this.invulnerable) {
            this.invulnerableTime -= deltaTime;
            this.blinkTimer += deltaTime;
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false;
            }
        }
    }

    shoot() {
        if (this.shootCooldown > 0) return [];

        this.shootCooldown = this.ship.fireRate;
        const projectiles = [];

        switch(this.ship.shotType) {
            case 'single':
                projectiles.push(new Projectile(this.x, this.y - 16, 0, -12, this.ship.damage));
                break;
            case 'double':
                projectiles.push(new Projectile(this.x - 8, this.y - 16, 0, -12, this.ship.damage));
                projectiles.push(new Projectile(this.x + 8, this.y - 16, 0, -12, this.ship.damage));
                break;
            case 'spread':
                projectiles.push(new Projectile(this.x, this.y - 16, 0, -12, this.ship.damage));
                projectiles.push(new Projectile(this.x - 6, this.y - 16, -3, -11, this.ship.damage));
                projectiles.push(new Projectile(this.x + 6, this.y - 16, 3, -11, this.ship.damage));
                break;
            case 'focused':
                projectiles.push(new Projectile(this.x, this.y - 16, 0, -15, this.ship.damage * 1.5));
                break;
        }

        return projectiles;
    }

    hit() {
        if (this.invulnerable) return false;
        
        this.lives--;
        this.invulnerable = true;
        this.invulnerableTime = 2000;
        this.blinkTimer = 0;
        return true;
    }

    draw(ctx) {
        if (this.invulnerable && Math.floor(this.blinkTimer / 100) % 2 === 0) {
            return;
        }

        ctx.save();
        
        // Corpo da nave
        ctx.fillStyle = this.ship.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 16);
        ctx.lineTo(this.x - 12, this.y + 8);
        ctx.lineTo(this.x - 6, this.y + 4);
        ctx.lineTo(this.x - 6, this.y + 12);
        ctx.lineTo(this.x + 6, this.y + 12);
        ctx.lineTo(this.x + 6, this.y + 4);
        ctx.lineTo(this.x + 12, this.y + 8);
        ctx.closePath();
        ctx.fill();

        // Detalhes
        ctx.fillStyle = this.ship.accentColor;
        ctx.fillRect(this.x - 3, this.y - 8, 6, 12);
        
        // Cockpit
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x - 2, this.y - 4, 4, 4);

        ctx.restore();
    }
}
