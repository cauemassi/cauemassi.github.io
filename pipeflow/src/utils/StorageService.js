// StorageService.js - Gerencia localStorage
export class StorageService {
    constructor() {
        this.STORAGE_KEY = 'pipeflow_data';
        this.data = this.load();
    }

    load() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : this.getDefaultData();
        } catch (error) {
            console.error('Error loading data:', error);
            return this.getDefaultData();
        }
    }

    getDefaultData() {
        return {
            difficulty: 'medium',
            unlockedLevels: 1,
            records: {}
        };
    }

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    getDifficulty() {
        return this.data.difficulty;
    }

    setDifficulty(difficulty) {
        this.data.difficulty = difficulty;
        this.save();
    }

    getUnlockedLevels() {
        return this.data.unlockedLevels;
    }

    unlockLevel(levelId) {
        if (levelId > this.data.unlockedLevels) {
            this.data.unlockedLevels = levelId;
            this.save();
        }
    }

    getRecord(levelId) {
        return this.data.records[levelId] || null;
    }

    saveRecord(levelId, score, difficulty) {
        const current = this.data.records[levelId];
        if (!current || score > current.score) {
            this.data.records[levelId] = { score, difficulty };
            this.save();
            return true;
        }
        return false;
    }

    reset() {
        this.data = this.getDefaultData();
        this.save();
    }
}
