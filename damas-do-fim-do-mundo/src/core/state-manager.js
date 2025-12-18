import { STATES } from '../utils/constants.js';

export class StateManager {
    constructor() {
        this.state = STATES.MENU;
        this.listeners = [];
    }

    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        this.notifyListeners(oldState, newState);
    }

    getState() {
        return this.state;
    }

    onStateChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(oldState, newState) {
        for (const listener of this.listeners) {
            listener(oldState, newState);
        }
    }
}
