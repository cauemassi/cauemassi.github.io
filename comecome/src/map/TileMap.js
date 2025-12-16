export class TileMap {
    constructor(mapData, tileSize) {
        this.map = mapData;
        this.tileSize = tileSize;
        this.width = mapData[0].length;
        this.height = mapData.length;
    }

    getTile(x, y) {
        // Wrap coordinates
        x = ((x % this.width) + this.width) % this.width;
        y = ((y % this.height) + this.height) % this.height;
        
        return this.map[y][x];
    }

    setTile(x, y, value) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.map[y][x] = value;
        }
    }

    isWall(x, y) {
        return this.getTile(x, y) === 0;
    }

    isPellet(x, y) {
        return this.getTile(x, y) === 1;
    }

    isPowerUp(x, y) {
        return this.getTile(x, y) === 2;
    }

    isSpecialPowerUp(x, y) {
        return this.getTile(x, y) === 3;
    }

    canMoveTo(x, y) {
        // Wrap coordinates
        x = ((x % this.width) + this.width) % this.width;
        y = ((y % this.height) + this.height) % this.height;
        
        const tile = this.getTile(x, y);
        return tile !== 0;
    }

    worldToTile(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.tileSize),
            y: Math.floor(worldY / this.tileSize)
        };
    }

    tileToWorld(tileX, tileY) {
        return {
            x: tileX * this.tileSize + this.tileSize / 2,
            y: tileY * this.tileSize + this.tileSize / 2
        };
    }

    getPlayerSpawn() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.map[y][x] === 5) {
                    return this.tileToWorld(x, y);
                }
            }
        }
        return { x: this.tileSize * 9.5, y: this.tileSize * 16.5 };
    }

    getGhostSpawns() {
        const spawns = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.map[y][x] === 6) {
                    spawns.push(this.tileToWorld(x, y));
                }
            }
        }
        return spawns;
    }

    countPellets() {
        let count = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.isPellet(x, y)) {
                    count++;
                }
            }
        }
        return count;
    }

    getAllIntersections() {
        const intersections = [];
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (!this.isWall(x, y)) {
                    const paths = this.getAvailablePaths(x, y);
                    if (paths.length > 2) {
                        intersections.push({ x, y });
                    }
                }
            }
        }
        return intersections;
    }

    getAvailablePaths(tileX, tileY) {
        const paths = [];
        const directions = [
            { dx: 0, dy: -1, name: 'up' },
            { dx: 0, dy: 1, name: 'down' },
            { dx: -1, dy: 0, name: 'left' },
            { dx: 1, dy: 0, name: 'right' }
        ];

        for (const dir of directions) {
            if (this.canMoveTo(tileX + dir.dx, tileY + dir.dy)) {
                paths.push(dir.name);
            }
        }

        return paths;
    }
}
