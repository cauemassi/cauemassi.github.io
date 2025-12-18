// InputHandler.js - Gerencia entradas do usuário
export class InputHandler {
    constructor() {
        this.listeners = {
            move: [],
            rotate: [],
            place: [],
            pause: [],
            speed: []
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        // D-Pad
        document.querySelectorAll('.dpad-btn').forEach(btn => {
            const direction = btn.dataset.direction;
            if (direction) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.notify('move', direction);
                });
            }
        });

        // Action Buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            const action = btn.dataset.action;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (action === 'rotate') {
                    this.notify('rotate');
                } else if (action === 'place') {
                    this.notify('place');
                }
            });
        });

        // Pause Button
        document.querySelector('.btn-pause').addEventListener('click', (e) => {
            e.preventDefault();
            this.notify('pause');
        });

        // Speed Button
        document.getElementById('btn-speed').addEventListener('click', (e) => {
            e.preventDefault();
            this.notify('speed');
        });

        // Keyboard Support
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.notify('move', 'up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.notify('move', 'down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.notify('move', 'left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.notify('move', 'right');
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this.notify('place');
                    break;
                case 'r':
                case 'R':
                case 'Shift':
                    e.preventDefault();
                    this.notify('rotate');
                    break;
                case 'Escape':
                case 'p':
                case 'P':
                    e.preventDefault();
                    this.notify('pause');
                    break;
            }
        });

        // Menu Buttons
        document.getElementById('btn-start').addEventListener('click', () => {
            if (this.onStartGame) this.onStartGame();
        });

        document.getElementById('btn-difficulty').addEventListener('click', () => {
            if (this.onToggleDifficulty) this.onToggleDifficulty();
        });

        document.getElementById('btn-levels').addEventListener('click', () => {
            if (this.onShowLevelSelect) this.onShowLevelSelect();
        });

        document.getElementById('btn-back-menu').addEventListener('click', () => {
            if (this.onBackToMenu) this.onBackToMenu();
        });

        // Result Screen Buttons
        document.getElementById('btn-next-level').addEventListener('click', () => {
            if (this.onNextLevel) this.onNextLevel();
        });

        document.getElementById('btn-retry').addEventListener('click', () => {
            if (this.onRetry) this.onRetry();
        });

        document.getElementById('btn-menu').addEventListener('click', () => {
            if (this.onBackToMenu) this.onBackToMenu();
        });
    }

    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    notify(event, data = null) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}
