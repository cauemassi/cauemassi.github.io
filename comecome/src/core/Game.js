import { GameLoop } from './GameLoop.js';
import { InputHandler } from './InputHandler.js';
import { StateManager } from './StateManager.js';
import { Player } from '../entities/Player.js';
import { Ghost } from '../entities/Ghost.js';
import { Pellet } from '../entities/Pellet.js';
import { PowerUp } from '../entities/PowerUp.js';
import { TileMap } from '../map/TileMap.js';
import { LevelLoader } from '../map/LevelLoader.js';
import { Renderer } from '../render/Renderer.js';
import { Menu } from '../ui/Menu.js';
import { HUD } from '../ui/HUD.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game systems
        this.stateManager = new StateManager();
        this.inputHandler = new InputHandler();
        this.renderer = new Renderer(this.canvas);
        this.menu = new Menu();
        this.hud = new HUD();
        
        // Game objects
        this.player = null;
        this.ghosts = [];
        this.pellets = [];
        this.tileMap = null;
        this.powerUp = null;
        this.specialPowerUp = null;
        
        // Game state
        this.pauseKeyPressed = false;
        this.specialKeyPressed = false;
        
        // Level data
        this.levelData = null;
    }

    init() {
        // Setup menu callbacks
        this.menu.onStart(() => this.startGame());
        this.hud.onRestart(() => this.returnToMenu());
        
        // Show initial menu
        this.menu.show(this.stateManager.highScore);
        
        // Setup canvas size
        this.resizeCanvas();
    }

    resizeCanvas() {
        // Set canvas to match level size
        const level = LevelLoader.getLevel(1);
        this.canvas.width = level.map[0].length * level.tileSize;
        this.canvas.height = level.map.length * level.tileSize;
    }

    startGame() {
        this.menu.hide();
        this.hud.hideGameOver();
        this.hud.showMobileControls();
        
        // Reset state
        this.stateManager.resetScore();
        this.stateManager.resetLevel();
        
        // Load level
        this.loadLevel(this.stateManager.level);
        
        // Start game loop
        this.stateManager.setState(this.stateManager.states.PLAYING);
        
        if (!this.gameLoop) {
            this.gameLoop = new GameLoop(
                (dt) => this.update(dt),
                () => this.render()
            );
        }
        
        this.gameLoop.start();
    }

    loadLevel(levelNumber) {
        // Load level data
        this.levelData = LevelLoader.getLevel(levelNumber);
        this.tileMap = new TileMap(this.levelData.map, this.levelData.tileSize);
        
        // Create player
        const playerSpawn = this.tileMap.getPlayerSpawn();
        this.player = new Player(playerSpawn.x, playerSpawn.y, this.levelData.tileSize);
        
        // Create ghosts
        this.ghosts = [];
        const ghostSpawns = this.tileMap.getGhostSpawns();
        const ghostTypes = [
            { color: '#ff0000', personality: 'blinky' },
            { color: '#ffb8ff', personality: 'pinky' },
            { color: '#00ffff', personality: 'inky' },
            { color: '#ffb851', personality: 'clyde' }
        ];
        
        for (let i = 0; i < Math.min(ghostSpawns.length, ghostTypes.length); i++) {
            const spawn = ghostSpawns[i];
            const type = ghostTypes[i];
            this.ghosts.push(new Ghost(
                spawn.x, 
                spawn.y, 
                this.levelData.tileSize,
                type.color,
                type.personality,
                this.levelData.difficulty
            ));
        }
        
        // Create pellets
        this.pellets = [];
        for (let y = 0; y < this.tileMap.height; y++) {
            for (let x = 0; x < this.tileMap.width; x++) {
                const worldPos = this.tileMap.tileToWorld(x, y);
                
                if (this.tileMap.isPellet(x, y)) {
                    this.pellets.push(new Pellet(worldPos.x, worldPos.y, this.levelData.tileSize, 'normal'));
                } else if (this.tileMap.isPowerUp(x, y)) {
                    this.pellets.push(new Pellet(worldPos.x, worldPos.y, this.levelData.tileSize, 'power'));
                } else if (this.tileMap.isSpecialPowerUp(x, y)) {
                    this.pellets.push(new Pellet(worldPos.x, worldPos.y, this.levelData.tileSize, 'special'));
                }
            }
        }
        
        // Create power-up systems
        this.powerUp = new PowerUp('classic', this.levelData.difficulty.powerUpDuration);
        this.specialPowerUp = new PowerUp('special', 5);
    }

    update(deltaTime) {
        if (!this.stateManager.isPlaying()) return;

        // Handle pause
        if (this.inputHandler.isPausePressed() && !this.pauseKeyPressed) {
            this.pauseKeyPressed = true;
            if (this.stateManager.isPaused()) {
                this.stateManager.setState(this.stateManager.states.PLAYING);
            } else {
                this.stateManager.setState(this.stateManager.states.PAUSED);
            }
        } else if (!this.inputHandler.isPausePressed()) {
            this.pauseKeyPressed = false;
        }

        if (this.stateManager.isPaused()) return;

        // Handle special power-up activation
        if (this.inputHandler.isSpecialPressed() && !this.specialKeyPressed) {
            this.specialKeyPressed = true;
            if (this.stateManager.hasSpecialPowerUp()) {
                this.activateSpecialPowerUp();
            }
        } else if (!this.inputHandler.isSpecialPressed()) {
            this.specialKeyPressed = false;
        }

        // Update player
        this.player.update(deltaTime, this.inputHandler, this.tileMap);

        // Update power-ups
        this.powerUp.update(deltaTime);
        this.specialPowerUp.update(deltaTime);

        // Update ghosts
        for (const ghost of this.ghosts) {
            ghost.update(deltaTime, this.player, this.tileMap, this.ghosts);
        }

        // Update pellets
        for (const pellet of this.pellets) {
            pellet.update(deltaTime);
        }

        // Check collisions
        this.checkCollisions();

        // Check level complete
        if (this.checkLevelComplete()) {
            this.nextLevel();
        }
    }

    checkCollisions() {
        // Player vs Pellets
        for (const pellet of this.pellets) {
            if (pellet.checkCollision(this.player)) {
                pellet.collect();
                this.stateManager.addScore(pellet.points);
                
                if (pellet.type === 'power') {
                    this.activatePowerUp();
                } else if (pellet.type === 'special') {
                    this.stateManager.setSpecialPowerUp(true);
                }
            }
        }

        // Player vs Ghosts
        for (const ghost of this.ghosts) {
            if (ghost.isEaten()) continue;
            
            const dx = this.player.x - ghost.x;
            const dy = this.player.y - ghost.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.radius + ghost.radius) {
                if (ghost.isVulnerable()) {
                    // Eat ghost
                    ghost.makeEaten();
                    this.stateManager.addScore(200);
                } else if (!this.specialPowerUp.isActive()) {
                    // Game over
                    this.gameOver();
                }
            }
        }
    }

    activatePowerUp() {
        this.powerUp.activate();
        this.player.activatePowerUp(this.levelData.difficulty.powerUpDuration);
        
        for (const ghost of this.ghosts) {
            ghost.makeVulnerable(this.levelData.difficulty.powerUpDuration);
        }
    }

    activateSpecialPowerUp() {
        if (this.stateManager.useSpecialPowerUp()) {
            this.specialPowerUp.activate();
            
            // Make all ghosts immobile
            for (const ghost of this.ghosts) {
                const originalSpeed = ghost.speed;
                ghost.speed = 0;
                
                setTimeout(() => {
                    ghost.speed = originalSpeed;
                }, 5000);
            }
        }
    }

    checkLevelComplete() {
        return this.pellets.every(p => p.collected);
    }

    nextLevel() {
        this.stateManager.nextLevel();
        this.loadLevel(this.stateManager.level);
    }

    gameOver() {
        this.stateManager.setState(this.stateManager.states.GAME_OVER);
        this.gameLoop.stop();
        this.hud.hideMobileControls();
        this.hud.showGameOver(this.stateManager.score);
    }

    returnToMenu() {
        this.hud.hideGameOver();
        this.hud.hideMobileControls();
        this.menu.show(this.stateManager.highScore);
        this.stateManager.setState(this.stateManager.states.MENU);
    }

    render() {
        this.renderer.clear();
        
        if (this.stateManager.getState() === this.stateManager.states.MENU ||
            this.stateManager.getState() === this.stateManager.states.GAME_OVER) {
            return;
        }

        // Render game objects
        this.renderer.renderMap(this.tileMap);
        this.renderer.renderPellets(this.pellets);
        
        for (const ghost of this.ghosts) {
            this.renderer.renderGhost(ghost);
        }
        
        this.renderer.renderPlayer(this.player);
        
        // Render HUD
        this.renderer.renderHUD(
            this.stateManager.score,
            this.stateManager.level,
            this.stateManager.hasSpecialPowerUp()
        );
        
        // Render pause overlay
        if (this.stateManager.isPaused()) {
            this.renderer.renderPauseScreen();
        }
    }
}
