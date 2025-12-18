// LevelManager.js - Gerencia as fases
import { levels } from '../data/levels.js';

export class LevelManager {
    constructor(storageService) {
        this.storage = storageService;
        this.currentLevel = null;
        this.currentLevelData = null;
    }

    loadLevel(levelId) {
        const levelData = levels.find(l => l.id === levelId);
        if (!levelData) return false;

        this.currentLevel = levelId;
        this.currentLevelData = levelData;
        return true;
    }

    getCurrentLevel() {
        return this.currentLevel;
    }

    getCurrentLevelData() {
        return this.currentLevelData;
    }

    getSetupTime(difficulty) {
        if (!this.currentLevelData) return 60;
        return this.currentLevelData.setupTime[difficulty];
    }

    getFlowSpeed(difficulty) {
        if (!this.currentLevelData) return 500;
        return this.currentLevelData.flowSpeed[difficulty];
    }

    hasNextLevel() {
        return this.currentLevel < levels.length;
    }

    nextLevel() {
        if (this.hasNextLevel()) {
            return this.loadLevel(this.currentLevel + 1);
        }
        return false;
    }

    completeLevel(score, difficulty) {
        const isNewRecord = this.storage.saveRecord(this.currentLevel, score, difficulty);
        
        if (this.hasNextLevel()) {
            this.storage.unlockLevel(this.currentLevel + 1);
        }
        
        return isNewRecord;
    }

    getAllLevels() {
        return levels.map(level => ({
            id: level.id,
            size: level.size,
            unlocked: level.id <= this.storage.getUnlockedLevels(),
            record: this.storage.getRecord(level.id)
        }));
    }
}
