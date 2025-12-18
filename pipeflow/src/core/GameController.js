// GameController.js - Controlador principal do jogo
import { Grid } from '../grid/Grid.js';
import { PipeFactory } from '../pipes/PipeFactory.js';
import { FlowEngine } from '../flow/FlowEngine.js';
import { StateManager } from './StateManager.js';
import { LevelManager } from './LevelManager.js';
import { Renderer } from '../ui/Renderer.js';
import { InputHandler } from '../input/InputHandler.js';
import { StorageService } from '../utils/StorageService.js';

export class GameController {
    constructor() {
        this.storage = new StorageService();
        this.stateManager = new StateManager();
        this.levelManager = new LevelManager(this.storage);
        this.renderer = new Renderer();
        this.inputHandler = new InputHandler();
        
        this.grid = null;
        this.pipeFactory = null;
        this.flowEngine = null;
        
        this.cursorPosition = { row: 0, col: 0 };
        this.score = 0;
        this.timeRemaining = 0;
        this.setupTimer = null;
        this.speedMultiplier = 1;
        
        this.setupStateHandlers();
        this.setupInputHandlers();
        this.setupMenuHandlers();
        
        this.init();
    }

    init() {
        this.renderer.updateDifficultyDisplay(this.storage.getDifficulty());
        this.stateManager.setState('MENU');
    }

    setupStateHandlers() {
        this.stateManager.on('MENU', () => {
            this.cleanupTimers();
            this.renderer.showScreen('menu-screen');
        });

        this.stateManager.on('LEVEL_SELECT', () => {
            this.cleanupTimers();
            const levels = this.levelManager.getAllLevels();
            this.renderer.renderLevelSelect(levels);
            this.renderer.showScreen('level-select-screen');
        });

        this.stateManager.on('SETUP', () => {
            this.renderer.showScreen('game-screen');
            this.startSetupPhase();
        });

        this.stateManager.on('FLOWING', () => {
            this.startFlowPhase();
        });

        this.stateManager.on('PAUSED', () => {
            this.pauseGame();
        });

        this.stateManager.on('SUCCESS', () => {
            this.handleSuccess();
        });

        this.stateManager.on('FAIL', () => {
            this.handleFail();
        });
    }

    setupInputHandlers() {
        this.inputHandler.on('move', (direction) => {
            if (this.stateManager.isState('SETUP')) {
                this.moveCursor(direction);
            }
        });

        this.inputHandler.on('rotate', () => {
            if (this.stateManager.isState('SETUP')) {
                this.rotateCurrentPipe();
            }
        });

        this.inputHandler.on('place', () => {
            if (this.stateManager.isState('SETUP')) {
                this.placePipe();
            }
        });

        this.inputHandler.on('pause', () => {
            if (this.stateManager.isState('PAUSED')) {
                this.resumeGame();
            } else if (this.stateManager.isState('SETUP') || this.stateManager.isState('FLOWING')) {
                this.stateManager.setState('PAUSED');
            }
        });

        this.inputHandler.on('speed', () => {
            if (this.stateManager.isState('FLOWING')) {
                this.toggleSpeed();
            }
        });
    }

    setupMenuHandlers() {
        this.inputHandler.onStartGame = () => {
            this.startGame(1);
        };

        this.inputHandler.onToggleDifficulty = () => {
            this.cycleDifficulty();
        };

        this.inputHandler.onShowLevelSelect = () => {
            this.stateManager.setState('LEVEL_SELECT');
        };

        this.inputHandler.onBackToMenu = () => {
            this.stateManager.setState('MENU');
        };

        this.renderer.onLevelSelect = (levelId) => {
            this.startGame(levelId);
        };

        this.inputHandler.onNextLevel = () => {
            if (this.levelManager.hasNextLevel()) {
                this.levelManager.nextLevel();
                this.startGame(this.levelManager.getCurrentLevel());
            }
        };

        this.inputHandler.onRetry = () => {
            this.startGame(this.levelManager.getCurrentLevel());
        };
    }

    startGame(levelId) {
        if (!this.levelManager.loadLevel(levelId)) {
            console.error('Failed to load level:', levelId);
            return;
        }

        const levelData = this.levelManager.getCurrentLevelData();
        
        this.grid = new Grid(levelData.size);
        this.grid.setStart(levelData.start.row, levelData.start.col, levelData.start.direction);
        this.grid.setEnd(levelData.end.row, levelData.end.col, levelData.end.direction);
        
        this.pipeFactory = new PipeFactory();
        this.pipeFactory.generateInitialQueue();
        
        this.flowEngine = new FlowEngine(this.grid);
        this.flowEngine.onComplete = () => this.stateManager.setState('SUCCESS');
        this.flowEngine.onLeak = () => this.stateManager.setState('FAIL');
        
        this.cursorPosition = { row: 0, col: 0 };
        this.score = 0;
        this.speedMultiplier = 1;
        
        const difficulty = this.storage.getDifficulty();
        this.timeRemaining = this.levelManager.getSetupTime(difficulty);
        
        this.stateManager.setState('SETUP');
    }

    startSetupPhase() {
        this.render();
        
        // Timer inicial de 30 segundos antes da água começar a fluir
        this.setupTimer = setInterval(() => {
            this.timeRemaining--;
            this.updateHUD();
            
            if (this.timeRemaining <= 270) { // 270 = 300 - 30 segundos
                clearInterval(this.setupTimer);
                this.stateManager.setState('FLOWING');
            }
        }, 1000);
    }

