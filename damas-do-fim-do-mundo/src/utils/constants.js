export const STATES = {
    MENU: 'MENU',
    SETUP: 'SETUP',
    PLAYER_TURN: 'PLAYER_TURN',
    AI_THINKING: 'AI_THINKING',
    AI_TURN: 'AI_TURN',
    GAME_OVER: 'GAME_OVER'
};

export const PLAYER = {
    HUMAN: 'player',
    AI: 'ai'
};

export const PIECE_TYPE = {
    REGULAR: 'regular',
    KING: 'king'
};

export const DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

export const DIRECTION = {
    UP_LEFT: [-1, -1],
    UP_RIGHT: [-1, 1],
    DOWN_LEFT: [1, -1],
    DOWN_RIGHT: [1, 1]
};
