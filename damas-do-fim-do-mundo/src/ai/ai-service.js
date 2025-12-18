import { DIFFICULTY, PLAYER } from '../utils/constants.js';

export class AIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    }

    async getMove(board, difficulty, validMoves, useAI = true) {
        // Se não deve usar IA ou não tem API Key, retorna movimento aleatório
        if (!useAI || !this.apiKey) {
            console.log('[AI] Modo offline: Escolhendo movimento aleatório');
            return this.getRandomMove(validMoves);
        }

        const prompt = this.buildPrompt(board, difficulty, validMoves);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'Você é um jogador de damas. Responda APENAS com a jogada no formato especificado (exemplo: a3-b4). Não adicione explicações ou texto extra.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: this.getTemperature(difficulty),
                    max_tokens: 50
                })
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();
            const moveText = data.choices[0].message.content.trim();
            
            return this.parseMove(moveText, validMoves);
        } catch (error) {
            console.error('Erro ao obter jogada da IA:', error);
            // Fallback: escolher movimento aleatório
            return this.getRandomMove(validMoves);
        }
    }

    buildPrompt(board, difficulty, validMoves) {
        const boardStr = this.formatBoard(board);
        const movesStr = this.formatMoves(validMoves);
        const difficultyInstructions = this.getDifficultyInstructions(difficulty);

        return `Você está jogando damas. Você é as peças VERMELHAS (b/B). O oponente são as peças BRANCAS (w/W).

${boardStr}

JOGADAS VÁLIDAS DISPONÍVEIS:
${movesStr}

${difficultyInstructions}

Responda APENAS com a jogada escolhida no formato: a3-b4
NÃO adicione explicações, vírgulas ou qualquer outro texto.`;
    }

    formatBoard(board) {
        let str = '  a b c d e f g h\n';
        for (let row = 0; row < 8; row++) {
            str += (row + 1) + ' ';
            for (let col = 0; col < 8; col++) {
                const piece = board.getPiece(row, col);
                if (!piece) {
                    str += '. ';
                } else if (piece.owner === PLAYER.HUMAN) {
                    str += piece.isKing() ? 'W ' : 'w ';
                } else {
                    str += piece.isKing() ? 'B ' : 'b ';
                }
            }
            str += (row + 1) + '\n';
        }
        str += '  a b c d e f g h';
        return str;
    }

    formatMoves(validMoves) {
        return validMoves
            .map(move => {
                const from = this.positionToNotation(move.from.row, move.from.col);
                const to = this.positionToNotation(move.to.row, move.to.col);
                const captureInfo = move.captures.length > 0 ? ` (captura ${move.captures.length})` : '';
                return `${from}-${to}${captureInfo}`;
            })
            .join('\n');
    }

    getDifficultyInstructions(difficulty) {
        switch (difficulty) {
            case DIFFICULTY.EASY:
                return `NÍVEL: FÁCIL
Instruções: Faça uma jogada razoável, mas não necessariamente a melhor. Evite cálculos profundos. Prefira movimentos simples.`;
            
            case DIFFICULTY.MEDIUM:
                return `NÍVEL: MÉDIO
Instruções: Faça uma boa jogada. Considere capturas e planeje 1-2 movimentos à frente. Balance ataque e defesa.`;
            
            case DIFFICULTY.HARD:
                return `NÍVEL: DIFÍCIL
Instruções: Jogue como um especialista em damas. Priorize capturas múltiplas, evite armadilhas, planeje estratégias ofensivas e defensivas. Escolha a MELHOR jogada possível.`;
            
            default:
                return '';
        }
    }

    getTemperature(difficulty) {
        switch (difficulty) {
            case DIFFICULTY.EASY: return 1.2;
            case DIFFICULTY.MEDIUM: return 0.7;
            case DIFFICULTY.HARD: return 0.3;
            default: return 0.7;
        }
    }

    positionToNotation(row, col) {
        const columns = 'abcdefgh';
        return columns[col] + (row + 1);
    }

    notationToPosition(notation) {
        const columns = 'abcdefgh';
        const col = columns.indexOf(notation[0]);
        const row = parseInt(notation[1]) - 1;
        return { row, col };
    }

    parseMove(moveText, validMoves) {
        // Extract move in format a3-b4
        const match = moveText.match(/([a-h][1-8])-([a-h][1-8])/);
        
        if (!match) {
            console.warn('Formato de movimento inválido:', moveText);
            return this.getRandomMove(validMoves);
        }

        const from = this.notationToPosition(match[1]);
        const to = this.notationToPosition(match[2]);

        // Find matching valid move
        const move = validMoves.find(m => 
            m.from.row === from.row && 
            m.from.col === from.col &&
            m.to.row === to.row && 
            m.to.col === to.col
        );

        if (!move) {
            console.warn('Movimento não encontrado nas jogadas válidas:', moveText);
            return this.getRandomMove(validMoves);
        }

        return move;
    }

    getRandomMove(validMoves) {
        if (validMoves.length === 0) return null;
        
        // Prefer captures
        const captures = validMoves.filter(m => m.captures.length > 0);
        const moves = captures.length > 0 ? captures : validMoves;
        
        return moves[Math.floor(Math.random() * moves.length)];
    }
}
