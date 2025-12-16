export class InputHandler {
    constructor() {
        this.keys = {};
        this.mobileDirection = null;
        this.mobileSpecial = false;
        
        this.setupKeyboardListeners();
        this.setupMobileListeners();
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });
    }

    setupMobileListeners() {
        const buttons = document.querySelectorAll('.btn-mobile');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const key = button.dataset.key;
                
                if (key === 'special') {
                    this.mobileSpecial = true;
                    setTimeout(() => this.mobileSpecial = false, 100);
                } else {
                    this.mobileDirection = key;
                }
            });

            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (button.dataset.key !== 'special') {
                    this.mobileDirection = null;
                }
            });
        });
    }

    isKeyPressed(key) {
        return this.keys[key] || false;
    }

    getDirection() {
        // Mobile priority
        if (this.mobileDirection) {
            return this.mobileDirection;
        }

        // Keyboard
        if (this.isKeyPressed('w') || this.isKeyPressed('ArrowUp')) return 'up';
        if (this.isKeyPressed('s') || this.isKeyPressed('ArrowDown')) return 'down';
        if (this.isKeyPressed('a') || this.isKeyPressed('ArrowLeft')) return 'left';
        if (this.isKeyPressed('d') || this.isKeyPressed('ArrowRight')) return 'right';
        
        return null;
    }

    isPausePressed() {
        return this.isKeyPressed(' ') || this.isKeyPressed('Space');
    }

    isSpecialPressed() {
        const keyPressed = this.isKeyPressed('r');
        const result = keyPressed || this.mobileSpecial;
        return result;
    }

    clearKey(key) {
        this.keys[key] = false;
    }
}
