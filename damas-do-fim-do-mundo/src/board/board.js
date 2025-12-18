import { Piece } from './piece.js';
import { PLAYER, PIECE_TYPE } from '../utils/constants.js';

export class Board {
    constructor() {
        this.grid = this.createEmptyGrid();
        this.initializePieces();
    }

    createEmptyGrid() {
        return Array(8).fill(null).map(() => Array(8).fill(null));
    }

    initializePieces() {
        // AI pieces (top rows)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    this.grid[row][col] = new Piece(PLAYER.AI);
                }
            }
        }

        // Player pieces (bottom rows)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    this.grid[row][col] = new Piece(PLAYER.HUMAN);
                }
            }
        }
    }

    getPiece(row, col) {
        if (!this.isValidPosition(row, col)) return null;
        return this.grid[row][col];
    }

    setPiece(row, col, piece) {
        if (this.isValidPosition(row, col)) {
            this.grid[row][col] = piece;
        }
    }

    removePiece(row, col) {
        this.setPiece(row, col, null);
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return false;

        this.setPiece(toRow, toCol, piece);
        this.removePiece(fromRow, fromCol);

        // Check for promotion
        if (piece.owner === PLAYER.HUMAN && toRow === 0) {
            piece.promote();
        } else if (piece.owner === PLAYER.AI && toRow === 7) {
            piece.promote();
        }

        return true;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    isPlayableSquare(row, col) {
        return (row + col) % 2 === 1;
    }

    getAllPieces(owner) {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.owner === owner) {
                    pieces.push({ row, col, piece });
                }
            }
        }
        return pieces;
    }

    clone() {
        const newBoard = new Board();
        newBoard.grid = this.grid.map(row => 
            row.map(piece => piece ? piece.clone() : null)
        );
        return newBoard;
    }

    toString() {
        let str = '  a b c d e f g h\n';
        for (let row = 0; row < 8; row++) {
            str += (row + 1) + ' ';
            for (let col = 0; col < 8; col++) {
                const piece = this.grid[row][col];
                if (!piece) {
                    str += '. ';
                } else if (piece.owner === PLAYER.HUMAN) {
                    str += piece.isKing() ? 'W ' : 'w ';
                } else {
                    str += piece.isKing() ? 'B ' : 'b ';
                }
            }
            str += '\n';
        }
        return str;
    }
}