    startFlowPhase() {
        const difficulty = this.storage.getDifficulty();
        const flowSpeed = this.levelManager.getFlowSpeed(difficulty);
        
        // Callback para atualizar visual durante o fluxo
        this.flowEngine.onFlowStep = () => {
            this.render();
        };
        
        this.flowEngine.start(flowSpeed);
        
        this.setupTimer = setInterval(() => {
            this.timeRemaining--;
            this.updateHUD();
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.setupTimer);
            }
        }, 1000);
    }

    moveCursor(direction) {
        const { row, col } = this.cursorPosition;
        
        switch(direction) {
            case 'up':
                this.cursorPosition.row = Math.max(0, row - 1);
                break;
            case 'down':
                this.cursorPosition.row = Math.min(this.grid.size - 1, row + 1);
                break;
            case 'left':
                this.cursorPosition.col = Math.max(0, col - 1);
                break;
            case 'right':
                this.cursorPosition.col = Math.min(this.grid.size - 1, col + 1);
                break;
        }
        
        this.render();
    }

    rotateCurrentPipe() {
        const currentPipe = this.pipeFactory.getCurrent();
        if (currentPipe) {
            currentPipe.rotation = (currentPipe.rotation + 90) % 360;
            this.renderPipeQueue();
        }
    }

    placePipe() {
        const { row, col } = this.cursorPosition;
        const currentPipe = this.pipeFactory.getCurrent();
        
        if (this.grid.placePipe(row, col, currentPipe)) {
            this.pipeFactory.getNext();
            this.render();
        }
    }

    toggleSpeed() {
        this.speedMultiplier = this.speedMultiplier === 1 ? 2 : 1;
        this.flowEngine.setSpeed(this.speedMultiplier);
        this.renderer.updateSpeedButton(this.speedMultiplier === 2);
    }

    pauseGame() {
        if (this.setupTimer) {
            clearInterval(this.setupTimer);
            this.setupTimer = null;
        }
        if (this.flowEngine) {
            this.flowEngine.pause();
        }
    }

    resumeGame() {
        const prevState = this.stateManager.getPreviousState();
        
        if (prevState === 'SETUP') {
            this.setupTimer = setInterval(() => {
                this.timeRemaining--;
                this.updateHUD();
                
                if (this.timeRemaining <= 270) { // 270 = 300 - 30 segundos
                    clearInterval(this.setupTimer);
                    this.stateManager.setState('FLOWING');
                }
            }, 1000);
            this.stateManager.setState('SETUP');
        } else if (prevState === 'FLOWING') {
            if (this.flowEngine) {
                this.flowEngine.resume();
            }
            this.setupTimer = setInterval(() => {
                this.timeRemaining--;
                this.updateHUD();
                this.render();
                
                if (this.timeRemaining <= 0) {
                    clearInterval(this.setupTimer);
                }
            }, 1000);
            this.stateManager.setState('FLOWING');
        }
    }

    cleanupTimers() {
        if (this.setupTimer) {
            clearInterval(this.setupTimer);
            this.setupTimer = null;
        }
        if (this.flowEngine) {
            this.flowEngine.stop();
        }
    }

    cycleDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        const current = this.storage.getDifficulty();
        const currentIndex = difficulties.indexOf(current);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        const nextDifficulty = difficulties[nextIndex];
        
        this.storage.setDifficulty(nextDifficulty);
        this.renderer.updateDifficultyDisplay(nextDifficulty);
    }

    handleSuccess() {
        if (this.setupTimer) clearInterval(this.setupTimer);
        if (this.flowEngine) this.flowEngine.stop();
        
        const pathLength = this.flowEngine.getPathLength();
        const pipeScore = pathLength * 10;
        const timeBonus = Math.max(0, Math.floor(this.timeRemaining));
        this.score = pipeScore + timeBonus;
        
        const difficulty = this.storage.getDifficulty();
        const isNewRecord = this.levelManager.completeLevel(this.score, difficulty);
        const record = this.storage.getRecord(this.levelManager.getCurrentLevel());
        
        this.renderer.showResult(
            true,
            this.levelManager.getCurrentLevel(),
            this.score,
            record,
            this.levelManager.hasNextLevel()
        );
    }

    handleFail() {
        if (this.setupTimer) clearInterval(this.setupTimer);
        if (this.flowEngine) this.flowEngine.stop();
        
        const pathLength = this.flowEngine.getPathLength();
        this.score = pathLength * 10;
        
        const record = this.storage.getRecord(this.levelManager.getCurrentLevel());
        
        this.renderer.showResult(
            false,
            this.levelManager.getCurrentLevel(),
            this.score,
            record,
            false
        );
    }

    render() {
        this.renderer.renderGrid(
            this.grid,
            this.cursorPosition.row,
            this.cursorPosition.col
        );
        this.renderPipeQueue();
        this.updateHUD();
    }

    renderPipeQueue() {
        const current = this.pipeFactory.getCurrent();
        const upcoming = this.pipeFactory.getUpcoming();
        this.renderer.renderPipeQueue(current, upcoming);
    }

    updateHUD() {
        this.renderer.updateHUD(
            this.levelManager.getCurrentLevel(),
            this.score,
            this.timeRemaining
        );
    }
}
