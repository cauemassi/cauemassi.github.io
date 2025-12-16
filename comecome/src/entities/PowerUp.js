export class PowerUp {
    constructor(type, duration) {
        this.type = type; // 'classic', 'special'
        this.duration = duration;
        this.active = false;
        this.timer = 0;
    }

    activate() {
        this.active = true;
        this.timer = this.duration;
    }

    update(deltaTime) {
        if (this.active) {
            this.timer -= deltaTime;
            if (this.timer <= 0) {
                this.deactivate();
            }
        }
    }

    deactivate() {
        this.active = false;
        this.timer = 0;
    }

    isActive() {
        return this.active;
    }

    getTimeRemaining() {
        return this.timer;
    }
}
