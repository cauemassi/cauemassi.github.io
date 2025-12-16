export class Pellet {
    constructor(x, y, tileSize, type = 'normal') {
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.type = type; // normal, power, special
        this.radius = this.getRadius();
        this.collected = false;
        this.points = this.getPoints();
        
        // Animation
        this.pulseTime = 0;
    }

    getRadius() {
        switch (this.type) {
            case 'power': return this.tileSize / 3;
            case 'special': return this.tileSize / 2.5;
            default: return this.tileSize / 8;
        }
    }

    getPoints() {
        switch (this.type) {
            case 'power': return 50;
            case 'special': return 100;
            default: return 10;
        }
    }

    update(deltaTime) {
        this.pulseTime += deltaTime * 3;
    }

    checkCollision(player) {
        if (this.collected) return false;

        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < (this.radius + player.radius);
    }

    collect() {
        this.collected = true;
    }
}
