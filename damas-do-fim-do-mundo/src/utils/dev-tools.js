// Development utility functions for testing and debugging

export class DevTools {
    static printBoard(board) {
        console.log('\n=== BOARD STATE ===');
        console.log(board.toString());
    }

    static printValidMoves(moves) {
        console.log('\n=== VALID MOVES ===');
        moves.forEach((move, index) => {
            const from = this.positionToNotation(move.from.row, move.from.col);
            const to = this.positionToNotation(move.to.row, move.to.col);
            const captures = move.captures.length > 0 ? ` (captures: ${move.captures.length})` : '';
            console.log(`${index + 1}. ${from} -> ${to}${captures}`);
        });
    }

    static positionToNotation(row, col) {
        const columns = 'abcdefgh';
        return columns[col] + (row + 1);
    }

    static testMode() {
        console.log('🛠️ Development mode enabled');
        console.log('Use window.game to access game controller');
        console.log('Use window.devTools for utility functions');
    }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.devTools = DevTools;
}
