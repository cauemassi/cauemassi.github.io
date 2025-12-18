// Grid.js - Grade do jogo
import { Cell } from './Cell.js';
import { Pipe } from '../pipes/Pipe.js';

export class Grid {
    constructor(size) {
        this.size = size;
        this.cells = [];
        this.initialize();
    }

    initialize() {
        this.cells = [];
        for (let row = 0; row < this.size; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.size; col++) {
                this.cells[row][col] = new Cell(row, col);
            }
        }
    }

    getCell(row, col) {
        if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
            return this.cells[row][col];
        }
        return null;
    }

    setStart(row, col, direction) {
        const cell = this.getCell(row, col);
        if (cell) {
            const pipe = new Pipe('start', 0);
            pipe.startDirection = direction;
            cell.setAsStart(pipe);
        }
    }

    setEnd(row, col, direction) {
        const cell = this.getCell(row, col);
        if (cell) {
            const pipe = new Pipe('end', 0);
            pipe.endDirection = direction;
            cell.setAsEnd(pipe);
        }
    }

    placePipe(row, col, pipeData) {
        const cell = this.getCell(row, col);
        if (cell && cell.isEmpty()) {
            const pipe = new Pipe(pipeData.type, pipeData.rotation);
            cell.setPipe(pipe);
            return true;
        }
        return false;
    }

    rotatePipe(row, col) {
        const cell = this.getCell(row, col);
        if (cell && cell.hasPipe() && !cell.isStart && !cell.isEnd) {
            cell.pipe.rotate();
            return true;
        }
        return false;
    }

    getNeighbor(row, col, direction) {
        const offsets = {
            'up': [-1, 0],
            'down': [1, 0],
            'left': [0, -1],
            'right': [0, 1]
        };
        
        const [dRow, dCol] = offsets[direction];
        return this.getCell(row + dRow, col + dCol);
    }

    clear() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.cells[row][col];
                if (!cell.isStart && !cell.isEnd) {
                    cell.removePipe();
                }
            }
        }
    }

    findStart() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.cells[row][col];
                if (cell.isStart) {
                    return { row, col, cell };
                }
            }
        }
        return null;
    }

    findEnd() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.cells[row][col];
                if (cell.isEnd) {
                    return { row, col, cell };
                }
            }
        }
        return null;
    }
}
