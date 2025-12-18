// Pipe.js - Classe representando um cano
export class Pipe {
    constructor(type, rotation = 0) {
        this.type = type; // 'straight', 'curve', 't', 'cross', 'start', 'end'
        this.rotation = rotation; // 0, 90, 180, 270
        this.hasWater = false;
    }

    rotate() {
        if (this.type !== 'start' && this.type !== 'end') {
            this.rotation = (this.rotation + 90) % 360;
        }
    }

    // Retorna as direções de saída baseado no tipo e rotação
    getConnections() {
        const connections = this.getBaseConnections();
        return this.rotateConnections(connections);
    }

    getBaseConnections() {
        switch (this.type) {
            case 'straight':
                return ['up', 'down'];
            case 'curve':
                return ['up', 'right'];
            case 't':
                return ['up', 'left', 'right'];
            case 'cross':
                return ['up', 'down', 'left', 'right'];
            case 'start':
                return [this.startDirection || 'right'];
            case 'end':
                return [this.endDirection || 'left'];
            default:
                return [];
        }
    }

    rotateConnections(connections) {
        const rotations = this.rotation / 90;
        const directionMap = ['up', 'right', 'down', 'left'];
        
        return connections.map(dir => {
            const index = directionMap.indexOf(dir);
            const newIndex = (index + rotations) % 4;
            return directionMap[newIndex];
        });
    }

    // Verifica se pode receber água de uma direção
    canReceiveFrom(direction) {
        const oppositeDir = this.getOppositeDirection(direction);
        return this.getConnections().includes(oppositeDir);
    }

    // Retorna a próxima direção do fluxo (se houver)
    getNextDirection(fromDirection) {
        if (!this.canReceiveFrom(fromDirection)) return null;
        
        const connections = this.getConnections();
        const oppositeDir = this.getOppositeDirection(fromDirection);
        
        // Remove a direção de entrada
        const exits = connections.filter(dir => dir !== oppositeDir);
        
        return exits.length > 0 ? exits[0] : null;
    }

    getOppositeDirection(direction) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        return opposites[direction];
    }

    clone() {
        const pipe = new Pipe(this.type, this.rotation);
        if (this.startDirection) pipe.startDirection = this.startDirection;
        if (this.endDirection) pipe.endDirection = this.endDirection;
        return pipe;
    }
}
