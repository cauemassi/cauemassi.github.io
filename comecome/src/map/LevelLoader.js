export class LevelLoader {
    static getLevel(levelNumber) {
        // Mapa clássico estilo Pac-Man
        // 0 = parede, 1 = pílula, 2 = power-up, 3 = power-up especial, 4 = espaço vazio, 5 = spawn jogador, 6 = spawn fantasma
        const baseMap = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0],
            [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 4, 0, 4, 0, 0, 0, 1, 0, 0, 0, 0],
            [4, 4, 4, 0, 1, 0, 4, 6, 6, 6, 6, 6, 4, 0, 1, 0, 4, 4, 4],
            [0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 4, 0, 1, 0, 0, 0, 0],
            [4, 4, 4, 4, 1, 4, 4, 1, 1, 3, 1, 1, 4, 4, 1, 4, 4, 4, 4],
            [0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 4, 0, 1, 0, 0, 0, 0],
            [4, 4, 4, 0, 1, 0, 4, 1, 1, 1, 1, 1, 4, 0, 1, 0, 4, 4, 4],
            [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
            [0, 2, 1, 0, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 0, 1, 2, 0],
            [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
            [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];

        return {
            map: baseMap,
            tileSize: 32,  // Aumentado de 24 para 32
            difficulty: this.getDifficulty(levelNumber)
        };
    }

    static getDifficulty(level) {
        // Progressão de dificuldade exponencial
        const baseSpeed = 1.0;
        const speedIncrease = 0.15;
        const basePowerUpDuration = 6;
        const durationDecrease = 0.3;

        return {
            ghostSpeed: baseSpeed + (speedIncrease * (level - 1)),
            powerUpDuration: Math.max(3, basePowerUpDuration - (durationDecrease * (level - 1))),
            ghostDecisionSpeed: Math.max(0.2, 0.5 - (0.05 * (level - 1))),
            specialPowerUpChance: level > 3 ? 2 : 1 // Mais power-ups especiais em fases avançadas
        };
    }
}
