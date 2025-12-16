// Arquivo de suporte para algoritmos de pathfinding e comportamentos de IA
export class GhostAI {
    static calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    static getDirectionToTarget(currentX, currentY, targetX, targetY) {
        const dx = targetX - currentX;
        const dy = targetY - currentY;

        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }

    static findPath(startX, startY, endX, endY, tileMap) {
        // Simple A* pathfinding implementation
        const openSet = [{ x: startX, y: startY, g: 0, h: 0, f: 0, parent: null }];
        const closedSet = new Set();

        while (openSet.length > 0) {
            // Get node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();

            if (current.x === endX && current.y === endY) {
                return this.reconstructPath(current);
            }

            closedSet.add(`${current.x},${current.y}`);

            // Check neighbors
            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 }
            ];

            for (const neighbor of neighbors) {
                if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;
                if (tileMap.isWall(neighbor.x, neighbor.y)) continue;

                const g = current.g + 1;
                const h = this.calculateDistance(neighbor.x, neighbor.y, endX, endY);
                const f = g + h;

                const existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
                
                if (!existing) {
                    openSet.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        g, h, f,
                        parent: current
                    });
                } else if (g < existing.g) {
                    existing.g = g;
                    existing.f = f;
                    existing.parent = current;
                }
            }
        }

        return null; // No path found
    }

    static reconstructPath(node) {
        const path = [];
        let current = node;
        
        while (current.parent) {
            path.unshift({ x: current.x, y: current.y });
            current = current.parent;
        }
        
        return path;
    }

    static predictPlayerPosition(player, stepsAhead) {
        const prediction = {
            x: player.getTilePosition().x,
            y: player.getTilePosition().y
        };

        switch (player.direction) {
            case 'up':
                prediction.y -= stepsAhead;
                break;
            case 'down':
                prediction.y += stepsAhead;
                break;
            case 'left':
                prediction.x -= stepsAhead;
                break;
            case 'right':
                prediction.x += stepsAhead;
                break;
        }

        return prediction;
    }

    static getScatterTarget(personality, tileMap) {
        // Scatter mode - ghosts go to their corners
        const corners = {
            blinky: { x: tileMap.width - 2, y: 1 },
            pinky: { x: 1, y: 1 },
            inky: { x: tileMap.width - 2, y: tileMap.height - 2 },
            clyde: { x: 1, y: tileMap.height - 2 }
        };

        return corners[personality] || corners.blinky;
    }
}
