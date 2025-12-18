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
        name: 'RAPTOR', 
        speed: 6, 
        damage: 1, 
        fireRate: 150, 
        shotType: 'single', 
        color: '#00ff00', 
        accentColor: '#00aa00' 
    },
    { 
        name: 'VIPER', 
        speed: 5, 
        damage: 2, 
        fireRate: 200, 
        shotType: 'double', 
        color: '#ff0000', 
        accentColor: '#aa0000' 
    },
    { 
        name: 'PHOENIX', 
        speed: 4, 
        damage: 1.5, 
        fireRate: 250, 
        shotType: 'spread', 
        color: '#ffaa00', 
        accentColor: '#ff6600' 
    },
    { 
        name: 'TITAN', 
        speed: 3, 
        damage: 3, 
        fireRate: 400, 
        shotType: 'focused', 
        color: '#0088ff', 
        accentColor: '#0044aa' 
    }
];
