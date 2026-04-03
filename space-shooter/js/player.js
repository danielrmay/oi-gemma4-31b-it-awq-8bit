/**
 * Player ship implementation.
 * Handles mouse-tracking with lerp, weaponry, and upgrade tiers.
 */

import CONFIG from './config.js';
import { particles } from './particles.js';
import { audio } from './audio.js';

class Player {
    constructor() {
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight - 100;
        this.radius = CONFIG.PLAYER.RADIUS;
        this.health = CONFIG.PLAYER.START_HEALTH;
        this.maxHealth = CONFIG.PLAYER.MAX_HEALTH;
        this.tier = 1;
        this.unleashTime = 0;
        this.lastShot = 0;
        this.tilt = 0;
    }

    update(mouseX, mouseY, currentTime) {
        // Mouse tracking with LERP for smoothness
        const dx = mouseX - this.x;
        this.x += dx * CONFIG.PLAYER.LERP_FACTOR;

        // Simple tilt animation based on movement
        this.tilt = dx * 0.01;

        // Engine trails
        particles.engineTrail(this.x - 10, this.y + 20);
        particles.engineTrail(this.x + 10, this.y + 20);

        if (this.unleashTime > 0) {
            this.unleashTime -= 16.67; // Approx 60fps
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.tilt * Math.PI / 180);

        const color = this.getTierColor();

        // Ship Body (F-117 style pixelated)
        ctx.fillStyle = CONFIG.COLORS.PLAYER_BODY;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        // Main fuselage
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(15, 15);
        ctx.lineTo(0, 10);
        ctx.lineTo(-15, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit
        ctx.fillStyle = color;
        ctx.fillRect(-2, -5, 4, 8);

        // Unleash Glow
        if (this.unleashTime > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
            ctx.strokeStyle = '#FFFFFF';
            ctx.setLineDash([5, 5]);
            ctx.stroke();

            // Shrinking countdown ring
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 15, 0, (this.unleashTime / CONFIG.GAME.UNLEASH_DURATION) * Math.PI * 2);
            ctx.strokeStyle = CONFIG.COLORS.UNLEASH_RING;
            ctx.setLineDash([]);
            ctx.stroke();
        }

        ctx.restore();
    }

    getTierColor() {
        switch(this.tier) {
            case 1: return CONFIG.COLORS.PLAYER_GLOW;
            case 2: return CONFIG.COLORS.BULLET_GREEN;
            case 3: return CONFIG.COLORS.BULLET_GOLD;
            case 4: return '#FFFFFF';
            default: return CONFIG.COLORS.PLAYER_GLOW;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        return this.health <= 0;
    }

    collectPowerup() {
        this.unleashTime = CONFIG.GAME.UNLEASH_DURATION;
        audio.playPowerup();
    }
}

export const player = new Player();
