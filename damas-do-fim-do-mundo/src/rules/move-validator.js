import { DIRECTION, PLAYER } from '../utils/constants.js';

export class MoveValidator {
    constructor(board) {
        this.board = board;
    }

    getAllValidMoves(owner) {
        const captures = this.getAllCaptures(owner);
        if (captures.length > 0) {
            return captures; // Mandatory captures
        }
        return this.getAllSimpleMoves(owner);
    }

    getAllSimpleMoves(owner) {
        const moves = [];
        const pieces = this.board.getAllPieces(owner);

        for (const { row, col, piece } of pieces) {
            const pieceMoves = this.getSimpleMovesForPiece(row, col, piece);
            moves.push(...pieceMoves);
        }

        return moves;
    }

    getSimpleMovesForPiece(row, col, piece) {
        const moves = [];
        const directions = this.getDirectionsForPiece(piece);

        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.board.isValidPosition(newRow, newCol) && 
                !this.board.getPiece(newRow, newCol)) {
                moves.push({
                    from: { row, col },
                    to: { row: newRow, col: newCol },
                    captures: []
                });
            }
        }

        return moves;
    }

    getAllCaptures(owner) {
        const captures = [];
        const pieces = this.board.getAllPieces(owner);

        console.log(`Buscando capturas para ${owner}, peças encontradas: ${pieces.length}`);

        for (const { row, col, piece } of pieces) {
            const pieceMoves = this.getCapturesForPiece(row, col, piece, []);
            if (pieceMoves.length > 0) {
                console.log(`Peça em (${row},${col}) tem ${pieceMoves.length} sequência(s) de captura`);
            }
            captures.push(...pieceMoves);
        }

        console.log(`Total de capturas encontradas: ${captures.length}`);
        return captures;
    }

    getCapturesForPiece(row, col, piece, capturedPositions, originalRow = null, originalCol = null) {
        // Track original position for the entire capture sequence
        if (originalRow === null) {
            originalRow = row;
            originalCol = col;
        }
        
        const captures = [];
        const directions = Object.values(DIRECTION);

        console.log(`  [Captura] Verificando de (${row},${col}), já capturou: ${capturedPositions.length}`);

        for (const [dRow, dCol] of directions) {
            const captureRow = row + dRow;
            const captureCol = col + dCol;
            const landRow = row + (dRow * 2);
            const landCol = col + (dCol * 2);

            if (!this.board.isValidPosition(landRow, landCol)) continue;

            const capturedPiece = this.board.getPiece(captureRow, captureCol);
            const landPiece = this.board.getPiece(landRow, landCol);

            // Check if we can capture
            if (capturedPiece && 
                capturedPiece.owner !== piece.owner && 
                !landPiece &&
                !this.isPositionCaptured(captureRow, captureCol, capturedPositions)) {
                
                const newCaptured = [...capturedPositions, { row: captureRow, col: captureCol }];
                console.log(`    [Captura] Possível capturar (${captureRow},${captureCol}), pousar em (${landRow},${landCol})`);
                
                // Check for multi-captures from the new position
                const multiCaptures = this.getCapturesForPiece(
                    landRow, 
                    landCol, 
                    piece, 
                    newCaptured,
                    originalRow,
                    originalCol
                );

                if (multiCaptures.length > 0) {
                    // Found continuation captures
                    console.log(`    [Captura] Continuação encontrada: ${multiCaptures.length} sequências`);
                    captures.push(...multiCaptures);
                } else {
                    // End of capture sequence
                    console.log(`    [Captura] Fim da sequência. Total capturadas: ${newCaptured.length}`);
                    captures.push({
                        from: { row: originalRow, col: originalCol },
                        to: { row: landRow, col: landCol },
                        captures: newCaptured
                    });
                }
            }
        }

        return captures;
    }

    isPositionCaptured(row, col, capturedPositions) {
        return capturedPositions.some(pos => pos.row === row && pos.col === col);
    }

    getDirectionsForPiece(piece) {
        if (piece.isKing()) {
            return Object.values(DIRECTION);
        }
        
        if (piece.owner === PLAYER.HUMAN) {
            return [DIRECTION.UP_LEFT, DIRECTION.UP_RIGHT];
        } else {
            return [DIRECTION.DOWN_LEFT, DIRECTION.DOWN_RIGHT];
        }
    }

    isValidMove(from, to, owner) {
        const validMoves = this.getAllValidMoves(owner);
        return validMoves.some(move => 
            move.from.row === from.row && 
            move.from.col === from.col &&
            move.to.row === to.row && 
            move.to.col === to.col
        );
    }

    getMove(from, to, owner) {
        const validMoves = this.getAllValidMoves(owner);
        return validMoves.find(move => 
            move.from.row === from.row && 
            move.from.col === from.col &&
            move.to.row === to.row && 
            move.to.col === to.col
        );
    }
}
