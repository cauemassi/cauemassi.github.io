// levels.js - Configuração das 10 fases do jogo
export const levels = [
    // Fase 1 - 10x10 - Tutorial Fácil
    {
        id: 1,
        size: 10,
        start: { row: 2, col: 2, direction: 'right' },
        end: { row: 2, col: 7, direction: 'left' },
        setupTime: { easy: 300, medium: 300, hard: 300 },
        flowSpeed: { easy: 5000, medium: 3000, hard: 1000 }
    },
    
    // Fase 2 - 10x10 - Fácil
    {
        id: 2,
        size: 10,
        start: { row: 1, col: 1, direction: 'down' },
        end: { row: 5, col: 1, direction: 'up' },
        setupTime: { easy: 300, medium: 300, hard: 300 },
        flowSpeed: { easy: 5000, medium: 3000, hard: 1000 }
    },
    
    // Fase 3 - 10x10 - Médio
    {
        id: 3,
        size: 10,
        start: { row: 3, col: 1, direction: 'right' },
        end: { row: 6, col: 8, direction: 'left' },
        setupTime: { easy: 300, medium: 300, hard: 300 },
        flowSpeed: { easy: 5000, medium: 3000, hard: 1000 }
    },
    
    // Fase 4 - 12x12 - Médio
    {
        id: 4,
        size: 12,
        start: { row: 2, col: 2, direction: 'right' },
        end: { row: 9, col: 9, direction: 'left' },
        setupTime: { easy: 300, medium: 300, hard: 300 },
        flowSpeed: { easy: 5000, medium: 3000, hard: 1000 }
    },
    
    // Fase 5 - 12x12 - Médio
    {
        id: 5,
        size: 12,
        start: { row: 1, col: 6, direction: 'down' },
        end: { row: 10, col: 5, direction: 'up' },
        setupTime: { easy: 300, medium: 300, hard: 300 },
        flowSpeed: { easy: 5000, medium: 3000, hard: 1000 }
    },
    
    // Fase 6 - 12x12 - Desafiador
    {
        id: 6,
        size: 12,
        start: { row: 5, col: 1, direction: 'right' },
        end: { row: 6, col: 10, direction: 'left' },
        setupTime: { easy: 300, medium: 300, hard: 300 },
        flowSpeed: { easy: 5000, medium: 3000, hard: 1000 }
    },
    
    // Fase 7 - 14x14 - Desafiador
    {
        id: 7,
        size: 14,
        start: { row: 2, col: 2, direction: 'down' },
        end: { row: 11, col: 11, direction: 'up' },
        setupTime: { easy: 300, medium: 300, hard: 300 },
        flowSpeed: { easy: 5000, medium: 3000, hard: 1000 }
    },
    
    // Fase 8 - 14x14 - Difícil
    {
        id: 8,
        size: 14,
        start: { row: 1, col: 7, direction: 'down' },
        end: { row: 12, col: 6, direction: 'up' },
        setupTime: { easy: 300, medium: 300, hard: 300 },
        flowSpeed: { easy: 5000, medium: 3000, hard: 1000 }
    },
    
    // Fase 9 - 14x14 - Difícil
    {
        id: 9,
        size: 14,
        start: { row: 6, col: 1, direction: 'right' },
        end: { row: 7, col: 12, direction: 'left' },
        setupTime: { easy: 300, medium: 300, hard: 300 },
        flowSpeed: { easy: 5000, medium: 3000, hard: 1000 }
    },
    
    // Fase 10 - 16x16 - Final Boss
    {
        id: 10,
        size: 16,
        start: { row: 3, col: 3, direction: 'right' },
        end: { row: 12, col: 12, direction: 'left' },
        setupTime: { easy: 300, medium: 300, hard: 300 },
        flowSpeed: { easy: 5000, medium: 3000, hard: 1000 }
    }
];
