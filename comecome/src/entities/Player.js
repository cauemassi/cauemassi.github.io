export class Player {
    constructor(x, y, tileSize) {
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.speed = 100; // pixels per second
        this.radius = tileSize / 2 - 2;
        
        this.direction = null;
        this.nextDirection = null;
        
        // Tile-based movement
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
        
        // Animation
        this.mouthAngle = 0.8;
        this.mouthSpeed = 8;
        this.mouthOpen = true;
        
        // Power-up state
        this.isPoweredUp = false;
        this.powerUpTimer = 0;
    }

    update(deltaTime, input, tileMap) {
        // Handle input
        const inputDir = input.getDirection();
        if (inputDir) {
            this.nextDirection = inputDir;
        }

        // Snap to grid when not moving
        if (!this.isMoving) {
            const currentTile = this.getTilePosition();
            const centerPos = tileMap.tileToWorld(currentTile.x, currentTile.y);
            this.x = centerPos.x;
            this.y = centerPos.y;
            
            // Try to start moving in new direction
            if (this.nextDirection) {
                if (this.canMove(this.nextDirection, tileMap)) {
                    this.direction = this.nextDirection;
                    this.nextDirection = null;
                    this.startMoving(this.direction, tileMap);
                }
            } else if (this.direction) {
                // Continue in current direction if possible
                if (this.canMove(this.direction, tileMap)) {
                    this.startMoving(this.direction, tileMap);
                }
            }
        } else {
            // Move towards target
            this.moveTowardsTarget(deltaTime);
        }

        // Animate mouth
        if (this.mouthOpen) {
            this.mouthAngle -= this.mouthSpeed * deltaTime;
            if (this.mouthAngle <= 0.2) {
                this.mouthOpen = false;
            }
        } else {
            this.mouthAngle += this.mouthSpeed * deltaTime;
            if (this.mouthAngle >= 0.8) {
                this.mouthOpen = true;
            }
        }

        // Update power-up timer
        if (this.isPoweredUp) {
            this.powerUpTimer -= deltaTime;
            if (this.powerUpTimer <= 0) {
                this.isPoweredUp = false;
            }
        }
    }

    startMoving(direction, tileMap) {
        const currentTile = this.getTilePosition();
        let nextTileX = currentTile.x;
        let nextTileY = currentTile.y;

        switch (direction) {
            case 'up':
                nextTileY--;
                break;
            case 'down':
                nextTileY++;
                break;
            case 'left':
                nextTileX--;
                break;
            case 'right':
                nextTileX++;
                break;
        }

        // Wrap around horizontally (tunnel effect)
        if (nextTileX < 0) {
            nextTileX = tileMap.width - 1;
        } else if (nextTileX >= tileMap.width) {
            nextTileX = 0;
        }

        // Wrap around vertically (tunnel effect)
        if (nextTileY < 0) {
            nextTileY = tileMap.height - 1;
        } else if (nextTileY >= tileMap.height) {
            nextTileY = 0;
        }

        if (tileMap.canMoveTo(nextTileX, nextTileY)) {
            const target = tileMap.tileToWorld(nextTileX, nextTileY);
            this.targetX = target.x;
            this.targetY = target.y;
            this.isMoving = true;
            
            // Teleport immediately if wrapping
            if (Math.abs(nextTileX - currentTile.x) > 1 || Math.abs(nextTileY - currentTile.y) > 1) {
                this.x = target.x;
                this.y = target.y;
                this.isMoving = false;
            }
        }
    }

    moveTowardsTarget(deltaTime) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) {
            // Reached target
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMoving = false;
        } else {
            // Move towards target
            const moveDistance = this.speed * deltaTime;
            const ratio = Math.min(moveDistance / distance, 1);
            this.x += dx * ratio;
            this.y += dy * ratio;
        }
    }

    canMove(direction, tileMap) {
        const currentTile = this.getTilePosition();
        let testX = currentTile.x;
        let testY = currentTile.y;

        switch (direction) {
            case 'up':
                testY--;
                break;
            case 'down':
                testY++;
                break;
            case 'left':
                testX--;
                break;
            case 'right':
                testX++;
                break;
        }

        return tileMap.canMoveTo(testX, testY);
    }

    canChangeDirection(dir, tileMap) {
        return this.canMove(dir, tileMap);
    }

    checkWallCollision(tileMap) {
        const tile = tileMap.worldToTile(this.x, this.y);
        return tileMap.isWall(tile.x, tile.y);
    }

    getTilePosition() {
        return {
            x: Math.floor(this.x / this.tileSize),
            y: Math.floor(this.y / this.tileSize)
        };
    }

    activatePowerUp(duration) {
        this.isPoweredUp = true;
        this.powerUpTimer = duration;
    }

    getRotation() {
        switch (this.direction) {
            case 'up': return -Math.PI / 2;
            case 'down': return Math.PI / 2;
            case 'left': return Math.PI;
            case 'right': return 0;
            default: return 0;
        }
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.direction = null;
        this.nextDirection = null;
        this.isMoving = false;
        this.isPoweredUp = false;
        this.powerUpTimer = 0;
    }
}
