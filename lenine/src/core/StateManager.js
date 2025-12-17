// StateManager - Manages game states
export class StateManager {
    static STATES = {
        MENU: 'menu',
        SETUP: 'setup',
        PLAYING: 'playing',
        PAUSED: 'paused',
        SUCCESS: 'success'
    };

    constructor() {
        this.currentState = StateManager.STATES.MENU;
        this.previousState = null;
        this.listeners = {};
    }

    setState(newState) {
        if (this.currentState === newState) return;

        this.previousState = this.currentState;
        this.currentState = newState;

        this.emit('stateChange', {
            from: this.previousState,
            to: this.currentState
        });
    }

    getState() {
        return this.currentState;
    }

    is(state) {
        return this.currentState === state;
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }

    pause() {
        if (this.is(StateManager.STATES.PLAYING)) {
            this.setState(StateManager.STATES.PAUSED);
        }
    }

    resume() {
        if (this.is(StateManager.STATES.PAUSED)) {
            this.setState(StateManager.STATES.PLAYING);
        }
    }

    toMenu() {
        this.setState(StateManager.STATES.MENU);
    }

    startGame() {
        this.setState(StateManager.STATES.SETUP);
    }

    victory() {
        this.setState(StateManager.STATES.SUCCESS);
    }
}
