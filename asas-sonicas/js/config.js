// ============================================
// CONFIGURAÇÃO GLOBAL
// ============================================
const CONFIG = {
    width: 480,
    height: 720,
    fps: 60,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

const SHIPS = [
    { 
        name: '14 BIS', 
        speed: 6, 
        damage: 1, 
        fireRate: 150, 
        shotType: 'single', 
        color: '#00ff00', 
        accentColor: '#00aa00',
        shipSprite: 'images/ships/14bis.png',
        pilotSprite: 'images/pilots/santos.png',
        pilotName: 'SANTOS'
    },
    { 
        name: 'KAWAI', 
        speed: 5, 
        damage: 2, 
        fireRate: 200, 
        shotType: 'double', 
        color: '#ff0000', 
        accentColor: '#aa0000',
        shipSprite: 'images/ships/falcon.png',
        pilotSprite: 'images/pilots/kawaii.png',
        pilotName: 'RED BARON'
    },
    { 
        name: 'SMITH', 
        speed: 4, 
        damage: 1.5, 
        fireRate: 250, 
        shotType: 'spread', 
        color: '#ffaa00', 
        accentColor: '#ff6600',
        shipSprite: 'images/ships/tiger.png',
        pilotSprite: 'images/pilots/smith.png',
        pilotName: 'FIRE HAWK'
    },
    { 
        name: 'VIKING', 
        speed: 3, 
        damage: 3, 
        fireRate: 400, 
        shotType: 'focused', 
        color: '#0088ff', 
        accentColor: '#0044aa',
        shipSprite: 'images/ships/leviatan.png',
        pilotSprite: 'images/pilots/viking.png',
        pilotName: 'IRON SHIELD'
    }
];

// ============================================
// SISTEMA DE FASES
// ============================================
const LEVELS = [
    {
        id: 1,
        name: 'CÉUS NOTURNOS',
        background: 'images/backgrounds/level1-bg.png',
        difficulty: 1,
        bossDuration: 60000,
        waveInterval: 2000
    },
    {
        id: 2,
        name: 'AURORA BOREAL',
        background: null, // ou 'images/level2-bg.png'
        difficulty: 1.3,
        bossDuration: 50000,
        waveInterval: 1800
    },
    {
        id: 3,
        name: 'TEMPESTADE SOLAR',
        background: null, // ou 'images/level3-bg.png'
        difficulty: 1.6,
        bossDuration: 45000,
        waveInterval: 1500
    },
    {
        id: 4,
        name: 'DIMENSÃO ESTELAR',
        background: null, // ou 'images/level4-bg.png'
        difficulty: 2,
        bossDuration: 40000,
        waveInterval: 1200
    }
];

// Sistema de save de progresso
class ProgressManager {
    static save(levelId) {
        let completed = this.getCompleted();
        if (!completed.includes(levelId)) {
            completed.push(levelId);
            localStorage.setItem('asasSonicasProgress', JSON.stringify(completed));
        }
    }

    static getCompleted() {
        const saved = localStorage.getItem('asasSonicasProgress');
        return saved ? JSON.parse(saved) : [];
    }

    static isCompleted(levelId) {
        return this.getCompleted().includes(levelId);
    }

    static reset() {
        localStorage.removeItem('asasSonicasProgress');
    }
}

