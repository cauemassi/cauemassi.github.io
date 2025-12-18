// ============================================
// ENEMY
// ============================================
class Enemy {
    constructor(x, y, type = 'drone') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.dead = false;
        this.shootCooldown = 0;
        
        switch(type) {
            case 'drone':
                this.width = 24;
                this.height = 24;
                this.hp = 1;
                this.speed = 2;
                this.score = 100;
                this.color = '#ff8800';
                this.fireRate = 2000;
                break;
            case 'fighter':
                this.width = 32;
                this.height = 32;
                this.hp = 3;
                this.speed = 1.5;
                this.score = 300;
                this.color = '#ff0088';
                this.fireRate = 1500;
                this.zigzag = 0;
                break;
            case 'heavy':
                this.width = 40;
                this.height = 40;
                this.hp = 5;
                this.speed = 1;
                this.score = 500;
                this.color = '#8800ff';
                this.fireRate = 1000;
                break;
        }
    }

    update(deltaTime, playerX, playerY) {
        switch(this.type) {
            case 'drone':
                this.y += this.speed;
                break;
            case 'fighter':
                this.y += this.speed;
                this.zigzag += 0.1;
                this.x += Math.sin(this.zigzag) * 2;
                break;
            case 'heavy':
                this.y += this.speed;
                break;
        }

        this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);

        if (this.y > CONFIG.height + 50) {
            this.dead = true;
        }
    }

    shoot(playerX, playerY) {
        if (this.shootCooldown > 0 || this.y < 0) return [];
        
        this.shootCooldown = this.fireRate;
        const projectiles = [];

        if (this.type === 'heavy') {
            // Tiro em leque
            for (let i = -1; i <= 1; i++) {
                const angle = Math.PI / 2 + i * 0.3;
                projectiles.push(new Projectile(
                    this.x, this.y + 20,
                    Math.cos(angle) * 5, Math.sin(angle) * 5,
                    1, true
                ));
            }
        } else {
            // Tiro direcionado ao jogador
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = 6;
            
            projectiles.push(new Projectile(
                this.x, this.y + 16,
                (dx / dist) * speed, (dy / dist) * speed,
                1, true
            ));
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
        
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        // Formato diferente por tipo
        if (this.type === 'drone') {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + 12);
            ctx.lineTo(this.x - 12, this.y - 12);
            ctx.lineTo(this.x + 12, this.y - 12);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'fighter') {
            ctx.fillRect(this.x - 16, this.y - 16, 32, 32);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
