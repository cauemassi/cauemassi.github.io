import { PLAYER, PIECE_TYPE } from '../utils/constants.js';

export class Piece {
    constructor(owner, type = PIECE_TYPE.REGULAR) {
        this.owner = owner;
        this.type = type;
    }

    isKing() {
        return this.type === PIECE_TYPE.KING;
    }

    promote() {
        this.type = PIECE_TYPE.KING;
    }

    clone() {
        return new Piece(this.owner, this.type);
    }
}
