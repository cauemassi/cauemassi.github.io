// ============================================
// INPUT MANAGER
// ============================================
class InputManager {
    constructor() {
        this.keys = {};
        this.touches = new Map();
        this.setupKeyboard();
        this.setupTouch();
    }

    setupKeyboard() {
        const keyMap = {
            'ArrowUp': 'up', 'KeyW': 'up',
            'ArrowDown': 'down', 'KeyS': 'down',
            'ArrowLeft': 'left', 'KeyA': 'left',
            'ArrowRight': 'right', 'KeyD': 'right',
            'Space': 'shoot',
            'ShiftLeft': 'special'
        };

        window.addEventListener('keydown', (e) => {
            const key = keyMap[e.code];
            if (key) {
                e.preventDefault();
                this.keys[key] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = keyMap[e.code];
            if (key) {
                e.preventDefault();
                this.keys[key] = false;
            }
        });
    }

    setupTouch() {
        const controls = document.querySelectorAll('.dpad-btn, #btnShoot');
        
        controls.forEach(btn => {
            const key = btn.dataset.key;
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[key] = true;
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[key] = false;
            });

            btn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.keys[key] = false;
            });
        });
    }

    isPressed(key) {
        return this.keys[key] || false;
    }

    reset() {
        this.keys = {};
    }
}
