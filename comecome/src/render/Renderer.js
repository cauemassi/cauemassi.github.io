export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderMap(tileMap) {
        const tileSize = tileMap.tileSize;

        for (let y = 0; y < tileMap.height; y++) {
            for (let x = 0; x < tileMap.width; x++) {
                const tile = tileMap.getTile(x, y);
                
                if (tile === 0) { // Wall
                    this.renderWall(x, y, tileSize, tileMap);
                }
            }
        }
    }

    renderWall(x, y, tileSize, tileMap) {
        const worldX = x * tileSize;
        const worldY = y * tileSize;
        
        this.ctx.strokeStyle = '#2121de';
        this.ctx.lineWidth = 3;
        
        // Check neighbors for rounded corners
        const hasTop = !tileMap.isWall(x, y - 1);
        const hasBottom = !tileMap.isWall(x, y + 1);
        const hasLeft = !tileMap.isWall(x - 1, y);
        const hasRight = !tileMap.isWall(x + 1, y);

        this.ctx.beginPath();
        
        if (hasTop) {
            this.ctx.moveTo(worldX, worldY);
            this.ctx.lineTo(worldX + tileSize, worldY);
        }
        if (hasBottom) {
            this.ctx.moveTo(worldX, worldY + tileSize);
            this.ctx.lineTo(worldX + tileSize, worldY + tileSize);
        }
        if (hasLeft) {
            this.ctx.moveTo(worldX, worldY);
            this.ctx.lineTo(worldX, worldY + tileSize);
        }
        if (hasRight) {
            this.ctx.moveTo(worldX + tileSize, worldY);
            this.ctx.lineTo(worldX + tileSize, worldY + tileSize);
        }
        
        this.ctx.stroke();
    }

    renderPellets(pellets) {
        for (const pellet of pellets) {
            if (pellet.collected) continue;

            this.ctx.save();
            this.ctx.translate(pellet.x, pellet.y);

            if (pellet.type === 'normal') {
                this.ctx.fillStyle = '#ffb8ae';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, pellet.radius, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (pellet.type === 'power') {
                const pulse = Math.sin(pellet.pulseTime) * 0.2 + 1;
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, pellet.radius * pulse, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (pellet.type === 'special') {
                const pulse = Math.sin(pellet.pulseTime * 2) * 0.3 + 1;
                const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, pellet.radius * pulse);
                gradient.addColorStop(0, '#ff00ff');
                gradient.addColorStop(0.5, '#00ffff');
                gradient.addColorStop(1, '#ffff00');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, pellet.radius * pulse, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Star effect
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 2;
                for (let i = 0; i < 4; i++) {
                    this.ctx.save();
                    this.ctx.rotate((Math.PI / 2) * i + pellet.pulseTime);
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -pellet.radius * 1.2);
                    this.ctx.lineTo(0, pellet.radius * 1.2);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }

            this.ctx.restore();
        }
    }

    renderPlayer(player) {
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        this.ctx.rotate(player.getRotation());

        // Body
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, player.radius);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(1, '#ffd700');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        
        // Pac-man with animated mouth
        const startAngle = player.mouthAngle;
        const endAngle = Math.PI * 2 - player.mouthAngle;
        
        this.ctx.arc(0, 0, player.radius, startAngle, endAngle);
        this.ctx.lineTo(0, 0);
        this.ctx.closePath();
        this.ctx.fill();

        // Eye
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(player.radius / 3, -player.radius / 3, player.radius / 8, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();

        // Power-up indicator
        if (player.isPoweredUp) {
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, player.radius + 4, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    renderGhost(ghost) {
        this.ctx.save();
        this.ctx.translate(ghost.x, ghost.y);

        const radius = ghost.radius;
        
        // Ghost color based on state
        let bodyColor = ghost.color;
        let eyeColor = '#fff';
        let pupilColor = '#2121de';

        if (ghost.isVulnerable()) {
            bodyColor = ghost.vulnerableTimer < 2 ? 
                (Math.floor(ghost.animationTime * 8) % 2 === 0 ? '#2121de' : '#fff') : 
                '#2121de';
            eyeColor = '#ff0000';
            pupilColor = '#fff';
        } else if (ghost.isEaten()) {
            // Just eyes
            this.renderGhostEyes(radius, eyeColor, pupilColor, ghost.direction);
            this.ctx.restore();
            return;
        }

        // Body
        this.ctx.fillStyle = bodyColor;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, Math.PI, 0, false);
        this.ctx.lineTo(radius, radius);
        
        // Wavy bottom
        const waves = 3;
        const waveWidth = (radius * 2) / waves;
        const waveHeight = radius / 3;
        
        for (let i = 0; i < waves; i++) {
            const waveX = radius - (i * waveWidth);
            const offset = Math.sin(ghost.animationTime * 4 + i) * (waveHeight / 2);
            this.ctx.lineTo(waveX - waveWidth / 2, radius - waveHeight + offset);
        }
        
        this.ctx.lineTo(-radius, radius);
        this.ctx.closePath();
        this.ctx.fill();

        // Eyes
        this.renderGhostEyes(radius, eyeColor, pupilColor, ghost.direction);

        this.ctx.restore();
    }

    renderGhostEyes(radius, eyeColor, pupilColor, direction) {
        const eyeRadius = radius / 4;
        const pupilRadius = eyeRadius / 2;
        const eyeOffsetX = radius / 3;
        const eyeOffsetY = -radius / 4;

        // Direction offset for pupils
        let pupilDx = 0, pupilDy = 0;
        switch (direction) {
            case 'up': pupilDy = -pupilRadius / 2; break;
            case 'down': pupilDy = pupilRadius / 2; break;
            case 'left': pupilDx = -pupilRadius / 2; break;
            case 'right': pupilDx = pupilRadius / 2; break;
        }

        // Left eye
        this.ctx.fillStyle = eyeColor;
        this.ctx.beginPath();
        this.ctx.arc(-eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = pupilColor;
        this.ctx.beginPath();
        this.ctx.arc(-eyeOffsetX + pupilDx, eyeOffsetY + pupilDy, pupilRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Right eye
        this.ctx.fillStyle = eyeColor;
        this.ctx.beginPath();
        this.ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = pupilColor;
        this.ctx.beginPath();
        this.ctx.arc(eyeOffsetX + pupilDx, eyeOffsetY + pupilDy, pupilRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSE', this.canvas.width / 2, this.canvas.height / 2);
    }

    renderHUD(score, level, specialAvailable) {
        const padding = 10;
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px "Press Start 2P", monospace';
        this.ctx.textAlign = 'left';
        
        // Score
        this.ctx.fillText(`SCORE: ${score}`, padding, 20);
        
        // Level
        this.ctx.fillText(`LEVEL: ${level}`, padding, 45);
        
        // Special power-up indicator
        if (specialAvailable) {
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.fillText('SPECIAL: READY (R)', padding, 70);
        }
    }
}
