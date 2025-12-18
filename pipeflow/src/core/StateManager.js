// StateManager.js - Máquina de estados do jogo
export class StateManager {
    constructor() {
        this.currentState = 'MENU';
        this.previousState = null;
        this.states = {
            MENU: 'MENU',
            LEVEL_SELECT: 'LEVEL_SELECT',
            SETUP: 'SETUP',
            FLOWING: 'FLOWING',
            PAUSED: 'PAUSED',
            SUCCESS: 'SUCCESS',
            FAIL: 'FAIL'
        };
        this.listeners = {};
    }

    setState(newState) {
        if (this.states[newState]) {
            this.previousState = this.currentState;
            this.currentState = newState;
            this.notify(newState, this.previousState);
        }
    }

    getState() {
        return this.currentState;
    }

    getPreviousState() {
        return this.previousState;
    }

    isState(state) {
        return this.currentState === state;
    }

    on(state, callback) {
        if (!this.listeners[state]) {
            this.listeners[state] = [];
        }
        this.listeners[state].push(callback);
    }

    notify(state, oldState) {
        if (this.listeners[state]) {
            this.listeners[state].forEach(callback => callback(oldState));
        }
    }
}
