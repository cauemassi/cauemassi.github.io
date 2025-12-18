// Cell.js - Representa uma célula da grade
export class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.pipe = null;
        this.isStart = false;
        this.isEnd = false;
    }

    setPipe(pipe) {
        if (!this.isStart && !this.isEnd) {
            this.pipe = pipe;
        }
    }

    removePipe() {
        if (!this.isStart && !this.isEnd) {
            this.pipe = null;
        }
    }

    hasPipe() {
        return this.pipe !== null;
    }

    isEmpty() {
        return !this.hasPipe() && !this.isStart && !this.isEnd;
    }

    setAsStart(pipe) {
        this.isStart = true;
        this.pipe = pipe;
    }

    setAsEnd(pipe) {
        this.isEnd = true;
        this.pipe = pipe;
    }
}
