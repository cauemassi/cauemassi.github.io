// ============================================
// PROJECTILE
// ============================================
class Projectile {
    constructor(x, y, vx, vy, damage, isEnemy = false, type = 'normal') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.isEnemy = isEnemy;
        this.type = type;
        this.width = 4;
        this.height = 12;
        this.dead = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -20 || this.x > CONFIG.width + 20 || 
            this.y < -20 || this.y > CONFIG.height + 20) {
            this.dead = true;
        }
    }

    draw(ctx) {
        ctx.save();
        
        if (this.isEnemy) {
            ctx.fillStyle = '#ff3333';
            ctx.shadowColor = '#ff0000';
        } else {
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
        }
        
        ctx.shadowBlur = 8;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        ctx.restore();
    }

    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
}
