import { PLAYER } from '../utils/constants.js';

export class RulesEngine {
    constructor(board, moveValidator) {
        this.board = board;
        this.moveValidator = moveValidator;
    }

    executeMove(move) {
        console.log('[RulesEngine] Executando movimento');
        
        // Remove captured pieces
        for (const capture of move.captures) {
            console.log(`[RulesEngine] Removendo peça em (${capture.row}, ${capture.col})`);
            const piece = this.board.getPiece(capture.row, capture.col);
            if (!piece) {
                console.warn(`[RulesEngine] AVISO: Tentando remover peça inexistente em (${capture.row}, ${capture.col})`);
            }
            this.board.removePiece(capture.row, capture.col);
        }

        // Move the piece
        console.log(`[RulesEngine] Movendo peça de (${move.from.row}, ${move.from.col}) para (${move.to.row}, ${move.to.col})`);
        const success = this.board.movePiece(
            move.from.row, 
            move.from.col, 
            move.to.row, 
            move.to.col
        );
        
        if (!success) {
            console.error('[RulesEngine] ERRO: Falha ao mover peça!');
        } else {
            console.log('[RulesEngine] Movimento executado com sucesso');
        }
    }

    checkGameOver() {
        const playerPieces = this.board.getAllPieces(PLAYER.HUMAN);
        const aiPieces = this.board.getAllPieces(PLAYER.AI);

        if (playerPieces.length === 0) {
            return { isOver: true, winner: PLAYER.AI };
        }

        if (aiPieces.length === 0) {
            return { isOver: true, winner: PLAYER.HUMAN };
        }

        // Check if player has valid moves
        const playerMoves = this.moveValidator.getAllValidMoves(PLAYER.HUMAN);
        if (playerMoves.length === 0) {
            return { isOver: true, winner: PLAYER.AI };
        }

        // Check if AI has valid moves
        const aiMoves = this.moveValidator.getAllValidMoves(PLAYER.AI);
        if (aiMoves.length === 0) {
            return { isOver: true, winner: PLAYER.HUMAN };
        }

        return { isOver: false, winner: null };
    }

    getPieceCount(owner) {
        return this.board.getAllPieces(owner).length;
    }
}
