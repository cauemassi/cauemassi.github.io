// FlowEngine.js - Controla o fluxo da água
export class FlowEngine {
    constructor(grid) {
        this.grid = grid;
        this.currentPosition = null;
        this.currentDirection = null;
        this.path = [];
        this.isFlowing = false;
        this.flowInterval = null;
        this.speed = 500;
        this.speedMultiplier = 1;
    }

    start(speed) {
        this.speed = speed;
        this.isFlowing = true;
        this.path = [];
        
        const start = this.grid.findStart();
        if (!start) return false;

        this.currentPosition = { row: start.row, col: start.col };
        this.currentDirection = start.cell.pipe.startDirection;
        
        this.path.push({ ...this.currentPosition });
        start.cell.pipe.hasWater = true;

        this.flowInterval = setInterval(() => this.flowStep(), this.speed / this.speedMultiplier);
        return true;
    }

    flowStep() {
        if (!this.isFlowing) return;

        const nextCell = this.grid.getNeighbor(
            this.currentPosition.row,
            this.currentPosition.col,
            this.currentDirection
        );

        if (!nextCell) {
            this.leak();
            return;
        }

        if (!nextCell.hasPipe()) {
            this.leak();
            return;
        }

        if (!nextCell.pipe.canReceiveFrom(this.currentDirection)) {
            this.leak();
            return;
        }

        nextCell.pipe.hasWater = true;
        this.path.push({
            row: nextCell.row,
            col: nextCell.col
        });

        // Chama callback para atualizar visual
        if (this.onFlowStep) {
            this.onFlowStep();
        }

        if (nextCell.isEnd) {
            this.complete();
            return;
        }

        const nextDirection = nextCell.pipe.getNextDirection(this.currentDirection);
        if (!nextDirection) {
            this.leak();
            return;
        }

        this.currentPosition = { row: nextCell.row, col: nextCell.col };
        this.currentDirection = nextDirection;
    }

    leak() {
        this.isFlowing = false;
        if (this.flowInterval) {
            clearInterval(this.flowInterval);
            this.flowInterval = null;
        }
        if (this.onLeak) this.onLeak();
    }

    complete() {
        this.isFlowing = false;
        if (this.flowInterval) {
            clearInterval(this.flowInterval);
            this.flowInterval = null;
        }
        if (this.onComplete) this.onComplete();
    }

    pause() {
        if (this.flowInterval) {
            clearInterval(this.flowInterval);
            this.flowInterval = null;
        }
    }

    resume() {
        if (this.isFlowing && !this.flowInterval) {
            this.flowInterval = setInterval(() => this.flowStep(), this.speed / this.speedMultiplier);
        }
    }

    stop() {
        this.isFlowing = false;
        if (this.flowInterval) {
            clearInterval(this.flowInterval);
            this.flowInterval = null;
        }
    }

    setSpeed(multiplier) {
        this.speedMultiplier = multiplier;
        if (this.flowInterval) {
            clearInterval(this.flowInterval);
            this.flowInterval = setInterval(() => this.flowStep(), this.speed / this.speedMultiplier);
        }
    }

    getPathLength() {
        return this.path.length;
    }
}
