export class Ghost {
    constructor(x, y, tileSize, color, personality, difficulty) {
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.color = color;
        this.personality = personality;
        this.baseSpeed = 80 * difficulty.ghostSpeed;
        this.speed = this.baseSpeed;
        this.radius = tileSize / 2 - 2;
        
        this.direction = 'left';
        this.nextDirection = null;
        
        // Tile-based movement
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
        
        // AI
        this.decisionTimer = 0;
        this.decisionInterval = difficulty.ghostDecisionSpeed;
        
        // States
        this.state = 'chase'; // chase, vulnerable, eaten
        this.vulnerableTimer = 0;
        this.eatenTimer = 0;
        
        // Animation
        this.animationTime = 0;
        
        // Home corner for Clyde
        this.homeCorner = this.getHomeCorner(personality);
    }

    update(deltaTime, player, tileMap, otherGhosts) {
        this.animationTime += deltaTime;
        
        // Update state timers
        if (this.state === 'vulnerable') {
            this.vulnerableTimer -= deltaTime;
            if (this.vulnerableTimer <= 0) {
                this.state = 'chase';
                this.speed = this.baseSpeed;
            }
        } else if (this.state === 'eaten') {
            this.eatenTimer -= deltaTime;
            if (this.eatenTimer <= 0) {
                this.state = 'chase';
                this.speed = this.baseSpeed;
            }
            return; // Don't move when eaten
        }

        // Tile-based movement
        if (!this.isMoving) {
            // Snap to grid
            const currentTile = this.getTilePosition(tileMap);
            const centerPos = tileMap.tileToWorld(currentTile.x, currentTile.y);
            this.x = centerPos.x;
            this.y = centerPos.y;
            
            // Make decision at intersections
            this.makeDecision(player, tileMap, otherGhosts);
            
            // Start moving
            if (this.direction) {
                this.startMoving(this.direction, tileMap);
            }
        } else {
            // Move towards target
            this.moveTowardsTarget(deltaTime);
        }
    }

    startMoving(direction, tileMap) {
        const currentTile = this.getTilePosition(tileMap);
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
        } else {
            // Can't move in this direction, force new decision
            this.direction = null;
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

    getTilePosition(tileMap) {
        return tileMap.worldToTile(this.x, this.y);
    }

    makeDecision(player, tileMap, otherGhosts) {
        const currentTile = tileMap.worldToTile(this.x, this.y);
        const availablePaths = tileMap.getAvailablePaths(currentTile.x, currentTile.y);
        
        if (availablePaths.length === 0) return;

        // Remove opposite direction to prevent backtracking
        const opposite = this.getOppositeDirection(this.direction);
        const validPaths = availablePaths.filter(dir => dir !== opposite);
        
        if (validPaths.length === 0) {
            this.direction = availablePaths[0];
            return;
        }

        let target;
        
        if (this.state === 'vulnerable') {
            // Run away from player
            target = this.getRunAwayTarget(player, tileMap);
        } else {
            // Chase based on personality
            target = this.getChaseTarget(player, tileMap, otherGhosts);
        }

        // Choose direction that gets closest to target
        this.direction = this.chooseBestDirection(validPaths, currentTile, target);
    }

    getChaseTarget(player, tileMap, otherGhosts) {
        const playerTile = player.getTilePosition();

        switch (this.personality) {
            case 'blinky': // Direct chase
                return playerTile;

            case 'pinky': // Ambush - 4 tiles ahead
                const ahead = 4;
                let targetX = playerTile.x;
                let targetY = playerTile.y;
                
                switch (player.direction) {
                    case 'up': targetY -= ahead; break;
                    case 'down': targetY += ahead; break;
                    case 'left': targetX -= ahead; break;
                    case 'right': targetX += ahead; break;
                }
                
                return { x: targetX, y: targetY };

            case 'inky': // Chaotic - based on Blinky
                const blinky = otherGhosts.find(g => g.personality === 'blinky');
                if (!blinky) return playerTile;
                
                const blinkyTile = tileMap.worldToTile(blinky.x, blinky.y);
                const aheadDist = 2;
                let pAheadX = playerTile.x;
                let pAheadY = playerTile.y;
                
                switch (player.direction) {
                    case 'up': pAheadY -= aheadDist; break;
                    case 'down': pAheadY += aheadDist; break;
                    case 'left': pAheadX -= aheadDist; break;
                    case 'right': pAheadX += aheadDist; break;
                }
                
                const vectorX = pAheadX - blinkyTile.x;
                const vectorY = pAheadY - blinkyTile.y;
                
                return {
                    x: blinkyTile.x + vectorX * 2,
                    y: blinkyTile.y + vectorY * 2
                };

            case 'clyde': // Coward - flee when close
                const currentTile = tileMap.worldToTile(this.x, this.y);
                const distance = Math.sqrt(
                    Math.pow(currentTile.x - playerTile.x, 2) +
                    Math.pow(currentTile.y - playerTile.y, 2)
                );
                
                if (distance < 8) {
                    return this.homeCorner;
                }
                return playerTile;

            default:
                return playerTile;
        }
    }

    getRunAwayTarget(player, tileMap) {
        const playerTile = player.getTilePosition();
        const currentTile = tileMap.worldToTile(this.x, this.y);
        
        // Run in opposite direction
        return {
            x: currentTile.x + (currentTile.x - playerTile.x) * 2,
            y: currentTile.y + (currentTile.y - playerTile.y) * 2
        };
    }

    chooseBestDirection(paths, currentPos, target) {
        let bestDir = paths[0];
        let bestDist = Infinity;

        for (const dir of paths) {
            let testX = currentPos.x;
            let testY = currentPos.y;

            switch (dir) {
                case 'up': testY--; break;
                case 'down': testY++; break;
                case 'left': testX--; break;
                case 'right': testX++; break;
            }

            const dist = Math.sqrt(
                Math.pow(testX - target.x, 2) +
                Math.pow(testY - target.y, 2)
            );

            if (dist < bestDist) {
                bestDist = dist;
                bestDir = dir;
            }
        }

        return bestDir;
    }

    getOppositeDirection(dir) {
        switch (dir) {
            case 'up': return 'down';
            case 'down': return 'up';
            case 'left': return 'right';
            case 'right': return 'left';
            default: return null;
        }
    }

    getHomeCorner(personality) {
        switch (personality) {
            case 'blinky': return { x: 17, y: 1 };
            case 'pinky': return { x: 1, y: 1 };
            case 'inky': return { x: 17, y: 20 };
            case 'clyde': return { x: 1, y: 20 };
            default: return { x: 1, y: 1 };
        }
    }

    makeVulnerable(duration) {
        this.state = 'vulnerable';
        this.vulnerableTimer = duration;
        this.speed = this.baseSpeed * 0.5;
    }

    makeEaten(duration = 3) {
        this.state = 'eaten';
        this.eatenTimer = duration;
    }

    isVulnerable() {
        return this.state === 'vulnerable';
    }

    isEaten() {
        return this.state === 'eaten';
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.direction = 'left';
        this.isMoving = false;
        this.state = 'chase';
        this.speed = this.baseSpeed;
        this.vulnerableTimer = 0;
        this.eatenTimer = 0;
    }
}
